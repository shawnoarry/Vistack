import { computed, watch, type Ref } from 'vue'
import type { WorkspaceMode } from '../types'
import type { GenerationHistoryItem } from '../utils/historyDb'
import type { createHistoryImageLoader } from '../utils/historyImageLoader'
import { buildHistoryAssets, buildStudioHistoryAssets, type AssetSortOrder } from '../utils/assetLibrary'
import { hasHistoryImage, isHistoryImageHidden } from '../utils/generationRecords'

export const ASSET_PAGE_SIZE = 36

interface HistoryAssetState {
    generationHistory: Ref<GenerationHistoryItem[]>
    assetCollections: Ref<string[]>
    studioHistoryGroupLimit: Ref<number>
    historyFilter: Ref<string>
    assetSearch: Ref<string>
    assetSort: Ref<AssetSortOrder>
    selectedAssetIds: Ref<string[]>
    assetDisplayLimit: Ref<number>
    currentView: Ref<'studio' | 'assets' | 'toolbox'>
    workspaceMode: Ref<WorkspaceMode>
    historyImageLoader: ReturnType<typeof createHistoryImageLoader>
}

export function useHistoryAssets({
    generationHistory, assetCollections, studioHistoryGroupLimit, historyFilter,
    assetSearch, assetSort, selectedAssetIds, assetDisplayLimit,
    currentView, workspaceMode, historyImageLoader
}: HistoryAssetState) {
    const historyCategories = computed(() =>
        Array.from(new Set(generationHistory.value.map(item => item.category).filter(Boolean) as string[]))
    )

    const collectionOptions = computed(() =>
        Array.from(new Set([...assetCollections.value, ...historyCategories.value])).filter(Boolean)
    )

    const favoriteHistory = computed(() => generationHistory.value.filter(item => item.favorite))
    const studioVisibleHistoryItems = computed(() => generationHistory.value.filter(item =>
        item.images.some((_, index) => hasHistoryImage(item, index) && !isHistoryImageHidden(item, index))
    ))
    const recentGenerationHistory = computed(() =>
        studioVisibleHistoryItems.value.slice(0, 6)
    )
    const formatHistoryListTime = (timestamp: number) => new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp))

    const allHistoryAssets = computed(() => buildHistoryAssets(generationHistory.value, {
        filter: 'all',
        search: '',
        sort: 'newest'
    }))
    const studioHistoryAssets = computed(() => buildStudioHistoryAssets(
        generationHistory.value,
        studioHistoryGroupLimit.value
    ).map(historyImageLoader.withThumbnail))
    const hasMoreStudioHistory = computed(() => studioVisibleHistoryItems.value.length > studioHistoryGroupLimit.value)
    const hiddenHistoryAssetCount = computed(() => generationHistory.value.reduce(
        (count, item) => count + item.images.filter((_, index) => isHistoryImageHidden(item, index)).length,
        0
    ))
    const favoriteHistoryAssetCount = computed(() => allHistoryAssets.value.filter(asset => asset.item.favorite).length)

    const filteredHistoryAssets = computed(() => buildHistoryAssets(generationHistory.value, {
        filter: historyFilter.value,
        search: assetSearch.value,
        sort: assetSort.value
    }))

    const selectedHistoryAssets = computed(() =>
        allHistoryAssets.value.filter(asset => selectedAssetIds.value.includes(asset.id))
    )

    const visibleLibraryAssets = computed(() => filteredHistoryAssets.value.slice(0, assetDisplayLimit.value).map(historyImageLoader.withThumbnail))
    watch([historyFilter, assetSearch, assetSort], () => { assetDisplayLimit.value = ASSET_PAGE_SIZE })
    watch(
        () => currentView.value === 'assets'
            ? filteredHistoryAssets.value.slice(0, assetDisplayLimit.value).map(asset => asset.item)
            : currentView.value === 'studio' && workspaceMode.value !== 'canvas'
                ? studioVisibleHistoryItems.value.slice(0, studioHistoryGroupLimit.value)
                : [],
        items => { void historyImageLoader.loadThumbnails(items) },
        { immediate: true }
    )

    return {
        collectionOptions, favoriteHistory, studioVisibleHistoryItems, recentGenerationHistory,
        formatHistoryListTime, allHistoryAssets, studioHistoryAssets, hasMoreStudioHistory,
        hiddenHistoryAssetCount, favoriteHistoryAssetCount, filteredHistoryAssets,
        selectedHistoryAssets, visibleLibraryAssets
    }
}
