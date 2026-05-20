export interface GenerateRequest {
    prompt: string
    images: string[]
    apikey: string
    endpoint: string
    model: string
    aspectRatio?: string
    imageSize?: string
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
    image: string
    description: string
    category?: string
    mode?: 'text' | 'image' | 'both'
    tags?: string[]
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
}
