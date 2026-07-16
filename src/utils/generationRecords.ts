import type { GenerateRequest, GenerationActualParams } from '../types'
import { sanitizeDiagnosticUrl } from './diagnostics'

export interface GenerationActualParamsContext {
    provider?: string
    resolvedEndpoint?: string
    requestCount?: number
    n?: number | string
    outputSize?: string
    referencePayloadField?: string
}

export function buildGenerationActualParams(
    request: GenerateRequest,
    context: GenerationActualParamsContext = {}
): GenerationActualParams {
    return compactActualParams({
        provider: context.provider,
        resolvedEndpoint: context.resolvedEndpoint
            ? sanitizeDiagnosticUrl(context.resolvedEndpoint)
            : undefined,
        requestCount: context.requestCount,
        n: context.n,
        aspectRatio: request.aspectRatio,
        imageSize: request.imageSize,
        outputSize: context.outputSize,
        quality: request.quality,
        autoPrompt: request.autoPrompt,
        translate: request.translate,
        referenceCount: request.images.length,
        referencePayloadField: context.referencePayloadField
    })
}

export function selectInitialHistoryId<T extends { id: string; images: string[] }>(items: T[]): string {
    return items.find(item => item.images.some(Boolean))?.id || ''
}

export function clampHistoryImageIndex(images: string[], index: number): number {
    if (!images.length) return 0
    if (!Number.isFinite(index)) return 0
    return Math.min(Math.max(Math.trunc(index), 0), images.length - 1)
}

function compactActualParams(params: GenerationActualParams): GenerationActualParams {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ) as GenerationActualParams
}
