import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

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

const pilotPreviewById = {
    'phone-selfie-natural': '/template-previews/phone-selfie-natural.webp',
    'kpop-studio-concept': '/template-previews/kpop-studio-concept.webp',
    'luxury-product-still': '/template-previews/luxury-product-still.webp',
    'gpt-image2-edit-exact-text': '/template-previews/gpt-image2-edit-exact-text.webp'
}

describe('GPT Image2 precise edit templates', () => {
    const templates = styleTemplates.filter(template => template.category === '精准改图配方')

    it('adds exactly the six approved G3-lite recipes', () => {
        expect(templates.map(template => template.id)).toEqual(preciseEditTemplateIds)
        expect(new Set(styleTemplates.map(template => template.id)).size).toBe(styleTemplates.length)
    })

    it('keeps the recipes inside the existing image-template surface', () => {
        for (const template of templates) {
            expect(template.mode).toBe('image')
            expect(template.image === '' || template.image.startsWith('/template-previews/')).toBe(true)
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

describe('template preview pilot', () => {
    it('binds the four approved WebP previews to their templates', () => {
        for (const [templateId, imagePath] of Object.entries(pilotPreviewById)) {
            expect(styleTemplates.find(template => template.id === templateId)?.image).toBe(imagePath)

            const filePath = resolve(process.cwd(), 'public', imagePath.slice(1))
            const header = readFileSync(filePath).subarray(0, 12)
            const fileSize = statSync(filePath).size

            expect(header.subarray(0, 4).toString('ascii')).toBe('RIFF')
            expect(header.subarray(8, 12).toString('ascii')).toBe('WEBP')
            expect(fileSize).toBeGreaterThan(20_000)
            expect(fileSize).toBeLessThan(350 * 1024)
        }
    })
})
