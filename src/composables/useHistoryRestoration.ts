import { ref, type Ref } from 'vue'
import type { ApiConnectionPreset } from '../types'
import { getGenerationHistoryItems, type GenerationHistoryItem } from '../utils/historyDb'
import { LocalStorage } from '../utils/storage'

interface HistoryRestorationState {
    generationHistory: Ref<GenerationHistoryItem[]>
    historyStorageError: Ref<string>
    apiConnectionPresets: Ref<ApiConnectionPreset[]>
    promptAssistantConnectionPresets: Ref<ApiConnectionPreset[]>
    assetCollections: Ref<string[]>
    onLoaded: () => void
}

export function useHistoryRestoration({
    generationHistory, historyStorageError, apiConnectionPresets,
    promptAssistantConnectionPresets, assetCollections, onLoaded
}: HistoryRestorationState) {
    const historyLoading = ref(false)

    const loadGenerationHistory = async () => {
        historyLoading.value = true
        try {
            generationHistory.value = await getGenerationHistoryItems(message => {
                historyStorageError.value = message
            })
            onLoaded()
        } catch (historyError) {
            console.warn('无法读取生成历史:', historyError)
            historyStorageError.value = '本地历史读取失败。请关闭其他 Vistack 页面后刷新重试。'
        } finally {
            historyLoading.value = false
        }
    }

    const refreshAfterBackupRestore = async () => {
        try {
            const restored = await getGenerationHistoryItems()
            const existing = new Set(generationHistory.value.map(item => item.id))
            generationHistory.value = [...generationHistory.value, ...restored.filter(item => !existing.has(item.id))]
                .sort((left, right) => right.createdAt - left.createdAt)
            apiConnectionPresets.value = LocalStorage.getApiConnectionPresets()
            promptAssistantConnectionPresets.value = LocalStorage.getPromptAssistantConnectionPresets()
            assetCollections.value = LocalStorage.getAssetCollections()
            onLoaded()
        } catch {
            historyStorageError.value = '备份已恢复，但列表刷新失败。请刷新页面查看。'
        }
    }

    return { historyLoading, loadGenerationHistory, refreshAfterBackupRestore }
}
