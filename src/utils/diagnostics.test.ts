import { describe, expect, it } from 'vitest'
import { buildDiagnosticReport, formatDiagnosticTimestamp, redactSensitiveText, sanitizeDiagnosticUrl, summarizeDiagnosticError } from './diagnostics'

describe('diagnostic report', () => {
    it('adds stable capture context while preserving existing detail lines', () => {
        const report = buildDiagnosticReport({
            title: 'Vistack 请求诊断',
            capturedAt: '2026-07-12T12:00:00.000Z',
            visibleError: 'HTTP 500 upstream failed',
            userAgent: 'Test Browser 1.0',
            details: [
                'provider: openai-image',
                '',
                false,
                'model: gpt-image-1'
            ]
        })

        expect(report).toBe([
            'Vistack 请求诊断',
            'capturedAt: 2026-07-12T12:00:00.000Z',
            'visibleError: HTTP 500 upstream failed',
            'browser: Test Browser 1.0',
            'provider: openai-image',
            'model: gpt-image-1'
        ].join('\n'))
    })

    it('uses an explicit empty-error marker', () => {
        const report = buildDiagnosticReport({
            title: 'Vistack 历史生成信息',
            capturedAt: '2026-07-12T12:00:00.000Z',
            details: ['historyId: history-1']
        })

        expect(report).toContain('visibleError: none')
    })

    it('redacts secrets from arbitrary diagnostic detail lines', () => {
        const report = buildDiagnosticReport({
            title: 'Vistack 历史生成信息',
            capturedAt: '2026-07-12T12:00:00.000Z',
            details: ['endpoint: https://api.example.com/v1?token=private-token']
        })

        expect(report).not.toContain('private-token')
        expect(report).toContain('[REDACTED]')
    })
})

describe('diagnostic secret redaction', () => {
    it('masks sensitive URL query parameters but keeps routing information', () => {
        expect(sanitizeDiagnosticUrl('https://api.example.com/v1/images?token=secret&model=test'))
            .toBe('https://api.example.com/v1/images?token=%5BREDACTED%5D&model=test')
        expect(sanitizeDiagnosticUrl('/api/proxy?api_key=secret&mode=image'))
            .toBe('/api/proxy?api_key=%5BREDACTED%5D&mode=image')
        expect(sanitizeDiagnosticUrl('https://user:password@api.example.com/v1'))
            .toBe('https://%5BREDACTED%5D:%5BREDACTED%5D@api.example.com/v1')
    })

    it('masks common credentials in error text', () => {
        const source = 'Authorization: Bearer abc.def-123 apiKey="sk-test" proxy_token=proxy-secret'
        const redacted = redactSensitiveText(source)

        expect(redacted).not.toContain('abc.def-123')
        expect(redacted).not.toContain('sk-test')
        expect(redacted).not.toContain('proxy-secret')
        expect(redacted).toContain('[REDACTED]')
    })

    it('masks a credential echoed in the visible error', () => {
        const report = buildDiagnosticReport({
            title: 'Vistack 请求诊断',
            capturedAt: '2026-07-12T12:00:00.000Z',
            visibleError: 'Request failed with Bearer private-token',
            details: []
        })

        expect(report).not.toContain('private-token')
        expect(report).toContain('Bearer [REDACTED]')
    })

    it('stores a compact redacted upstream error summary', () => {
        const summary = summarizeDiagnosticError('  Authorization: Bearer private-token\nupstream failed  ', 48)

        expect(summary).not.toContain('private-token')
        expect(summary).toContain('[REDACTED]')
        expect(summary.length).toBeLessThanOrEqual(48)
    })
})

describe('diagnostic timestamps', () => {
    it('formats valid history dates and tolerates invalid legacy values', () => {
        expect(formatDiagnosticTimestamp(1_752_326_400_000)).toBe('2025-07-12T13:20:00.000Z')
        expect(formatDiagnosticTimestamp('invalid')).toBe('unknown')
    })
})
