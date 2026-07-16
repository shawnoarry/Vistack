export interface DiagnosticReportOptions {
    title: string
    details: Array<string | null | undefined | false>
    capturedAt?: Date | string
    visibleError?: string | null
    userAgent?: string
}

const REDACTED = '[REDACTED]'
const SENSITIVE_QUERY_PARAM = /api.?key|token|secret|password|authorization|auth/i

export function buildDiagnosticReport(options: DiagnosticReportOptions): string {
    const capturedAt = normalizeCapturedAt(options.capturedAt)
    const visibleError = options.visibleError?.trim()
    const userAgent = options.userAgent?.trim()

    return [
        options.title,
        `capturedAt: ${capturedAt}`,
        visibleError ? `visibleError: ${redactSensitiveText(visibleError)}` : 'visibleError: none',
        userAgent ? `browser: ${userAgent}` : '',
        ...options.details.map(detail => typeof detail === 'string' ? redactSensitiveText(detail) : detail)
    ].filter(Boolean).join('\n')
}

export function sanitizeDiagnosticUrl(value: string): string {
    const trimmed = value.trim()
    if (!trimmed) return ''

    try {
        const isAbsolute = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
        const url = new URL(trimmed, 'https://vistack.local')
        if (url.username) url.username = REDACTED
        if (url.password) url.password = REDACTED
        for (const key of [...url.searchParams.keys()]) {
            if (SENSITIVE_QUERY_PARAM.test(key)) {
                url.searchParams.set(key, REDACTED)
            }
        }

        if (isAbsolute) {
            return url.toString()
        }

        return `${url.pathname}${url.search}${url.hash}`
    } catch {
        return redactSensitiveText(trimmed)
    }
}

export function formatDiagnosticTimestamp(value: Date | string | number): string {
    const date = value instanceof Date ? value : new Date(value)
    return Number.isNaN(date.getTime()) ? 'unknown' : date.toISOString()
}

export function redactSensitiveText(value: string): string {
    return value
        .replace(/(bearer\s+)[a-z\d._~+\/-]+=*/gi, `$1${REDACTED}`)
        .replace(/([?&](?:api.?key|token|secret|password|authorization|auth)=)[^&#\s]+/gi, `$1${REDACTED}`)
        .replace(/((?:api[_-]?key|proxy[_-]?token|authorization|password|secret)\s*[:=]\s*["']?)[^"',\s&]+/gi, `$1${REDACTED}`)
}

export function summarizeDiagnosticError(value: string, maxLength = 2000): string {
    const normalized = redactSensitiveText(value).replace(/\s+/g, ' ').trim()
    if (normalized.length <= maxLength) return normalized
    return `${normalized.slice(0, Math.max(maxLength - 1, 0)).trimEnd()}…`
}

function normalizeCapturedAt(value?: Date | string): string {
    if (value instanceof Date) {
        return formatDiagnosticTimestamp(value)
    }

    if (typeof value === 'string' && value.trim()) {
        return value.trim()
    }

    return new Date().toISOString()
}
