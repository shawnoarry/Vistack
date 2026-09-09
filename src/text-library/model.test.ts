import { describe, expect, it } from 'vitest'
import { addUsage, changeStatus, emptyLibrary, formatCredit, librarySchema, mergeLibrary, mergeQuotes, newQuote, normalizedText, quoteStatus, removeCategory, searchQuotes, undoUsage } from './model'

describe('text library', () => {
    it('keeps legacy categories but starts a new library without personal categories', () => {
        const old = librarySchema.parse({ version: 1, revision: 2, quotes: [{ ...newQuote('旧书摘'), literatureType: 'japanese' }] })
        expect(old.categories.find(c => c.id === 'japanese')?.name).toBe('日式文学')
        expect(librarySchema.parse(emptyLibrary()).categories).toEqual([])
    })
    it('renames by stable id and removes categories without deleting quotes or usage history', () => {
        const q = { ...newQuote('甲'), literatureType: 'mine', status: 'used' as const, notes: '保留备注' }
        const original = { ...emptyLibrary(), categories: [{ id: 'mine', name: '书摘' }], quotes: [q] }
        const renamed = librarySchema.parse({ ...original, categories: [{ id: 'mine', name: '读书笔记' }] })
        expect(renamed.quotes[0].literatureType).toBe('mine')
        const removed = removeCategory(renamed, 'mine')
        expect(removed.quotes).toHaveLength(1)
        expect(removed.quotes[0]).toMatchObject({ text: '甲', literatureType: 'unclassified', status: 'used', notes: '保留备注' })
        expect(original.categories).toHaveLength(1)
        expect(librarySchema.safeParse(removed).success).toBe(true)
    })
    it('adds imported categories, merges same names and remaps colliding ids without overwriting local categories', () => {
        const local = { ...emptyLibrary(), categories: [{ id: 'same-id', name: '同事自己的分类' }, { id: 'local-id', name: '诗歌' }],
            quotes: [{ ...newQuote('已经收录'), literatureType: 'same-id' }] }
        const incoming = { ...emptyLibrary(), categories: [{ id: 'same-id', name: '我的随笔' }, { id: 'remote-id', name: '诗歌' }],
            quotes: [{ ...newQuote('新随笔'), literatureType: 'same-id' }, { ...newQuote('新诗歌'), literatureType: 'remote-id' }, newQuote('已经收录')] }
        const merged = mergeLibrary(local, incoming)
        expect(merged.categories).toHaveLength(3)
        expect(merged.categories[0]).toEqual(local.categories[0])
        expect(merged.quotes[1].literatureType).toBe(merged.categories.find(c => c.name === '我的随笔')!.id)
        expect(merged.quotes[1].literatureType).not.toBe('same-id')
        expect(merged.quotes[2].literatureType).toBe('local-id')
        expect(merged.quotes[0]).toEqual(local.quotes[0])
        expect(merged.skipped).toBe(1)
        expect(mergeLibrary({ ...local, ...merged }, incoming).categories).toEqual(merged.categories)
        expect(librarySchema.safeParse({ ...local, ...merged }).success).toBe(true)
    })
    it('imports category-only backups and rejects ambiguous or dangling categories', () => {
        const result = mergeLibrary(emptyLibrary(), { ...emptyLibrary(), categories: [{ id: 'a', name: '书摘' }] })
        expect(result.added).toBe(0)
        expect(result.categories).toHaveLength(1)
        expect(librarySchema.safeParse({ ...emptyLibrary(), categories: [{ id: 'a', name: '书摘' }, { id: 'b', name: ' 书摘 ' }] }).success).toBe(false)
        expect(librarySchema.safeParse({ ...emptyLibrary(), quotes: [{ ...newQuote('甲'), literatureType: 'missing' }] }).success).toBe(false)
        expect(librarySchema.safeParse({ ...emptyLibrary(), categories: [{ id: 'a', name: '未归类' }] }).success).toBe(false)
    })
    it('formats credits without inventing countries or merging Russia with the Soviet Union', () => {
        const q = newQuote('正文')
        expect(formatCredit({ ...q, author: '莫言' })).toBe('——莫言')
        expect(formatCredit({ ...q, author: '莫言' }, false)).toBe('莫言')
        expect(formatCredit({ ...q, creditPrefix: '日本', author: '作者', source: '作品' })).toBe('——[日]作者《作品》')
        expect(formatCredit({ ...q, creditPrefix: '日本', author: '作者', source: '作品' }, false)).toBe('[日]作者《作品》')
        expect(formatCredit({ ...q, author: '〔宋〕苏轼', source: '《作品》' })).toBe('——[宋]苏轼《作品》')
        for (const country of ['俄罗斯', '苏联', '印尼', '俄']) expect(formatCredit({ ...q, author: '作者', creditPrefix: country })).toBe(`——[${country}]作者`)
    })
    it('migrates earlier libraries and preserves explicitly chosen states', () => {
        const used = { ...newQuote('原有文字'), usages: [{ id: 'u', date: '2026-09-09', purpose: '海报' }] }
        expect(quoteStatus(used)).toBe('used')
        const rejected = changeStatus(used, 'rejected', '退回')
        expect(quoteStatus(rejected)).toBe('rejected')
        expect(rejected.usages).toHaveLength(1)
        expect(rejected.statusHistory[0].from).toBe('used')
    })
    it('restores planned or legacy-used state when the last dated usage is removed', () => {
        for (const status of ['planned', 'used', 'unused'] as const) {
            const q = { ...newQuote('旧文案正文'), status }
            const first = addUsage(q, { id: 'u1', date: '2026-09-09', purpose: '海报' })
            const second = addUsage(first, { id: 'u2', date: '2026-09-10', purpose: '海报' })
            expect(quoteStatus(second)).toBe('used')
            expect(quoteStatus(undoUsage(undoUsage(second, 'u1'), 'u2'))).toBe(status)
        }
    })
    it('normalizes punctuation, whitespace, width and case for duplicates', () => {
        expect(normalizedText('你好， 世界！ＡＢＣ')).toBe(normalizedText('你好世界abc'))
    })
    it('requires all search terms across fields', () => {
        const a = { ...newQuote('愿你心怀希望，走过春天。'), author: '甲', tags: ['成长'] }
        const b = newQuote('冬天的希望')
        expect(searchQuotes([a, b], '希望 成长').map(q => q.id)).toEqual([a.id])
        expect(searchQuotes([a, b], '不存在', false)).toEqual([])
    })
    it('expands optional theme synonyms but does not claim semantic matching', () => {
        const q = newQuote('在宁静中，看见自己。')
        expect(searchQuotes([q], '平静', true)).toHaveLength(1)
        expect(searchQuotes([q], '平静', false)).toHaveLength(0)
    })
    it('finds authors, notes and distant text', () => {
        const q = { ...newQuote('山'.repeat(80) + '海边'), author: '苏轼', notes: '生日备选' }
        expect(searchQuotes([q], '海边 苏轼', false)).toHaveLength(1)
        expect(searchQuotes([q], '生日', false)).toHaveLength(1)
    })
    it('keeps existing usage history when importing duplicate text', () => {
        const original = { ...newQuote('你好，世界。'), usages: [{ id: 'usage', date: '2026-09-09', purpose: '日历' }] }
        const merged = mergeQuotes([original], [newQuote('你好世界'), newQuote('新的文字'), newQuote('新的文字！')])
        expect(merged.added).toBe(1)
        expect(merged.skipped).toBe(2)
        expect(merged.quotes[0].usages).toHaveLength(1)
    })
    it('reassigns colliding ids on distinct imported text', () => {
        const a = newQuote('甲')
        const b = { ...newQuote('乙'), id: a.id }
        const result = mergeQuotes([a], [b])
        expect(new Set(result.quotes.map(q => q.id)).size).toBe(2)
    })
    it('validates imported library and rejects duplicate ids', () => {
        const q = newQuote('甲')
        expect(librarySchema.safeParse({ ...emptyLibrary(), quotes: [q, q] }).success).toBe(false)
        expect(librarySchema.safeParse({ quotes: ['正文'] }).success).toBe(false)
        expect(librarySchema.safeParse({ ...emptyLibrary(), quotes: [q] }).success).toBe(true)
    })
})
