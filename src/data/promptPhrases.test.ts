import { describe, expect, it } from 'vitest'
import { composePromptWithPhrase } from '../utils/promptPhraseComposer'
import { promptPhraseGroups } from './promptPhrases'

const allPhrases = promptPhraseGroups.flatMap(group => group.phrases)
const getPhrase = (label: string) => {
    const phrase = allPhrases.find(item => item.label === label)
    if (!phrase) throw new Error(`Missing prompt phrase: ${label}`)
    return phrase
}

describe('prompt phrase library', () => {
    it('builds a concrete prompt from a minimal user sentence', () => {
        const selected = ['85mm 人像', '窗边自然光', '清冷韩系'].map(getPhrase)
        const prompt = selected.reduce(
            (current, phrase) => composePromptWithPhrase(current, phrase, allPhrases),
            '一个女生在咖啡店拍照。'
        )

        expect(prompt).toContain('85mm 人像视角')
        expect(prompt).toContain('窗光从主体一侧柔和照入')
        expect(prompt).toContain('低饱和冷灰与柔和蓝色调')
        expect(prompt).not.toContain('。，')
    })

    it('replaces conflicting camera choices in a composed prompt', () => {
        const withDocumentaryLens = composePromptWithPhrase('一个女生在咖啡店拍照。', getPhrase('35mm 纪实'), allPhrases)
        const withPortraitLens = composePromptWithPhrase(withDocumentaryLens, getPhrase('85mm 人像'), allPhrases)

        expect(withPortraitLens).not.toContain('35mm')
        expect(withPortraitLens).toContain('85mm')
    })

    it('does not expose anatomy-distorting body shortcuts', () => {
        const labels = allPhrases.map(phrase => phrase.label)
        expect(labels).not.toEqual(expect.arrayContaining(['九头身', '小头小脸', '沙漏轮廓', '蜂腰', '宽髋曲线']))
    })
})
