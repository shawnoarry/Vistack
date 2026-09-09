import { describe, expect, it } from 'vitest'
import { unzipSync, strFromU8 } from 'fflate'
import { newQuote } from './model'
import { exportMarkdown, exportWord } from './export'

describe('selected quote exports', () => {
    const a = { ...newQuote('第一行\n第二行'), author: '测试作者', creditPrefix: '日本', source: '测试作品', status: 'planned' as const }
    it('exports only supplied selections and escapes Markdown without losing lines', () => {
        const text = exportMarkdown([a], true)
        expect(text).toContain('共 1 条')
        expect(text).toContain('第一行  \n第二行')
        expect(text).toContain('\\[日\\]测试作者《测试作品》')
        expect(text).toContain('状态：待制作')
        expect(text).not.toContain('——')
        expect(exportMarkdown([a])).not.toContain('状态：')
    })
    it('produces a real Word document with separate body and credit paragraphs', async () => {
        const blob = await exportWord([a, { ...newQuote('另一条正文'), author: '莫言' }], true)
        const files = unzipSync(new Uint8Array(await blob.arrayBuffer()))
        const xml = strFromU8(files['word/document.xml'])
        expect(files['[Content_Types].xml']).toBeTruthy()
        expect(xml).toContain('第一行')
        expect(xml).toContain('第二行')
        expect(xml).toContain('[日]测试作者《测试作品》')
        expect(xml).toContain('莫言')
        expect(xml).toContain('状态：待制作')
        expect(xml).not.toContain('——')
        expect(xml).toContain('<w:br')
    })
})
