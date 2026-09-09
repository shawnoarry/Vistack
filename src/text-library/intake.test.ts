import { describe, expect, it } from 'vitest'
import { parseIntake } from './intake'

describe('new quote attribution parsing', () => {
    it('does not mistake a long poetic line beginning with an em dash for an author', () => {
        const raw = '至于我们的相遇，我有多种比喻\n比如大火席卷麦田\n——我把所有收成抵挡给一场虚妄'
        expect(parseIntake(raw)).toMatchObject({ text: raw, recognized: false })
        expect(parseIntake('正文。\n——陀思妥耶夫斯基', ['陀思妥耶夫斯基'])).toMatchObject({ author: '陀思妥耶夫斯基' })
    })
    it('recognizes work-before-author credits with an explicit separator', () => {
        expect(parseIntake('你高大宽阔，我瘦小单薄。\n《致父亲》 卡夫卡')).toMatchObject({
            text: '你高大宽阔，我瘦小单薄。', author: '卡夫卡', source: '《致父亲》', creditPrefix: '', recognized: true
        })
        expect(parseIntake('正文。\n《作品》 [日]测试作者')).toMatchObject({ text: '正文。', author: '测试作者', creditPrefix: '日', source: '《作品》' })
        expect(parseIntake('正文。\n《作品》卡夫卡', ['卡夫卡'])).toMatchObject({ author: '卡夫卡', source: '《作品》' })
        expect(parseIntake('正文。\n《作品》很好看').recognized).toBe(false)
    })
    it('splits a transliterated final-line author and decodes copied HTML whitespace', () => {
        const raw = '对自己耐心些。 冲一朵花大喊大叫并不会使它绽放。&#x20;\n查理·麦克西'
        expect(parseIntake(raw)).toEqual({ text: '对自己耐心些。 冲一朵花大喊大叫并不会使它绽放。',
            author: '查理·麦克西', creditPrefix: '', source: '', originalInput: raw, recognized: true })
        expect(parseIntake('一段正文。&nbsp;')).toMatchObject({ text: '一段正文。', recognized: true })
        expect(parseIntake('一段正文。\n春天·夏天').recognized).toBe(false)
    })
    it('splits a pasted body and signed author with country and work', () => {
        const raw = '正文第一行。\n正文第二行。\n——[日本]测试作者《测试作品》'
        expect(parseIntake(raw)).toEqual({ text: '正文第一行。\n正文第二行。', author: '测试作者', creditPrefix: '日',
            source: '《测试作品》', originalInput: raw, recognized: true })
    })
    it('handles inline credits, book-only sources and separately signed authors', () => {
        expect(parseIntake('正文在这里。——[宋]测试作者《作品》')).toMatchObject({ text: '正文在这里。', author: '测试作者', creditPrefix: '宋' })
        expect(parseIntake('正文。\n《某作品》')).toMatchObject({ text: '正文。', author: '', source: '《某作品》' })
        expect(parseIntake('正文。\n——某作者\n《作品》')).toMatchObject({ text: '正文。', author: '某作者', source: '《作品》' })
        expect(parseIntake('正文。\n作者：某作者')).toMatchObject({ text: '正文。', author: '某作者' })
    })
    it('uses evidenced names for unmarked authors, without guessing arbitrary short lines', () => {
        expect(parseIntake('正文。\n某作者', ['某作者'])).toMatchObject({ text: '正文。', author: '某作者' })
        expect(parseIntake('正文。\n要快乐')).toMatchObject({ text: '正文。\n要快乐', recognized: false })
        expect(parseIntake('我看见——光')).toMatchObject({ text: '我看见——光', recognized: false })
        expect(parseIntake('《只有书名》').recognized).toBe(false)
    })
    it('preserves empty books and the original political/national label without inventing an origin', () => {
        expect(parseIntake('正文。\n——[苏联]作者《》')).toMatchObject({ source: '', creditPrefix: '苏联', author: '作者' })
        expect(parseIntake('正文。\n——[俄罗斯]作者')).toMatchObject({ creditPrefix: '俄罗斯' })
        expect(parseIntake('正文。\n——莫言')).toMatchObject({ author: '莫言' })
    })
})
