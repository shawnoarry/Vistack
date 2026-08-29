import { describe, expect, it } from 'vitest'

import {
    AWESOME_GPT_IMAGE2_SOURCE,
    AWESOME_GPT_IMAGE2_TEMPLATE_IDS,
    awesomeGptImage2Templates,
    awesomeGptImage2TemplateSources
} from './awesomeGptImage2Templates'

describe('awesome GPT Image 2 blueprint templates', () => {
    it('contains the six selected gap-filling templates with pinned provenance', () => {
        expect(AWESOME_GPT_IMAGE2_SOURCE).toEqual({
            repository: 'https://github.com/freestylefly/awesome-gpt-image-2',
            skillVersion: '1.0.4',
            license: 'MIT'
        })
        expect(awesomeGptImage2Templates).toHaveLength(6)
        expect(AWESOME_GPT_IMAGE2_TEMPLATE_IDS).toHaveLength(6)
        expect(new Set(AWESOME_GPT_IMAGE2_TEMPLATE_IDS).size).toBe(6)
        expect(Object.keys(awesomeGptImage2TemplateSources)).toEqual(AWESOME_GPT_IMAGE2_TEMPLATE_IDS)
    })

    it('keeps every blueprint bilingual, editable, and structurally classified', () => {
        for (const template of awesomeGptImage2Templates) {
            expect(template.prompt.length).toBeGreaterThan(300)
            expect(template.promptEn?.length).toBeGreaterThan(300)
            expect(template.prompt).toContain('【')
            expect(template.promptEn).toContain('【')
            expect(template.image).toBe('')
            expect(template.taxonomy?.output).toBeTruthy()
            expect(template.taxonomy?.styles.length).toBeGreaterThan(0)
        }
    })
})
