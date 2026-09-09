import { describe, expect, it } from 'vitest'
import { colorStatus, importLegacy, type LegacyParagraph } from './legacyImport'

const p = (paragraph: number, text: string, color = 'AUTO'): LegacyParagraph => ({
    paragraph, text, colors: [color], runs: [{ text, color }]
})
describe('legacy color import', () => {
    it('attaches a trailing book-only line as a source, preserving body color and original text', () => {
        const result = importLegacy([p(1, '正文不应该与出处分成两条。', '0000FF'), p(2, '《测试书名》', 'FF0000'), p(4, '另一条正文。')], 'sample.doc')
        expect(result.quotes).toHaveLength(2)
        expect(result.quotes[0]).toMatchObject({ text: '正文不应该与出处分成两条。', source: '《测试书名》', status: 'used' })
        expect(result.quotes[0].provenance.map(p => p.text)).toContain('《测试书名》')
    })
    it('assigns section book names to numbered extracts without overwriting the following section', () => {
        const result = importLegacy([p(1, '《甲书》'), p(2, '1.第一条正文。'), p(3, '2.第二条正文。'),
            p(4, '《乙书》'), p(5, '3.第三条正文。'), p(7, '无出处的另一条。')], 'sample.doc')
        expect(result.quotes.map(q => q.source)).toEqual(['《甲书》', '《甲书》', '《乙书》', ''])
        expect(result.quotes.some(q => /^《[^》]+》$/.test(q.text))).toBe(false)
    })
    it('does not guess conflicting sources or attach a poem heading to the preceding quote', () => {
        const result = importLegacy([p(1, '这是正文。——作者《已有出处》'), p(2, '《另一标题》'), p(3, '唐 测试作者'), p(4, '诗的正文在这里。')], 'sample.doc')
        expect(result.quotes[0].source).toBe('《已有出处》')
        expect(result.quotes.find(q => q.text === '《另一标题》')?.reviewFlags).toContain('可能是标题或残留片段')
    })
    it('recognizes shade families, retaining unknown yellow and white', () => {
        for (const color of ['0000FF', '00B0F0', 'C6D9F1', '5B9BD5', '4F81BD']) expect(colorStatus(color)).toBe('used')
        for (const color of ['92D050', '9BBB59', '3D9B49', '00B050']) expect(colorStatus(color)).toBe('planned')
        for (const color of ['C00000', 'FF0000']) expect(colorStatus(color)).toBe('rejected')
        for (const color of ['AUTO', '000000', '3E3E3E', '444444']) expect(colorStatus(color)).toBe('unused')
        expect(colorStatus('FFFF00')).toBe('uncertain')
        expect(colorStatus('FFFFFF')).toBe('uncertain')
    })
    it('joins poetry and separated attribution without mixing the next quote', () => {
        const result = importLegacy([p(2, '第一行，'), p(3, '第二行。'), p(5, '——测试作者《作品》'), p(7, '另一段正文。')], 'sample.doc')
        expect(result.groups).toBe(2)
        expect(result.quotes[0].text).toBe('第一行，\n第二行。')
        expect(result.quotes[0].author).toBe('测试作者')
        expect(result.quotes[0].source).toBe('《作品》')
        expect(result.quotes[0].provenance[0].to).toBe(5)
    })
    it('ignores a black author line when body is blue', () => {
        const result = importLegacy([p(1, '正文已经使用过。', '00B0F0'), p(3, '——测试作者')], 'sample.doc')
        expect(result.quotes[0].status).toBe('used')
        expect(result.quotes[0].usages).toEqual([])
    })
    it('routes conflicting chromatic runs to uncertainty', () => {
        const paragraph = p(1, '蓝色的正文与绿色的正文')
        paragraph.runs = [{ text: '蓝色的正文', color: '0000FF' }, { text: '与绿色的正文', color: '92D050' }]
        paragraph.colors = ['0000FF', '92D050']
        expect(importLegacy([paragraph], 'sample.doc').quotes[0].status).toBe('uncertain')
    })
    it('keeps duplicate provenance and gives used status precedence over black and green', () => {
        const result = importLegacy([p(1, '相同的正文。'), p(3, '相同的正文！', '92D050'), p(5, '相同的正文', '00B0F0')], 'sample.doc')
        expect(result.merged).toBe(2)
        expect(result.quotes).toHaveLength(1)
        expect(result.quotes[0].status).toBe('used')
        expect(result.quotes[0].provenance).toHaveLength(3)
    })
    it('splits consecutive numbered quotations', () => {
        const result = importLegacy([p(1, '1.第一条正文。'), p(2, '2.第二条正文。')], 'sample.doc')
        expect(result.quotes).toHaveLength(2)
        expect(result.quotes[0].text).toBe('第一条正文。')
    })
    it('extracts parenthesized authors and recognizes names evidenced elsewhere in the file', () => {
        const result = importLegacy([p(1, '正文第一条。（测试作者《某作品》）'), p(3, '这是另一条正文。'), p(4, '测试作者')], 'sample.doc')
        expect(result.quotes[0].author).toBe('测试作者')
        expect(result.quotes[0].source).toBe('《某作品》')
        expect(result.quotes[0].text).toBe('正文第一条。')
        expect(result.quotes[1].author).toBe('测试作者')
        expect(result.quotes[1].text).toBe('这是另一条正文。')
    })
})
