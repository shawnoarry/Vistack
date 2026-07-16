import { describe, expect, it } from 'vitest'
import type { GenerateRequest } from '../types'
import { buildGenerationActualParams, clampHistoryImageIndex, selectInitialHistoryId } from './generationRecords'

const request: GenerateRequest = {
    prompt: 'edit this image',
    images: ['data:image/png;base64,reference'],
    apikey: 'sk-private',
    endpoint: 'https://api.example.com/v1/images?token=private',
    model: 'gpt-image-1',
    proxyToken: 'proxy-private',
    aspectRatio: '1:1',
    imageSize: '2K',
    quality: 'high',
    autoPrompt: true
}

describe('generation record snapshots', () => {
    it('keeps only display-safe actual parameters', () => {
        const actualParams = buildGenerationActualParams(request, {
            provider: 'openai-image-edit',
            resolvedEndpoint: 'https://api.example.com/v1/images?token=private&mode=edit',
            requestCount: 1,
            n: 'not sent',
            outputSize: '1024x1024',
            referencePayloadField: 'multipart image[]'
        })

        expect(actualParams).toEqual({
            provider: 'openai-image-edit',
            resolvedEndpoint: 'https://api.example.com/v1/images?token=%5BREDACTED%5D&mode=edit',
            requestCount: 1,
            n: 'not sent',
            aspectRatio: '1:1',
            imageSize: '2K',
            outputSize: '1024x1024',
            quality: 'high',
            autoPrompt: true,
            referenceCount: 1,
            referencePayloadField: 'multipart image[]'
        })
        expect(JSON.stringify(actualParams)).not.toContain('sk-private')
        expect(JSON.stringify(actualParams)).not.toContain('proxy-private')
        expect(JSON.stringify(actualParams)).not.toContain('data:image')
    })
})

describe('history result selection', () => {
    it('restores the newest history group that still has a readable image', () => {
        expect(selectInitialHistoryId([
            { id: 'empty-new', images: [] },
            { id: 'new-readable', images: ['', 'image-b'] },
            { id: 'old-readable', images: ['image-c'] }
        ])).toBe('new-readable')
    })

    it('keeps the selected image index inside the current generation', () => {
        expect(clampHistoryImageIndex(['a', 'b'], 9)).toBe(1)
        expect(clampHistoryImageIndex(['a', 'b'], -2)).toBe(0)
        expect(clampHistoryImageIndex([], 1)).toBe(0)
    })
})
