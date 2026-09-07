import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getImageThumbnail, getStoredImage, putImageThumbnail } from './historyDb'
import { resolveImageThumbnail } from './imageThumbnail'

vi.mock('./historyDb', () => ({ getImageThumbnail: vi.fn(), getStoredImage: vi.fn(), putImageThumbnail: vi.fn() }))
beforeEach(() => {
    vi.resetAllMocks()
    vi.unstubAllGlobals()
    vi.mocked(getImageThumbnail).mockResolvedValue(undefined)
    vi.mocked(putImageThumbnail).mockResolvedValue(undefined)
})

describe('disposable image thumbnails', () => {
    it('reads a cached thumbnail without reading the original', async () => {
        const cached = { id: 'v1:one', dataUrl: 'thumb', width: 2048, height: 1024 }
        vi.mocked(getImageThumbnail).mockResolvedValue(cached)
        expect(await resolveImageThumbnail('one')).toEqual(cached)
        expect(getStoredImage).not.toHaveBeenCalled()
    })

    it('falls back to the original when decoding fails, without caching the original', async () => {
        vi.mocked(getStoredImage).mockResolvedValue({ id: 'one', dataUrl: 'original', createdAt: 1, source: 'generated' })
        expect((await resolveImageThumbnail('one'))?.dataUrl).toBe('original')
        expect(putImageThumbnail).not.toHaveBeenCalled()
    })

    it('retains transparency and aspect ratio, and returns the thumbnail when cache writes fail', async () => {
        vi.mocked(getStoredImage).mockResolvedValue({ id: 'one', dataUrl: 'original', createdAt: 1, source: 'generated' })
        vi.mocked(putImageThumbnail).mockRejectedValue(new Error('quota'))
        vi.stubGlobal('Image', class { src = ''; naturalWidth = 2048; naturalHeight = 1024; decode = async () => {} })
        const drawImage = vi.fn()
        const toDataURL = vi.fn(() => 'data:image/webp;thumbnail')
        const canvas = { width: 0, height: 0, getContext: () => ({ drawImage }), toDataURL }
        vi.stubGlobal('document', { createElement: () => canvas })
        const result = await resolveImageThumbnail('one')
        expect(drawImage.mock.calls[0].slice(1)).toEqual([0, 0, 640, 320])
        expect(toDataURL).toHaveBeenCalledWith('image/webp', 0.8)
        expect(result).toMatchObject({ dataUrl: 'data:image/webp;thumbnail', width: 2048, height: 1024 })
        expect(canvas.width).toBe(0)
    })
})
