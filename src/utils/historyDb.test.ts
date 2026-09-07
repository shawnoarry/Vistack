import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb'
import {
    clearGenerationHistoryItems, deleteGenerationHistoryItem, deleteStoredImage,
    getGenerationHistoryItems, getStoredImage, putGenerationHistoryItem,
    putStoredImage, getImageThumbnail, putImageThumbnail, resolveHistoryItemImages, resolveHistoryItemsImages, type GenerationHistoryItem
} from './historyDb'
import { removeHistoryImage } from './generationRecords'

const item = (id: string, imageIds = ['shared']): GenerationHistoryItem => ({
    id, source: 'image', prompt: 'keep this prompt', model: 'test', endpoint: 'https://example.com',
    aspectRatio: '1:1', imageSize: '1K', createdAt: 1,
    images: imageIds.map(() => ''), imageIds
})

async function seedLegacy(record: GenerationHistoryItem) {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('nano-banana-workbench', 3)
        request.onupgradeneeded = () => request.result.createObjectStore('generation-history', { keyPath: 'id' })
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('generation-history', 'readwrite')
        tx.objectStore('generation-history').put(record)
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onabort = () => { db.close(); reject(tx.error) }
    })
}

beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('indexedDB', new IDBFactory())
})

describe('history persistence and deletion', () => {
    it('stores thumbnails separately and retains shared caches until the original can be deleted', async () => {
        await putStoredImage({ id: 'shared', dataUrl: 'original', createdAt: 1, source: 'generated' })
        await putImageThumbnail({ id: 'v1:shared', dataUrl: 'thumbnail', width: 2048, height: 1024 })
        await putGenerationHistoryItem(item('protected'))
        await deleteStoredImage('shared')
        expect((await getImageThumbnail('v1:shared'))?.dataUrl).toBe('thumbnail')
        expect((await resolveHistoryItemImages(item('protected')))[0]).toBe('original')
        await deleteGenerationHistoryItem('protected')
        await deleteStoredImage('shared')
        expect(await getImageThumbnail('v1:shared')).toBeUndefined()
        expect(await getStoredImage('shared')).toBeUndefined()
    })
    it('reads only requested images, deduplicating shared IDs in a batch', async () => {
        await putStoredImage({ id: 'shared', dataUrl: 'shared-image', createdAt: 1, source: 'generated' })
        await putStoredImage({ id: 'unrequested', dataUrl: 'other-image', createdAt: 1, source: 'generated' })
        const get = vi.spyOn(IDBObjectStore.prototype, 'get')
        const resolved = await resolveHistoryItemsImages([item('one'), item('two')])
        expect(resolved.map(record => record.images)).toEqual([['shared-image'], ['shared-image']])
        expect(get.mock.calls.map(args => args[0])).toEqual(['shared'])
    })

    it('keeps shared images until their last history reference is deleted', async () => {
        await putStoredImage({ id: 'shared', dataUrl: 'data:image/png;base64,abc', createdAt: 1, source: 'generated' })
        await putGenerationHistoryItem(item('first'))
        await putGenerationHistoryItem(item('second'))
        await deleteGenerationHistoryItem('first')
        await deleteStoredImage('shared')
        expect((await getStoredImage('shared'))?.dataUrl).toBe('data:image/png;base64,abc')
        expect(await resolveHistoryItemImages((await getGenerationHistoryItems())[0])).toEqual(['data:image/png;base64,abc'])
        await deleteGenerationHistoryItem('second')
        await deleteStoredImage('shared')
        expect(await getStoredImage('shared')).toBeUndefined()
    })

    it('preserves another occurrence of the same image within one group', async () => {
        await putStoredImage({ id: 'shared', dataUrl: 'local', createdAt: 1, source: 'generated' })
        const group = item('group', ['shared', 'shared'])
        await putGenerationHistoryItem(group)
        await putGenerationHistoryItem(removeHistoryImage(group, 0))
        await deleteStoredImage('shared')
        expect(await getStoredImage('shared')).toBeDefined()
    })

    it('does not resurrect deleted legacy records on repeated loads', async () => {
        await seedLegacy(item('old'))
        expect((await getGenerationHistoryItems()).map(record => record.id)).toEqual(['old'])
        await deleteGenerationHistoryItem('old')
        expect(await getGenerationHistoryItems()).toEqual([])
        expect(await getGenerationHistoryItems()).toEqual([])
        await expect(putGenerationHistoryItem(item('old'))).rejects.toThrow()
    })

    it('does not overwrite a newer edited record with its legacy copy', async () => {
        await seedLegacy(item('old'))
        await putGenerationHistoryItem({ ...item('old'), prompt: 'updated' })
        expect((await getGenerationHistoryItems())[0].prompt).toBe('updated')
    })

    it('clears current and unmigrated legacy history without their reappearing', async () => {
        await seedLegacy(item('old'))
        await putGenerationHistoryItem(item('current'))
        await clearGenerationHistoryItems()
        expect(await getGenerationHistoryItems()).toEqual([])
    })

    it('does not report success when a transaction aborts after a successful put', async () => {
        await getGenerationHistoryItems()
        const original = IDBObjectStore.prototype.put
        vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, ...args) {
            const request = original.apply(this, args)
            request.addEventListener('success', () => this.transaction.abort())
            return request
        })
        await expect(putGenerationHistoryItem(item('aborted'))).rejects.toThrow()
        vi.restoreAllMocks()
        expect(await getGenerationHistoryItems()).toEqual([])
    })

    it('rolls back both a delete and its deletion marker on transaction failure', async () => {
        await seedLegacy(item('old'))
        await getGenerationHistoryItems()
        const original = IDBObjectStore.prototype.delete
        vi.spyOn(IDBObjectStore.prototype, 'delete').mockImplementation(function (this: IDBObjectStore, key) {
            const request = original.call(this, key)
            request.addEventListener('success', () => this.transaction.abort())
            return request
        })
        await expect(deleteGenerationHistoryItem('old')).rejects.toThrow()
        vi.restoreAllMocks()
        await expect(putGenerationHistoryItem({ ...item('old'), prompt: 'still editable' })).resolves.toBe('old')
        expect((await getGenerationHistoryItems())[0].prompt).toBe('still editable')
    })

    it('keeps current and legacy records readable when migration cannot commit', async () => {
        await seedLegacy(item('old'))
        await putGenerationHistoryItem(item('current'))
        const original = IDBObjectStore.prototype.put
        vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, ...args) {
            const request = original.apply(this, args)
            request.addEventListener('success', () => this.transaction.abort())
            return request
        })
        const warning = vi.fn()
        expect((await getGenerationHistoryItems(warning)).map(record => record.id).sort()).toEqual(['current', 'old'])
        expect(warning).toHaveBeenCalledOnce()
    })

    it.each([3, 4])('upgrades version %i without losing history, images, or pending tasks', async version => {
        const db = await new Promise<IDBDatabase>(resolve => {
            const request = indexedDB.open('vistack', version)
            request.onupgradeneeded = () => {
                for (const name of ['generation-history', 'stored-images', 'pending-generation-tasks']) {
                    request.result.createObjectStore(name, { keyPath: 'id' })
                }
                if (version === 4) request.result.createObjectStore('history-deletions', { keyPath: 'id' })
            }
            request.onsuccess = () => resolve(request.result)
        })
        await new Promise<void>(resolve => {
            const tx = db.transaction(['generation-history', 'stored-images', 'pending-generation-tasks'], 'readwrite')
            tx.objectStore('generation-history').put(item('protected'))
            tx.objectStore('stored-images').put({ id: 'shared', dataUrl: 'protected-image' })
            tx.objectStore('pending-generation-tasks').put({ id: 'pending', prompt: 'protected-prompt' })
            tx.oncomplete = () => { db.close(); resolve() }
        })
        expect((await getGenerationHistoryItems())[0].prompt).toBe('keep this prompt')
        expect((await getStoredImage('shared'))?.dataUrl).toBe('protected-image')
        const upgraded = await new Promise<IDBDatabase>(resolve => {
            const request = indexedDB.open('vistack')
            request.onsuccess = () => resolve(request.result)
        })
        expect(upgraded.version).toBe(5)
        expect(upgraded.objectStoreNames.contains('image-thumbnails')).toBe(true)
        expect(upgraded.objectStoreNames.contains('history-deletions')).toBe(true)
        await new Promise<void>(resolve => {
            const tx = upgraded.transaction('pending-generation-tasks')
            const request = tx.objectStore('pending-generation-tasks').get('pending')
            tx.oncomplete = () => {
                expect(request.result.prompt).toBe('protected-prompt')
                upgraded.close()
                resolve()
            }
        })
    })

    it('preserves image positions when a stored image and its fallback are missing', async () => {
        await putStoredImage({ id: 'second', dataUrl: 'second-image', createdAt: 1, source: 'generated' })
        expect(await resolveHistoryItemImages(item('group', ['missing', 'second']))).toEqual(['', 'second-image'])
    })

    it('keeps diagnostic details aligned after successive single-image deletions', () => {
        const group = {
            ...item('group', ['a', 'b', 'c', 'd']),
            rawImageUrls: ['url-a', 'url-b', 'url-c', 'url-d'],
            imageDetails: [0, 2, 3].map(index => ({ index, revisedPrompt: `prompt-${index}` })),
            hiddenImageIndexes: [2, 3]
        }
        const result = removeHistoryImage(removeHistoryImage(group, 1), 0)
        expect(result.imageIds).toEqual(['c', 'd'])
        expect(result.rawImageUrls).toEqual(['url-c', 'url-d'])
        expect(result.hiddenImageIndexes).toEqual([0, 1])
        expect(result.imageDetails).toEqual([
            { index: 0, revisedPrompt: 'prompt-2' }, { index: 1, revisedPrompt: 'prompt-3' }
        ])
        expect(group.imageIds).toEqual(['a', 'b', 'c', 'd'])
        expect(removeHistoryImage(group, 9)).toBe(group)
    })
})
