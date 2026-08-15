import { describe, expect, it } from 'vitest'

import { styleTemplates } from './templates'

const preciseEditTemplateIds = [
    'gpt-image2-edit-identity-scene',
    'gpt-image2-edit-outfit-only',
    'gpt-image2-edit-background-only',
    'gpt-image2-edit-multi-reference',
    'gpt-image2-edit-local-detail',
    'gpt-image2-edit-exact-text'
]

describe('GPT Image2 precise edit templates', () => {
    const templates = styleTemplates.filter(template => template.category === '精准改图配方')

    it('adds exactly the six approved G3-lite recipes', () => {
        expect(templates.map(template => template.id)).toEqual(preciseEditTemplateIds)
        expect(new Set(styleTemplates.map(template => template.id)).size).toBe(styleTemplates.length)
    })

    it('keeps the recipes inside the existing image-template surface', () => {
        for (const template of templates) {
            expect(template.mode).toBe('image')
            expect(template.image).toBe('')
            expect(template.prompt.trim().length).toBeGreaterThan(120)
            expect(template.promptEn?.trim().length).toBeGreaterThan(120)
            expect(template.tags).toContain('精准改图')
        }
    })

    it('makes reference roles and preservation constraints explicit', () => {
        for (const template of templates.slice(0, 5)) {
            expect(template.prompt).toContain('参考职责')
            expect(template.prompt).toContain('必须保持')
        }

        const exactText = templates.find(template => template.id === 'gpt-image2-edit-exact-text')
        expect(exactText?.prompt).toContain('准确文字')
        expect(exactText?.prompt).toContain('逐字准确')
    })
})
