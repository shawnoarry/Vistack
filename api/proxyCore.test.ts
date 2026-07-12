import { afterEach, describe, expect, it, vi } from 'vitest'
import { isProxyAuthorized, performProxyRequest } from './proxyCore'

const originalProxyToken = process.env.VISTACK_PROXY_TOKEN

afterEach(() => {
    if (originalProxyToken === undefined) {
        delete process.env.VISTACK_PROXY_TOKEN
    } else {
        process.env.VISTACK_PROXY_TOKEN = originalProxyToken
    }
    vi.unstubAllGlobals()
})

describe('proxy authorization compatibility', () => {
    it('accepts the configured token and rejects missing or incorrect tokens', () => {
        process.env.VISTACK_PROXY_TOKEN = 'test-secret'

        expect(isProxyAuthorized('https://vistack.example/api/proxy?token=test-secret')).toBe(true)
        expect(isProxyAuthorized('https://vistack.example/api/proxy?token=wrong')).toBe(false)
        expect(isProxyAuthorized('https://vistack.example/api/proxy')).toBe(false)
    })
})

describe('proxy request compatibility', () => {
    it.each([
        'ftp://example.com/file',
        'http://localhost:3000/v1',
        'http://127.0.0.1/v1',
        'http://10.0.0.1/v1',
        'http://172.16.0.1/v1',
        'http://192.168.1.1/v1',
        'http://169.254.169.254/latest/meta-data'
    ])('rejects an unsafe target before fetch: %s', async target => {
        const fetchMock = vi.fn<typeof fetch>()
        vi.stubGlobal('fetch', fetchMock)

        await expect(performProxyRequest({ target })).rejects.toThrow()
        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('forwards only the currently supported headers and JSON body', async () => {
        const fetchMock = vi.fn<typeof fetch>(async () => new Response('{"ok":true}', {
            status: 201,
            headers: {
                'content-type': 'application/json',
                'cache-control': 'no-store',
                'x-private-upstream-header': 'do-not-forward'
            }
        }))
        vi.stubGlobal('fetch', fetchMock)

        const result = await performProxyRequest({
            target: 'https://api.example.com/v1/generate',
            method: 'POST',
            headers: {
                Authorization: 'Bearer test-key',
                Accept: 'application/json',
                'X-Should-Not-Forward': 'private'
            },
            body: { prompt: 'test' }
        })

        expect(fetchMock).toHaveBeenCalledOnce()
        const [target, init] = fetchMock.mock.calls[0]
        expect(target).toBe('https://api.example.com/v1/generate')
        expect(init).toMatchObject({
            method: 'POST',
            redirect: 'follow',
            headers: {
                Authorization: 'Bearer test-key',
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: '{"prompt":"test"}'
        })
        expect(result.status).toBe(201)
        expect(result.headers).toEqual({
            'content-type': 'application/json',
            'cache-control': 'no-store'
        })
        expect(new TextDecoder().decode(result.body)).toBe('{"ok":true}')
    })

    it('sends GET requests without a body', async () => {
        const fetchMock = vi.fn<typeof fetch>(async () => new Response('ok'))
        vi.stubGlobal('fetch', fetchMock)

        await performProxyRequest({
            target: 'https://api.example.com/v1/models',
            method: 'GET',
            body: { ignored: true }
        })

        expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/v1/models', expect.objectContaining({
            method: 'GET',
            body: undefined
        }))
    })
})
