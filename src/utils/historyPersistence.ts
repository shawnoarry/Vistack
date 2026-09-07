import { ref } from 'vue'
import { deleteGenerationHistoryItem, putGenerationHistoryItem, type GenerationHistoryItem } from './historyDb'

export function createHistoryPersistence() {
    const unsavedIds = ref<string[]>([])
    const retrying = ref(false)
    const error = ref('')
    const pending = new Map<string, GenerationHistoryItem>()
    let queue: Promise<unknown> = Promise.resolve()

    function enqueue<T>(operation: () => Promise<T>): Promise<T> {
        const result = queue.then(operation)
        queue = result.catch(() => undefined)
        return result
    }

    function save(item: GenerationHistoryItem): Promise<boolean> {
        // Capture the intended version before Vue state or a later edit can change it.
        const snapshot: GenerationHistoryItem = JSON.parse(JSON.stringify(item))
        pending.set(item.id, snapshot)
        unsavedIds.value = [...pending.keys()]
        return enqueue(async () => {
            try {
                await putGenerationHistoryItem(snapshot)
                if (pending.get(item.id) === snapshot) pending.delete(item.id)
                return true
            } catch {
                return false
            } finally {
                unsavedIds.value = [...pending.keys()]
            }
        })
    }

    function remove(id: string): Promise<boolean> {
        return enqueue(async () => {
            try {
                await deleteGenerationHistoryItem(id)
                pending.delete(id)
                unsavedIds.value = [...pending.keys()]
                error.value = ''
                return true
            } catch {
                error.value = '删除未完成，记录已保留。请重试删除。'
                return false
            }
        })
    }

    async function retry() {
        if (retrying.value) return
        retrying.value = true
        try {
            // Wait for current edits/deletions before selecting versions to retry.
            await queue
            await Promise.all([...pending.values()].map(save))
        } finally {
            retrying.value = false
        }
    }

    return { unsavedIds, retrying, error, save, remove, retry }
}
