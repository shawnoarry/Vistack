import { describe, expect, it } from 'vitest'
import type { GenerationTask } from '../types'
import {
    addGenerationFailureRecord,
    buildGenerationFailureRecord,
    loadGenerationFailureRecords,
    saveGenerationFailureRecords,
    type FailureRecordStorage
} from './failureRecords'

const task = (overrides: Partial<GenerationTask> = {}): GenerationTask => ({
    id: 'task-1',
    source: 'image',
    origin: 'studio',
    title: '图生图 #1',
    prompt: 'Replace the coat',
    status: 'error',
    createdAt: 100,
    model: 'image-model',
    endpoint: 'https://api.example.com/v1/images?token=private',
    resolvedEndpoint: 'https://api.example.com/v1/images?api_key=private',
    aspectRatio: '1:1',
    imageSize: '2K',
    count: 1,
    images: [],
    recipe: {
        mainPrompt: 'Replace the coat',
        compiledPrompt: 'Replace the coat',
        supplementPrompt: '',
        selectedStyle: '',
        customPrompt: '',
        referenceImages: ['data:image/png;base64,private-reference'],
        referenceImageLabels: ['人物1'],
        referenceImageMetadata: [],
        count: 1
    },
    ...overrides
})

describe('generation failure records', () => {
    it('stores a compact redacted task snapshot without reference images', () => {
        const record = buildGenerationFailureRecord(
            task(),
            'Authorization: Bearer private-token upstream failed'
        )
        const serialized = JSON.stringify(record)

        expect(serialized).not.toContain('private-token')
        expect(serialized).not.toContain('private-reference')
        expect(serialized).toContain('[REDACTED]')
        expect(record.prompt).toBe('Replace the coat')
    })

    it('keeps the newest unique records inside the configured limit', () => {
        const records = Array.from({ length: 4 }, (_, index) =>
            buildGenerationFailureRecord(task({ id: `task-${index}`, createdAt: index }), `error ${index}`)
        )
        const newest = buildGenerationFailureRecord(task({ id: 'task-1', createdAt: 10 }), 'new error')

        expect(addGenerationFailureRecord(records, newest, 3).map(item => item.createdAt)).toEqual([10, 3, 2])
    })

    it('round-trips valid records and ignores malformed storage', () => {
        const values = new Map<string, string>()
        const storage: FailureRecordStorage = {
            getItem: key => values.get(key) || null,
            setItem: (key, value) => values.set(key, value)
        }
        const record = buildGenerationFailureRecord(task(), 'failed')

        saveGenerationFailureRecords([record], storage)
        expect(loadGenerationFailureRecords(storage)).toEqual([record])

        values.set('vistack-generation-failure-records', '{broken')
        expect(loadGenerationFailureRecords(storage)).toEqual([])
    })
})
