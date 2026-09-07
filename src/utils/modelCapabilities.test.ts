import { describe, expect, it } from 'vitest'
import { getGeminiChatCapabilities, inferModelOptionMetadata, shouldPreferInferredSizeMetadata } from './modelCapabilities'

describe('existing provider and model capability profiles', () => {
    it('preserves provider-specific GPT Image 2 size formats', () => {
        expect(inferModelOptionMetadata('gpt-image-2', 'https://api.example.com/v1')).toMatchObject({
            sizeFormat: 'ratio', supportedResolutions: ['1K', '2K', '4K'], hasResolution: true
        })
        expect(inferModelOptionMetadata('gpt-image-2', 'https://metapi.lilililwan.xyz/v1')).toMatchObject({
            sizeFormat: 'absolute', supportedSizes: ['1024x1024', '1536x1024', '1024x1536'], hasResolution: false
        })
        expect(inferModelOptionMetadata('gpt-image-2', 'https://ljqclub.com/v1')).toMatchObject({
            sizeFormat: 'ratio', defaultSize: '4:5', hasResolution: false
        })
    })

    it.each([
        ['nano-banana-2', 4, 4, true], ['nano-banana-pro', 4, 2, true],
        ['gemini-3-pro-image', 4, 4, true], ['gemini-2.5-flash-image', 4, 2, false],
        ['grok-imagine', 4, 1, false], ['seedream', 6, 6, false], ['flux', 1, 1, false]
    ])('preserves %s count and reference limits', (model, maxGenerations, maxInputImages, hasResolution) => {
        expect(inferModelOptionMetadata(String(model), '')).toMatchObject({ maxGenerations, maxInputImages, hasResolution })
    })

    it('keeps unknown models unrestricted by inferred metadata', () => {
        expect(inferModelOptionMetadata('custom-team-model', 'https://custom.example/v1')).toEqual({})
        expect(shouldPreferInferredSizeMetadata('custom-team-model', '')).toBe(false)
        expect(getGeminiChatCapabilities('custom-team-model')).toEqual({ googleSearch: false, mappedSize: false })
    })

    it('keeps the non-4K Banana Pro resolution restriction', () => {
        expect(inferModelOptionMetadata('nano-banana-pro', '').supportedResolutions).toEqual(['1K', '2K'])
        expect(inferModelOptionMetadata('nano-banana-pro-4k', '').supportedResolutions).toEqual(['1K', '2K', '4K'])
    })

    it('preserves Gemini chat aliases without enabling search for Flash', () => {
        expect(getGeminiChatCapabilities('Google/Gemini-3.1-Pro')).toEqual({ googleSearch: true, mappedSize: true })
        expect(getGeminiChatCapabilities('gemini-2.5-flash-image')).toEqual({ googleSearch: false, mappedSize: true })
    })
})
