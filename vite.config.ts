import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { isProxyAuthorized, performMultipartProxyRequest, performProxyRequest, type ProxyPayload, type ProxyResult } from './api/proxyCore'

function localApiProxyPlugin(): Plugin {
    return {
        name: 'vistack-local-api-proxy',
        configureServer(server) {
            server.middlewares.use('/api/proxy', async (req, res) => {
                if (req.method === 'OPTIONS') {
                    res.statusCode = 204
                    res.end()
                    return
                }

                // 鉴权：?token=xxx 必须与环境变量 VISTACK_PROXY_TOKEN 一致。
                // 未配置环境变量时自动放行（本地开发友好）。
                if (!isProxyAuthorized(getRequestUrl(req))) {
                    sendJson(res, 401, { error: 'Unauthorized: this proxy is protected.' })
                    return
                }

                if (req.method !== 'POST') {
                    sendJson(res, 405, { error: 'Proxy endpoint only accepts POST.' })
                    return
                }

                try {
                    if (isMultipart(req)) {
                        const formData = await readMultipartBody(req)
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

                    const payload = await readJsonBody(req)
                    const result = await performProxyRequest(payload)
                    sendProxyResult(res, result)
                } catch (error) {
                    sendJson(res, 400, {
                        error: error instanceof Error ? error.message : 'Proxy request failed.'
                    })
                }
            })
        }
    }
}

function sendProxyResult(res: ServerResponse, result: ProxyResult) {
    for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value)
    }
    res.statusCode = result.status
    res.end(Buffer.from(result.body))
}

function sendJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>) {
    res.statusCode = statusCode
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(payload))
}

function isMultipart(req: IncomingMessage): boolean {
    return String(req.headers['content-type'] || '').toLowerCase().includes('multipart/form-data')
}

async function readMultipartBody(req: IncomingMessage): Promise<FormData> {
    const body = await readRawBody(req)
    const request = new Request('http://localhost/api/proxy', {
        method: 'POST',
        headers: {
            'content-type': String(req.headers['content-type'] || '')
        },
        body: new Uint8Array(body).buffer
    })
    return request.formData()
}

function readJsonBody(req: IncomingMessage): Promise<ProxyPayload> {
    return readRawBody(req).then(body => {
        const raw = body.toString('utf8').trim()
        return raw ? JSON.parse(raw) : {}
    })
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        req.on('data', chunk => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })
        req.on('error', reject)
        req.on('end', () => {
            resolve(Buffer.concat(chunks))
        })
    })
}

// 拼出完整请求 URL，用于解析 query 参数（开发环境下）。
function getRequestUrl(req: IncomingMessage): string {
    const headers = req.headers || {}
    const host = headers.host || headers['x-forwarded-host'] || 'localhost'
    const proto = headers['x-forwarded-proto'] || 'http'
    const rawUrl = typeof req.url === 'string' ? req.url : '/'
    return `${proto}://${host}${rawUrl}`
}

export default defineConfig({
    plugins: [vue(), localApiProxyPlugin()],
    cacheDir: '.vite-cache',
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    },
    server: {
        port: 3000
    }
})
