import type { GenerationHistoryItem } from './historyDb'

export type AssetSortOrder = 'newest' | 'oldest'

export interface HistoryAsset {
    id: string
    item: GenerationHistoryItem
    image: string
    index: number
}

export interface AssetLibraryQuery {
    filter: string
    search: string
    sort: AssetSortOrder
}

const matchesFilter = (item: GenerationHistoryItem, filter: string) => {
    if (filter === 'all') return true
    if (filter === 'favorite') return item.favorite === true
    if (filter === 'text' || filter === 'image') return item.source === filter
    if (filter.startsWith('category:')) return item.category === filter.slice('category:'.length)
    return true
}

const matchesSearch = (item: GenerationHistoryItem, search: string) => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return true

    return [item.prompt, item.recipe?.mainPrompt, item.model]
        .filter((value): value is string => Boolean(value))
        .some(value => value.toLocaleLowerCase().includes(query))
}

export const buildHistoryAssets = (
    items: GenerationHistoryItem[],
    query: AssetLibraryQuery
): HistoryAsset[] => {
    const direction = query.sort === 'oldest' ? 1 : -1

    return items
        .filter(item => matchesFilter(item, query.filter) && matchesSearch(item, query.search))
        .sort((left, right) => (left.createdAt - right.createdAt) * direction)
        .flatMap(item => item.images.map((image, index) => ({
            id: `${item.id}-${index}`,
            item,
            image,
            index
        })))
}

const normalizeExtension = (extension: string) => {
    const normalized = extension.toLocaleLowerCase().replace(/[^a-z0-9]/g, '')
    if (normalized === 'jpeg') return 'jpg'
    return normalized || 'png'
}

export const buildAssetDownloadFilename = (
    timestamp: number,
    sequence: number,
    total: number,
    extension: string
) => {
    const date = new Date(timestamp)
    const datePart = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
    ].join('')
    const timePart = [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
        String(date.getSeconds()).padStart(2, '0')
    ].join('')
    const width = Math.max(2, String(total).length)
    const sequencePart = String(sequence).padStart(width, '0')

    return `vistack-${datePart}-${timePart}-${sequencePart}.${normalizeExtension(extension)}`
}
