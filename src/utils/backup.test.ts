import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { createBackup, inspectBackup, restoreBackup } from './backup'
import { deleteGenerationHistoryItem, getGenerationHistoryItems, getStoredImage, putGenerationHistoryItem, putStoredImage, resolveHistoryItemImages, type GenerationHistoryItem } from './historyDb'
import { LocalStorage } from './storage'
import type { ApiConnectionPreset } from '../types'

const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII='
const values = new Map<string, string>()
const storage: Storage = {
    get length() { return values.size }, clear: () => values.clear(), key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, String(value)) }, removeItem: key => { values.delete(key) }
}
const preset: ApiConnectionPreset = {
    id: 'api', name: 'Saved API', apiKey: 'secret-key', proxyToken: 'secret-proxy',
    endpoint: 'https://user:password@example.com/v1?token=secret-query&mode=image', model: 'image-model', useProxy: false, createdAt: 1, updatedAt: 1
}
const record = (id = 'history'): GenerationHistoryItem => ({
    id, source: 'image', prompt: 'Keep this prompt', model: 'image-model', endpoint: preset.endpoint,
    aspectRatio: '1:1', imageSize: '1K', createdAt: 1, images: [''], imageIds: ['original'], favorite: true,
    recipe: {
        mainPrompt: 'Reference prompt', compiledPrompt: 'Compiled prompt', supplementPrompt: '', selectedStyle: '', customPrompt: '',
        referenceImages: [png], referenceImageLabels: ['Person'], referenceImageMetadata: [{ role: 'character', label: 'Person' }], count: 1
    }
})

async function seed() {
    await putStoredImage({ id: 'original', dataUrl: png, createdAt: 1, source: 'generated' })
    await putGenerationHistoryItem(record())
    LocalStorage.saveApiConnectionPresets([preset])
    LocalStorage.savePromptAssistantConnectionPresets([{ ...preset, id: 'assistant' }])
    LocalStorage.saveAssetCollections(['Favorites'])
}
async function fixture(includeCredentials = false) {
    await seed()
    return createBackup({ includeCredentials })
}
async function modifyArchive(blob: Blob, modify: (files: Record<string, Uint8Array>) => void) {
    const files = unzipSync(new Uint8Array(await blob.arrayBuffer()))
    modify(files)
    return new Blob([new Uint8Array(zipSync(files)).buffer])
}
function freshDatabase() { vi.stubGlobal('indexedDB', new IDBFactory()); values.clear() }

beforeEach(() => { vi.restoreAllMocks(); vi.stubGlobal('localStorage', storage); freshDatabase() })
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('ZIP backup and restore', () => {
    it('stores original bytes once for shared generated/reference images and omits credentials by default', async () => {
        const backup = await fixture()
        const parsed = await inspectBackup(backup.blob)
        expect(parsed.manifest.files).toHaveLength(1)
        expect(parsed.manifest.records[0].images).toEqual(parsed.manifest.records[0].recipe?.referenceImages)
        expect(parsed.manifest.records[0].images[0]).toMatch(/^images\/.+\.png$/)
        expect([...parsed.images.values()][0]).toEqual(new Uint8Array(await (await fetch(png)).arrayBuffer()))
        const manifest = JSON.stringify(parsed.manifest)
        for (const secret of ['secret-key', 'secret-proxy', 'secret-query', 'password']) expect(manifest).not.toContain(secret)
        expect(parsed.manifest.records[0].prompt).toBe('Keep this prompt')
        expect(parsed.manifest.apiPresets[0].endpoint).toBe('https://example.com/v1?mode=image')
    })

    it('round-trips originals, reference metadata, prompts, favorites and both preset groups', async () => {
        const backup = await fixture()
        const parsed = await inspectBackup(backup.blob)
        freshDatabase()
        const result = await restoreBackup(parsed)
        expect(result).toEqual({ imported: 1, skipped: 0, importedPresets: 2, skippedPresets: 0 })
        const restored = (await getGenerationHistoryItems())[0]
        expect(await resolveHistoryItemImages(restored)).toEqual([png])
        expect(restored.recipe?.referenceImages).toEqual([png])
        expect(restored.recipe?.referenceImageMetadata).toEqual(record().recipe?.referenceImageMetadata)
        expect(restored.favorite).toBe(true)
        expect(LocalStorage.getPromptAssistantConnectionPresets()).toHaveLength(1)
        expect(LocalStorage.getAssetCollections()).toEqual(['Favorites'])
    })

    it('imports credentials only when the archive and restore choice both allow them', async () => {
        const parsed = await inspectBackup((await fixture(true)).blob)
        expect(parsed.manifest.apiPresets[0].apiKey).toBe('secret-key')
        freshDatabase()
        await restoreBackup(parsed)
        expect(LocalStorage.getApiConnectionPresets()[0].apiKey).toBe('')
        expect((await getGenerationHistoryItems())[0].endpoint).not.toContain('secret-query')
        freshDatabase()
        await restoreBackup(parsed, { includeCredentials: true })
        expect(LocalStorage.getApiConnectionPresets()[0].apiKey).toBe('secret-key')
    })

    it('removes credential fields from image diagnostics when keys are excluded', async () => {
        await seed()
        await putGenerationHistoryItem({ ...record(), imageDetails: [{ index: 0, actualParams: { apiKey: 'detail-secret', quality: 'high', url: 'https://example.com?token=url-secret' } }] })
        const backup = await createBackup({ includeCredentials: false })
        const params = backup.manifest.records[0].imageDetails?.[0].actualParams
        expect(params).toEqual({ quality: 'high', url: 'https://example.com/' })
    })

    it('does not produce a complete backup when existing preset data is malformed', async () => {
        await seed()
        values.set('vistack-api-connection-presets', '[{"id":"broken"}]')
        await expect(createBackup({ includeCredentials: false })).rejects.toThrow('接口预设数据无法读取')
        expect(values.get('vistack-api-connection-presets')).toBe('[{"id":"broken"}]')
    })

    it('downloads a remote original without sending browser credentials', async () => {
        const bytes = await (await fetch(png)).arrayBuffer()
        await putGenerationHistoryItem({ ...record(), images: ['https://example.com/image.png'], imageIds: [], recipe: undefined })
        const request = vi.fn().mockResolvedValue(new Response(bytes, { headers: { 'content-type': 'image/png' } }))
        vi.stubGlobal('fetch', request)
        const backup = await createBackup({ includeCredentials: false })
        expect(backup.manifest.files).toHaveLength(1)
        expect(backup.manifest.missingImages).toHaveLength(0)
        expect(request).toHaveBeenCalledWith('https://example.com/image.png', expect.objectContaining({ credentials: 'omit', referrerPolicy: 'no-referrer' }))
    })

    it('skips duplicate IDs without replacing current edits or credentials', async () => {
        const parsed = await inspectBackup((await fixture()).blob)
        await putGenerationHistoryItem({ ...record(), prompt: 'Newer local edit' })
        const result = await restoreBackup(parsed)
        expect(result.imported).toBe(0)
        expect(result.skipped).toBe(1)
        expect((await getGenerationHistoryItems())[0].prompt).toBe('Newer local edit')
        expect(LocalStorage.getApiConnectionPresets()[0].apiKey).toBe('secret-key')
    })

    it('recovers deleted history without clearing deletion markers, and can recover it again', async () => {
        const parsed = await inspectBackup((await fixture()).blob)
        await deleteGenerationHistoryItem('history')
        expect((await restoreBackup(parsed)).imported).toBe(1)
        expect((await getGenerationHistoryItems())[0].id).toBe('restored:history')
        expect((await restoreBackup(parsed)).skipped).toBe(1)
        await deleteGenerationHistoryItem('restored:history')
        expect((await restoreBackup(parsed)).imported).toBe(1)
        expect((await getGenerationHistoryItems())[0].id).toBe('restored:restored:history')
    })

    it('lists failed remote downloads and restores only available references with aligned labels', async () => {
        await seed()
        await putGenerationHistoryItem({ ...record(), images: ['https://example.com/expired'], imageIds: [], recipe: {
            ...record().recipe!, referenceImages: ['https://example.com/missing', png], referenceImageLabels: ['Missing', 'Kept'],
            referenceImageMetadata: [{ role: 'other', label: 'Missing' }, { role: 'character', label: 'Kept' }]
        } })
        const originalFetch = globalThis.fetch
        vi.stubGlobal('fetch', vi.fn((input, init) => String(input).startsWith('https:') ? Promise.resolve(new Response('', { status: 404 })) : originalFetch(input, init)))
        const backup = await createBackup({ includeCredentials: false })
        expect(backup.manifest.missingImages).toHaveLength(2)
        const parsed = await inspectBackup(backup.blob)
        freshDatabase()
        await restoreBackup(parsed)
        const restored = (await getGenerationHistoryItems())[0]
        expect(restored.images).toEqual([''])
        expect(restored.recipe?.referenceImages).toEqual([png])
        expect(restored.recipe?.referenceImageLabels).toEqual(['Kept'])
        expect(restored.imagePersistenceWarnings?.length).toBeGreaterThan(0)
    })

    it('rejects damaged image bytes before any database write', async () => {
        const backup = await fixture()
        const corrupted = await modifyArchive(backup.blob, files => { files[backup.manifest.files[0].path][20] ^= 1 })
        await expect(inspectBackup(corrupted)).rejects.toThrow('校验失败')
        expect((await getGenerationHistoryItems())[0].id).toBe('history')
    })

    it('rejects missing files, unsupported versions and unsafe ZIP paths', async () => {
        const backup = await fixture()
        await expect(inspectBackup(await modifyArchive(backup.blob, files => { delete files[backup.manifest.files[0].path] }))).rejects.toThrow('缺失')
        await expect(inspectBackup(await modifyArchive(backup.blob, files => {
            const manifest = JSON.parse(strFromU8(files['manifest.json'])); manifest.version = 999
            files['manifest.json'] = strToU8(JSON.stringify(manifest))
        }))).rejects.toThrow('版本不受支持')
        await expect(inspectBackup(await modifyArchive(backup.blob, files => { files['../outside.txt'] = strToU8('invalid') }))).rejects.toThrow('结构')
    })

    it('rolls back both images and records if the import transaction aborts', async () => {
        const parsed = await inspectBackup((await fixture()).blob)
        freshDatabase()
        const original = IDBObjectStore.prototype.add
        vi.spyOn(IDBObjectStore.prototype, 'add').mockImplementation(function (this: IDBObjectStore, ...args) {
            const request = original.apply(this, args)
            if (this.name === 'stored-images') request.addEventListener('success', () => this.transaction.abort())
            return request
        })
        await expect(restoreBackup(parsed)).rejects.toThrow()
        expect(await getGenerationHistoryItems()).toEqual([])
        expect(await getStoredImage(`backup-${parsed.manifest.files[0].sha256}`)).toBeUndefined()
        expect(LocalStorage.getApiConnectionPresets()).toEqual([])
    })

    it('reports a settings failure after history commits and rolls back settings changes', async () => {
        const parsed = await inspectBackup((await fixture()).blob)
        freshDatabase()
        vi.spyOn(storage, 'setItem').mockImplementation((key, value) => {
            if (key === 'vistack-prompt-assistant-connection-presets') throw new Error('quota')
            values.set(key, String(value))
        })
        const result = await restoreBackup(parsed)
        expect(result.imported).toBe(1)
        expect(result.settingsError).toBeTruthy()
        expect(values.has('vistack-api-connection-presets')).toBe(false)
        expect(await getGenerationHistoryItems()).toHaveLength(1)
    })

    it('includes unsaved session records and stops cleanly when cancelled', async () => {
        const backup = await createBackup({ includeCredentials: false, history: [{ ...record('unsaved'), images: [png], imageIds: [] }], unsavedIds: ['unsaved'] })
        expect(backup.manifest.records[0].id).toBe('unsaved')
        const controller = new AbortController(); controller.abort()
        await seed()
        await expect(createBackup({ includeCredentials: false, signal: controller.signal })).rejects.toThrow('取消')
    })
})
