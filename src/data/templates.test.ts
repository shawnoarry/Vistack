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

const completedPreviewById = {
    'kbo-broadcast-identity-anchor': '/template-previews/kbo-broadcast-identity-anchor.webp',
    'commercial-campaign': '/template-previews/commercial-campaign.webp',
    'magazine-cover': '/template-previews/magazine-cover.webp',
    'poster-key-visual': '/template-previews/poster-key-visual.webp',
    'beauty-editorial': '/template-previews/beauty-editorial.webp',
    'mv-concept-still': '/template-previews/mv-concept-still.webp',
    'album-photobook': '/template-previews/album-photobook.webp',
    'photocard-portrait': '/template-previews/photocard-portrait.webp',
    'artist-profile-photo': '/template-previews/artist-profile-photo.webp',
    'comeback-teaser-poster': '/template-previews/comeback-teaser-poster.webp',
    'editorial-fashion-fullbody': '/template-previews/editorial-fashion-fullbody.webp',
    'korean-ootd-mirror': '/template-previews/korean-ootd-mirror.webp',
    'idol-backstage-selfie': '/template-previews/idol-backstage-selfie.webp',
    'fancam-cover': '/template-previews/fancam-cover.webp',
    'airport-preview': '/template-previews/airport-preview.webp',
    'after-work-preview': '/template-previews/after-work-preview.webp',
    'korean-cafe-snapshot': '/template-previews/korean-cafe-snapshot.webp',
    'street-paparazzi': '/template-previews/street-paparazzi.webp',
    'product-hero': '/template-previews/product-hero.webp',
    'cinematic-environment': '/template-previews/cinematic-environment.webp',
    'gpt-image2-edit-identity-scene': '/template-previews/gpt-image2-edit-identity-scene.webp',
    'gpt-image2-edit-outfit-only': '/template-previews/gpt-image2-edit-outfit-only.webp',
    'gpt-image2-edit-background-only': '/template-previews/gpt-image2-edit-background-only.webp',
    'gpt-image2-edit-multi-reference': '/template-previews/gpt-image2-edit-multi-reference.webp',
    'gpt-image2-edit-local-detail': '/template-previews/gpt-image2-edit-local-detail.webp'
}

function readWebpDimensions(buffer: Buffer) {
    const chunkType = buffer.subarray(12, 16).toString('ascii')

    if (chunkType === 'VP8 ') {
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff
        }
    }

    if (chunkType === 'VP8L') {
        const bits = buffer.readUInt32LE(21)
        return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1
        }
    }

    if (chunkType === 'VP8X') {
        return {
            width: buffer.readUIntLE(24, 3) + 1,
            height: buffer.readUIntLE(27, 3) + 1
        }
    }

    throw new Error(`Unsupported WebP chunk type: ${chunkType}`)
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

    it('binds all 25 completed preview assets', () => {
        for (const [templateId, imagePath] of Object.entries(completedPreviewById)) {
            expect(styleTemplates.find(template => template.id === templateId)?.image).toBe(imagePath)

            const filePath = resolve(process.cwd(), 'public', imagePath.slice(1))
            const image = readFileSync(filePath)
            const fileSize = statSync(filePath).size

            expect(image.subarray(0, 4).toString('ascii')).toBe('RIFF')
            expect(image.subarray(8, 12).toString('ascii')).toBe('WEBP')
            expect(readWebpDimensions(image)).toEqual({ width: 1024, height: 1280 })
            expect(fileSize).toBeGreaterThan(20_000)
            expect(fileSize).toBeLessThan(350 * 1024)
        }

        expect(styleTemplates.filter(template => template.image).length).toBe(58)
    })
})
