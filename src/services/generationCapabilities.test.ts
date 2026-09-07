import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateImage } from './api'
import type { GenerateRequest } from '../types'

afterEach(() => vi.unstubAllGlobals())
const request: GenerateRequest = {
    prompt: 'Keep the reference composition', images: [], apikey: 'fixture',
    endpoint: 'https://api.example.com/v1/images/generations', model: 'gpt-image-2',
    aspectRatio: '4:5', imageSize: '2K', count: 1
}

async function captureRequest(overrides: Partial<GenerateRequest>) {
    const mock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({
        data: [{ url: 'https://images.example.com/original.png' }]
    }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', mock)
    const result = await generateImage({ ...request, ...overrides })
    expect(result.imageUrls).toEqual(['https://images.example.com/original.png'])
    expect(mock).toHaveBeenCalledTimes(1)
    return JSON.parse(String(mock.mock.calls[0][1]?.body))
}

describe('provider parameter transport compatibility', () => {
    it.each(['https://api.grsai.com/v1/api/generate', 'https://api.grsai.com/draw/completions'])('preserves Grsai pixel mapping at %s', async endpoint => {
        const body = await captureRequest({ endpoint })
        expect(body).toMatchObject({ aspectRatio: '1632x2048', count: 1 })
        expect(body).not.toHaveProperty('imageSize')
    })

    it('keeps original reference bytes and Doraverse multipart field names', async () => {
        const mock = vi.fn<typeof fetch>(async input => String(input).startsWith('data:')
            ? new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } })
            : new Response(JSON.stringify({ data: [{ url: 'https://images.example.com/original.png' }] }), {
                headers: { 'content-type': 'application/json' }
            }))
        vi.stubGlobal('fetch', mock)
        await generateImage({ ...request, endpoint: 'https://metapi.lilililwan.xyz/v1/images/edits',
            images: ['data:image/png;base64,AQID'], quality: 'high' })
        const form = mock.mock.calls.find(([url]) => String(url).endsWith('/images/edits'))?.[1]?.body as FormData
        expect(form.get('size')).toBe('1024x1536')
        expect(form.get('quality')).toBe('high')
        expect(form.get('n')).toBe('1')
        expect(form.has('image[]')).toBe(false)
        expect(new Uint8Array(await (form.get('image') as Blob).arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
    })

    it('keeps LJQ ratio sizes without adding Doraverse-only fields', async () => {
        const body = await captureRequest({ endpoint: 'https://ljqclub.com/v1/images/generations', quality: 'high' })
        expect(body).toMatchObject({ model: 'gpt-image-2', size: '4:5', n: 1 })
        expect(body).not.toHaveProperty('quality')
        expect(body).not.toHaveProperty('resolution')
    })

    it('keeps Doraverse fixed sizes and quality options', async () => {
        const body = await captureRequest({ endpoint: 'https://metapi.lilililwan.xyz/v1/images/generations', quality: 'high', autoPrompt: true, translate: false })
        expect(body).toMatchObject({ size: '1024x1536', n: 1, quality: 'high', resolution: '2K', autoPrompt: true, translate: false })
    })

    it('keeps generic OpenAI dimensions within the existing size rules', async () => {
        const body = await captureRequest({})
        const [width, height] = body.size.split('x').map(Number)
        expect(width % 16).toBe(0)
        expect(height % 16).toBe(0)
        expect(width / height).toBeCloseTo(4 / 5, 1)
        expect(body).not.toHaveProperty('resolution')
    })

    it('keeps Gemini chat image configuration and search', async () => {
        const body = await captureRequest({ endpoint: 'https://api.example.com/v1/chat/completions', model: 'gemini-3-pro-image', enableGoogleSearch: true })
        expect(body.image_config).toMatchObject({ aspect_ratio: '4:5', image_size: '2K' })
        expect(body.image_config.size).toMatch(/^\d+x\d+$/)
        expect(body.tools).toEqual([{ google_search: {} }])
    })

    it('preserves unknown chat models without adding known-model constraints', async () => {
        const body = await captureRequest({ endpoint: 'https://api.example.com/v1/chat/completions', model: 'custom-image-model', aspectRatio: '7:5', imageSize: 'custom', enableGoogleSearch: true })
        expect(body.image_config).toEqual({ aspect_ratio: '7:5', image_size: 'custom' })
        expect(body).not.toHaveProperty('tools')
    })
})
