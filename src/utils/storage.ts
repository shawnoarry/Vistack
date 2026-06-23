import type { ApiConnectionPreset, GenerationBatchMode, ModelOption, StyleTemplate } from '../types'

export interface StoredPromptPhrase {
    id: string
    label: string
    value: string
}

export interface StoredPromptPhraseGroup {
    id: string
    title: string
    description: string
    phrases: StoredPromptPhrase[]
}

export interface StoredPromptPhraseOverride {
    id: string
    groupId: string
    label: string
    value: string
}

// 本地存储工具类
export class LocalStorage {
    private static readonly API_KEY = 'vistack-api-key'
    private static readonly API_ENDPOINT = 'vistack-api-endpoint'
    private static readonly API_USE_PROXY = 'vistack-api-use-proxy'
    private static readonly API_PROXY_TOKEN = 'vistack-api-proxy-token'
    private static readonly API_CONNECTION_PRESETS = 'vistack-api-connection-presets'
    private static readonly MODEL_ID = 'vistack-model-id'
    private static readonly MODEL_CACHE = 'vistack-model-cache'
    private static readonly PROMPT_ASSISTANT_API_KEY = 'vistack-prompt-assistant-api-key'
    private static readonly PROMPT_ASSISTANT_ENDPOINT = 'vistack-prompt-assistant-endpoint'
    private static readonly PROMPT_ASSISTANT_MODEL_ID = 'vistack-prompt-assistant-model-id'
    private static readonly PROMPT_ASSISTANT_USE_PROXY = 'vistack-prompt-assistant-use-proxy'
    private static readonly PROMPT_ASSISTANT_PROXY_TOKEN = 'vistack-prompt-assistant-proxy-token'
    private static readonly ASSET_COLLECTIONS = 'vistack-asset-collections'
    private static readonly CUSTOM_PROMPT_PHRASE_GROUPS = 'vistack-custom-prompt-phrase-groups'
    private static readonly PROMPT_PHRASE_OVERRIDES = 'vistack-prompt-phrase-overrides'
    private static readonly CUSTOM_STYLE_TEMPLATES = 'vistack-custom-style-templates'
    private static readonly GENERATION_BATCH_MODE = 'vistack-generation-batch-mode'
    private static readonly THEME_MODE = 'vistack-theme-mode'
    private static readonly LEGACY_KEYS = {
        API_KEY: 'nano-banana-api-key',
        API_ENDPOINT: 'nano-banana-api-endpoint',
        MODEL_ID: 'nano-banana-model-id',
        MODEL_CACHE: 'nano-banana-model-cache'
    }

    // 保存API密钥
    static saveApiKey(apiKey: string): void {
        try {
            localStorage.setItem(this.API_KEY, apiKey)
        } catch (error) {
            console.warn('无法保存API密钥到本地存储:', error)
        }
    }

    // 获取API密钥
    static getApiKey(): string {
        try {
            return this.getStoredValue(this.API_KEY, this.LEGACY_KEYS.API_KEY)
        } catch (error) {
            console.warn('无法从本地存储读取API密钥:', error)
            return ''
        }
    }

    // 清除API密钥
    static clearApiKey(): void {
        try {
            localStorage.removeItem(this.API_KEY)
        } catch (error) {
            console.warn('无法清除本地存储的API密钥:', error)
        }
    }

    // 保存自定义端点
    static saveApiEndpoint(endpoint: string): void {
        try {
            localStorage.setItem(this.API_ENDPOINT, endpoint)
        } catch (error) {
            console.warn('无法保存API端点到本地存储:', error)
        }
    }

    // 获取自定义端点
    static getApiEndpoint(): string {
        try {
            return this.getStoredValue(this.API_ENDPOINT, this.LEGACY_KEYS.API_ENDPOINT)
        } catch (error) {
            console.warn('无法从本地存储读取API端点:', error)
            return ''
        }
    }

    // 清除自定义端点
    static clearApiEndpoint(): void {
        try {
            localStorage.removeItem(this.API_ENDPOINT)
        } catch (error) {
            console.warn('无法清除本地存储的API端点:', error)
        }
    }

    static saveApiUseProxy(useProxy: boolean): void {
        try {
            localStorage.setItem(this.API_USE_PROXY, useProxy ? 'true' : 'false')
        } catch (error) {
            console.warn('无法保存 API 代理设置:', error)
        }
    }

    static getApiUseProxy(): boolean {
        try {
            return localStorage.getItem(this.API_USE_PROXY) === 'true'
        } catch (error) {
            console.warn('无法读取 API 代理设置:', error)
            return false
        }
    }

    static saveApiProxyToken(token: string): void {
        try {
            localStorage.setItem(this.API_PROXY_TOKEN, token)
        } catch (error) {
            console.warn('无法保存代理密码:', error)
        }
    }

    static getApiProxyToken(): string {
        try {
            return localStorage.getItem(this.API_PROXY_TOKEN) || ''
        } catch (error) {
            console.warn('无法读取代理密码:', error)
            return ''
        }
    }

    static clearApiProxyToken(): void {
        try {
            localStorage.removeItem(this.API_PROXY_TOKEN)
        } catch (error) {
            console.warn('无法清除代理密码:', error)
        }
    }

    static saveApiConnectionPresets(presets: ApiConnectionPreset[]): void {
        try {
            localStorage.setItem(this.API_CONNECTION_PRESETS, JSON.stringify(presets))
        } catch (error) {
            console.warn('无法保存 API 配置预设:', error)
        }
    }

    static getApiConnectionPresets(): ApiConnectionPreset[] {
        try {
            const raw = localStorage.getItem(this.API_CONNECTION_PRESETS)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []

            return parsed
                .map(item => ({
                    id: typeof item?.id === 'string' ? item.id : '',
                    name: typeof item?.name === 'string' ? item.name : '',
                    apiKey: typeof item?.apiKey === 'string' ? item.apiKey : '',
                    endpoint: typeof item?.endpoint === 'string' ? item.endpoint : '',
                    model: typeof item?.model === 'string' ? item.model : '',
                    useProxy: item?.useProxy === true,
                    proxyToken: typeof item?.proxyToken === 'string' ? item.proxyToken : '',
                    createdAt: typeof item?.createdAt === 'number' ? item.createdAt : Date.now(),
                    updatedAt: typeof item?.updatedAt === 'number' ? item.updatedAt : Date.now()
                }))
                .filter(item => item.id && item.name.trim() && item.endpoint.trim())
        } catch (error) {
            console.warn('无法读取 API 配置预设:', error)
            return []
        }
    }

    // 保存模型ID
    static saveModelId(modelId: string): void {
        try {
            localStorage.setItem(this.MODEL_ID, modelId)
        } catch (error) {
            console.warn('无法保存模型ID到本地存储:', error)
        }
    }

    // 获取模型ID
    static getModelId(): string {
        try {
            return this.getStoredValue(this.MODEL_ID, this.LEGACY_KEYS.MODEL_ID)
        } catch (error) {
            console.warn('无法从本地存储读取模型ID:', error)
            return ''
        }
    }

    // 清除模型ID
    static clearModelId(): void {
        try {
            localStorage.removeItem(this.MODEL_ID)
        } catch (error) {
            console.warn('无法清除本地存储的模型ID:', error)
        }
    }

    static savePromptAssistantApiKey(apiKey: string): void {
        try {
            localStorage.setItem(this.PROMPT_ASSISTANT_API_KEY, apiKey)
        } catch (error) {
            console.warn('无法保存提示词助手 API 密钥:', error)
        }
    }

    static getPromptAssistantApiKey(): string {
        try {
            return localStorage.getItem(this.PROMPT_ASSISTANT_API_KEY) || ''
        } catch (error) {
            console.warn('无法读取提示词助手 API 密钥:', error)
            return ''
        }
    }

    static clearPromptAssistantApiKey(): void {
        try {
            localStorage.removeItem(this.PROMPT_ASSISTANT_API_KEY)
        } catch (error) {
            console.warn('无法清除提示词助手 API 密钥:', error)
        }
    }

    static savePromptAssistantEndpoint(endpoint: string): void {
        try {
            localStorage.setItem(this.PROMPT_ASSISTANT_ENDPOINT, endpoint)
        } catch (error) {
            console.warn('无法保存提示词助手端点:', error)
        }
    }

    static getPromptAssistantEndpoint(): string {
        try {
            return localStorage.getItem(this.PROMPT_ASSISTANT_ENDPOINT) || ''
        } catch (error) {
            console.warn('无法读取提示词助手端点:', error)
            return ''
        }
    }

    static clearPromptAssistantEndpoint(): void {
        try {
            localStorage.removeItem(this.PROMPT_ASSISTANT_ENDPOINT)
        } catch (error) {
            console.warn('无法清除提示词助手端点:', error)
        }
    }

    static savePromptAssistantModelId(modelId: string): void {
        try {
            localStorage.setItem(this.PROMPT_ASSISTANT_MODEL_ID, modelId)
        } catch (error) {
            console.warn('无法保存提示词助手模型:', error)
        }
    }

    static getPromptAssistantModelId(): string {
        try {
            return localStorage.getItem(this.PROMPT_ASSISTANT_MODEL_ID) || ''
        } catch (error) {
            console.warn('无法读取提示词助手模型:', error)
            return ''
        }
    }

    static clearPromptAssistantModelId(): void {
        try {
            localStorage.removeItem(this.PROMPT_ASSISTANT_MODEL_ID)
        } catch (error) {
            console.warn('无法清除提示词助手模型:', error)
        }
    }

    static savePromptAssistantUseProxy(useProxy: boolean): void {
        try {
            localStorage.setItem(this.PROMPT_ASSISTANT_USE_PROXY, useProxy ? 'true' : 'false')
        } catch (error) {
            console.warn('Unable to save prompt assistant proxy setting:', error)
        }
    }

    static getPromptAssistantUseProxy(): boolean {
        try {
            return localStorage.getItem(this.PROMPT_ASSISTANT_USE_PROXY) === 'true'
        } catch (error) {
            console.warn('Unable to read prompt assistant proxy setting:', error)
            return false
        }
    }

    static savePromptAssistantProxyToken(token: string): void {
        try {
            localStorage.setItem(this.PROMPT_ASSISTANT_PROXY_TOKEN, token)
        } catch (error) {
            console.warn('Unable to save prompt assistant proxy token:', error)
        }
    }

    static getPromptAssistantProxyToken(): string {
        try {
            return localStorage.getItem(this.PROMPT_ASSISTANT_PROXY_TOKEN) || ''
        } catch (error) {
            console.warn('Unable to read prompt assistant proxy token:', error)
            return ''
        }
    }

    static clearPromptAssistantProxyToken(): void {
        try {
            localStorage.removeItem(this.PROMPT_ASSISTANT_PROXY_TOKEN)
        } catch (error) {
            console.warn('Unable to clear prompt assistant proxy token:', error)
        }
    }

    static saveThemeMode(mode: 'light' | 'dark'): void {
        try {
            localStorage.setItem(this.THEME_MODE, mode)
        } catch (error) {
            console.warn('无法保存主题模式:', error)
        }
    }

    static getThemeMode(): 'light' | 'dark' {
        try {
            return localStorage.getItem(this.THEME_MODE) === 'dark' ? 'dark' : 'light'
        } catch (error) {
            console.warn('无法读取主题模式:', error)
            return 'light'
        }
    }

    static saveGenerationBatchMode(mode: GenerationBatchMode): void {
        try {
            localStorage.setItem(this.GENERATION_BATCH_MODE, mode)
        } catch (error) {
            console.warn('鏃犳硶淇濆瓨鐢熸垚鎵规妯″紡:', error)
        }
    }

    static getGenerationBatchMode(): GenerationBatchMode {
        try {
            return localStorage.getItem(this.GENERATION_BATCH_MODE) === 'single' ? 'single' : 'fill'
        } catch (error) {
            console.warn('鏃犳硶璇诲彇鐢熸垚鎵规妯″紡:', error)
            return 'fill'
        }
    }

    static saveAssetCollections(collections: string[]): void {
        try {
            localStorage.setItem(this.ASSET_COLLECTIONS, JSON.stringify(collections))
        } catch (error) {
            console.warn('无法保存资产收藏夹:', error)
        }
    }

    static getAssetCollections(): string[] {
        try {
            const raw = localStorage.getItem(this.ASSET_COLLECTIONS)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed)
                ? parsed.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
                : []
        } catch (error) {
            console.warn('无法读取资产收藏夹:', error)
            return []
        }
    }

    static saveCustomPromptPhraseGroups(groups: StoredPromptPhraseGroup[]): void {
        try {
            localStorage.setItem(this.CUSTOM_PROMPT_PHRASE_GROUPS, JSON.stringify(groups))
        } catch (error) {
            console.warn('无法保存自定义提示词词组:', error)
        }
    }

    static getCustomPromptPhraseGroups(): StoredPromptPhraseGroup[] {
        try {
            const raw = localStorage.getItem(this.CUSTOM_PROMPT_PHRASE_GROUPS)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []

            return parsed
                .map(group => ({
                    id: typeof group?.id === 'string' ? group.id : '',
                    title: typeof group?.title === 'string' ? group.title : '',
                    description: typeof group?.description === 'string' ? group.description : '',
                    phrases: Array.isArray(group?.phrases)
                        ? group.phrases
                            .map((phrase: unknown) => {
                                const item = phrase as Partial<StoredPromptPhrase>
                                return {
                                    id: typeof item.id === 'string' ? item.id : '',
                                    label: typeof item.label === 'string' ? item.label : '',
                                    value: typeof item.value === 'string' ? item.value : ''
                                }
                            })
                            .filter((phrase: StoredPromptPhrase) => phrase.id && phrase.label.trim() && phrase.value.trim())
                        : []
                }))
                .filter(group => group.id && group.title.trim())
        } catch (error) {
            console.warn('无法读取自定义提示词词组:', error)
            return []
        }
    }

    static savePromptPhraseOverrides(overrides: StoredPromptPhraseOverride[]): void {
        try {
            localStorage.setItem(this.PROMPT_PHRASE_OVERRIDES, JSON.stringify(overrides))
        } catch (error) {
            console.warn('无法保存提示词词组覆盖:', error)
        }
    }

    static getPromptPhraseOverrides(): StoredPromptPhraseOverride[] {
        try {
            const raw = localStorage.getItem(this.PROMPT_PHRASE_OVERRIDES)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []

            return parsed
                .map(override => ({
                    id: typeof override?.id === 'string' ? override.id : '',
                    groupId: typeof override?.groupId === 'string' ? override.groupId : '',
                    label: typeof override?.label === 'string' ? override.label : '',
                    value: typeof override?.value === 'string' ? override.value : ''
                }))
                .filter(override => override.id && override.groupId && override.label.trim() && override.value.trim())
        } catch (error) {
            console.warn('无法读取提示词词组覆盖:', error)
            return []
        }
    }

    static saveCustomStyleTemplates(templates: StyleTemplate[]): void {
        try {
            localStorage.setItem(this.CUSTOM_STYLE_TEMPLATES, JSON.stringify(templates))
        } catch (error) {
            console.warn('无法保存自定义模板:', error)
        }
    }

    static getCustomStyleTemplates(): StyleTemplate[] {
        try {
            const raw = localStorage.getItem(this.CUSTOM_STYLE_TEMPLATES)
            if (!raw) return []
            const parsed = JSON.parse(raw)
            if (!Array.isArray(parsed)) return []

            return parsed
                .map(template => ({
                    id: typeof template?.id === 'string' ? template.id : '',
                    title: typeof template?.title === 'string' ? template.title : '',
                    prompt: typeof template?.prompt === 'string' ? template.prompt : '',
                    image: typeof template?.image === 'string' ? template.image : '',
                    description: typeof template?.description === 'string' ? template.description : '',
                    category: typeof template?.category === 'string' ? template.category : '我的模板',
                    mode: template?.mode === 'text' || template?.mode === 'image' || template?.mode === 'both' ? template.mode : 'both',
                    tags: Array.isArray(template?.tags) ? template.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && tag.trim() !== '') : [],
                    source: 'custom' as const
                }))
                .filter(template => template.id && template.title.trim() && template.prompt.trim())
        } catch (error) {
            console.warn('无法读取自定义模板:', error)
            return []
        }
    }

    // 保存模型列表缓存
    static saveModelCache(endpoint: string, models: ModelOption[]): void {
        try {
            const cache = this.getModelCacheMap()
            cache[this.normalizeEndpoint(endpoint)] = models
            localStorage.setItem(this.MODEL_CACHE, JSON.stringify(cache))
        } catch (error) {
            console.warn('无法保存模型列表到本地存储:', error)
        }
    }

    // 获取指定端点的模型列表缓存
    static getModelCache(endpoint: string): ModelOption[] {
        try {
            const cache = this.getModelCacheMap()
            return cache[this.normalizeEndpoint(endpoint)] || []
        } catch (error) {
            console.warn('无法从本地存储读取模型列表:', error)
            return []
        }
    }

    // 清除模型列表缓存，可传入端点进行选择性清除
    static clearModelCache(endpoint?: string): void {
        try {
            if (!endpoint) {
                localStorage.removeItem(this.MODEL_CACHE)
                return
            }

            const cache = this.getModelCacheMap()
            const normalized = this.normalizeEndpoint(endpoint)
            if (normalized in cache) {
                delete cache[normalized]
                localStorage.setItem(this.MODEL_CACHE, JSON.stringify(cache))
            }
        } catch (error) {
            console.warn('无法清除模型列表缓存:', error)
        }
    }

    private static getModelCacheMap(): Record<string, ModelOption[]> {
        const raw = this.getStoredValue(this.MODEL_CACHE, this.LEGACY_KEYS.MODEL_CACHE)
        if (!raw) return {}

        try {
            const parsed = JSON.parse(raw)
            if (parsed && typeof parsed === 'object') {
                return parsed as Record<string, ModelOption[]>
            }
        } catch (error) {
            console.warn('模型缓存解析失败，将重新创建:', error)
        }

        return {}
    }

    private static normalizeEndpoint(endpoint: string): string {
        return endpoint.trim().replace(/\/$/, '').toLowerCase()
    }

    private static getStoredValue(currentKey: string, legacyKey: string): string {
        const current = localStorage.getItem(currentKey)
        if (current !== null) return current

        const legacy = localStorage.getItem(legacyKey)
        if (legacy !== null) {
            localStorage.setItem(currentKey, legacy)
            return legacy
        }

        return ''
    }
}
