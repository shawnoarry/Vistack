import { effectScope, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHistoryAssets } from './useHistoryAssets'
import { createHistoryImageLoader } from '../utils/historyImageLoader'
import { resolveImageThumbnail } from '../utils/imageThumbnail'
import type { GenerationHistoryItem } from '../utils/historyDb'
import type { WorkspaceMode } from '../types'

vi.mock('../utils/imageThumbnail', () => ({ resolveImageThumbnail: vi.fn() }))

describe('recent history thumbnails', () => {
    it('uses the visible local thumbnail after original release, including canvas mode', async () => {
        const item: GenerationHistoryItem = {
            id: 'history', source: 'image', createdAt: 1, prompt: '', model: '', endpoint: '',
            aspectRatio: '1:1', imageSize: '2K', images: ['data:hidden', 'data:original'],
            imageIds: ['hidden', 'visible'], rawImageUrls: ['', 'https://expired.example/image'],
            hiddenImageIndexes: [0]
        }
        const history = ref([item])
        const workspaceMode = ref<WorkspaceMode>('quick')
        const currentView = ref<'studio' | 'assets' | 'toolbox'>('studio')
        vi.mocked(resolveImageThumbnail).mockImplementation(async id => ({ id, dataUrl: `thumb:${id}`, width: 2048, height: 2048 }))
        const loader = createHistoryImageLoader(history, vi.fn())
        const scope = effectScope()
        const state = scope.run(() => useHistoryAssets({
            generationHistory: history, assetCollections: ref([]), studioHistoryGroupLimit: ref(12),
            historyFilter: ref('all'), assetSearch: ref(''), assetSort: ref('newest'),
            selectedAssetIds: ref([]), assetDisplayLimit: ref(36), currentView, workspaceMode,
            historyImageLoader: loader
        }))!
        try {
            await loader.loadThumbnails(history.value)
            loader.releaseOriginals()
            expect(history.value[0].images[1]).toBe('https://expired.example/image')
            expect(state.firstVisibleHistoryImage(history.value[0])).toBe('thumb:visible')
            currentView.value = 'toolbox'
            await nextTick()
            await loader.loadThumbnails([])
            workspaceMode.value = 'canvas'
            currentView.value = 'studio'
            await nextTick()
            await loader.loadThumbnails(history.value)
            expect(state.firstVisibleHistoryImage(history.value[0])).toBe('thumb:visible')
            expect(state.firstVisibleHistoryImage({ ...item, hiddenImageIndexes: [0, 1] })).toBe('')
        } finally {
            scope.stop()
        }
    })
})
