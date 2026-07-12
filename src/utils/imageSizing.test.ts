import { describe, expect, it } from 'vitest'
import {
    aspectRatioToDoraverseGptImageSize,
    aspectRatioToGeminiSize,
    aspectRatioToGrsaiGptImageSize,
    aspectRatioToOpenAiImageSize,
    buildAspectRatioOptions,
    normalizeImageResolution
} from './imageSizing'

describe('image size compatibility', () => {
    it('normalizes named resolutions without changing custom values', () => {
        expect(normalizeImageResolution(' 2k ')).toBe('2K')
        expect(normalizeImageResolution('auto')).toBe('auto')
        expect(normalizeImageResolution('2048x2048')).toBe('2048x2048')
    })

    it('keeps the current Gemini size table and scaling rules', () => {
        expect(aspectRatioToGeminiSize('1:1')).toBe('1024x1024')
        expect(aspectRatioToGeminiSize('16:9', '2K')).toBe('2688x1536')
        expect(aspectRatioToGeminiSize('9:16', '4K')).toBe('3072x5376')
        expect(aspectRatioToGeminiSize('1234x567', '4K')).toBe('1234x567')
        expect(aspectRatioToGeminiSize('unknown')).toBe('1024x1024')
    })

    it('keeps the Grsai GPT image size table', () => {
        expect(aspectRatioToGrsaiGptImageSize('1:1')).toBe('1280x1280')
        expect(aspectRatioToGrsaiGptImageSize('16:9', '2K')).toBe('2048x1152')
        expect(aspectRatioToGrsaiGptImageSize('9:16', '4K')).toBe('2160x3840')
        expect(aspectRatioToGrsaiGptImageSize('1600X900', '2K')).toBe('1600x900')
        expect(aspectRatioToGrsaiGptImageSize('unknown', '2K')).toBe('2048x2048')
    })

    it('maps Doraverse ratios to its three supported GPT image sizes', () => {
        expect(aspectRatioToDoraverseGptImageSize('1:1')).toBe('1024x1024')
        expect(aspectRatioToDoraverseGptImageSize('16:9')).toBe('1536x1024')
        expect(aspectRatioToDoraverseGptImageSize('9:16')).toBe('1024x1536')
    })

    it('keeps common OpenAI size conversions and automatic sizing', () => {
        expect(aspectRatioToOpenAiImageSize('1:1', '1K')).toBe('1024x1024')
        expect(aspectRatioToOpenAiImageSize('16:9', '4K')).toBe('3840x2160')
        expect(aspectRatioToOpenAiImageSize('9:16', '4K')).toBe('2160x3840')
        expect(aspectRatioToOpenAiImageSize('1:1', 'auto')).toBe('auto')
    })

    it('keeps explicit OpenAI sizes inside the current constraints', () => {
        expect(aspectRatioToOpenAiImageSize('100x100')).toBe('816x816')

        const [width, height] = aspectRatioToOpenAiImageSize('8000x1000').split('x').map(Number)
        expect(Math.max(width, height)).toBeLessThanOrEqual(3840)
        expect(Math.max(width, height) / Math.min(width, height)).toBeLessThanOrEqual(3)
        expect(width * height).toBeGreaterThanOrEqual(655_360)
        expect(width * height).toBeLessThanOrEqual(8_294_400)
    })

    it('builds selector labels without changing their values', () => {
        expect(buildAspectRatioOptions({ '1:1': '1024x1024', '16:9': '1344x768' })).toEqual([
            { value: '1:1', label: '1:1 - 1024x1024' },
            { value: '16:9', label: '16:9 - 1344x768' }
        ])
    })
})
