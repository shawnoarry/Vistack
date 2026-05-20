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
}

const DB_NAME = 'nano-banana-workbench'
const DB_VERSION = 1
const STORE_HISTORY = 'generation-history'

const isIndexedDbAvailable = () => typeof indexedDB !== 'undefined'

function openHistoryDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!isIndexedDbAvailable()) {
            reject(new Error('当前环境不支持 IndexedDB'))
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)
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
    handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return openHistoryDb().then(
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
    const items = await historyTransaction<GenerationHistoryItem[]>('readonly', store => store.getAll())
    return items.sort((a, b) => b.createdAt - a.createdAt)
}

export function putGenerationHistoryItem(item: GenerationHistoryItem): Promise<IDBValidKey> {
    return historyTransaction<IDBValidKey>('readwrite', store => store.put(item))
}

export function clearGenerationHistoryItems(): Promise<undefined> {
    return historyTransaction<undefined>('readwrite', store => store.clear())
}
