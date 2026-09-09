import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const target = resolve(root, 'text-library-public/ocr')
const core = resolve(root, 'node_modules/tesseract.js-core')
await mkdir(`${target}/core`, { recursive: true })
await copyFile(resolve(root, 'node_modules/tesseract.js/dist/worker.min.js'), `${target}/worker.min.js`)
for (const file of await readdir(core)) {
    if (/^tesseract-core.*\.wasm\.js$/.test(file)) await copyFile(resolve(core, file), `${target}/core/${file}`)
}
await copyFile(resolve(core, 'LICENSE'), `${target}/core/LICENSE.txt`)
for (const lang of ['chi_sim', 'eng']) {
    const output = `${target}/${lang}.traineddata.gz`
    try {
        if ((await stat(output)).size > 100000) {
            const head = (await readFile(output)).subarray(0, 2)
            if (head[0] === 0x1f && head[1] === 0x8b) continue
        }
    } catch {}
    console.log(`Preparing local OCR model: ${lang}`)
    const response = await fetch(`https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/${lang}.traineddata`, { signal: AbortSignal.timeout(120000) })
    if (!response.ok) throw new Error(`OCR model download failed: ${response.status}`)
    const data = Buffer.from(await response.arrayBuffer())
    if (data.length < 100000) throw new Error('OCR model download was incomplete')
    await writeFile(output, gzipSync(data))
}
console.log('Local Chinese and English OCR assets are ready.')
