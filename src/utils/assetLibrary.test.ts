import { describe, expect, it } from 'vitest'
import type { GenerationHistoryItem } from './historyDb'
import { buildAssetDownloadFilename, buildHistoryAssets, buildStudioHistoryAssets } from './assetLibrary'

const historyItem = (overrides: Partial<GenerationHistoryItem>): GenerationHistoryItem => ({
    id: 'history-1',
    source: 'image',
    prompt: 'Replace the blue coat',
    model: 'image-editor-v1',
    endpoint: 'https://example.com/v1',
    aspectRatio: '1:1',
    imageSize: '2K',
    createdAt: 100,
    images: ['image-a'],
    ...overrides
})

describe('asset library queries', () => {
    const items = [
        historyItem({ id: 'new', createdAt: 300, images: ['new-a', 'new-b'], favorite: true }),
        historyItem({ id: 'middle', createdAt: 200, prompt: 'Warm portrait', model: 'portrait-v2', source: 'text' }),
        historyItem({ id: 'old', createdAt: 100, category: 'Campaign', prompt: 'Product packshot' })
    ]

    it('flattens images and keeps newest records first', () => {
        const assets = buildHistoryAssets(items, { filter: 'all', search: '', sort: 'newest' })

        expect(assets.map(asset => asset.id)).toEqual(['new-0', 'new-1', 'middle-0', 'old-0'])
    })

    it('searches prompts and model names case-insensitively', () => {
        expect(buildHistoryAssets(items, { filter: 'all', search: 'PORTRAIT', sort: 'newest' })[0]?.id).toBe('middle-0')
        expect(buildHistoryAssets(items, { filter: 'all', search: 'packshot', sort: 'newest' })[0]?.id).toBe('old-0')
    })

    it('combines favorite and category filters with sorting', () => {
        expect(buildHistoryAssets(items, { filter: 'favorite', search: '', sort: 'oldest' }).map(asset => asset.id)).toEqual(['new-0', 'new-1'])
        expect(buildHistoryAssets(items, { filter: 'category:Campaign', search: '', sort: 'newest' })[0]?.id).toBe('old-0')
    })

    it('hides studio cards without removing them from the asset library', () => {
        const items = [historyItem({
            id: 'visibility',
            images: ['visible-a', 'hidden-b'],
            hiddenImageIndexes: [1]
        })]

        expect(buildStudioHistoryAssets(items, 12).map(asset => asset.image)).toEqual(['visible-a'])
        expect(buildHistoryAssets(items, { filter: 'all', search: '', sort: 'newest' }).map(asset => asset.image))
            .toEqual(['visible-a', 'hidden-b'])
    })
})

describe('asset download filenames', () => {
    it('uses stable timestamps, sequence numbers, and normalized extensions', () => {
        const timestamp = new Date(2026, 6, 13, 12, 30, 45).getTime()

        expect(buildAssetDownloadFilename(timestamp, 1, 5, 'jpeg')).toBe('vistack-20260713-123045-01.jpg')
        expect(buildAssetDownloadFilename(timestamp, 12, 120, 'png')).toBe('vistack-20260713-123045-012.png')
    })
})
