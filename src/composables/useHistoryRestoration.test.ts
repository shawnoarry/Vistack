import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHistoryRestoration } from './useHistoryRestoration'
import { getGenerationHistoryItems, type GenerationHistoryItem } from '../utils/historyDb'
import { LocalStorage } from '../utils/storage'

vi.mock('../utils/historyDb', () => ({ getGenerationHistoryItems: vi.fn() }))
vi.mock('../utils/storage', () => ({ LocalStorage: {
    getApiConnectionPresets: vi.fn(() => []), getPromptAssistantConnectionPresets: vi.fn(() => []), getAssetCollections: vi.fn(() => [])
} }))
const record = (id: string, createdAt = 1): GenerationHistoryItem => ({
    id, createdAt, source: 'image', prompt: 'original', model: 'test', endpoint: '', images: [], aspectRatio: '1:1', imageSize: '1K'
})
beforeEach(() => vi.clearAllMocks())

describe('history refresh after restoration', () => {
    it('adds restored records without overwriting current edits or selections', async () => {
        const generationHistory = ref([{ ...record('current'), prompt: 'unsaved edit' }])
        const assetCollections = ref<string[]>([])
        const onLoaded = vi.fn()
        vi.mocked(getGenerationHistoryItems).mockResolvedValue([record('current'), record('new', 2)])
        vi.mocked(LocalStorage.getAssetCollections).mockReturnValue(['restored collection'])
        const state = useHistoryRestoration({ generationHistory, assetCollections, onLoaded,
            historyStorageError: ref(''), apiConnectionPresets: ref([]), promptAssistantConnectionPresets: ref([]) })
        await state.refreshAfterBackupRestore()
        await state.refreshAfterBackupRestore()
        expect(generationHistory.value.map(item => item.id)).toEqual(['new', 'current'])
        expect(generationHistory.value[1].prompt).toBe('unsaved edit')
        expect(assetCollections.value).toEqual(['restored collection'])
        expect(onLoaded).toHaveBeenCalledTimes(2)
    })

    it('retains the current history and reports a refresh failure', async () => {
        const generationHistory = ref([record('current')])
        const historyStorageError = ref('')
        vi.mocked(getGenerationHistoryItems).mockRejectedValue(new Error('blocked database'))
        const state = useHistoryRestoration({ generationHistory, historyStorageError, assetCollections: ref([]),
            apiConnectionPresets: ref([]), promptAssistantConnectionPresets: ref([]), onLoaded: vi.fn() })
        await state.refreshAfterBackupRestore()
        expect(generationHistory.value.map(item => item.id)).toEqual(['current'])
        expect(historyStorageError.value).toContain('刷新失败')
        expect(state.historyLoading.value).toBe(false)
    })
})
