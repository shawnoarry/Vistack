import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const destination = resolve(root, 'tmp/portable-notices')
await mkdir(destination, { recursive: true })
const seen = new Set()
const inventory = []
async function visit(name, parent = root) {
    let directory = parent
    let packagePath
    while (true) {
        const candidate = resolve(directory, 'node_modules', name, 'package.json')
        try { await readFile(candidate); packagePath = candidate; break } catch {}
        if (dirname(directory) === directory) throw new Error(`Missing dependency ${name}`)
        directory = dirname(directory)
    }
    if (seen.has(packagePath)) return
    seen.add(packagePath)
    const meta = JSON.parse(await readFile(packagePath, 'utf8'))
    const packageDir = dirname(packagePath)
    const licenses = (await readdir(packageDir)).filter(file => /^(licen[sc]e|copying|notice)([.-]|$)/i.test(file))
    const prefix = `${meta.name.replaceAll('/', '__')}-${meta.version}`
    for (const license of licenses) {
        const bytes = await readFile(resolve(packageDir, license))
        await writeFile(resolve(destination, `${prefix}-${license}`), bytes)
    }
    inventory.push({ name: meta.name, version: meta.version, license: meta.license, files: licenses })
    for (const child of Object.keys(meta.dependencies || {})) await visit(child, packageDir)
}
for (const name of ['vue', '@lucide/vue', 'zod', 'fuse.js', 'docx', 'tesseract.js', 'entities']) await visit(name)
for (const [name, url] of [
    ['Node-v22.13.0-LICENSE', 'https://raw.githubusercontent.com/nodejs/node/v22.13.0/LICENSE'],
    ['tessdata_fast-LICENSE', 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/LICENSE']
]) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`License download failed: ${name}`)
    await writeFile(resolve(destination, name), await response.text())
}
await writeFile(resolve(destination, 'dependencies.json'), JSON.stringify(inventory, null, 2))
console.log(`Prepared ${inventory.length} dependency notices plus Node and OCR data licenses.`)
