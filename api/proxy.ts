interface ProxyPayload {
    target?: unknown
    method?: unknown
    headers?: unknown
    body?: unknown
}

interface ProxyResult {
    status: number
    headers: Record<string, string>
    body: ArrayBuffer
}

interface MultipartProxyPayload {
    target: string
    headers: Record<string, string>
    body: FormData
}

interface StreamProxyMessage {
    type: 'ready' | 'heartbeat' | 'done' | 'error'
    elapsedMs?: number
    status?: number
    headers?: Record<string, string>
    body?: string
    error?: string
}

const FORWARDED_HEADERS = new Set([
    'accept',
    'authorization',
    'content-type'
])

const RESPONSE_HEADERS = [
    'content-type',
    'cache-control',
    'etag',
    'last-modified'
]

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function handler(req: any, res: any) {
    if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
    }

    // 鉴权：要求 ?token=xxx 与环境变量 VISTACK_PROXY_TOKEN 一致。
    // 未配置环境变量时自动放行（仅本地开发场景下会这样）。
    if (!isProxyAuthorized(getRequestUrl(req))) {
        res.statusCode = 401
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'Unauthorized: this proxy is protected.' }))
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
            const streamMode = String(formData.get('_vistack_stream') || '')
            formData.delete('_vistack_target')
            formData.delete('_vistack_stream')

            if (streamMode === 'ndjson') {
                await streamMultipartProxyRequest(res, {
                    target,
                    headers: {
                        Authorization: String(req.headers.authorization || '')
                    },
                    body: formData
                })
                return
            }

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
        console.error('Vistack proxy failed:', error)
        res.statusCode = 400
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({
            error: error instanceof Error ? error.message : 'Proxy request failed.'
        }))
    }
}

async function performProxyRequest(payload: ProxyPayload): Promise<ProxyResult> {
    const target = normalizeTarget(payload.target)
    const method = normalizeMethod(payload.method)
    const headers = normalizeHeaders(payload.headers)
    const body = buildRequestBody(payload.body, method, headers)

    const upstream = await fetch(target, {
        method,
        headers,
        body,
        redirect: 'follow'
    })

    return buildProxyResult(upstream)
}

async function performMultipartProxyRequest(payload: MultipartProxyPayload): Promise<ProxyResult> {
    const target = normalizeTarget(payload.target)
    const headers = normalizeHeaders(payload.headers)

    const upstream = await fetch(target, {
        method: 'POST',
        headers,
        body: payload.body,
        redirect: 'follow'
    })

    return buildProxyResult(upstream)
}

async function buildProxyResult(upstream: Response): Promise<ProxyResult> {
    const responseHeaders: Record<string, string> = {}
    for (const headerName of RESPONSE_HEADERS) {
        const value = upstream.headers.get(headerName)
        if (value) {
            responseHeaders[headerName] = value
        }
    }

    return {
        status: upstream.status,
        headers: responseHeaders,
        body: await upstream.arrayBuffer()
    }
}

function sendProxyResult(res: any, result: ProxyResult) {
    for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value)
    }
    res.setHeader('x-vistack-proxy', '1')
    res.statusCode = result.status
    res.end(Buffer.from(result.body))
}

async function streamMultipartProxyRequest(res: any, payload: MultipartProxyPayload): Promise<void> {
    const startedAt = Date.now()
    let heartbeatTimer: ReturnType<typeof setInterval> | undefined

    try {
        res.statusCode = 200
        res.setHeader('content-type', 'application/x-ndjson; charset=utf-8')
        res.setHeader('cache-control', 'no-cache, no-transform')
        res.setHeader('x-vistack-proxy', '1')
        res.setHeader('x-accel-buffering', 'no')
        res.write(formatStreamMessage({ type: 'ready', elapsedMs: 0 }))

        heartbeatTimer = setInterval(() => {
            res.write(formatStreamMessage({
                type: 'heartbeat',
                elapsedMs: Date.now() - startedAt
            }))
        }, 10_000)

        const result = await performMultipartProxyRequest(payload)
        res.write(formatStreamMessage({
            type: 'done',
            elapsedMs: Date.now() - startedAt,
            status: result.status,
            headers: result.headers,
            body: arrayBufferToBase64(result.body)
        }))
    } catch (error) {
        res.write(formatStreamMessage({
            type: 'error',
            elapsedMs: Date.now() - startedAt,
            error: error instanceof Error ? error.message : 'Proxy stream request failed.'
        }))
    } finally {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer)
        }
        res.end()
    }
}

function formatStreamMessage(message: StreamProxyMessage): string {
    return `${JSON.stringify(message)}\n`
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString('base64')
}

function isMultipart(req: any): boolean {
    return String(req.headers?.['content-type'] || '').toLowerCase().includes('multipart/form-data')
}

async function readMultipartPayload(req: any): Promise<FormData> {
    const chunks = await readRequestChunks(req)
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
    if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        return req.body
    }

    if (typeof req.body === 'string' && req.body.trim()) {
        return JSON.parse(req.body)
    }

    if (Buffer.isBuffer(req.body)) {
        const rawBody = req.body.toString('utf8').trim()
        return rawBody ? JSON.parse(rawBody) : {}
    }

    const chunks = await readRequestChunks(req)
    const raw = Buffer.concat(chunks).toString('utf8').trim()
    return raw ? JSON.parse(raw) : {}
}

async function readRequestChunks(req: any): Promise<Buffer[]> {
    const chunks: Buffer[] = []
    for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    return chunks
}

function normalizeTarget(target: unknown): string {
    if (typeof target !== 'string' || !target.trim()) {
        throw new Error('缺少代理目标地址。')
    }

    let url: URL
    try {
        url = new URL(target.trim())
    } catch {
        throw new Error('代理目标地址不是有效 URL。')
    }

    if (!['https:', 'http:'].includes(url.protocol)) {
        throw new Error('代理目标地址只支持 HTTP/HTTPS。')
    }

    if (isPrivateHost(url.hostname)) {
        throw new Error('出于安全考虑，代理不能访问本机或内网地址。')
    }

    return url.toString()
}

function normalizeMethod(method: unknown): string {
    const normalized = typeof method === 'string' ? method.toUpperCase() : 'GET'
    if (!['GET', 'POST'].includes(normalized)) {
        throw new Error('代理目前只支持 GET 和 POST 请求。')
    }
    return normalized
}

function normalizeHeaders(headers: unknown): Record<string, string> {
    if (!headers || typeof headers !== 'object' || Array.isArray(headers)) {
        return {}
    }

    const normalized: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
        const name = key.toLowerCase()
        if (!FORWARDED_HEADERS.has(name)) continue
        if (typeof value !== 'string') continue
        if (!value.trim()) continue
        normalized[key] = value
    }

    return normalized
}

function buildRequestBody(body: unknown, method: string, headers: Record<string, string>): BodyInit | undefined {
    if (method === 'GET' || body === undefined || body === null) {
        return undefined
    }

    if (typeof body === 'string') {
        return body
    }

    if (!hasHeader(headers, 'content-type')) {
        headers['Content-Type'] = 'application/json'
    }
    return JSON.stringify(body)
}

function hasHeader(headers: Record<string, string>, headerName: string): boolean {
    return Object.keys(headers).some(key => key.toLowerCase() === headerName.toLowerCase())
}

function isPrivateHost(hostname: string): boolean {
    const host = hostname.toLowerCase()
    if (host === 'localhost' || host.endsWith('.localhost')) return true
    if (host === '0.0.0.0') return true
    if (host === '::1' || host === '[::1]') return true
    if (host === '169.254.169.254') return true

    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (!ipv4) return false

    const parts = ipv4.slice(1).map(part => Number(part))
    if (parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return true

    const [first, second] = parts
    return first === 10 ||
        first === 127 ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168) ||
        (first === 169 && second === 254)
}

// 读取环境变量中的代理密码。未设置时为空字符串。
function readProxyToken(): string {
    if (typeof process !== 'undefined' && process.env && typeof process.env.VISTACK_PROXY_TOKEN === 'string') {
        return process.env.VISTACK_PROXY_TOKEN.trim()
    }
    return ''
}

// 校验调用方是否带正确的 ?token=xxx。
// 未配置密码时一律放行（仅本地开发会这样，线上务必设置环境变量）。
function isProxyAuthorized(requestUrl: string): boolean {
    const expected = readProxyToken()
    if (!expected) return true

    try {
        const parsed = new URL(requestUrl, 'http://localhost')
        const provided = (parsed.searchParams.get('token') || '').trim()
        if (!provided) return false
        if (provided.length !== expected.length) return false
        return timingSafeEqual(provided, expected)
    } catch {
        return false
    }
}

function timingSafeEqual(a: string, b: string): boolean {
    let result = 0
    for (let i = 0; i < a.length; i += 1) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    return result === 0
}

// 拼出完整请求 URL，用于解析 query 参数。Vercel 把协议/主机/原始路径拼起来即可。
function getRequestUrl(req: any): string {
    const headers = req.headers || {}
    const host = headers.host || headers['x-forwarded-host'] || 'localhost'
    const proto = headers['x-forwarded-proto'] || 'https'
    const rawUrl = typeof req.url === 'string' ? req.url : (req.originalUrl || '/')
    return `${proto}://${host}${rawUrl}`
}
