import type { GenerateRequest, GenerationActualParams, GenerationBatchMode, GenerationImageDetail, GenerationRecipe, GenerationTask, GenerationTaskHandle } from '../types'
import { LocalStorage } from './storage'

export type GenerationHistorySource = 'text' | 'image'

export interface GenerationHistoryItem {
    id: string
    source: GenerationHistorySource
    prompt: string
    model: string
    endpoint: string
    resolvedEndpoint?: string
    requestProvider?: string
    aspectRatio: string
    imageSize: string
    count?: number
    batchMode?: GenerationBatchMode
    useProxy?: boolean
    createdAt: number
    images: string[]
    imageIds?: string[]
    rawImageUrls?: string[]
    imagePersistenceWarnings?: string[]
    category?: string
    favorite?: boolean
    recipe?: GenerationRecipe
    actualParams?: GenerationActualParams
    imageDetails?: GenerationImageDetail[]
    revisedPrompt?: string
    durationMs?: number
    redactedErrorSummary?: string
    hiddenImageIndexes?: number[]
}

export interface StoredImage {
    id: string
    dataUrl: string
    originalUrl?: string
    createdAt: number
    source: 'generated' | 'reference'
}

export interface PendingGenerationTaskItem {
    id: string
    task: GenerationTask
    request: Omit<GenerateRequest, 'apikey' | 'proxyToken'>
    handles: GenerationTaskHandle[]
    createdAt: number
    updatedAt: number
}

const DB_NAME = 'vistack'
const LEGACY_DB_NAME = 'nano-banana-workbench'
const DB_VERSION = 5
const STORE_HISTORY = 'generation-history'
const STORE_IMAGES = 'stored-images'
const STORE_PENDING_TASKS = 'pending-generation-tasks'
const STORE_DELETIONS = 'history-deletions'
const STORE_THUMBNAILS = 'image-thumbnails'

export interface ImageThumbnail {
    id: string
    dataUrl: string
    width: number
    height: number
}

const isIndexedDbAvailable = () => typeof indexedDB !== 'undefined'

function openHistoryDb(dbName = DB_NAME): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!isIndexedDbAvailable()) {
            reject(new Error('当前环境不支持 IndexedDB'))
            return
        }

        const request = dbName === DB_NAME ? indexedDB.open(dbName, DB_VERSION) : indexedDB.open(dbName)
        request.onupgradeneeded = event => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_HISTORY)) {
                db.createObjectStore(STORE_HISTORY, { keyPath: 'id' })
            }
            if (dbName === DB_NAME && !db.objectStoreNames.contains(STORE_IMAGES)) {
                db.createObjectStore(STORE_IMAGES, { keyPath: 'id' })
            }
            if (dbName === DB_NAME && !db.objectStoreNames.contains(STORE_PENDING_TASKS)) {
                db.createObjectStore(STORE_PENDING_TASKS, { keyPath: 'id' })
            }
            if (dbName === DB_NAME && !db.objectStoreNames.contains(STORE_DELETIONS)) {
                db.createObjectStore(STORE_DELETIONS, { keyPath: 'id' })
            }
            if (dbName === DB_NAME && !db.objectStoreNames.contains(STORE_THUMBNAILS)) {
                db.createObjectStore(STORE_THUMBNAILS, { keyPath: 'id' })
            }
        }
        let blocked = false
        request.onsuccess = () => {
            if (blocked) {
                request.result.close()
                return
            }
            request.result.onversionchange = () => request.result.close()
            resolve(request.result)
        }
        request.onerror = () => reject(request.error)
        request.onblocked = () => {
            blocked = true
            reject(new Error('本地存储升级被其他页面阻止，请关闭其他 Vistack 页面后重试'))
        }
    })
}

async function runTransaction<T>(
    stores: string[],
    mode: IDBTransactionMode,
    handler: (transaction: IDBTransaction) => () => T,
    dbName = DB_NAME
): Promise<T> {
    const db = await openHistoryDb(dbName)
    return new Promise((resolve, reject) => {
        let transaction: IDBTransaction
        try {
            transaction = db.transaction(stores, mode)
        } catch (error) {
            db.close()
            reject(error)
            return
        }
        let result: () => T
        transaction.oncomplete = () => {
            db.close()
            resolve(result())
        }
        transaction.onabort = () => {
            db.close()
            reject(transaction.error || new Error('本地存储事务未完成'))
        }
        try {
            result = handler(transaction)
        } catch (error) {
            transaction.abort()
            reject(error)
        }
    })
}

function historyTransaction<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>,
    dbName = DB_NAME
): Promise<T> {
    return runTransaction([STORE_HISTORY], mode, transaction => {
        const request = handler(transaction.objectStore(STORE_HISTORY))
        return () => request.result
    }, dbName)
}

function imageTransaction<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return runTransaction([STORE_IMAGES], mode, transaction => {
        const request = handler(transaction.objectStore(STORE_IMAGES))
        return () => request.result
    })
}

function pendingTaskTransaction<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return runTransaction([STORE_PENDING_TASKS], mode, transaction => {
        const request = handler(transaction.objectStore(STORE_PENDING_TASKS))
        return () => request.result
    })
}

export async function getGenerationHistoryItems(onWarning: (message: string) => void = console.warn): Promise<GenerationHistoryItem[]> {
    const legacyItems = await readHistoryItems(LEGACY_DB_NAME)
    try {
        return await readMergedHistory(legacyItems, true)
    } catch {
        const items = await readMergedHistory(legacyItems, false)
        onWarning('旧版历史暂未保存到当前数据库。请释放浏览器存储空间后刷新重试。')
        return items
    }
}

function readMergedHistory(legacyItems: GenerationHistoryItem[], migrate: boolean): Promise<GenerationHistoryItem[]> {
    // Import and deletion markers share a transaction so another tab cannot resurrect a deletion.
    return runTransaction([STORE_HISTORY, STORE_DELETIONS], migrate ? 'readwrite' : 'readonly', transaction => {
        const history = transaction.objectStore(STORE_HISTORY)
        const current = history.getAll()
        const deletions = transaction.objectStore(STORE_DELETIONS).getAllKeys()
        let items: GenerationHistoryItem[] = []
        deletions.onsuccess = () => {
            const ids = new Set(current.result.map((item: GenerationHistoryItem) => item.id))
            const deletedIds = new Set(deletions.result)
            const imported = legacyItems.filter(item => !ids.has(item.id) && !deletedIds.has(item.id))
            if (migrate) {
                for (const item of imported) history.put(toPlainIndexedDbValue(prepareHistoryItemForStorage(item)))
            }
            items = [...current.result, ...imported].sort((a, b) => b.createdAt - a.createdAt)
        }
        return () => items
    })
}

export async function resolveHistoryItemImages(item: GenerationHistoryItem): Promise<string[]> {
    return (await resolveHistoryItemsImages([item]))[0].images
}

export async function resolveHistoryItemsImages(items: GenerationHistoryItem[]): Promise<GenerationHistoryItem[]> {
    const ids = [...new Set(items.flatMap(item => item.imageIds || []).filter(Boolean))]
    const stored = ids.length ? await runTransaction([STORE_IMAGES], 'readonly', transaction => {
        const store = transaction.objectStore(STORE_IMAGES)
        const requests = ids.map(id => store.get(id))
        return () => new Map(ids.map((id, index) => [id, requests[index].result as StoredImage | undefined]))
    }) : new Map<string, StoredImage | undefined>()
    return items.map(item => ({
        ...item,
        images: Array.from({ length: Math.max(item.images.length, item.imageIds?.length || 0, item.rawImageUrls?.length || 0) }, (_, index) =>
            stored.get(item.imageIds?.[index] || '')?.dataUrl || item.images[index] || item.rawImageUrls?.[index] || ''
        )
    }))
}

export function putGenerationHistoryItem(item: GenerationHistoryItem): Promise<IDBValidKey> {
    return runTransaction([STORE_HISTORY, STORE_DELETIONS], 'readwrite', transaction => {
        const deleted = transaction.objectStore(STORE_DELETIONS).get(item.id)
        deleted.onsuccess = () => {
            if (deleted.result) transaction.abort()
            else transaction.objectStore(STORE_HISTORY).put(toPlainIndexedDbValue(prepareHistoryItemForStorage(item)))
        }
        return () => item.id
    })
}

export function deleteGenerationHistoryItem(id: string): Promise<undefined> {
    return runTransaction([STORE_HISTORY, STORE_DELETIONS], 'readwrite', transaction => {
        transaction.objectStore(STORE_DELETIONS).put({ id })
        transaction.objectStore(STORE_HISTORY).delete(id)
        return () => undefined
    })
}

export async function clearGenerationHistoryItems(): Promise<undefined> {
    const legacyItems = await readHistoryItems(LEGACY_DB_NAME)
    return runTransaction([STORE_HISTORY, STORE_DELETIONS], 'readwrite', transaction => {
        const history = transaction.objectStore(STORE_HISTORY)
        const keys = history.getAllKeys()
        keys.onsuccess = () => {
            const deletions = transaction.objectStore(STORE_DELETIONS)
            for (const id of new Set([...keys.result, ...legacyItems.map(item => item.id)])) deletions.put({ id })
            history.clear()
        }
        return () => undefined
    })
}

export function getStoredImage(id: string): Promise<StoredImage | undefined> {
    return imageTransaction<StoredImage | undefined>('readonly', store => store.get(id))
}

export function putStoredImage(image: StoredImage): Promise<IDBValidKey> {
    return imageTransaction<IDBValidKey>('readwrite', store => store.put(image))
}

export function getImageThumbnail(id: string): Promise<ImageThumbnail | undefined> {
    return runTransaction([STORE_THUMBNAILS], 'readonly', transaction => {
        const request = transaction.objectStore(STORE_THUMBNAILS).get(id)
        return () => request.result
    })
}

export function putImageThumbnail(thumbnail: ImageThumbnail): Promise<void> {
    return runTransaction([STORE_IMAGES, STORE_THUMBNAILS], 'readwrite', transaction => {
        const original = transaction.objectStore(STORE_IMAGES).getKey(thumbnail.id.slice('v1:'.length))
        original.onsuccess = () => {
            if (original.result !== undefined) transaction.objectStore(STORE_THUMBNAILS).put(thumbnail)
        }
        return () => undefined
    })
}

export async function deleteStoredImage(id: string): Promise<undefined> {
    if (!id) return
    // Retain legacy references conservatively, including records not migrated yet.
    const legacyItems = await readHistoryItems(LEGACY_DB_NAME)
    if (legacyItems.some(item => item.imageIds?.includes(id))) return
    return runTransaction([STORE_HISTORY, STORE_IMAGES, STORE_THUMBNAILS], 'readwrite', transaction => {
        const history = transaction.objectStore(STORE_HISTORY).getAll()
        history.onsuccess = () => {
            if (!history.result.some((item: GenerationHistoryItem) => item.imageIds?.includes(id))) {
                transaction.objectStore(STORE_IMAGES).delete(id)
                transaction.objectStore(STORE_THUMBNAILS).delete(`v1:${id}`)
            }
        }
        return () => undefined
    })
}

export async function getPendingGenerationTaskItems(): Promise<PendingGenerationTaskItem[]> {
    try {
        const items = await pendingTaskTransaction<PendingGenerationTaskItem[]>('readonly', store => store.getAll())
        return items.sort((a, b) => b.createdAt - a.createdAt)
    } catch (error) {
        console.warn('无法读取待恢复生成任务:', error)
        return []
    }
}

export function putPendingGenerationTaskItem(item: PendingGenerationTaskItem): Promise<IDBValidKey> {
    return pendingTaskTransaction<IDBValidKey>('readwrite', store => store.put(toPlainIndexedDbValue(item)))
}

export function deletePendingGenerationTaskItem(id: string): Promise<undefined> {
    return pendingTaskTransaction<undefined>('readwrite', store => store.delete(id))
}

export async function persistGeneratedImages(images: string[], useProxy = false, proxyToken?: string): Promise<{
    images: string[]
    imageIds: string[]
    rawImageUrls: string[]
    warnings: string[]
}> {
    const persistedImages: string[] = []
    const imageIds: string[] = []
    const rawImageUrls: string[] = []
    const warnings: string[] = []

    for (const image of images) {
        const rawImageUrl = isHttpUrl(image) ? image : ''
        rawImageUrls.push(rawImageUrl)

        try {
            const dataUrl = await imageToDataUrl(image, useProxy, proxyToken)
            const id = await hashText(dataUrl)
            await putStoredImage({
                id,
                dataUrl,
                originalUrl: rawImageUrl || undefined,
                createdAt: Date.now(),
                source: 'generated'
            })
            persistedImages.push(dataUrl)
            imageIds.push(id)
        } catch (error) {
            persistedImages.push(image)
            imageIds.push('')
            warnings.push(error instanceof Error ? error.message : '图片本地保存失败，已保留原始链接')
        }
    }

    return {
        images: persistedImages,
        imageIds,
        rawImageUrls,
        warnings
    }
}

async function readHistoryItems(dbName: string): Promise<GenerationHistoryItem[]> {
    return historyTransaction<GenerationHistoryItem[]>('readonly', store => store.getAll(), dbName)
}

export async function mergeBackupHistory(
    items: GenerationHistoryItem[],
    images: StoredImage[]
): Promise<{ imported: number; skipped: number }> {
    // Images and records commit together; existing records and deleted-ID markers stay intact.
    return runTransaction([STORE_HISTORY, STORE_IMAGES, STORE_DELETIONS], 'readwrite', transaction => {
        const history = transaction.objectStore(STORE_HISTORY)
        const imageStore = transaction.objectStore(STORE_IMAGES)
        const current = history.getAllKeys()
        const deleted = transaction.objectStore(STORE_DELETIONS).getAllKeys()
        const result = { imported: 0, skipped: 0 }
        deleted.onsuccess = () => {
            const ids = new Set(current.result)
            const deletedIds = new Set(deleted.result)
            const neededImages = new Set<string>()
            for (const item of items) {
                let id = item.id
                while (deletedIds.has(id)) id = `restored:${id}`
                if (ids.has(id)) {
                    result.skipped += 1
                    continue
                }
                ids.add(id)
                history.add(toPlainIndexedDbValue(prepareHistoryItemForStorage({ ...item, id })))
                item.imageIds?.filter(Boolean).forEach(imageId => neededImages.add(imageId))
                result.imported += 1
            }
            for (const image of images) {
                if (!neededImages.has(image.id)) continue
                const existing = imageStore.get(image.id)
                existing.onsuccess = () => {
                    if (existing.result && existing.result.dataUrl !== image.dataUrl) transaction.abort()
                    else if (!existing.result) imageStore.add(image)
                }
            }
        }
        return () => result
    })
}

function prepareHistoryItemForStorage(item: GenerationHistoryItem): GenerationHistoryItem {
    if (!item.imageIds?.length) return item

    return {
        ...item,
        images: item.images.map((image, index) => {
            const hasStoredImage = Boolean(item.imageIds?.[index])
            if (!hasStoredImage) return image
            return item.rawImageUrls?.[index] || ''
        })
    }
}

function toPlainIndexedDbValue<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T
}

function isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value)
}

function isDataUrl(value: string): boolean {
    return value.startsWith('data:')
}

// 拼出带 token 的代理下载地址。未设密码时就是 /api/proxy。
function getProxyDownloadUrl(tokenOverride?: string): string {
    const token = (tokenOverride ?? LocalStorage.getApiProxyToken()).trim()
    if (!token) return '/api/proxy'
    return `/api/proxy?token=${encodeURIComponent(token)}`
}

async function imageToDataUrl(image: string, useProxy = false, proxyToken?: string): Promise<string> {
    if (isDataUrl(image)) return image
    if (!isHttpUrl(image)) return image

    let response: Response
    try {
        if (useProxy) {
            const proxyUrl = getProxyDownloadUrl(proxyToken)
            response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target: image,
                    method: 'GET',
                    headers: {
                        Accept: 'image/*,*/*'
                    }
                })
            })
        } else {
            response = await fetch(image, { cache: 'no-store' })
        }
    } catch (error) {
        throw new Error('图片已生成，但浏览器无法下载到本地保存。可能是跨域限制、链接过期或网络异常。')
    }

    if (!response.ok) {
        throw new Error(`图片已生成，但本地保存失败：HTTP ${response.status}`)
    }

    const blob = await response.blob()
    return blobToDataUrl(blob, 'image/png')
}

function blobToDataUrl(blob: Blob, fallbackMime: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
        reader.onerror = () => reject(reader.error || new Error('图片读取失败'))
        reader.readAsDataURL(blob.type ? blob : new Blob([blob], { type: fallbackMime }))
    })
}

async function hashText(value: string): Promise<string> {
    if (globalThis.crypto?.subtle) {
        const data = new TextEncoder().encode(value)
        const digest = await crypto.subtle.digest('SHA-256', data)
        return Array.from(new Uint8Array(digest))
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('')
    }

    let hash = 0
    for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
    }
    return `fallback-${Math.abs(hash).toString(16)}-${value.length}`
}
