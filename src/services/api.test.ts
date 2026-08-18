import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchModels, improvePrompt } from './api'

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
    it('sends calendar style assignments and uses the creative temperature', async () => {
        const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
            choices: [{ message: { content: '{"options":[]}' } }]
        }), {
            status: 200,
            headers: { 'content-type': 'application/json' }
        }))
        vi.stubGlobal('fetch', fetchMock)

        await improvePrompt({
            ...request,
            task: 'calendar-illustration',
            context: '方案 1：自然光摄影。\n方案 2：透明水彩。\n方案 3：材料拼贴。'
        })

        const [, init] = fetchMock.mock.calls[0]
        const body = JSON.parse(String(init?.body)) as {
            temperature: number
            messages: Array<{ role: string; content: string }>
        }
        expect(body.temperature).toBe(0.95)
        expect(body.messages[1].content).toContain('严格按创作条件中列出的方案 1、2、3 风格路线逐条输出')
        expect(body.messages[1].content).toContain('方案 1：自然光摄影')
        expect(body.messages[0].content).toContain('允许具体人物、自然物、静物、空间和场景')
        expect(body.messages[0].content).not.toContain('优先输出非人物、非具象')
        expect(body.messages[1].content).toContain('允许具体人物、自然物、静物、空间和场景')
        expect(body.messages[1].content).toContain('不限制人物方案数量')
        expect(body.messages[1].content).toContain('作品名、书名、专有名词与出处信息可以提供创意线索')
        expect(body.messages[1].content).toContain('不要机械推断作者国籍或地域')
        expect(body.messages[1].content).toContain('不要在结果中复述原文、生成书名或作者署名')
        expect(body.messages[1].content).not.toContain('最多只有一组')
    })

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

describe('model list error guidance', () => {
    it('stops endpoint probing and explains a protected Vistack proxy rejection', async () => {
        const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
            error: 'Unauthorized: this proxy is protected.'
        }), {
            status: 401,
            headers: { 'content-type': 'application/json' }
        }))
        vi.stubGlobal('fetch', fetchMock)

        await expect(fetchModels(
            'test-key',
            'https://api.example.com/v1/chat/completions',
            true,
            'wrong-proxy-token'
        )).rejects.toThrow(
            'Vistack 代理鉴权失败（HTTP 401）。请检查当前配置的代理密码，必须与服务端 VISTACK_PROXY_TOKEN 完全一致。'
        )

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [, init] = fetchMock.mock.calls[0]
        expect(JSON.parse(String(init?.body))).toMatchObject({
            target: 'https://api.example.com/v1/models',
            method: 'GET'
        })
    })
})
