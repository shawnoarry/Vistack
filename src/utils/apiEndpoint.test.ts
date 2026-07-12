import { describe, expect, it } from 'vitest'
import {
    getEndpointPath,
    isDoraverseImageProxyEndpoint,
    isGrsaiEndpoint,
    isLjqclubImageEndpoint,
    isOpenAiImageModelId,
    normalizeEndpointPath,
    resolveChatCompletionsEndpoint,
    resolveImageGenerationEndpoint,
    resolveModelEndpointCandidates,
    resolveSiblingEndpoint
} from './apiEndpoint'

describe('API endpoint compatibility', () => {
    it('keeps complete endpoints unchanged', () => {
        const endpoint = 'https://api.example.com/v1/chat/completions?tenant=demo'

        expect(resolveChatCompletionsEndpoint(endpoint)).toBe(endpoint)
        expect(resolveImageGenerationEndpoint(endpoint, 'gpt-image-1')).toBe(endpoint)
    })

    it('builds chat and OpenAI image endpoints from a base URL', () => {
        const endpoint = 'https://api.example.com'

        expect(resolveChatCompletionsEndpoint(endpoint)).toBe('https://api.example.com/v1/chat/completions')
        expect(resolveImageGenerationEndpoint(endpoint, 'gpt-image-1')).toBe('https://api.example.com/v1/images/generations')
        expect(resolveImageGenerationEndpoint(endpoint, 'gpt-image-1', true)).toBe('https://api.example.com/v1/images/edits')
        expect(resolveImageGenerationEndpoint(endpoint, 'gemini-2.5-flash-image')).toBe('https://api.example.com/v1/chat/completions')
    })

    it('preserves query parameters while extending an incomplete URL', () => {
        expect(resolveChatCompletionsEndpoint('https://api.example.com/v1?tenant=demo'))
            .toBe('https://api.example.com/v1/chat/completions?tenant=demo')
    })

    it('keeps the Grsai and Doraverse routes used by the current adapters', () => {
        expect(resolveImageGenerationEndpoint('https://api.grsai.com', 'nano-banana-pro'))
            .toBe('https://api.grsai.com/v1/api/generate')
        expect(resolveImageGenerationEndpoint('https://metapi.lilililwan.xyz/v1', 'gpt-image-1'))
            .toBe('https://metapi.lilililwan.xyz/v1/images/generations')
        expect(resolveImageGenerationEndpoint('https://metapi.lilililwan.xyz/v1', 'gpt-image-1', true))
            .toBe('https://metapi.lilililwan.xyz/v1/images/edits')
    })

    it('builds the complete model endpoint candidate list in stable order', () => {
        expect(resolveModelEndpointCandidates('https://api.example.com/v1/chat/completions')).toEqual([
            'https://api.example.com/v1/models',
            'https://api.example.com/v1/model',
            'https://api.example.com/v1/models/list',
            'https://api.example.com/v1/model/list',
            'https://api.example.com/v1/list/models',
            'https://api.example.com/v1/list/model'
        ])
    })

    it('recognizes the provider and model variants used by routing', () => {
        expect(isGrsaiEndpoint('https://api.grsai.com/v1')).toBe(true)
        expect(isDoraverseImageProxyEndpoint('https://metapi.lilililwan.xyz/imageproxy/v1')).toBe(true)
        expect(isLjqclubImageEndpoint('https://api.ljqclub.com/v1')).toBe(true)
        expect(isLjqclubImageEndpoint('https://fake-ljqclub.com/v1')).toBe(false)
        expect(isOpenAiImageModelId('GPT Image 1')).toBe(true)
        expect(isOpenAiImageModelId('dall-e-3')).toBe(true)
        expect(isOpenAiImageModelId('gemini-3-pro-image')).toBe(false)
    })

    it('normalizes paths and resolves sibling endpoints', () => {
        expect(getEndpointPath('https://api.example.com/V1/Models/')).toBe('/v1/models')
        expect(normalizeEndpointPath('/V1/Images/Generations/')).toBe('/v1/images/generations')
        expect(resolveSiblingEndpoint('https://api.example.com/v1/chat/completions', 'models/list'))
            .toBe('https://api.example.com/v1/models/list')
    })
})
