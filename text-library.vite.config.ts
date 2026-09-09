import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { TextLibraryStore } from './tools/text-library/store'

const store = new TextLibraryStore(process.env.TEXT_LIBRARY_PATH || 'D:/日历/text-library.json')
const api: Plugin = {
    name: 'local-text-library',
    configureServer(server) {
        server.middlewares.use('/api/text-library', async (req, res) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            const reply = (status: number, value: unknown) => { res.statusCode = status; res.end(JSON.stringify(value)) }
            const host = req.headers.host || ''
            if (!/^127\.0\.0\.1:\d+$/.test(host) ||
                (req.headers.origin && req.headers.origin !== `http://${host}`)) {
                reply(403, { error: '仅允许本机访问' }); return
            }
            try {
                if (req.method === 'GET') {
                    reply(200, { data: await store.load(), path: store.path }); return
                }
                if (req.method !== 'PUT') { reply(405, { error: '不支持的请求方式' }); return }
                if (!req.headers['content-type']?.startsWith('application/json')) {
                    reply(415, { error: '需要 JSON 数据' }); return
                }
                const chunks: Buffer[] = []
                let length = 0
                for await (const chunk of req) {
                    length += chunk.length
                    if (length > 25 * 1024 * 1024) { reply(413, { error: '文件超过 25 MB' }); return }
                    chunks.push(Buffer.from(chunk))
                }
                reply(200, { data: await store.save(JSON.parse(Buffer.concat(chunks).toString('utf8'))), path: store.path })
            } catch (error) {
                const message = error instanceof Error ? error.message : '保存失败'
                reply(message === 'CONFLICT' ? 409 : 400, {
                    error: message === 'CONFLICT' ? '文字库已在其他窗口更新。请保留当前输入，刷新后重试。' : message
                })
            }
        })
    }
}

export default defineConfig({
    plugins: [vue(), api],
    publicDir: 'text-library-public',
    cacheDir: '.vite-cache/text-library',
    server: { host: '127.0.0.1', port: 4178, strictPort: true, open: process.env.TEXT_LIBRARY_NO_OPEN === '1' ? false : '/text-library.html' },
    build: { outDir: 'dist-text-library', rollupOptions: { input: resolve('text-library.html') } }
})
