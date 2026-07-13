import { describe, expect, it } from 'vitest'
import { buildGenerationActionLabel, resolveGenerationMode } from './generationAction'

describe('studio generation action', () => {
    it('uses text-to-image mode without references and image-to-image mode with references', () => {
        expect(resolveGenerationMode(0)).toBe('text')
        expect(resolveGenerationMode(1)).toBe('image')
        expect(resolveGenerationMode(4)).toBe('image')
    })

    it('keeps the familiar mode names in default and concurrent-task states', () => {
        expect(buildGenerationActionLabel('text', false)).toBe('文生图')
        expect(buildGenerationActionLabel('image', false)).toBe('图生图')
        expect(buildGenerationActionLabel('text', true)).toBe('继续文生图')
        expect(buildGenerationActionLabel('image', true)).toBe('继续图生图')
    })
})
