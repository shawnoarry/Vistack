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

export interface HistoryImageVisibilityRecord {
    images: string[]
    hiddenImageIndexes?: number[]
}

export function normalizeHiddenImageIndexes(item: HistoryImageVisibilityRecord): number[] {
    return Array.from(new Set(item.hiddenImageIndexes || []))
        .filter(index => Number.isInteger(index) && index >= 0 && index < item.images.length)
        .sort((left, right) => left - right)
}

export function isHistoryImageHidden(item: HistoryImageVisibilityRecord, imageIndex: number): boolean {
    return normalizeHiddenImageIndexes(item).includes(imageIndex)
}

export function setHistoryImageHidden<T extends HistoryImageVisibilityRecord>(
    item: T,
    imageIndex: number,
    hidden: boolean
): T {
    if (!Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex >= item.images.length) return item

    const indexes = new Set(normalizeHiddenImageIndexes(item))
    if (hidden) indexes.add(imageIndex)
    else indexes.delete(imageIndex)

    const hiddenImageIndexes = [...indexes].sort((left, right) => left - right)
    return {
        ...item,
        hiddenImageIndexes: hiddenImageIndexes.length ? hiddenImageIndexes : undefined
    }
}

export function reindexHiddenImagesAfterDeletion(
    item: HistoryImageVisibilityRecord,
    deletedImageIndex: number
): number[] | undefined {
    const nextIndexes = normalizeHiddenImageIndexes(item)
        .filter(index => index !== deletedImageIndex)
        .map(index => index > deletedImageIndex ? index - 1 : index)

    return nextIndexes.length ? nextIndexes : undefined
}

export function selectInitialVisibleHistoryImage<
    T extends { id: string } & HistoryImageVisibilityRecord
>(items: T[]): { id: string; imageIndex: number } | null {
    for (const item of items) {
        const imageIndex = item.images.findIndex((image, index) => Boolean(image) && !isHistoryImageHidden(item, index))
        if (imageIndex >= 0) return { id: item.id, imageIndex }
    }
    return null
}

function compactActualParams(params: GenerationActualParams): GenerationActualParams {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
    ) as GenerationActualParams
}
