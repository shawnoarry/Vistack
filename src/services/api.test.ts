import { afterEach, describe, expect, it, vi } from 'vitest'
import { improvePrompt } from './api'

afterEach(() => {
    vi.unstubAllGlobals()
})

const request = {
    prompt: '测试文案',
    context: '',
    apikey: 'test-key',
    endpoint: 'https://api.example.com/v1/chat/completions',
    model: 'test-model'
}

describe('prompt assistant network transport', () => {
    it('reconstructs a streamed proxy response and requests NDJSON keepalive mode', async () => {
        const upstreamBody = JSON.stringify({
            choices: [{ message: { content: '代理返回的提示词' } }]
        })
        const streamBody = [
            JSON.stringify({ type: 'ready', elapsedMs: 0 }),
            JSON.stringify({ type: 'heartbeat', elapsedMs: 10_000 }),
            JSON.stringify({
                type: 'done',
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: Buffer.from(upstreamBody).toString('base64')
            }),
            ''
        ].join('\n')
        const fetchMock = vi.fn<typeof fetch>(async () => new Response(streamBody, {
            status: 200,
            headers: {
                'content-type': 'application/x-ndjson; charset=utf-8',
                'x-vistack-proxy': '1'
            }
        }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(improvePrompt({ ...request, useProxy: true, proxyToken: 'proxy-token' }))
            .resolves.toEqual({ prompt: '代理返回的提示词' })

        const [url, init] = fetchMock.mock.calls[0]
        expect(url).toBe('/api/proxy?token=proxy-token')
        expect(JSON.parse(String(init?.body))).toMatchObject({
            target: request.endpoint,
            method: 'POST',
            _vistack_stream: 'ndjson'
        })
    })

    it('redacts sensitive endpoint parameters from network errors', async () => {
        vi.stubGlobal('fetch', vi.fn<typeof fetch>(async () => {
            throw new TypeError('Failed to fetch')
        }))

        const endpoint = 'https://api.example.com/v1/chat/completions?token=private-token'
        let message = ''
        try {
            await improvePrompt({ ...request, endpoint })
        } catch (error) {
            message = error instanceof Error ? error.message : String(error)
        }

        expect(message).toContain('Network request failed')
        expect(message).toContain('REDACTED')
        expect(message).not.toContain('private-token')
    })
})
