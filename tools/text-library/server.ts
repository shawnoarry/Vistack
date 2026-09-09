import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { TextLibraryStore } from './store'

const directory = dirname(fileURLToPath(import.meta.url))
const publicRoot = resolve(directory, 'public')
const store = new TextLibraryStore(resolve(directory, '..', 'text-library.json'))
const port = Number(process.env.TEXT_LIBRARY_PORT || 4178)
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid TEXT_LIBRARY_PORT')
const address = `http://127.0.0.1:${port}/text-library.html`
const mime: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.wasm': 'application/wasm', '.gz': 'application/gzip'
}

const server = createServer(async (req, res) => {
    const json = (status: number, value: unknown) => {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
        res.end(JSON.stringify(value))
    }
    if (req.headers.host !== `127.0.0.1:${port}` ||
        (req.headers.origin && req.headers.origin !== `http://127.0.0.1:${port}`)) {
        json(403, { error: '仅允许本机访问' }); return
    }
    res.setHeader('X-Content-Type-Options', 'nosniff')
    try {
        const pathname = decodeURIComponent(new URL(req.url || '/', address).pathname)
        if (pathname === '/api/text-library') {
            if (req.method === 'GET') { json(200, { data: await store.load(), path: store.path }); return }
            if (req.method !== 'PUT') { json(405, { error: '不支持的请求方式' }); return }
            if (!req.headers['content-type']?.startsWith('application/json')) {
                json(415, { error: '需要 JSON 数据' }); return
            }
            const chunks: Buffer[] = []
            let size = 0
            for await (const chunk of req) {
                size += chunk.length
                if (size > 25 * 1024 * 1024) { json(413, { error: '文件超过 25 MB' }); return }
                chunks.push(Buffer.from(chunk))
            }
            const data = await store.save(JSON.parse(Buffer.concat(chunks).toString('utf8')))
            json(200, { data, path: store.path })
            return
        }
        if (req.method !== 'GET' && req.method !== 'HEAD') { json(405, { error: '不支持的请求方式' }); return }
        const target = resolve(publicRoot, `.${pathname === '/' ? '/text-library.html' : pathname}`)
        if (!target.startsWith(publicRoot + sep)) { json(403, { error: '禁止访问' }); return }
        const contents = await readFile(target)
        res.writeHead(200, { 'Content-Type': mime[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' })
        res.end(req.method === 'HEAD' ? undefined : contents)
    } catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') { json(404, { error: '文件不存在' }); return }
        const message = e instanceof Error ? e.message : '请求失败'
        json(message === 'CONFLICT' ? 409 : 400, { error: message === 'CONFLICT' ? '文字库已在其他窗口更新。请保留当前输入，刷新后重试。' : message })
    }
})
function openBrowser() {
    execFile('rundll32.exe', ['url.dll,FileProtocolHandler', address], { windowsHide: true }, () => {})
}
server.on('error', async (e: NodeJS.ErrnoException) => {
    if (e.code === 'EADDRINUSE' && process.argv.includes('--open')) {
        try {
            const response = await fetch(`http://127.0.0.1:${port}/api/text-library`, { signal: AbortSignal.timeout(1500) })
            const body = await response.json()
            if (response.ok && resolve(body.path) === store.path) { openBrowser(); return }
        } catch { /* Never open a different application occupying this port. */ }
    }
    console.error(e.code === 'EADDRINUSE' ? `Port ${port} is already in use. Open ${address} or close the other application.` : e.message)
    process.exitCode = 1
})
server.listen(port, '127.0.0.1', () => {
    console.log(`Text library: ${address}\nData: ${store.path}\nKeep this window open while using the library.`)
    if (process.argv.includes('--open')) openBrowser()
})
