import { computed, ref, type Ref } from 'vue'
import { resolveHistoryItemsImages, type GenerationHistoryItem } from './historyDb'
import type { ImageThumbnail } from './historyDb'
import type { HistoryAsset } from './assetLibrary'
import { resolveImageThumbnail } from './imageThumbnail'

function imageKey(item: GenerationHistoryItem): string {
    return JSON.stringify([item.id, item.imageIds || [], item.images.length])
}

export function createHistoryImageLoader(history: Ref<GenerationHistoryItem[]>, onError: () => void, pinned: () => string[] = () => []) {
    const originalLoading = ref(false)
    const thumbnailLoading = ref(false)
    const loading = computed(() => originalLoading.value || thumbnailLoading.value)
    const loaded = new Set<string>()
    const pending = new Map<string, Promise<void>>()
    const thumbnails = ref(new Map<string, ImageThumbnail | undefined>())
    const thumbnailPending = new Map<string, Promise<void>>()
    let visibleIds = new Set<string>()
    let queue = Promise.resolve()

    function releaseOriginals(keepIds: string[] = []) {
        const keep = new Set([...keepIds, ...pinned()])
        let changed = false
        const next = history.value.map(item => {
            if (keep.has(item.id) || pending.has(imageKey(item))) return item
            const images = item.images.map((image, index) => item.imageIds?.[index] ? (item.rawImageUrls?.[index] || '') : image)
            if (images.every((image, index) => image === item.images[index])) return item
            loaded.delete(imageKey(item))
            changed = true
            return { ...item, images }
        })
        if (changed) history.value = next
    }

    async function loadThumbnails(items: GenerationHistoryItem[]) {
        visibleIds = new Set(items.flatMap(item => item.imageIds || []).filter(Boolean))
        for (const id of thumbnails.value.keys()) {
            if (!visibleIds.has(id)) thumbnails.value.delete(id)
        }
        releaseOriginals(items.length ? history.value.filter(item => loaded.has(imageKey(item))).map(item => item.id) : [])
        for (const id of visibleIds) {
            if (thumbnails.value.has(id) || thumbnailPending.has(id)) continue
            const job = queue.then(async () => {
                if (!visibleIds.has(id)) return
                const thumbnail = await resolveImageThumbnail(id)
                if (visibleIds.has(id)) thumbnails.value.set(id, thumbnail)
            }).catch(onError).finally(() => {
                thumbnailPending.delete(id)
                thumbnailLoading.value = thumbnailPending.size > 0
            })
            queue = job
            thumbnailPending.set(id, job)
            thumbnailLoading.value = true
        }
        await Promise.all([...visibleIds].map(id => thumbnailPending.get(id)))
    }

    function withThumbnail(asset: HistoryAsset): HistoryAsset {
        const id = asset.item.imageIds?.[asset.index]
        if (!id) return asset
        const thumbnail = thumbnails.value.get(id)
        return { ...asset, image: thumbnail?.dataUrl || (thumbnails.value.has(id) ? asset.image : ''),
            originalWidth: thumbnail?.width, originalHeight: thumbnail?.height }
    }

    async function load(items: GenerationHistoryItem[]): Promise<void> {
        releaseOriginals(items.map(item => item.id))
        const requested = [...new Map(items.map(item => [imageKey(item), item])).values()]
        const fresh = requested.filter(item => item.imageIds?.some(Boolean) && !loaded.has(imageKey(item)) && !pending.has(imageKey(item)))
        if (fresh.length) {
            const job = resolveHistoryItemsImages(fresh).then(resolved => {
                const images = new Map(resolved.map(item => [imageKey(item), item.images]))
                // Merge only matching image lists, preserving edits or deletions made during the read.
                history.value = history.value.map(item => images.has(imageKey(item))
                    ? { ...item, images: images.get(imageKey(item))! }
                    : item)
                fresh.forEach(item => loaded.add(imageKey(item)))
            }).catch(onError).finally(() => {
                fresh.forEach(item => pending.delete(imageKey(item)))
                originalLoading.value = pending.size > 0
            })
            fresh.forEach(item => pending.set(imageKey(item), job))
            originalLoading.value = true
        }
        await Promise.all(requested.map(item => pending.get(imageKey(item))))
    }

    return { load, loading, loadThumbnails, withThumbnail, releaseOriginals }
}
