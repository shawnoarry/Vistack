import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHistoryPersistence } from './historyPersistence'
import { deleteGenerationHistoryItem, putGenerationHistoryItem, type GenerationHistoryItem } from './historyDb'

vi.mock('./historyDb', () => ({ putGenerationHistoryItem: vi.fn(), deleteGenerationHistoryItem: vi.fn() }))
const record: GenerationHistoryItem = {
    id: 'record', source: 'image', prompt: 'original', model: 'test', endpoint: '',
    aspectRatio: '1:1', imageSize: '1K', createdAt: 1, images: ['image']
}

beforeEach(() => vi.resetAllMocks())

describe('unsaved history recovery', () => {
    it('retains a failed save and retries the latest edit', async () => {
        const state = createHistoryPersistence()
        vi.mocked(putGenerationHistoryItem).mockRejectedValue(new Error('quota'))
        expect(await state.save(record)).toBe(false)
        expect(await state.save({ ...record, prompt: 'latest edit' })).toBe(false)
        expect(state.unsavedIds.value).toEqual(['record'])
        vi.mocked(putGenerationHistoryItem).mockResolvedValue('record')
        await state.retry()
        expect(putGenerationHistoryItem).toHaveBeenLastCalledWith({ ...record, prompt: 'latest edit' })
        expect(state.unsavedIds.value).toEqual([])
    })

    it('does not allow an earlier successful save to clear a later failed edit', async () => {
        const state = createHistoryPersistence()
        vi.mocked(putGenerationHistoryItem).mockResolvedValueOnce('record').mockRejectedValueOnce(new Error('quota'))
        const first = state.save(record)
        const second = state.save({ ...record, prompt: 'newer' })
        expect(await first).toBe(true)
        expect(await second).toBe(false)
        expect(state.unsavedIds.value).toEqual(['record'])
    })

    it('cancels retries for records that were successfully deleted', async () => {
        const state = createHistoryPersistence()
        vi.mocked(putGenerationHistoryItem).mockRejectedValue(new Error('quota'))
        await state.save(record)
        vi.mocked(deleteGenerationHistoryItem).mockResolvedValue(undefined)
        expect(await state.remove(record.id)).toBe(true)
        await state.retry()
        expect(putGenerationHistoryItem).toHaveBeenCalledTimes(1)
        expect(state.unsavedIds.value).toEqual([])
    })

    it('reports a failed deletion and retains the pending save for recovery', async () => {
        const state = createHistoryPersistence()
        vi.mocked(putGenerationHistoryItem).mockRejectedValue(new Error('quota'))
        vi.mocked(deleteGenerationHistoryItem).mockRejectedValue(new Error('aborted'))
        await state.save(record)
        expect(await state.remove(record.id)).toBe(false)
        expect(state.error.value).toContain('删除未完成')
        expect(state.unsavedIds.value).toEqual(['record'])
    })
})
