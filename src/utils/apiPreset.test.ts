import { describe, expect, it } from 'vitest'
import type { ApiConnectionPreset } from '../types'
import { apiPresetMatchesConfig, findMatchingApiPresetId, resolveSelectedApiPresetId } from './apiPreset'

const preset = (overrides: Partial<ApiConnectionPreset> = {}): ApiConnectionPreset => ({
    id: 'preset-1',
    name: 'Primary',
    apiKey: 'api-key',
    endpoint: 'https://api.example.com/v1/',
    model: 'image-model',
    useProxy: false,
    proxyToken: '',
    createdAt: 100,
    updatedAt: 100,
    ...overrides
})

const config = {
    apiKey: ' api-key ',
    endpoint: 'https://api.example.com/v1',
    model: 'image-model',
    useProxy: false
}

describe('API preset identity matching', () => {
    it('keeps the selected id when duplicate presets share the same configuration', () => {
        const presets = [
            preset({ id: 'named', name: 'Named config' }),
            preset({ id: 'automatic', name: 'api.example.com / image-model' })
        ]

        expect(resolveSelectedApiPresetId(presets, 'automatic', config)).toBe('automatic')
    })

    it('falls back to a matching preset after the selected configuration changes', () => {
        const presets = [
            preset({ id: 'named', name: 'Named config' }),
            preset({ id: 'other', apiKey: 'other-key' })
        ]

        expect(resolveSelectedApiPresetId(presets, 'other', config)).toBe('named')
    })

    it('matches normalized endpoints and proxy settings', () => {
        const proxyPreset = preset({ id: 'proxy', useProxy: true, proxyToken: 'proxy-token' })

        expect(apiPresetMatchesConfig(proxyPreset, {
            ...config,
            useProxy: true,
            proxyToken: ' proxy-token '
        })).toBe(true)
        expect(findMatchingApiPresetId([proxyPreset], {
            ...config,
            useProxy: true,
            proxyToken: 'wrong-token'
        })).toBe('')
    })
})
