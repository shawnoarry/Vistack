import { formatCredit, quoteStatus, statusLabels, type Quote } from './model'

const mdEscape = (text: string) => text.replace(/([\\`*_{}\[\]<>#|])/g, '\\$1')

export function exportMarkdown(quotes: Quote[], includeStatus = false): string {
    const entries = quotes.map((q, index) => {
        const lines = [`## ${index + 1}`, '', mdEscape(q.text).replace(/\r?\n/g, '  \n')]
        const credit = formatCredit(q, false)
        if (credit) lines.push('', mdEscape(credit))
        if (includeStatus) lines.push('', `状态：${statusLabels[quoteStatus(q)]}`)
        return lines.join('\n')
    })
    return `# 拾句文案选集\n\n共 ${quotes.length} 条\n\n${entries.join('\n\n')}\n`
}

export async function exportWord(quotes: Quote[], includeStatus = false): Promise<Blob> {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
    const children = [
        new Paragraph({ text: '拾句文案选集', heading: HeadingLevel.TITLE, spacing: { after: 180 } }),
        new Paragraph({ text: `共 ${quotes.length} 条`, spacing: { after: 360 } })
    ]
    for (const [index, q] of quotes.entries()) {
        children.push(new Paragraph({
            children: [new TextRun({ text: `${index + 1}`, bold: true, size: 22 })],
            keepNext: true, spacing: { before: 200, after: 120 }
        }))
        const credit = formatCredit(q, false)
        children.push(new Paragraph({
            children: q.text.split(/\r?\n/).map((text, i) => new TextRun({ text, break: i ? 1 : 0 })),
            keepNext: !!credit && q.text.length < 600,
            spacing: { after: 120, line: 330 }
        }))
        if (credit) children.push(new Paragraph({
            children: [new TextRun({ text: credit, size: 22 })], spacing: { after: 160 }
        }))
        if (includeStatus) children.push(new Paragraph({
            children: [new TextRun({ text: `状态：${statusLabels[quoteStatus(q)]}`, size: 20 })],
            spacing: { after: 160 }
        }))
    }
    return Packer.toBlob(new Document({
        creator: '拾句', title: '拾句文案选集', description: '从本地文字库选出的文案与署名',
        styles: {
            default: {
                document: { run: { font: '宋体', size: 24, color: '000000' }, paragraph: { spacing: { line: 330 } } },
                title: { run: { font: '微软雅黑', size: 40, bold: true, color: '000000' } }
            }
        },
        sections: [{ properties: { page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }
        } }, children }]
    }))
}
