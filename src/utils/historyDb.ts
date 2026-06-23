import type { GenerateRequest, GenerationBatchMode, GenerationRecipe, GenerationTask, GenerationTaskHandle } from '../types'
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
const DB_VERSION = 3
const STORE_HISTORY = 'generation-history'
const STORE_IMAGES = 'stored-images'
const STORE_PENDING_TASKS = 'pending-generation-tasks'

const isIndexedDbAvailable = () => typeof indexedDB !== 'undefined'

function openHistoryDb(dbName = DB_NAME): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!isIndexedDbAvailable()) {
            reject(new Error('当前环境不支持 IndexedDB'))
            return
        }

        const request = indexedDB.open(dbName, DB_VERSION)
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
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function historyTransaction<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>,
    dbName = DB_NAME
): Promise<T> {
    return openHistoryDb(dbName).then(
        db =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_HISTORY, mode)
                const store = transaction.objectStore(STORE_HISTORY)
                const request = handler(store)
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })
    )
}

function imageTransaction<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return openHistoryDb(DB_NAME).then(
        db =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_IMAGES, mode)
                const store = transaction.objectStore(STORE_IMAGES)
                const request = handler(store)
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })
    )
}

function pendingTaskTransaction<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return openHistoryDb(DB_NAME).then(
        db =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_PENDING_TASKS, mode)
                const store = transaction.objectStore(STORE_PENDING_TASKS)
                const request = handler(store)
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })
    )
}

export async function getGenerationHistoryItems(): Promise<GenerationHistoryItem[]> {
    const currentItems = await readHistoryItems(DB_NAME)
    const legacyItems = await readHistoryItems(LEGACY_DB_NAME)
    const currentIds = new Set(currentItems.map(item => item.id))
    const legacyOnlyItems = legacyItems.filter(item => !currentIds.has(item.id))

    if (legacyOnlyItems.length) {
        await Promise.allSettled(legacyOnlyItems.map(item => putGenerationHistoryItem(item)))
    }

    return [...currentItems, ...legacyOnlyItems].sort((a, b) => b.createdAt - a.createdAt)
}

export async function resolveHistoryItemImages(item: GenerationHistoryItem): Promise<string[]> {
    if (!item.imageIds?.length) return item.images

    const count = Math.max(item.images.length, item.imageIds.length, item.rawImageUrls?.length || 0)
    const resolved = await Promise.all(Array.from({ length: count }, async (_, index) => {
        const imageId = item.imageIds?.[index]
        const storedImage = imageId ? await getStoredImage(imageId) : undefined
        return storedImage?.dataUrl || item.images[index] || item.rawImageUrls?.[index] || ''
    }))

    return resolved.filter(Boolean)
}

export function putGenerationHistoryItem(item: GenerationHistoryItem): Promise<IDBValidKey> {
    return historyTransaction<IDBValidKey>('readwrite', store => store.put(prepareHistoryItemForStorage(item)))
}

export function deleteGenerationHistoryItem(id: string): Promise<undefined> {
    return historyTransaction<undefined>('readwrite', store => store.delete(id))
}

export function clearGenerationHistoryItems(): Promise<undefined> {
    return historyTransaction<undefined>('readwrite', store => store.clear())
}

export function getStoredImage(id: string): Promise<StoredImage | undefined> {
    return imageTransaction<StoredImage | undefined>('readonly', store => store.get(id))
}

export function putStoredImage(image: StoredImage): Promise<IDBValidKey> {
    return imageTransaction<IDBValidKey>('readwrite', store => store.put(image))
}

export function deleteStoredImage(id: string): Promise<undefined> {
    return imageTransaction<undefined>('readwrite', store => store.delete(id))
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
    return pendingTaskTransaction<IDBValidKey>('readwrite', store => store.put(item))
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
    try {
        return await historyTransaction<GenerationHistoryItem[]>('readonly', store => store.getAll(), dbName)
    } catch (error) {
        console.warn('无法读取生成历史:', error)
        return []
    }
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
