import Fuse from 'fuse.js'
import { z } from 'zod'

export const statusSchema = z.enum(['unused', 'used', 'planned', 'rejected', 'discouraged', 'uncertain'])
export type QuoteStatus = z.infer<typeof statusSchema>
export const statusLabels: Record<QuoteStatus, string> = {
    unused: '未使用', used: '已使用', planned: '待制作', rejected: '不能用 / 退回',
    discouraged: '不建议用', uncertain: '待确认状态'
}
export const literatureLabels = {
    ancient: '中国古诗词', western: '西方文学', japanese: '日式文学', chinese: '中式随笔', unclassified: '未归类'
}
export type LiteratureType = string
export const categorySchema = z.object({
    id: z.string().min(1).max(100).refine(value => value !== 'unclassified', '未归类为保留分类'),
    name: z.string().trim().min(1).max(40).refine(value => value !== '未归类', '未归类为保留名称')
})
export type Category = z.infer<typeof categorySchema>
const legacyCategories = Object.entries(literatureLabels).filter(([id]) => id !== 'unclassified').map(([id, name]) => ({ id, name }))
const provenanceSchema = z.object({
    file: z.string(),
    from: z.number().int(),
    to: z.number().int(),
    text: z.string(),
    colors: z.array(z.string()),
    detectedStatus: statusSchema,
    runs: z.array(z.object({ text: z.string(), color: z.string() })).default([])
})
export const usageSchema = z.object({
    id: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    purpose: z.string().max(500)
})
export const quoteSchema = z.object({
    id: z.string().min(1),
    text: z.string().trim().min(1).max(20000),
    author: z.string().max(500),
    creditPrefix: z.string().max(50).default(''),
    source: z.string().max(2000),
    tags: z.array(z.string().trim().min(1).max(100)).max(50),
    notes: z.string().max(10000),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    usages: z.array(usageSchema),
    favorite: z.boolean(),
    status: statusSchema.optional(),
    statusReason: z.string().max(2000).default(''),
    statusHistory: z.array(z.object({ from: statusSchema, to: statusSchema, at: z.string().datetime(), reason: z.string() })).default([]),
    usageBaseline: statusSchema.optional(),
    provenance: z.array(provenanceSchema).default([]),
    reviewFlags: z.array(z.string()).default([]),
    reviewed: z.boolean().default(false),
    originalInput: z.string().max(25000).default(''),
    literatureType: z.string().min(1).max(100).default('unclassified')
})
export const librarySchema = z.object({
    version: z.literal(1),
    revision: z.number().int().nonnegative(),
    categories: z.array(categorySchema).max(200).default(legacyCategories),
    quotes: z.array(quoteSchema).max(50000)
}).superRefine((data, ctx) => {
    if (new Set(data.quotes.map(q => q.id)).size !== data.quotes.length) {
        ctx.addIssue({ code: 'custom', message: '存在重复的记录 ID' })
    }
    if (new Set(data.categories.map(c => c.id)).size !== data.categories.length ||
        new Set(data.categories.map(c => c.name.toLocaleLowerCase())).size !== data.categories.length) {
        ctx.addIssue({ code: 'custom', message: '分类名称或 ID 重复' })
    }
    if (data.quotes.some(q => q.literatureType !== 'unclassified' && !data.categories.some(c => c.id === q.literatureType))) {
        ctx.addIssue({ code: 'custom', message: '文字引用了不存在的分类' })
    }
})
export type Quote = z.infer<typeof quoteSchema>
export type Library = z.infer<typeof librarySchema>
export const emptyLibrary = (): Library => ({ version: 1, revision: 0, quotes: [], categories: [] })
export function removeCategory(library: Library, id: string): Library {
    return { ...library, categories: library.categories.filter(c => c.id !== id),
        quotes: library.quotes.map(q => q.literatureType === id ? { ...q, literatureType: 'unclassified', updatedAt: new Date().toISOString() } : q) }
}
export function mergeLibrary(existing: Library, incoming: Library) {
    const categories = existing.categories.map(c => ({ ...c }))
    const mapping = new Map<string, string>()
    for (const category of incoming.categories) {
        const match = categories.find(c => c.name.toLocaleLowerCase() === category.name.toLocaleLowerCase())
        if (match) { mapping.set(category.id, match.id); continue }
        const id = categories.some(c => c.id === category.id) ? crypto.randomUUID() : category.id
        categories.push({ ...category, id })
        mapping.set(category.id, id)
    }
    const result = mergeQuotes(existing.quotes, incoming.quotes.map(q => ({ ...q, literatureType: mapping.get(q.literatureType) || 'unclassified' })))
    return { ...result, categories }
}
export const normalizedText = (text: string) => text.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu, '')
export function newQuote(text = ''): Quote {
    const now = new Date().toISOString()
    return { id: crypto.randomUUID(), text, author: '', creditPrefix: '', source: '', tags: [], notes: '', createdAt: now, updatedAt: now, usages: [], favorite: false,
        statusReason: '', statusHistory: [], provenance: [], reviewFlags: [], reviewed: false, originalInput: '', literatureType: 'unclassified' }
}
export function quoteStatus(q: Quote): QuoteStatus { return q.status ?? (q.usages.length ? 'used' : 'unused') }
export function normalizeCreditPrefix(value: string): string {
    const clean = value.trim().replace(/^[\[【〔［]\s*|\s*[\]】〕］]$/g, '')
    const aliases: Record<string, string> = { 日本: '日', 美国: '美', 英国: '英', 韩国: '韩' }
    return aliases[clean] || clean
}
export function splitAuthorPrefix(author: string) {
    const match = author.match(/^[\[【〔［]([^\]】〕］]{1,20})[\]】〕］]\s*(.*)$/)
    return match ? { prefix: normalizeCreditPrefix(match[1]), author: match[2].trim() } : { prefix: '', author: author.trim() }
}
export function formatCredit(q: Pick<Quote, 'author' | 'creditPrefix' | 'source'>, withDash = true) {
    const parsed = splitAuthorPrefix(q.author)
    const prefix = normalizeCreditPrefix(q.creditPrefix || parsed.prefix)
    const source = q.source.trim()
    const work = source ? (/^《.*》$/.test(source) ? source : `《${source}》`) : ''
    const body = `${prefix ? `[${prefix}]` : ''}${parsed.author}${work}`
    return body ? `${withDash ? '——' : ''}${body}` : ''
}
export function changeStatus(q: Quote, status: QuoteStatus, reason: string, reviewed = true): Quote {
    const now = new Date().toISOString()
    return { ...q, status, statusReason: reason, reviewed, updatedAt: now,
        statusHistory: [...q.statusHistory, { from: quoteStatus(q), to: status, at: now, reason }] }
}
export function addUsage(q: Quote, usage: z.infer<typeof usageSchema>): Quote {
    return { ...changeStatus(q, 'used', `使用：${usage.purpose}`),
        usageBaseline: q.usages.length ? q.usageBaseline : quoteStatus(q), usages: [...q.usages, usage] }
}
export function undoUsage(q: Quote, id: string): Quote {
    const usages = q.usages.filter(u => u.id !== id)
    if (usages.length === q.usages.length) return q
    const changed = !usages.length && quoteStatus(q) === 'used'
        ? changeStatus(q, q.usageBaseline ?? 'unused', '撤销最后一次使用记录', q.reviewed) : q
    return { ...changed, usages, usageBaseline: usages.length ? q.usageBaseline : undefined }
}

const themes = [
    ['春天', '春日', '春风', '新生', '萌芽'],
    ['希望', '期待', '曙光', '光明', '盼望'],
    ['成长', '勇气', '坚持', '努力', '前行'],
    ['平静', '安静', '宁静', '从容', '安然'],
    ['离别', '告别', '再见', '远行', '思念'],
    ['自由', '旷野', '无拘', '自在'],
    ['低谷', '挫折', '困境', '艰难', '失意'],
    ['秋天', '秋日', '秋风', '落叶'],
    ['时间', '岁月', '时光', '光阴'],
    ['生活', '日常', '烟火', '人间'],
    ['夏天', '夏日', '盛夏', '蝉鸣', '夏季'],
    ['冬天', '冬日', '寒冬', '冬季', '白雪'],
    ['孤独', '孤单', '独处', '寂寞'],
    ['自己', '自我', '独立', '本心'],
    ['放下', '释怀', '放手', '松绑'],
    ['爱情', '相爱', '爱你', '恋人'],
    ['朋友', '友情', '友谊', '知己'],
    ['快乐', '幸福', '喜悦', '欢喜'],
    ['读书', '阅读', '书籍', '文字'],
    ['勇敢', '勇气', '无畏', '坚强'],
    ['温柔', '善良', '体谅', '善意'],
    ['九月', '初秋', '白露', '秋日']
]

export function searchQuotes(quotes: Quote[], query: string, expand = true): Quote[] {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return [...quotes]
    const searchable = quotes.map(q => ({ ...q, text: q.text.replace(/[\s\u200b-\u200f]+/g, '') }))
    const fuse = new Fuse(searchable, {
        keys: [{ name: 'text', weight: 3 }, { name: 'tags', weight: 3 }, 'author', 'creditPrefix', 'source', 'notes'],
        threshold: 0.32, ignoreLocation: true, includeScore: true, minMatchCharLength: 2
    })
    const scores = terms.map(term => {
        const variants = expand ? [...new Set([term, ...themes.filter(g => g.includes(term)).flat()])] : [term]
        const map = new Map<string, number>()
        for (const variant of variants) {
            for (const result of fuse.search(variant)) {
                const score = (result.score ?? 1) + (variant === term ? 0 : 0.15)
                map.set(result.item.id, Math.min(map.get(result.item.id) ?? Infinity, score))
            }
            // Fuse limits long patterns; exact substrings must always remain searchable.
            for (const q of quotes) {
                if ([q.text, q.author, q.creditPrefix, q.source, q.notes, ...q.tags].some(v => v.toLowerCase().includes(variant))) {
                    map.set(q.id, Math.min(map.get(q.id) ?? Infinity, variant === term ? 0 : 0.15))
                }
            }
        }
        return map
    })
    return quotes.filter(q => scores.every(s => s.has(q.id)))
        .sort((a, b) => scores.reduce((n, s) => n + s.get(a.id)! - s.get(b.id)!, 0))
}

export function mergeQuotes(existing: Quote[], incoming: Quote[]) {
    const result = [...existing]
    const texts = new Set(existing.map(q => normalizedText(q.text)))
    const ids = new Set(existing.map(q => q.id))
    let skipped = 0
    for (const q of incoming) {
        const key = normalizedText(q.text)
        if (texts.has(key)) { skipped++; continue }
        const item = { ...q, id: ids.has(q.id) ? crypto.randomUUID() : q.id }
        result.push(item)
        texts.add(key)
        ids.add(item.id)
    }
    return { quotes: result, added: result.length - existing.length, skipped }
}
