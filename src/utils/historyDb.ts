import type { GenerationRecipe } from '../types'

export type GenerationHistorySource = 'text' | 'image'

export interface GenerationHistoryItem {
    id: string
    source: GenerationHistorySource
    prompt: string
    model: string
    endpoint: string
    aspectRatio: string
    imageSize: string
    createdAt: number
    images: string[]
    category?: string
    favorite?: boolean
    recipe?: GenerationRecipe
}

const DB_NAME = 'vistack'
const LEGACY_DB_NAME = 'nano-banana-workbench'
const DB_VERSION = 1
const STORE_HISTORY = 'generation-history'

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

export function putGenerationHistoryItem(item: GenerationHistoryItem): Promise<IDBValidKey> {
    return historyTransaction<IDBValidKey>('readwrite', store => store.put(item))
}

export function clearGenerationHistoryItems(): Promise<undefined> {
    return historyTransaction<undefined>('readwrite', store => store.clear())
}

async function readHistoryItems(dbName: string): Promise<GenerationHistoryItem[]> {
    try {
        return await historyTransaction<GenerationHistoryItem[]>('readonly', store => store.getAll(), dbName)
    } catch (error) {
        console.warn('无法读取生成历史:', error)
        return []
    }
}
