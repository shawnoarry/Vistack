import type { ApiConnectionPreset } from '../types'

export interface ApiPresetConfig {
    apiKey: string
    endpoint: string
    model: string
    useProxy: boolean
    proxyToken?: string
}

export const normalizeApiPresetEndpoint = (endpoint: string) =>
    endpoint.trim().replace(/\/+$/, '').toLowerCase()

export const apiPresetMatchesConfig = (
    preset: ApiConnectionPreset,
    config: ApiPresetConfig
) => {
    const endpoint = normalizeApiPresetEndpoint(config.endpoint)
    const model = config.model.trim()
    const apiKey = config.apiKey.trim()
    const proxyToken = config.useProxy ? (config.proxyToken || '').trim() : ''

    return normalizeApiPresetEndpoint(preset.endpoint) === endpoint &&
        preset.model.trim() === model &&
        preset.apiKey.trim() === apiKey &&
        preset.useProxy === config.useProxy &&
        (!config.useProxy || (preset.proxyToken || '').trim() === proxyToken)
}

export const findMatchingApiPresetId = (
    presets: ApiConnectionPreset[],
    config: ApiPresetConfig
) => presets.find(preset => apiPresetMatchesConfig(preset, config))?.id || ''

export const resolveSelectedApiPresetId = (
    presets: ApiConnectionPreset[],
    selectedPresetId: string,
    config: ApiPresetConfig
) => {
    const selectedPreset = presets.find(preset => preset.id === selectedPresetId)
    if (selectedPreset && apiPresetMatchesConfig(selectedPreset, config)) {
        return selectedPreset.id
    }

    return findMatchingApiPresetId(presets, config)
}
