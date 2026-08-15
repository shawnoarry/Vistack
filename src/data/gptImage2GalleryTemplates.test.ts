import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
    GPT_IMAGE2_GALLERY_SOURCE,
    GPT_IMAGE2_GALLERY_TEMPLATE_IDS,
    gptImage2GalleryTemplateSources,
    gptImage2GalleryTemplates
} from './gptImage2GalleryTemplates'

const expectedCategoryCounts = {
    '海报排版': 4,
    '电影画面': 4,
    '时尚编辑': 4,
    '插画艺术': 4,
    'UI 与图形': 4,
    '建筑与技术': 4,
    '美妆生活': 2,
    '游戏视觉': 2
}

function readWebpDimensions(buffer: Buffer) {
    const chunkType = buffer.subarray(12, 16).toString('ascii')

    if (chunkType === 'VP8 ') {
        expect(buffer.subarray(23, 26)).toEqual(Buffer.from([0x9d, 0x01, 0x2a]))
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

describe('GPT Image2 curated gallery templates', () => {
    it('contains the approved 28 unique entries and category distribution', () => {
        expect(gptImage2GalleryTemplates).toHaveLength(28)
        expect(GPT_IMAGE2_GALLERY_TEMPLATE_IDS).toHaveLength(28)
        expect(new Set(GPT_IMAGE2_GALLERY_TEMPLATE_IDS).size).toBe(28)

        const sourceNumbers = Object.values(gptImage2GalleryTemplateSources).map(source => source.number)
        expect(sourceNumbers).toHaveLength(28)
        expect(new Set(sourceNumbers).size).toBe(28)

        const categoryCounts = Object.fromEntries(
            Object.keys(expectedCategoryCounts).map(category => [
                category,
                gptImage2GalleryTemplates.filter(template => template.category === category).length
            ])
        )
        expect(categoryCounts).toEqual(expectedCategoryCounts)
    })

    it('keeps complete bilingual prompts and pinned upstream provenance', () => {
        expect(GPT_IMAGE2_GALLERY_SOURCE).toEqual({
            repository: 'https://github.com/wuyoscar/GPT-Image2-Skill',
            commit: '068dd9e24aadc8731e46f38548ca4dcd94515d35',
            license: 'MIT'
        })

        for (const template of gptImage2GalleryTemplates) {
            const source = gptImage2GalleryTemplateSources[template.id]

            expect(template.mode).toBe('text')
            expect(template.prompt.trim().length).toBeGreaterThan(100)
            expect(template.prompt).toMatch(/[\u3400-\u9fff]/)
            expect(template.promptEn?.trim().length).toBeGreaterThan(100)
            expect(template.promptEn).toMatch(/[A-Za-z]{4}/)
            expect(source.number).toBeGreaterThan(0)
            expect(source.sourceFile).toMatch(/^gallery-.+\.md$/)
            expect(source.sourceImage).toMatch(/^docs\/.+\.png$/)
        }
    })

    it('maps every entry to a compact 512 by 640 WebP preview', () => {
        for (const template of gptImage2GalleryTemplates) {
            expect(template.image).toBe(`/template-previews/gallery/${template.id}.webp`)

            const filePath = resolve(process.cwd(), 'public', template.image.slice(1))
            const image = readFileSync(filePath)
            const fileSize = statSync(filePath).size

            expect(image.subarray(0, 4).toString('ascii')).toBe('RIFF')
            expect(image.subarray(8, 12).toString('ascii')).toBe('WEBP')
            expect(readWebpDimensions(image)).toEqual({ width: 512, height: 640 })
            expect(fileSize).toBeGreaterThan(8 * 1024)
            expect(fileSize).toBeLessThan(200 * 1024)
        }
    })
})
