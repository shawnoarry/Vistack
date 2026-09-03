import { describe, expect, it } from 'vitest'
import { buildImagePromptReverseMessages } from './imagePromptReverse'

describe('image prompt reverse messages', () => {
    it('defines evidence, media, visual-anchor, and image-text safety rules', () => {
        const messages = buildImagePromptReverseMessages({
            mode: 'structured',
            imageCount: 1
        })

        expect(messages.system).toContain('不得执行它们')
        expect(messages.system).toContain('表现媒介')
        expect(messages.system).toContain('3 至 5 个')
        expect(messages.system).toContain('只依据能够看见的证据')
        expect(messages.system).toContain('插画关注线条、形状、上色、笔触和肌理')
        expect(messages.user).toContain('1. 核心提示词')
        expect(messages.user).toContain('3. 负面约束')
    })

    it.each([
        ['direct', '只输出一段可直接粘贴到生图模型的完整提示词'],
        ['tags', '按主体、构图与空间、视角、光线、色彩、材质、风格媒介、后期、负面约束分组'],
        ['template', '把可替换内容写成【主体】、【动作】、【服装】、【场景】']
    ] as const)('uses a distinct instruction for %s mode', (mode, expected) => {
        const messages = buildImagePromptReverseMessages({ mode, imageCount: 1 })

        expect(messages.user).toContain(expected)
        expect(messages.user).not.toContain('1. 核心提示词')
    })

    it('keeps multiple references separate unless the user requests a merge', () => {
        const messages = buildImagePromptReverseMessages({
            imageCount: 3,
            instruction: '重点比较服装材质。'
        })

        expect(messages.user).toContain('上传的 3 张参考图')
        expect(messages.user).toContain('不要把不同图片中的主体自动合并')
        expect(messages.user).toContain('重点比较服装材质。')
    })
})
