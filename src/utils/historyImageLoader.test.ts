import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createHistoryImageLoader } from './historyImageLoader'
import { resolveHistoryItemsImages, type GenerationHistoryItem } from './historyDb'
import { buildHistoryAssets, buildStudioHistoryAssets } from './assetLibrary'
import { selectInitialVisibleHistoryImage } from './generationRecords'
import { resolveImageThumbnail } from './imageThumbnail'

vi.mock('./historyDb', () => ({ resolveHistoryItemsImages: vi.fn() }))
vi.mock('./imageThumbnail', () => ({ resolveImageThumbnail: vi.fn() }))
const record = (id: string): GenerationHistoryItem => ({
    id, source: 'image', prompt: `prompt-${id}`, model: 'test', endpoint: '', createdAt: 1,
    aspectRatio: '1:1', imageSize: '1K', images: [''], imageIds: [`image-${id}`]
})

beforeEach(() => vi.resetAllMocks())

describe('progressive history images', () => {
    it('releases stored originals but preserves inline images and the pinned preview', async () => {
        const history = ref([record('old'), record('preview'), { ...record('inline'), imageIds: [] }])
        history.value.forEach(item => { item.images = [`data:${item.id}`] })
        const loader = createHistoryImageLoader(history, vi.fn(), () => ['preview'])
        loader.releaseOriginals()
        expect(history.value.map(item => item.images[0])).toEqual(['', 'data:preview', 'data:inline'])
        vi.mocked(resolveHistoryItemsImages).mockResolvedValue([{ ...record('old'), images: ['data:original'] }])
        await loader.load([history.value[0]])
        expect(history.value[0].images[0]).toBe('data:original')
        loader.releaseOriginals()
        await loader.load([history.value[0]])
        expect(resolveHistoryItemsImages).toHaveBeenCalledTimes(2)
    })

    it('keeps thumbnails separate from originals and drops thumbnails outside the current view', async () => {
        const history = ref([record('one'), record('two')])
        vi.mocked(resolveImageThumbnail).mockImplementation(async id => ({ id, dataUrl: `thumb:${id}`, width: 2048, height: 1024 }))
        const loader = createHistoryImageLoader(history, vi.fn())
        await loader.loadThumbnails([history.value[0]])
        const assets = buildHistoryAssets(history.value, { filter: 'all', search: '', sort: 'newest' })
        expect(loader.withThumbnail(assets[0]).image).toBe('thumb:image-one')
        expect(loader.withThumbnail(assets[0]).originalWidth).toBe(2048)
        expect(history.value[0].images).toEqual([''])
        expect(resolveHistoryItemsImages).not.toHaveBeenCalled()
        await loader.loadThumbnails([history.value[1]])
        expect(loader.withThumbnail(assets[0]).image).toBe('')
        expect(loader.withThumbnail(assets[1]).image).toBe('thumb:image-two')
    })

    it('discards a thumbnail read completed after navigating away', async () => {
        const history = ref([record('one')])
        let finish!: (value: undefined) => void
        vi.mocked(resolveImageThumbnail).mockImplementation(() => new Promise(resolve => { finish = resolve }))
        const loader = createHistoryImageLoader(history, vi.fn())
        const job = loader.loadThumbnails(history.value)
        await Promise.resolve()
        await loader.loadThumbnails([])
        finish(undefined)
        await job
        expect(loader.loading.value).toBe(false)
        expect(loader.withThumbnail({ id: 'one-0', item: history.value[0], index: 0, image: 'fallback' }).image).toBe('')
    })
    it('loads only requested groups and shares overlapping reads', async () => {
        const history = ref(Array.from({ length: 100 }, (_, index) => record(String(index))))
        let finish!: (items: GenerationHistoryItem[]) => void
        vi.mocked(resolveHistoryItemsImages).mockImplementation(() => new Promise(resolve => { finish = resolve }))
        const loader = createHistoryImageLoader(history, vi.fn())
        const first = loader.load(history.value.slice(0, 12))
        const overlapping = loader.load(history.value.slice(0, 6))
        expect(resolveHistoryItemsImages).toHaveBeenCalledTimes(1)
        expect(vi.mocked(resolveHistoryItemsImages).mock.calls[0][0]).toHaveLength(12)
        finish(history.value.slice(0, 12).map(item => ({ ...item, images: [`data:${item.id}`] })))
        await Promise.all([first, overlapping])
        expect(history.value.filter(item => item.images[0])).toHaveLength(12)
        await loader.load(history.value.slice(0, 12))
        expect(resolveHistoryItemsImages).toHaveBeenCalledTimes(1)
        expect(loader.loading.value).toBe(false)
    })

    it('does not undo a favorite edit or restore deleted images when a read finishes', async () => {
        const history = ref([record('keep'), record('delete'), record('change')])
        const snapshots = [...history.value]
        let finish!: (items: GenerationHistoryItem[]) => void
        vi.mocked(resolveHistoryItemsImages).mockImplementation(() => new Promise(resolve => { finish = resolve }))
        const loader = createHistoryImageLoader(history, vi.fn())
        const loading = loader.load(snapshots)
        history.value = [
            { ...history.value[0], favorite: true },
            { ...history.value[2], imageIds: ['replacement'], images: [''] }
        ]
        finish(snapshots.map(item => ({ ...item, images: [`data:${item.id}`] })))
        await loading
        expect(history.value.map(item => item.id)).toEqual(['keep', 'change'])
        expect(history.value[0].favorite).toBe(true)
        expect(history.value[0].images).toEqual(['data:keep'])
        expect(history.value[1].images).toEqual([''])
    })

    it('allows a failed read to be retried', async () => {
        const history = ref([record('retry')])
        const error = vi.fn()
        const loader = createHistoryImageLoader(history, error)
        vi.mocked(resolveHistoryItemsImages).mockRejectedValueOnce(new Error('read failure'))
        await loader.load(history.value)
        expect(error).toHaveBeenCalledOnce()
        expect(loader.loading.value).toBe(false)
        vi.mocked(resolveHistoryItemsImages).mockResolvedValueOnce([{ ...record('retry'), images: ['data:retry'] }])
        await loader.load(history.value)
        expect(history.value[0].images).toEqual(['data:retry'])
    })

    it('retains unloaded results in selection, search, and visibility counts', () => {
        const items = [
            { ...record('hidden'), hiddenImageIndexes: [0] }, record('visible'), record('older')
        ]
        expect(selectInitialVisibleHistoryImage(items)).toEqual({ id: 'visible', imageIndex: 0 })
        expect(buildStudioHistoryAssets(items, 1).map(asset => asset.item.id)).toEqual(['visible'])
        expect(buildHistoryAssets(items, { filter: 'all', search: 'older', sort: 'newest' }).map(asset => asset.item.id)).toEqual(['older'])
    })
})
