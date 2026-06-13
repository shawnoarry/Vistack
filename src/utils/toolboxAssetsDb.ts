export interface ToolboxModelAsset {
    id: string
    name: string
    images: string[]
    prompt: string
    notes: string
    mode: string
    framing: string
    usage: string
    fidelity: string
    style: string
    favorite: boolean
    createdAt: number
    updatedAt: number
}

const DB_NAME = 'vistack-toolbox'
const DB_VERSION = 1
const STORE_MODEL_ASSETS = 'model-assets'

const isIndexedDbAvailable = () => typeof indexedDB !== 'undefined'

function openToolboxDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!isIndexedDbAvailable()) {
            reject(new Error('当前环境不支持 IndexedDB'))
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = event => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_MODEL_ASSETS)) {
                db.createObjectStore(STORE_MODEL_ASSETS, { keyPath: 'id' })
            }
        }
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function modelAssetTransaction<T>(
    mode: IDBTransactionMode,
    handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return openToolboxDb().then(
        db =>
            new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_MODEL_ASSETS, mode)
                const store = transaction.objectStore(STORE_MODEL_ASSETS)
                const request = handler(store)
                request.onsuccess = () => resolve(request.result)
                request.onerror = () => reject(request.error)
            })
    )
}

export async function getToolboxModelAssets(): Promise<ToolboxModelAsset[]> {
    try {
        const items = await modelAssetTransaction<ToolboxModelAsset[]>('readonly', store => store.getAll())
        return items
            .map(normalizeModelAsset)
            .filter((item): item is ToolboxModelAsset => Boolean(item))
            .sort((a, b) => b.updatedAt - a.updatedAt)
    } catch (error) {
        console.warn('无法读取工具箱模特资产:', error)
        return []
    }
}

export function putToolboxModelAsset(asset: ToolboxModelAsset): Promise<IDBValidKey> {
    return modelAssetTransaction<IDBValidKey>('readwrite', store => store.put(normalizeModelAsset(asset) || asset))
}

export function deleteToolboxModelAsset(id: string): Promise<undefined> {
    return modelAssetTransaction<undefined>('readwrite', store => store.delete(id))
}

function normalizeModelAsset(value: unknown): ToolboxModelAsset | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    const item = value as Partial<ToolboxModelAsset>
    const id = typeof item.id === 'string' && item.id.trim() ? item.id : ''
    const name = typeof item.name === 'string' && item.name.trim() ? item.name.trim() : '未命名模特'
    const images = Array.isArray(item.images)
        ? item.images.filter((image): image is string => typeof image === 'string' && image.trim() !== '')
        : []
    const prompt = typeof item.prompt === 'string' ? item.prompt : ''

    if (!id || !images.length) return null

    return {
        id,
        name,
        images,
        prompt,
        notes: typeof item.notes === 'string' ? item.notes : '',
        mode: typeof item.mode === 'string' ? item.mode : 'turnaround',
        framing: typeof item.framing === 'string' ? item.framing : 'auto',
        usage: typeof item.usage === 'string' ? item.usage : 'general',
        fidelity: typeof item.fidelity === 'string' ? item.fidelity : 'high',
        style: typeof item.style === 'string' ? item.style : 'realistic',
        favorite: item.favorite === true,
        createdAt: normalizeTimestamp(item.createdAt),
        updatedAt: normalizeTimestamp(item.updatedAt)
    }
}

function normalizeTimestamp(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : Date.now()
}
