import { performMultipartProxyRequest, performProxyRequest, type ProxyPayload } from './proxyCore'

export default async function handler(req: any, res: any) {
    if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
    }

    if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'Proxy endpoint only accepts POST.' }))
        return
    }

    try {
        if (isMultipart(req)) {
            const formData = await readMultipartPayload(req)
            const target = String(formData.get('_vistack_target') || '')
            formData.delete('_vistack_target')
            const result = await performMultipartProxyRequest({
                target,
                headers: {
                    Authorization: String(req.headers.authorization || '')
                },
                body: formData
            })
            sendProxyResult(res, result)
            return
        }

        const payload = await readPayload(req)
        const result = await performProxyRequest(payload)
        sendProxyResult(res, result)
    } catch (error) {
        res.statusCode = 400
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({
            error: error instanceof Error ? error.message : 'Proxy request failed.'
        }))
    }
}

function sendProxyResult(res: any, result: Awaited<ReturnType<typeof performProxyRequest>>) {
    for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value)
    }
    res.statusCode = result.status
    res.end(Buffer.from(result.body))
}

function isMultipart(req: any): boolean {
    return String(req.headers?.['content-type'] || '').toLowerCase().includes('multipart/form-data')
}

async function readMultipartPayload(req: any): Promise<FormData> {
    const chunks: Buffer[] = []
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const request = new Request('http://localhost/api/proxy', {
        method: 'POST',
        headers: {
            'content-type': String(req.headers['content-type'] || '')
        },
        body: Buffer.concat(chunks)
    })

    return request.formData()
}

async function readPayload(req: any): Promise<ProxyPayload> {
    if (req.body && typeof req.body === 'object') {
        return req.body
    }

    if (typeof req.body === 'string' && req.body.trim()) {
        return JSON.parse(req.body)
    }

    const chunks: Buffer[] = []
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    const raw = Buffer.concat(chunks).toString('utf8').trim()
    return raw ? JSON.parse(raw) : {}
}
