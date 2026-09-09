import { createHash } from 'node:crypto'
import { newQuote, normalizedText, quoteStatus, splitAuthorPrefix, type Quote, type QuoteStatus } from '../../src/text-library/model'

export interface LegacyParagraph {
    paragraph: number
    text: string
    colors: string[]
    runs: { text: string; color: string }[]
}
export function colorStatus(color: string): QuoteStatus {
    if (color.toUpperCase() === 'AUTO') return 'unused'
    if (!/^[0-9a-f]{6}$/i.test(color)) return 'uncertain'
    const [r, g, b] = [0, 2, 4].map(i => parseInt(color.slice(i, i + 2), 16) / 255)
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
    if (d < 0.06) return max < 0.65 ? 'unused' : 'uncertain'
    const h = ((max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60 + 360) % 360
    if (h < 25 || h > 340) return 'rejected'
    if (h >= 65 && h <= 165) return 'planned'
    if (h >= 180 && h <= 260) return 'used'
    return 'uncertain'
}

function clean(text: string) {
    return text.replace(/\[\/?cp\]/gi, '').replace(/[\u200b-\u200f\ufeff]/g, '').trim()
}
const attribution = (text: string) => /^(?:[/／]|[—–─-]+)\s*[^。！？!?]{1,120}$/.test(clean(text))
const numbered = (text: string) => /^\s*\d{1,3}[.、．]\s*\S/.test(text)
const inlineCredit = (text: string) => /^.{4,}[—–─-]{2,}\s*[^。！？!?]{1,120}$/.test(clean(text))
const title = (text: string) => /^《[^》]{1,50}》$/.test(clean(text))

function splitCredit(paragraphs: LegacyParagraph[], knownAuthors: string[] = []): { text: string; author: string; source: string; body: LegacyParagraph[] } {
    const lines = paragraphs.map(p => clean(p.text))
    let body = [...paragraphs]
    let credit = ''
    const last = lines[lines.length - 1] || ''
    if (lines.length > 1 && (attribution(last) || knownAuthors.includes(last) || /^[^。！？!?，,《》]{1,35}《[^》]+》[-—一]*$/.test(last))) {
        credit = last
        lines.pop()
        body = body.slice(0, -1)
    } else {
        const match = last.match(/^(.{4,}?)[—–─-]{2,}\s*([^。！？!?]{1,120})$/)
        if (match) { lines[lines.length - 1] = match[1]; credit = match[2] }
        else {
            const parenthetical = last.match(/^(.{4,}?)[（(]\s*([^。！？!?，,（）()]{1,35}《[^》]+》)\s*[）)]$/)
            if (parenthetical) { lines[lines.length - 1] = parenthetical[1].trim(); credit = parenthetical[2] }
            else {
                const book = last.match(/^(.*?)(《[^》]+》)\s*$/)
                const beforeBook = book ? book[1].trimEnd() : last
                const name = knownAuthors.find(author => beforeBook.endsWith(author) && beforeBook.length > author.length + 4)
                if (name) {
                    const main = beforeBook.slice(0, -name.length).trimEnd()
                    if (/[。！？!?；;”」]$/.test(main)) {
                        lines[lines.length - 1] = main
                        credit = name + (book?.[2] || '')
                    }
                }
            }
        }
    }
    const text = lines.join('\n').replace(/^\s*\d{1,3}[.、．]\s*/, '').trim()
    credit = credit.replace(/^(?:[/／]|[—–─-]+)\s*/, '').replace(/[-—]+\s*$/, '').trim()
    const book = credit.match(/《[^》]+》/)
    return { text: text || paragraphs.map(p => clean(p.text)).join('\n'), author: book ? credit.slice(0, book.index).trim() : credit, source: book?.[0] || '', body }
}

function detectedStatus(body: LegacyParagraph[]) {
    const weights = new Map<QuoteStatus, number>()
    for (const p of body) for (const run of p.runs) {
        const count = clean(run.text).replace(/[\s\p{P}]/gu, '').length
        if (!count) continue
        const state = colorStatus(run.color)
        weights.set(state, (weights.get(state) || 0) + count)
    }
    const meaningful = [...weights.keys()]
    const chromatic = meaningful.filter(s => s !== 'unused' && s !== 'uncertain')
    if (chromatic.length > 1) return { status: 'uncertain' as QuoteStatus, mixed: true }
    if (meaningful.includes('uncertain')) return { status: 'uncertain' as QuoteStatus, mixed: meaningful.length > 1 }
    // Black attribution and pasted punctuation do not erase explicit red/blue/green marking.
    return { status: chromatic[0] || 'unused' as QuoteStatus, mixed: false }
}

export function importLegacy(paragraphs: LegacyParagraph[], source: string) {
    const groups: LegacyParagraph[][] = []
    let current: LegacyParagraph[] = []
    const flush = () => { if (current.length) groups.push(current); current = [] }
    for (const p of paragraphs) {
        const previous = current[current.length - 1]
        const isCredit = attribution(p.text)
        if (previous) {
            const gap = p.paragraph - previous.paragraph
            const ended = attribution(previous.text) || inlineCredit(previous.text)
            const newBlock = numbered(p.text) || title(p.text) || title(previous.text) ||
                (gap > 1 && !(isCredit && gap <= 3)) || ended
            if (newBlock) flush()
        }
        current.push(p)
    }
    flush()
    const knownAuthors = [...new Set(groups.map(group => splitAuthorPrefix(splitCredit(group).author).author)
        .filter(author => author.length >= 2 && author.length <= 35 && !/[。！？!?，,《》]/.test(author)))]
        .sort((a, b) => b.length - a.length)
    const quotes = groups.map(group => {
        const parsed = splitCredit(group, knownAuthors)
        const decision = detectedStatus(parsed.body)
        const colors = [...new Set(group.flatMap(p => p.colors))]
        const raw = group.map(p => p.text).join('\n')
        const flags: string[] = []
        if (decision.status === 'uncertain') flags.push(decision.mixed ? '正文包含不同状态色系' : '颜色含义未确认')
        if (group.length > 10 || parsed.text.length > 650) flags.push('较长条目，需核对是否包含多条文案')
        if (/\D\d{1,3}[.、．]\S/.test(parsed.text)) flags.push('段内可能含有多个编号')
        if (title(parsed.text) || parsed.text.length < 5) flags.push('可能是标题或残留片段')
        if (attribution(parsed.text)) flags.push('可能是独立署名，请核对正文')
        const author = splitAuthorPrefix(parsed.author)
        if (author.prefix === '俄') flags.push('原署名仅写“俄”，需确认俄罗斯或苏联，不自动改写')
        const state = flags.length && decision.status === 'unused' ? 'uncertain' : decision.status
        const q = newQuote(parsed.text)
        return { ...q,
            id: 'legacy-' + createHash('sha256').update(`${source}:${group[0].paragraph}:${raw}`).digest('hex').slice(0, 24),
            author: author.author, creditPrefix: author.prefix, source: parsed.source, status: state,
            statusReason: state === 'planned' ? '旧文档绿色：已选待制作；可能有已制作但未改蓝色的条目。'
                : state === 'used' ? '旧文档蓝色：明确已使用，具体使用日期未知。'
                : state === 'rejected' ? '旧文档红色：不能用或被上级退回。'
                : state === 'unused' ? '旧文档黑色或深灰：普通收录，按未使用导入。' : '旧文档颜色或分条需要人工确认。',
            reviewFlags: flags,
            provenance: [{ file: source, from: group[0].paragraph, to: group[group.length - 1].paragraph,
                text: raw, colors, detectedStatus: decision.status,
                runs: group.flatMap((p, i) => [...(i ? [{ text: '\n', color: 'AUTO' }] : []), ...p.runs.map(r => ({ text: r.text, color: r.color }))]) }]
        }
    })
    const absorbedTitles = new Set<string>()
    for (let index = 0; index < quotes.length; index++) {
        const heading = quotes[index]
        if (!title(heading.text) || groups[index].length !== 1) continue
        const next = groups[index + 1]
        const previous = quotes[index - 1]
        const targets: typeof quotes = []
        if (next && numbered(next[0].text)) {
            for (let j = index + 1; j < groups.length && numbered(groups[j][0].text); j++) targets.push(quotes[j])
        } else if (previous && !title(previous.text) && !absorbedTitles.has(previous.id) &&
            groups[index][0].paragraph - groups[index - 1][groups[index - 1].length - 1].paragraph === 1 &&
            !(next && /^(?:现代|当代|唐|宋|明|清|元|汉)[·•\s]+/.test(clean(next[0].text)))) {
            targets.push(previous)
        }
        if (!targets.length || targets.some(q => q.source && q.source !== heading.text)) continue
        for (const target of targets) {
            target.source = heading.text
            target.provenance.push(...heading.provenance)
        }
        absorbedTitles.add(heading.id)
    }
    const result: Quote[] = []
    const byText = new Map<string, Quote>()
    let merged = 0
    const rank: Record<QuoteStatus, number> = { unused: 0, planned: 1, used: 2, rejected: 3, discouraged: 4, uncertain: 5 }
    for (const q of quotes) {
        if (absorbedTitles.has(q.id)) continue
        const key = normalizedText(q.text)
        const previous = byText.get(key)
        if (!previous) { result.push(q); byText.set(key, q); continue }
        previous.provenance.push(...q.provenance)
        const oldState = quoteStatus(previous)
        if (oldState !== q.status) {
            const state = rank[oldState] >= rank[q.status] ? oldState : q.status
            previous.status = state
            previous.statusReason = '重复正文在原文中有不同标色，保留全部原文位置；优先待确认，其次退回、已使用、待制作、未使用。'
        }
        if (previous.author && q.author && normalizedText(previous.author) !== normalizedText(q.author)) {
            previous.reviewFlags.push('相同正文有不同署名，需核对原文')
        } else if (!previous.author && q.author) { previous.author = q.author; previous.source = q.source; previous.creditPrefix = q.creditPrefix }
        if (previous.creditPrefix && q.creditPrefix && previous.creditPrefix !== q.creditPrefix) previous.reviewFlags.push('重复正文的国家或朝代标记不一致')
        previous.reviewFlags = [...new Set([...previous.reviewFlags, ...q.reviewFlags])]
        merged++
    }
    return { quotes: result, groups: groups.length, merged,
        statusCounts: Object.fromEntries(Object.keys(rank).map(s => [s, result.filter(q => quoteStatus(q) === s).length])) }
}
