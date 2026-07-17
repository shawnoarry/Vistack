import type { GenerationActualParams, GenerationBatchMode, GenerationTask } from '../types'
import { sanitizeDiagnosticUrl, summarizeDiagnosticError } from './diagnostics'

export interface GenerationFailureRecord {
    id: string
    source: GenerationTask['source']
    origin: NonNullable<GenerationTask['origin']>
    title: string
    prompt: string
    createdAt: number
    model: string
    endpoint: string
    resolvedEndpoint?: string
    requestProvider?: string
    aspectRatio: string
    imageSize: string
    count: number
    batchMode?: GenerationBatchMode
    useProxy?: boolean
    durationMs?: number
    errorSummary: string
    actualParams?: GenerationActualParams
}

const FAILURE_RECORDS_KEY = 'vistack-generation-failure-records'
export const FAILURE_RECORD_LIMIT = 20

export interface FailureRecordStorage {
    getItem(key: string): string | null
    setItem(key: string, value: string): void
}

export function buildGenerationFailureRecord(task: GenerationTask, message: string): GenerationFailureRecord {
    const resolvedEndpoint = task.resolvedEndpoint || task.endpoint
    const actualParams = task.actualParams
        ? {
            ...task.actualParams,
            resolvedEndpoint: task.actualParams.resolvedEndpoint
                ? sanitizeDiagnosticUrl(task.actualParams.resolvedEndpoint)
                : undefined
        }
        : undefined

    return {
        id: task.id,
        source: task.source,
        origin: task.origin || 'studio',
        title: task.title,
        prompt: task.prompt,
        createdAt: task.createdAt,
        model: task.model,
        endpoint: sanitizeDiagnosticUrl(task.endpoint),
        resolvedEndpoint: resolvedEndpoint ? sanitizeDiagnosticUrl(resolvedEndpoint) : undefined,
        requestProvider: task.requestProvider,
        aspectRatio: task.aspectRatio,
        imageSize: task.imageSize,
        count: task.count,
        batchMode: task.batchMode || task.recipe.batchMode,
        useProxy: task.useProxy === true,
        durationMs: task.durationMs,
        errorSummary: summarizeDiagnosticError(message),
        actualParams
    }
}

export function addGenerationFailureRecord(
    records: GenerationFailureRecord[],
    record: GenerationFailureRecord,
    limit = FAILURE_RECORD_LIMIT
): GenerationFailureRecord[] {
    return [record, ...records.filter(item => item.id !== record.id)]
        .sort((left, right) => right.createdAt - left.createdAt)
        .slice(0, Math.max(Math.trunc(limit), 0))
}

export function loadGenerationFailureRecords(
    storage: FailureRecordStorage | undefined = getBrowserStorage()
): GenerationFailureRecord[] {
    if (!storage) return []

    try {
        const raw = storage.getItem(FAILURE_RECORDS_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []

        return parsed
            .filter(isFailureRecord)
            .sort((left, right) => right.createdAt - left.createdAt)
            .slice(0, FAILURE_RECORD_LIMIT)
    } catch {
        return []
    }
}

export function saveGenerationFailureRecords(
    records: GenerationFailureRecord[],
    storage: FailureRecordStorage | undefined = getBrowserStorage()
): void {
    if (!storage) return

    try {
        storage.setItem(FAILURE_RECORDS_KEY, JSON.stringify(records.slice(0, FAILURE_RECORD_LIMIT)))
    } catch (error) {
        console.warn('无法保存失败记录:', error)
    }
}

function getBrowserStorage(): FailureRecordStorage | undefined {
    return typeof localStorage === 'undefined' ? undefined : localStorage
}

function isFailureRecord(value: unknown): value is GenerationFailureRecord {
    if (!value || typeof value !== 'object') return false
    const item = value as Partial<GenerationFailureRecord>
    return typeof item.id === 'string' &&
        (item.source === 'text' || item.source === 'image') &&
        (item.origin === 'studio' || item.origin === 'toolbox') &&
        typeof item.title === 'string' &&
        typeof item.prompt === 'string' &&
        typeof item.createdAt === 'number' &&
        typeof item.model === 'string' &&
        typeof item.endpoint === 'string' &&
        typeof item.aspectRatio === 'string' &&
        typeof item.imageSize === 'string' &&
        typeof item.count === 'number' &&
        typeof item.errorSummary === 'string'
}
