import { readFile, mkdir, writeFile, rename, copyFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { emptyLibrary, librarySchema, type Library } from '../../src/text-library/model'

export class TextLibraryStore {
    private queue: Promise<unknown> = Promise.resolve()
    constructor(readonly path: string) {}

    async load(): Promise<Library> {
        try {
            return librarySchema.parse(JSON.parse(await readFile(this.path, 'utf8')))
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyLibrary()
            throw new Error('文字库文件无法读取。请先保留原文件，再检查 JSON 或从 .bak 备份恢复。')
        }
    }

    save(input: unknown): Promise<Library> {
        const task = this.queue.then(async () => {
            const next = librarySchema.parse(input)
            const current = await this.load()
            if (current.revision !== next.revision) throw new Error('CONFLICT')
            const saved = { ...next, revision: current.revision + 1 }
            await mkdir(dirname(this.path), { recursive: true })
            try { await copyFile(this.path, `${this.path}.bak`) }
            catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
            await writeFile(`${this.path}.tmp`, JSON.stringify(saved, null, 2), 'utf8')
            await rename(`${this.path}.tmp`, this.path)
            return saved
        })
        this.queue = task.catch(() => undefined)
        return task
    }
}
