import type { ModelOption } from '../types'
import { aspectRatioToDoraverseGptImageSize, aspectRatioToOpenAiImageSize } from './imageSizing'
import { isDoraverseImageProxyEndpoint, isLjqclubImageEndpoint } from './apiEndpoint'

export const imageQualityOptions = ['auto', 'low', 'medium', 'high'].map(value => ({ value, label: value }))

export function getGeminiChatCapabilities(modelId: string) {
    const normalized = modelId.toLowerCase()
    const googleSearch = normalized.includes('gemini-3-pro-image') ||
        normalized.includes('gemini-3-pro') || normalized.includes('gemini-3.1-pro')
    return {
        googleSearch,
        mappedSize: googleSearch || normalized.includes('nano-banana') || normalized.includes('gemini-2.5-flash-image')
    }
}

const ratioSizeOptions = ['21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16']

export function resolveOpenAiImageSize(endpoint: string, modelId: string, aspectRatio: string, imageSize?: string): string {
    if (isLjqclubImageEndpoint(endpoint)) {
        return aspectRatio || 'auto'
    }

    if (isDoraverseImageProxyEndpoint(endpoint)) {
        if (shouldUseDoraverseGptImageSize(endpoint, modelId)) {
            return aspectRatioToDoraverseGptImageSize(aspectRatio)
        }

        return aspectRatio || 'auto'
    }

    return aspectRatioToOpenAiImageSize(aspectRatio, imageSize)
}

function shouldUseDoraverseGptImageSize(endpoint: string, modelId: string): boolean {
    return isDoraverseImageProxyEndpoint(endpoint) && /^gpt-image-2\b/i.test(modelId.trim())
}

export const isGptImage2ModelId = (modelId: string): boolean =>
    /(^|[/:\s_-])gpt[\s_-]*image[\s_-]*2\b/i.test(modelId.trim())

const isKnownDynamicResolutionImageModelId = (modelId: string): boolean => {
    const normalized = modelId.toLowerCase()
    return /gpt[\s_-]*image|gptimage/.test(normalized) ||
        normalized.includes('nano-banana-2') ||
        normalized.includes('nano-banana-pro') ||
        normalized.includes('gemini-3-pro-image') ||
        normalized.includes('gemini-3-pro') ||
        normalized.includes('gemini-3.1-pro')
}

const isLjqclubCodexImageModel = (modelId: string, endpoint: string): boolean =>
    isLjqclubImageEndpoint(endpoint) && /gpt[\s_-]*image|gptimage/.test(modelId.toLowerCase())

export const shouldPreferInferredSizeMetadata = (modelId: string, endpoint: string): boolean =>
    isKnownDynamicResolutionImageModelId(modelId) ||
    (isDoraverseImageProxyEndpoint(endpoint) && isGptImage2ModelId(modelId))

export const inferModelOptionMetadata = (modelId: string, endpoint: string): Partial<ModelOption> => {
    const normalized = modelId.toLowerCase()

    if (/gpt[\s_-]*image|gptimage/.test(normalized)) {
        if (isLjqclubCodexImageModel(modelId, endpoint)) {
            return {
                sizeFormat: 'ratio',
                maxGenerations: 4,
                maxInputImages: 4,
                defaultSize: '4:5',
                hasResolution: false,
                supportedSizes: ratioSizeOptions
            }
        }

        if (isDoraverseImageProxyEndpoint(endpoint) && isGptImage2ModelId(modelId)) {
            return {
                sizeFormat: 'absolute',
                maxGenerations: 4,
                maxInputImages: 4,
                defaultSize: '1024x1024',
                defaultResolution: '720p',
                supportedSizes: ['1024x1024', '1536x1024', '1024x1536'],
                supportedResolutions: ['720p'],
                hasResolution: false
            }
        }

        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 4,
            defaultSize: '1:1',
            defaultResolution: '1K',
            supportedResolutions: ['1K', '2K', '4K'],
            hasResolution: true
        }
    }

    if (normalized.includes('nano-banana-2')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 4,
            defaultSize: '21:9',
            defaultResolution: normalized.includes('4k') ? '4K' : '1K',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: ['1K', '2K', '4K'],
            hasResolution: true
        }
    }

    if (normalized.includes('nano-banana-pro')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 2,
            defaultSize: '21:9',
            defaultResolution: normalized.includes('4k') ? '4K' : '1K',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: normalized.includes('4k') ? ['1K', '2K', '4K'] : ['1K', '2K'],
            hasResolution: true
        }
    }

    if (normalized.includes('gemini-3-pro-image') || normalized.includes('gemini-3-pro') || normalized.includes('gemini-3.1-pro')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 4,
            defaultSize: '1:1',
            defaultResolution: '1K',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: ['1K', '2K', '4K'],
            hasResolution: true
        }
    }

    if (normalized.includes('nano-banana') || normalized.includes('gemini-2.5-flash-image')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 2,
            defaultSize: '21:9',
            defaultResolution: '720p',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    if (normalized.includes('grok-imagine')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 1,
            defaultSize: '2:1',
            defaultResolution: '720p',
            supportedSizes: ['2:1', '20:9', '19.5:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:19.5', '9:20', '1:2'],
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    if (normalized.includes('seedream')) {
        return {
            sizeFormat: 'named',
            maxGenerations: 6,
            maxInputImages: 6,
            defaultSize: 'square_hd',
            defaultResolution: '720p',
            supportedSizes: ['auto', 'square', 'square_hd', '3:4', '4:3', '9:16', '16:9', 'auto_2K', 'auto_4K'],
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    if (normalized.includes('flux')) {
        return {
            sizeFormat: 'named',
            maxGenerations: 1,
            maxInputImages: 1,
            defaultSize: 'square_hd',
            defaultResolution: '720p',
            supportedSizes: ['square_hd', 'square', 'portrait_4:3', 'portrait_16:9', 'landscape_4:3', 'landscape_16:9'],
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    return {}
}
