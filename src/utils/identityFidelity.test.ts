import { describe, expect, it } from 'vitest'

import {
    buildIdentityFidelityPrompt,
    DEFAULT_IDENTITY_FIDELITY,
    normalizeIdentityFidelity
} from './identityFidelity'

describe('identity fidelity prompt policy', () => {
    it('uses balanced preservation for missing or legacy values', () => {
        expect(DEFAULT_IDENTITY_FIDELITY).toBe('balanced')
        expect(normalizeIdentityFidelity(undefined)).toBe('balanced')
        expect(normalizeIdentityFidelity('legacy-value')).toBe('balanced')
    })

    it('keeps all three policies distinct and avoids pasted-head results', () => {
        const prompts = ['free', 'balanced', 'strict'].map(policy =>
            buildIdentityFidelityPrompt(policy)
        )

        expect(new Set(prompts).size).toBe(3)
        for (const prompt of prompts) {
            expect(prompt).toContain('head')
            expect(prompt).toContain('body')
            expect(prompt).toContain('pasted')
        }
    })

    it('lets balanced mode rebuild the portrait for the requested shot', () => {
        const prompt = buildIdentityFidelityPrompt('balanced')

        expect(prompt).toContain('camera angle')
        expect(prompt).toContain('expression')
        expect(prompt).toContain('hairstyle')
        expect(prompt).toContain('pose')
        expect(prompt).toContain('Requested changes take priority')
        expect(prompt).not.toContain('strongest and only')
        expect(prompt).not.toContain('unchanged hairstyle')
    })

    it('keeps strict mode coherent without forcing the source portrait angle', () => {
        const prompt = buildIdentityFidelityPrompt('strict')

        expect(prompt).toContain('high priority')
        expect(prompt).toContain('Only change attributes explicitly requested')
        expect(prompt).toContain('do not force the source portrait angle')
    })
})
