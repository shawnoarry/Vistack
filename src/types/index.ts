export type GenerationBatchMode = 'single' | 'fill'

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
    useProxy?: boolean
    batchMode?: GenerationBatchMode
}

export interface GenerateResponse {
    imageUrls: string[]
}

export type GenerationTaskProvider = 'grsai' | 'grsai-draw'

export interface GenerationTaskHandle {
    provider: GenerationTaskProvider
    taskId: string
    apiEndpoint: string
    resultEndpoint: string
    model: string
    createdAt: number
    useProxy?: boolean
}

export interface GenerateImageOptions {
    onTaskCreated?: (task: GenerationTaskHandle) => void | Promise<void>
}

export interface PromptAssistantRequest {
    prompt: string
    context: string
    apikey: string
    endpoint: string
    model: string
    task?: 'optimize' | 'translate-template' | 'image-to-prompt'
    targetLanguage?: 'zh' | 'en'
    useProxy?: boolean
    images?: string[]
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

export interface ApiConnectionPreset {
    id: string
    name: string
    apiKey: string
    endpoint: string
    model: string
    useProxy: boolean
    createdAt: number
    updatedAt: number
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

export interface ToolboxReference extends ReferenceImageMeta {
    image: string
}

export interface ToolboxGeneratePayload {
    prompt: string
    references: ToolboxReference[]
    title: string
    tool?: 'image-to-prompt' | 'model-asset' | 'outfit-swap' | 'mask-edit' | 'couple-photo' | 'prompt'
    assetId?: string
    assetName?: string
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
    batchMode?: GenerationBatchMode
}

export type GenerationTaskStatus = 'running' | 'done' | 'error'

export interface GenerationTask {
    id: string
    source: 'text' | 'image'
    origin?: 'studio' | 'toolbox'
    title: string
    prompt: string
    status: GenerationTaskStatus
    createdAt: number
    model: string
    endpoint: string
    aspectRatio: string
    imageSize: string
    count: number
    batchMode?: GenerationBatchMode
    images: string[]
    error?: string
    recipe: GenerationRecipe
    useProxy?: boolean
    resolvedEndpoint?: string
    requestProvider?: string
    toolboxTool?: ToolboxGeneratePayload['tool']
    toolboxReferences?: ToolboxReference[]
    toolboxAssetId?: string
    toolboxAssetName?: string
}

export interface ToolboxRolePushPayload {
    task: GenerationTask
    role: ReferenceImageRole
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
