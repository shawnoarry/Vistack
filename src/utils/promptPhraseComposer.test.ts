import { describe, expect, it } from 'vitest'
import type { PromptPhrase } from '../data/promptPhrases'
import { composePromptWithPhrase } from './promptPhraseComposer'

const phrases: PromptPhrase[] = [
    { label: '35mm', value: '35mm 镜头，保留环境', conflictGroup: 'lens' },
    { label: '85mm', value: '85mm 镜头，突出人物', conflictGroup: 'lens' },
    { label: '自然光', value: '窗边柔和自然光' }
]

describe('composePromptWithPhrase', () => {
    it('appends a phrase to the user prompt', () => {
        expect(composePromptWithPhrase('一个女生在咖啡店拍照', phrases[0], phrases))
            .toBe('一个女生在咖啡店拍照。35mm 镜头，保留环境')
    })

    it('does not append the same phrase twice', () => {
        const prompt = '一个女生在咖啡店拍照。35mm 镜头，保留环境'
        expect(composePromptWithPhrase(prompt, phrases[0], phrases)).toBe(prompt)
    })

    it('replaces a phrase from the same conflict group', () => {
        const prompt = '一个女生在咖啡店拍照。35mm 镜头，保留环境。窗边柔和自然光'
        expect(composePromptWithPhrase(prompt, phrases[1], phrases))
            .toBe('一个女生在咖啡店拍照。窗边柔和自然光。85mm 镜头，突出人物')
    })

    it('keeps freely composable phrases', () => {
        const prompt = '一个女生在咖啡店拍照。85mm 镜头，突出人物'
        expect(composePromptWithPhrase(prompt, phrases[2], phrases))
            .toBe('一个女生在咖啡店拍照。85mm 镜头，突出人物。窗边柔和自然光')
    })
})
