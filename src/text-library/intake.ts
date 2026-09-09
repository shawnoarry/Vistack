import { normalizeCreditPrefix, splitAuthorPrefix } from './model'
import { decodeHTML } from 'entities'

export interface ParsedIntake {
    text: string
    author: string
    creditPrefix: string
    source: string
    originalInput: string
    recognized: boolean
}

function parseCredit(value: string, knownAuthors: Set<string>, explicit = false) {
    const trimmed = value.trim()
    const marked = /^(?:[—–─-]+|[/／|｜]|作者[:：])\s*/.test(trimmed)
    const clean = trimmed.replace(/^(?:[—–─-]+|[/／|｜]|作者[:：])\s*/, '').trim()
    const leadingWork = clean.match(/^《([^《》]+)》(\s*)(.+)$/)
    if (leadingWork) {
        const parsed = splitAuthorPrefix(leadingWork[3].trim())
        const nameLike = /^[\p{Script=Han}A-Za-z·•・.\s-]{2,30}$/u.test(parsed.author)
        if (nameLike && (leadingWork[2] || parsed.prefix || knownAuthors.has(parsed.author))) {
            return { author: parsed.author, creditPrefix: normalizeCreditPrefix(parsed.prefix), source: `《${leadingWork[1]}》` }
        }
    }
    const work = clean.match(/《([^《》]*)》\s*$/)
    const name = work ? clean.slice(0, work.index).trim() : clean
    const prefix = splitAuthorPrefix(name)
    if (!prefix.author && !work?.[1]) return null
    if (prefix.author.length > 40 || /[。！？!?，,；;：:\n《》]/.test(prefix.author)) return null
    const transliteratedName = /^[\p{Script=Han}]{1,8}(?:[·•・][\p{Script=Han}]{1,8}){1,3}$/u.test(prefix.author) &&
        prefix.author.replace(/[·•・]/g, '').length >= 5
    if (marked && !work && !prefix.prefix && !knownAuthors.has(prefix.author) &&
        /^[\p{Script=Han}]{6,}$/u.test(prefix.author)) return null
    if (!marked && !explicit && !work && !prefix.prefix && !knownAuthors.has(prefix.author) && !transliteratedName) return null
    return { author: prefix.author, creditPrefix: normalizeCreditPrefix(prefix.prefix), source: work?.[1] ? `《${work[1]}》` : '' }
}

export function parseIntake(raw: string, authors: string[] = []): ParsedIntake {
    const originalInput = raw.trim()
    const cleanedInput = decodeHTML(originalInput).replace(/\r\n?/g, '\n').split('\n').map(line => line.trimEnd()).join('\n').trim()
    const lines = cleanedInput.split('\n')
    const known = new Set(authors.filter(Boolean))
    const untouched = { text: cleanedInput, author: '', creditPrefix: '', source: '',
        originalInput: cleanedInput !== originalInput ? originalInput : '', recognized: cleanedInput !== originalInput }
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
    if (!lines.length) return untouched
    const last = lines[lines.length - 1].trim()
    if (lines.length > 1) {
        const credit = parseCredit(last, known)
        if (credit) {
            lines.pop()
            while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
            if (!credit.author && credit.source && lines.length > 1) {
                const separateAuthor = parseCredit(lines[lines.length - 1], known)
                if (separateAuthor && separateAuthor.author && !separateAuthor.source) {
                    credit.author = separateAuthor.author
                    credit.creditPrefix = separateAuthor.creditPrefix
                    lines.pop()
                }
            }
            const text = lines.join('\n').trim()
            if (text) return { text, ...credit, originalInput, recognized: true }
        }
    }
    // Inline dashes can also be prose. Require a book, a country/dynasty or an evidenced author.
    const match = cleanedInput.match(/^([\s\S]+?)(?:[—–─]{1,2}|--)\s*([^\n]+)$/)
    if (match) {
        const credit = parseCredit(match[2], known)
        if (credit && match[1].trim()) return { text: match[1].trim(), ...credit, originalInput, recognized: true }
    }
    return untouched
}
