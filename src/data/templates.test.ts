import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { styleTemplates } from './templates'

const gameCharacterBustVariableLabels = [
    '人物设定：',
    '气质神态：',
    '面部特征：',
    '发型特征：',
    '身份锚点：',
    '服装设定：',
    '画面氛围：',
    '角色专属排除：'
]

describe('game asset templates', () => {
    it('keeps editable character variables ahead of the fixed bust base prompt', () => {
        const template = styleTemplates.find(candidate => candidate.id === 'game-character-bust-portrait')

        expect(template).toMatchObject({
            title: '人物设定图-胸像',
            category: '人物设定图',
            mode: 'text',
            image: ''
        })
        expect(template?.taxonomy?.output).toBe('character')
        expect(template?.tags).toContain('游戏素材')
        expect(template?.usageGuide).toBe('只修改开头【可编辑变量区】；【固定绘画基座】通常不要修改。')

        const prompt = template?.prompt ?? ''
        const fixedBaseIndex = prompt.indexOf('【固定绘画基座｜通常不要修改】')

        expect(prompt.startsWith('【可编辑变量区｜每次只修改本区】')).toBe(true)
        expect(fixedBaseIndex).toBeGreaterThan(0)
        for (const label of gameCharacterBustVariableLabels) {
            expect(prompt.indexOf(label), `${label} should stay in the editable block`).toBeGreaterThan(0)
            expect(prompt.indexOf(label)).toBeLessThan(fixedBaseIndex)
        }

        expect(prompt.slice(fixedBaseIndex)).not.toMatch(/\[[^\]\n]+\]/)
        expect(prompt).toContain('竖幅2:3，单人正面上半身肖像')
        expect(prompt).toContain('半写实数字厚涂和写实游戏角色概念艺术风格')
        expect(prompt).toContain('面部精细、衣物概括、背景松动')
    })
})

const preciseEditTemplateIds = [
    'gpt-image2-edit-identity-scene',
    'gpt-image2-edit-outfit-only',
    'gpt-image2-edit-background-only',
    'gpt-image2-edit-multi-reference',
    'gpt-image2-edit-local-detail',
    'gpt-image2-edit-exact-text'
]

const expandedPromptTemplateIds = [
    'commercial-campaign',
    'magazine-cover',
    'poster-key-visual',
    'beauty-editorial',
    'kpop-studio-concept',
    'mv-concept-still',
    'album-photobook',
    'comeback-teaser-poster',
    'luxury-product-still',
    'product-hero',
    'cinematic-environment'
]

const heavyRedrawStyleTemplateIds = [
    'retro-minimal-concept-illustration',
    'retro-flatlay-packaging-print',
    'japanese-retro-goods-packaging'
]

const chinesePromptSections = [
    '生成目标：',
    '可编辑内容：',
    '参考图处理：',
    '画面设计：',
    '镜头与构图：',
    '光线与材质：',
    '避免：'
]

const englishPromptSections = [
    'Goal:',
    'Editable Elements:',
    'Reference Handling:',
    'Visual Design:',
    'Camera and Composition:',
    'Lighting and Materials:',
    'Avoid:'
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
    'retro-minimal-concept-illustration': '/template-previews/retro-minimal-concept-illustration.webp',
    'retro-flatlay-packaging-print': '/template-previews/retro-flatlay-packaging-print.webp',
    'japanese-retro-goods-packaging': '/template-previews/japanese-retro-goods-packaging.webp',
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

describe('expanded built-in prompt templates', () => {
    const templates = expandedPromptTemplateIds.map(templateId => {
        const template = styleTemplates.find(candidate => candidate.id === templateId)
        expect(template, `missing template ${templateId}`).toBeDefined()
        return template!
    })

    it('keeps the approved template set and reusable seven-section structure', () => {
        for (const template of templates) {
            let previousChineseSectionIndex = -1
            let previousEnglishSectionIndex = -1

            for (const section of chinesePromptSections) {
                const sectionIndex = template.prompt.indexOf(section)
                expect(sectionIndex, `${template.id} missing ${section}`).toBeGreaterThan(previousChineseSectionIndex)
                previousChineseSectionIndex = sectionIndex
            }

            for (const section of englishPromptSections) {
                const sectionIndex = template.promptEn?.indexOf(section) ?? -1
                expect(sectionIndex, `${template.id} missing ${section}`).toBeGreaterThan(previousEnglishSectionIndex)
                previousEnglishSectionIndex = sectionIndex
            }
        }
    })

    it('provides several complete editable phrases in both languages', () => {
        for (const template of templates) {
            expect(template.prompt.match(/【[^】]+】/g)?.length ?? 0, `${template.id} Chinese placeholders`).toBeGreaterThanOrEqual(6)
            expect(template.promptEn?.match(/【[^】]+】/g)?.length ?? 0, `${template.id} English placeholders`).toBeGreaterThanOrEqual(6)
        }
    })

    it('treats portrait references as identity guidance instead of a pasted head', () => {
        const portraitTemplateIds = expandedPromptTemplateIds.slice(0, 8)

        for (const templateId of portraitTemplateIds) {
            const template = templates.find(candidate => candidate.id === templateId)!
            expect(template.prompt).toContain('不要把参考图的头部像贴纸一样原样复制')
            expect(template.promptEn).toContain('Do not paste the reference head unchanged')
        }
    })
})

describe('heavy redraw style templates', () => {
    const templates = heavyRedrawStyleTemplateIds.map(templateId => {
        const template = styleTemplates.find(candidate => candidate.id === templateId)
        expect(template, `missing template ${templateId}`).toBeDefined()
        return template!
    })

    it('ships the redraw styles as bilingual general-purpose illustration presets', () => {
        for (const template of templates) {
            expect(template.category).toBe('插画艺术')
            expect(template.mode).toBe('both')
            expect(template.tags).toContain('重画风')
            expect(template.promptEn?.trim().length).toBeGreaterThan(250)
            expect(template.image).toMatch(/^\/template-previews\/.+\.webp$/)
        }
    })

    it('keeps the minimalist preset focused on positive visual style language', () => {
        const template = templates[0]
        expect(template.prompt).toContain('大块概括性形体')
        expect(template.prompt).toContain('低饱和有限色盘')
        expect(template.prompt).toContain('数字厚涂')
        expect(template.prompt).toContain('尺度对比')
        expect(template.prompt).not.toMatch(/用户指定|任意主题|参考图|不要|避免/)
        expect(template.promptEn).not.toMatch(/user|any subject|reference image|do not|avoid/i)
    })

    it('keeps the flat-lay preset independent from food subject matter', () => {
        expect(templates[1].prompt).toContain('不要默认生成食物、甜品、商品或塑料包装盒')
        expect(templates[1].prompt).toContain('任意主题')
        expect(templates[1].prompt).toContain('彻底重构')
    })

    it('provides a dedicated food-and-object packaging preset with random fallback', () => {
        const template = templates[2]
        expect(template.prompt).toContain('食品或日常物品')
        expect(template.prompt).toContain('如果用户没有指定具体主题')
        expect(template.prompt).toContain('透明塑料盒')
        expect(template.prompt).toContain('文字排版是画面风格的重要部分')
        expect(template.prompt).toContain('一个醒目的商品名称')
        expect(template.prompt).toContain('两到四个短标签')
        expect(template.prompt).toContain('所有可读文字必须只使用简洁英文')
        expect(template.prompt).toContain('即使用户用中文描述主题')
        expect(template.prompt).toContain('也不得自行生成中文汉字')
        expect(template.prompt).toContain('不使用真实品牌')
        expect(template.promptEn).toContain('render it verbatim and clearly')
        expect(template.promptEn).toContain('one prominent product name')
        expect(template.promptEn).toContain('simple English only')
        expect(template.promptEn).toContain('does not authorize Chinese packaging copy')
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

    it('binds all completed preview assets', () => {
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

        expect(styleTemplates.filter(template => template.image).length).toBe(61)
    })
})
