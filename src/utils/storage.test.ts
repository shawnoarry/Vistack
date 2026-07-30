import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiConnectionPreset } from '../types'
import { LocalStorage } from './storage'

const values = new Map<string, string>()
const localStorageMock: Storage = {
    get length() {
        return values.size
    },
    clear() {
        values.clear()
    },
    getItem(key: string) {
        return values.get(key) ?? null
    },
    key(index: number) {
        return [...values.keys()][index] ?? null
    },
    removeItem(key: string) {
        values.delete(key)
    },
    setItem(key: string, value: string) {
        values.set(key, String(value))
    }
}

const preset = (overrides: Partial<ApiConnectionPreset> = {}): ApiConnectionPreset => ({
    id: 'preset-1',
    name: 'Primary',
    apiKey: 'primary-key',
    endpoint: 'https://api.example.com/v1',
    model: 'image-model',
    useProxy: false,
    proxyToken: '',
    createdAt: 100,
    updatedAt: 100,
    ...overrides
})

beforeEach(() => {
    values.clear()
    vi.stubGlobal('localStorage', localStorageMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('API connection preset storage', () => {
    it('keeps prompt assistant presets separate from image-generation presets', () => {
        const imagePreset = preset()
        const assistantPreset = preset({
            id: 'assistant-1',
            name: 'Assistant',
            apiKey: 'assistant-key',
            model: 'text-model'
        })

        LocalStorage.saveApiConnectionPresets([imagePreset])
        LocalStorage.savePromptAssistantConnectionPresets([assistantPreset])

        expect(LocalStorage.getApiConnectionPresets()).toEqual([imagePreset])
        expect(LocalStorage.getPromptAssistantConnectionPresets()).toEqual([assistantPreset])
    })

    it('filters invalid prompt assistant presets with the shared preset parser', () => {
        values.set('vistack-prompt-assistant-connection-presets', JSON.stringify([
            preset({ id: 'valid', name: 'Valid assistant' }),
            { id: 'missing-endpoint', name: 'Invalid', endpoint: '' },
            null
        ]))

        expect(LocalStorage.getPromptAssistantConnectionPresets()).toEqual([
            preset({ id: 'valid', name: 'Valid assistant' })
        ])
    })
})
