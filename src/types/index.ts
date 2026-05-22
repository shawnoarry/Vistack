export interface GenerateRequest {
    prompt: string
    images: string[]
    apikey: string
    endpoint: string
    model: string
    aspectRatio?: string
    imageSize?: string
    count?: number
    enableGoogleSearch?: boolean
}

export interface GenerateResponse {
    imageUrls: string[]
}

export interface PromptAssistantRequest {
    prompt: string
    context: string
    apikey: string
    endpoint: string
    model: string
    task?: 'optimize' | 'translate-template'
    targetLanguage?: 'zh' | 'en'
}

export interface PromptAssistantResponse {
    prompt: string
}

export interface ApiModel {
    id: string
    name?: string
    description?: string
    capabilities?: {
        image?: boolean
        [key: string]: unknown
    }
    [key: string]: unknown
}

export interface ModelListResponse {
    data?: ApiModel[]
    models?: ApiModel[]
}

export interface ModelOption {
    id: string
    label: string
    description?: string
    supportsImages: boolean
}

export interface StyleTemplate {
    id: string
    title: string
    prompt: string
    promptEn?: string
    image: string
    description: string
    category?: string
    mode?: 'text' | 'image' | 'both'
    tags?: string[]
    source?: 'builtin' | 'custom'
}

export interface PromptPoolItem {
    id: string
    title: string
    prompt: string
    description: string
    tags?: string[]
}

export interface PromptPoolGroup {
    id: string
    title: string
    description: string
    items: PromptPoolItem[]
}

export type ReferenceImageRole = 'character' | 'outfit' | 'background' | 'product' | 'style' | 'other'

export interface ReferenceImageMeta {
    role: ReferenceImageRole
    label: string
    note?: string
}

export interface GenerationRecipe {
    mainPrompt: string
    compiledPrompt: string
    supplementPrompt: string
    selectedStyle: string
    customPrompt: string
    referenceImages: string[]
    referenceImageLabels: string[]
    referenceImageMetadata: ReferenceImageMeta[]
    count: number
}

export type GenerationTaskStatus = 'running' | 'done' | 'error'

export interface GenerationTask {
    id: string
    source: 'text' | 'image'
    title: string
    prompt: string
    status: GenerationTaskStatus
    createdAt: number
    model: string
    aspectRatio: string
    imageSize: string
    count: number
    images: string[]
    error?: string
    recipe: GenerationRecipe
}

export type WorkspaceMode = 'quick' | 'canvas'

export type CanvasWorkbenchItemSource = 'result' | 'history' | 'reference' | 'manual'

export interface CanvasWorkbenchItem {
    id: string
    image: string
    title: string
    source: CanvasWorkbenchItemSource
    x: number
    y: number
    width: number
    height: number
    createdAt: number
    prompt?: string
}
