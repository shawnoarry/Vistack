export interface ProxyPayload {
    target?: unknown
    method?: unknown
    headers?: unknown
    body?: unknown
}

export interface ProxyResult {
    status: number
    headers: Record<string, string>
    body: ArrayBuffer
}

export interface MultipartProxyPayload {
    target: string
    headers: Record<string, string>
    body: FormData
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

export async function performProxyRequest(payload: ProxyPayload): Promise<ProxyResult> {
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

export async function performMultipartProxyRequest(payload: MultipartProxyPayload): Promise<ProxyResult> {
    const target = normalizeTarget(payload.target)
    const headers = normalizeHeaders(payload.headers)

    const upstream = await fetch(target, {
        method: 'POST',
        headers,
        body: payload.body,
        redirect: 'follow'
    })

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
