import { strFromU8, strToU8, unzip, zip, type Zippable } from 'fflate'
import type { ApiConnectionPreset } from '../types'
import { getGenerationHistoryItems, getStoredImage, mergeBackupHistory, type GenerationHistoryItem, type StoredImage } from './historyDb'
import { LocalStorage } from './storage'
import { redactSensitiveText } from './diagnostics'
import { backupManifestSchema, MAX_BACKUP_BYTES, MAX_BACKUP_FILE_BYTES, MAX_BACKUP_FILES, MAX_MANIFEST_BYTES, type BackupManifest } from './backupSchema'

export interface BackupOptions {
    includeCredentials: boolean
    history?: GenerationHistoryItem[]
    unsavedIds?: string[]
    signal?: AbortSignal
    onProgress?: (message: string) => void
}
export interface ParsedBackup {
    manifest: BackupManifest
    images: Map<string, Uint8Array>
}

function checkCancelled(signal?: AbortSignal) {
    if (signal?.aborted) throw new Error('操作已取消')
}

function requireChecksumSupport() {
    if (!globalThis.crypto?.subtle) throw new Error('备份校验需要安全连接，请使用 localhost 或 HTTPS 打开应用。')
}

export function withoutUrlCredentials(value: string): string {
    if (!value) return value
    try {
        const url = new URL(value)
        url.username = ''; url.password = ''
        for (const key of [...url.searchParams.keys()]) {
            if (/key|token|secret|password|auth|signature|credential|sig$/i.test(key)) url.searchParams.delete(key)
        }
        return url.toString()
    } catch { return value }
}

function cleanPreset(preset: ApiConnectionPreset, includeCredentials: boolean): ApiConnectionPreset {
    return {
        ...preset,
        apiKey: includeCredentials ? preset.apiKey : '',
        proxyToken: includeCredentials ? preset.proxyToken : '',
        endpoint: includeCredentials ? preset.endpoint : withoutUrlCredentials(preset.endpoint)
    }
}

function cleanHistory(record: GenerationHistoryItem, includeCredentials: boolean): GenerationHistoryItem {
    if (includeCredentials) return record
    return {
        ...record,
        endpoint: withoutUrlCredentials(record.endpoint),
        resolvedEndpoint: record.resolvedEndpoint ? withoutUrlCredentials(record.resolvedEndpoint) : undefined,
        actualParams: record.actualParams ? {
            ...record.actualParams,
            resolvedEndpoint: record.actualParams.resolvedEndpoint ? withoutUrlCredentials(record.actualParams.resolvedEndpoint) : undefined
        } : undefined,
        imageDetails: record.imageDetails?.map(detail => ({
            ...detail,
            actualParams: detail.actualParams ? Object.fromEntries(Object.entries(detail.actualParams)
                .filter(([key]) => !/api.?key|token|secret|password|authorization|credential/i.test(key))
                .map(([key, value]) => [key, typeof value === 'string' && /^https?:\/\//i.test(value) ? withoutUrlCredentials(value) : value])) : undefined
        })),
        imagePersistenceWarnings: record.imagePersistenceWarnings?.map(redactSensitiveText),
        redactedErrorSummary: record.redactedErrorSummary ? redactSensitiveText(record.redactedErrorSummary) : undefined
    }
}

async function digest(bytes: Uint8Array): Promise<string> {
    const result = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer)
    return [...new Uint8Array(result)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}

function imageFormat(bytes: Uint8Array): { mime: string; extension: string } {
    const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))
    if (bytes[0] === 137 && ascii(1, 4) === 'PNG') return { mime: 'image/png', extension: 'png' }
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { mime: 'image/jpeg', extension: 'jpg' }
    if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { mime: 'image/webp', extension: 'webp' }
    if (['GIF87a', 'GIF89a'].includes(ascii(0, 6))) return { mime: 'image/gif', extension: 'gif' }
    if (ascii(4, 8) === 'ftyp' && /avif|avis/.test(ascii(8, 32))) return { mime: 'image/avif', extension: 'avif' }
    if (ascii(0, 2) === 'BM') return { mime: 'image/bmp', extension: 'bmp' }
    if (ascii(0, 4) === 'II*\x00' || ascii(0, 4) === 'MM\x00*') return { mime: 'image/tiff', extension: 'tif' }
    throw new Error('不是受支持的图片文件')
}

async function fetchImage(source: string, signal?: AbortSignal): Promise<Uint8Array> {
    if (!/^(data:image\/|blob:|https?:\/\/)/i.test(source)) throw new Error('图片内容不存在')
    const timeout = new AbortController()
    const abort = () => timeout.abort()
    signal?.addEventListener('abort', abort, { once: true })
    checkCancelled(signal)
    const timer = setTimeout(abort, 30000)
    try {
        let response: Response
        if (/^https?:/i.test(source) && LocalStorage.getApiUseProxy()) {
            const token = LocalStorage.getApiProxyToken()
            response = await fetch(`/api/proxy${token ? `?token=${encodeURIComponent(token)}` : ''}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: timeout.signal,
                body: JSON.stringify({ target: source, method: 'GET', headers: { Accept: 'image/*' } })
            })
        } else {
            response = await fetch(source, { signal: timeout.signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
        }
        if (!response.ok) throw new Error('图片下载失败')
        if (Number(response.headers.get('content-length')) > MAX_BACKUP_FILE_BYTES) throw new Error('单张图片超过 128 MB')
        if (!response.body) throw new Error('图片内容为空')
        const reader = response.body.getReader()
        const chunks: Uint8Array[] = []
        let size = 0
        try {
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                size += value.length
                if (size > MAX_BACKUP_FILE_BYTES) throw new Error('单张图片超过 128 MB')
                chunks.push(value)
            }
        } catch (error) { await reader.cancel(); throw error }
        const bytes = new Uint8Array(size)
        let offset = 0
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
        return bytes
    } finally {
        clearTimeout(timer)
        signal?.removeEventListener('abort', abort)
    }
}

export async function createBackup(options: BackupOptions): Promise<{ blob: Blob; manifest: BackupManifest; filename: string }> {
    requireChecksumSupport()
    checkCancelled(options.signal)
    options.onProgress?.('正在读取生成记录...')
    const saved = await getGenerationHistoryItems()
    const unsaved = new Set(options.unsavedIds || [])
    const byId = new Map(saved.map(item => [item.id, item]))
    for (const item of options.history || []) if (unsaved.has(item.id) || !byId.has(item.id)) byId.set(item.id, item)
    const records = JSON.parse(JSON.stringify([...byId.values()])) as GenerationHistoryItem[]
    const settings = LocalStorage.getBackupSettings()
    const manifest: BackupManifest = {
        format: 'vistack-backup', version: 1, createdAt: new Date().toISOString(), includesCredentials: options.includeCredentials,
        records: [], files: [], missingImages: [], collections: settings.collections,
        apiPresets: settings.apiPresets.map(preset => cleanPreset(preset, options.includeCredentials)),
        assistantPresets: settings.assistantPresets.map(preset => cleanPreset(preset, options.includeCredentials))
    }
    const archive: Zippable = {}
    const sourcePaths = new Map<string, string>()
    let totalBytes = 0
    const addImage = async (source: string, recordId: string, kind: 'generated' | 'reference', index: number) => {
        checkCancelled(options.signal)
        try {
            if (sourcePaths.has(source)) return sourcePaths.get(source)!
            const bytes = await fetchImage(source, options.signal)
            const format = imageFormat(bytes)
            const hash = await digest(bytes)
            const path = `images/${hash}.${format.extension}`
            if (!archive[path]) {
                totalBytes += bytes.length
                if (totalBytes > MAX_BACKUP_BYTES || manifest.files.length >= MAX_BACKUP_FILES) throw new RangeError('备份超过当前 512 MB 或 10000 个图片文件的上限，未生成文件。')
                archive[path] = [bytes, { level: 0 }]
                manifest.files.push({ path, mime: format.mime, sha256: hash, bytes: bytes.length })
            }
            sourcePaths.set(source, path)
            return path
        } catch (error) {
            checkCancelled(options.signal)
            if (error instanceof RangeError) throw error
            manifest.missingImages.push({ recordId, kind, index, reason: '图片无法读取或下载，未包含图片文件' })
            return ''
        }
    }
    for (let recordIndex = 0; recordIndex < records.length; recordIndex++) {
        checkCancelled(options.signal)
        options.onProgress?.(`正在打包图片 ${recordIndex + 1}/${records.length} 组`)
        const item = records[recordIndex]
        const images: string[] = []
        for (let index = 0; index < Math.max(item.images.length, item.imageIds?.length || 0, item.rawImageUrls?.length || 0); index++) {
            const stored = item.imageIds?.[index] ? await getStoredImage(item.imageIds[index]) : undefined
            const source = stored?.dataUrl || item.images[index] || item.rawImageUrls?.[index] || ''
            images.push(await addImage(source, item.id, 'generated', index))
        }
        const copy = cleanHistory({ ...item, images, imageIds: undefined, rawImageUrls: undefined }, options.includeCredentials)
        if (copy.recipe) {
            const referenceImages: string[] = []
            for (let index = 0; index < copy.recipe.referenceImages.length; index++) {
                referenceImages.push(await addImage(copy.recipe.referenceImages[index], item.id, 'reference', index))
            }
            copy.recipe = { ...copy.recipe, referenceImages }
        }
        manifest.records.push(copy)
    }
    const validation = backupManifestSchema.safeParse(manifest)
    if (!validation.success) throw new Error('部分记录格式异常，备份已停止。原数据保持不变。')
    const validated = validation.data
    const metadata = strToU8(JSON.stringify(validated, null, 2))
    if (metadata.length > MAX_MANIFEST_BYTES || totalBytes + metadata.length > MAX_BACKUP_BYTES) throw new Error('备份内容超过大小限制')
    archive['manifest.json'] = [metadata, { level: 6 }]
    options.onProgress?.('正在生成 ZIP 文件...')
    const bytes = await new Promise<Uint8Array>((resolve, reject) => zip(archive, (error, result) => error ? reject(error) : resolve(result)))
    checkCancelled(options.signal)
    if (bytes.length > MAX_BACKUP_BYTES) throw new Error('备份文件超过 512 MB')
    return { blob: new Blob([new Uint8Array(bytes).buffer], { type: 'application/zip' }), manifest: validated, filename: `vistack-backup-${validated.createdAt.replace(/[:.]/g, '-')}.zip` }
}

export async function inspectBackup(file: Blob): Promise<ParsedBackup> {
    requireChecksumSupport()
    if (file.size > MAX_BACKUP_BYTES) throw new Error('备份文件不能超过 512 MB')
    let expanded = 0
    let entries = 0
    let invalid = false
    const names = new Set<string>()
    const input = new Uint8Array(await file.arrayBuffer())
    const files = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
        unzip(input, { filter(entry) {
            entries += 1; expanded += entry.originalSize
            const allowed = entry.name === 'manifest.json' || /^images\/[a-f0-9]{64}\.(png|jpg|webp|gif|avif|bmp|tif)$/.test(entry.name)
            if (!allowed || names.has(entry.name) || entries > MAX_BACKUP_FILES + 1 || expanded > MAX_BACKUP_BYTES || entry.originalSize > (entry.name === 'manifest.json' ? MAX_MANIFEST_BYTES : MAX_BACKUP_FILE_BYTES)) invalid = true
            names.add(entry.name)
            return !invalid
        } }, (error, result) => error ? reject(new Error('ZIP 文件损坏或无法读取')) : resolve(result))
    })
    if (invalid || !files['manifest.json']) throw new Error('备份文件结构或大小不符合要求')
    let manifest: BackupManifest
    try { manifest = backupManifestSchema.parse(JSON.parse(strFromU8(files['manifest.json']))) }
    catch { throw new Error('备份清单无效或版本不受支持') }
    const unique = (values: string[]) => new Set(values).size === values.length
    if (!unique(manifest.files.map(item => item.path)) || !unique(manifest.records.map(item => item.id)) || !unique(manifest.apiPresets.map(item => item.id)) || !unique(manifest.assistantPresets.map(item => item.id))) throw new Error('备份清单含重复标识')
    const images = new Map<string, Uint8Array>()
    for (const entry of manifest.files) {
        const bytes = files[entry.path]
        if (!bytes || bytes.length !== entry.bytes || await digest(bytes) !== entry.sha256) throw new Error('备份图片缺失或校验失败')
        const format = imageFormat(bytes)
        if (format.mime !== entry.mime || entry.path !== `images/${entry.sha256}.${format.extension}`) throw new Error('备份图片格式不匹配')
        images.set(entry.path, bytes)
    }
    if (images.size + 1 !== Object.keys(files).length) throw new Error('备份中含有未登记的文件')
    for (const record of manifest.records) {
        for (const path of [...record.images, ...(record.recipe?.referenceImages || [])]) {
            if (path && !images.has(path)) throw new Error('生成记录引用了缺失的图片文件')
        }
    }
    const expectedMissing = manifest.records.flatMap(record => [
        ...record.images.flatMap((path, index) => path ? [] : [JSON.stringify([record.id, 'generated', index])]),
        ...(record.recipe?.referenceImages || []).flatMap((path, index) => path ? [] : [JSON.stringify([record.id, 'reference', index])])
    ]).sort()
    const listedMissing = manifest.missingImages.map(item => JSON.stringify([item.recordId, item.kind, item.index])).sort()
    if (JSON.stringify(expectedMissing) !== JSON.stringify(listedMissing)) throw new Error('缺失图片清单与生成记录不一致')
    return { manifest, images }
}

function toDataUrl(bytes: Uint8Array, mime: string): string {
    let binary = ''
    for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index, index + 32768))
    return `data:${mime};base64,${btoa(binary)}`
}

export async function restoreBackup(backup: ParsedBackup, options: { includeCredentials?: boolean } = {}): Promise<{ imported: number; skipped: number; importedPresets: number; skippedPresets: number; settingsError?: string }> {
    const byPath = new Map(backup.manifest.files.map(file => [file.path, {
        id: `backup-${file.sha256}`, dataUrl: toDataUrl(backup.images.get(file.path)!, file.mime),
        createdAt: Date.now(), source: 'generated' as const
    }]))
    const records: GenerationHistoryItem[] = backup.manifest.records.map(record => {
        const item = cleanHistory({ ...record, images: record.images.map(() => ''), imageIds: record.images.map(path => byPath.get(path)?.id || '') }, backup.manifest.includesCredentials && options.includeCredentials === true)
        if (record.recipe) {
            const indexes = record.recipe.referenceImages.map((path, index) => path ? index : -1).filter(index => index >= 0)
            item.recipe = {
                ...record.recipe,
                referenceImages: indexes.map(index => byPath.get(record.recipe!.referenceImages[index])!.dataUrl),
                referenceImageLabels: indexes.map(index => record.recipe!.referenceImageLabels[index] || ''),
                referenceImageMetadata: indexes.map(index => record.recipe!.referenceImageMetadata[index] || { role: 'other', label: '' })
            }
        }
        if (backup.manifest.missingImages.some(missing => missing.recordId === item.id)) {
            item.imagePersistenceWarnings = [...(item.imagePersistenceWarnings || []), '备份中部分图片缺失，未恢复这些图片']
        }
        return item
    })
    const result = await mergeBackupHistory(records, [...byPath.values()] as StoredImage[])
    try {
        const settings = LocalStorage.mergeBackupSettings({
            apiPresets: backup.manifest.apiPresets.map(preset => cleanPreset(preset, backup.manifest.includesCredentials && options.includeCredentials === true)),
            assistantPresets: backup.manifest.assistantPresets.map(preset => cleanPreset(preset, backup.manifest.includesCredentials && options.includeCredentials === true)),
            collections: backup.manifest.collections
        })
        return { ...result, ...settings }
    } catch {
        return { ...result, importedPresets: 0, skippedPresets: 0, settingsError: '历史已恢复，但接口预设或收藏夹未能保存。请稍后重试导入。' }
    }
}
