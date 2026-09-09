import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TextLibraryStore } from './store'
import { emptyLibrary, newQuote } from '../../src/text-library/model'

const dirs: string[] = []
async function store() {
    const dir = await mkdtemp(join(tmpdir(), 'vistack-text-test-'))
    dirs.push(dir)
    return new TextLibraryStore(join(dir, 'library.json'))
}
afterEach(async () => { await Promise.all(dirs.splice(0).map(dir => rm(dir, { recursive: true, force: true }))) })
describe('local file storage', () => {
    it('persists and reloads, keeping the previous file as backup', async () => {
        const s = await store()
        expect(await s.load()).toEqual(emptyLibrary())
        const first = await s.save({ ...emptyLibrary(), quotes: [newQuote('第一条')] })
        expect(first.revision).toBe(1)
        const second = await s.save({ ...first, quotes: [...first.quotes, newQuote('第二条')] })
        expect(await s.load()).toEqual(second)
        expect(JSON.parse(await readFile(`${s.path}.bak`, 'utf8'))).toEqual(first)
    })
    it('rejects stale concurrent writes', async () => {
        const s = await store()
        const results = await Promise.allSettled([s.save(emptyLibrary()), s.save(emptyLibrary())])
        expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1)
        expect(results.filter(r => r.status === 'rejected')).toHaveLength(1)
    })
    it('does not overwrite corrupt files', async () => {
        const s = await store()
        await writeFile(s.path, 'broken json')
        await expect(s.save(emptyLibrary())).rejects.toThrow('无法读取')
        expect(await readFile(s.path, 'utf8')).toBe('broken json')
    })
})
