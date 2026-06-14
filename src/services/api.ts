import type { ApiModel, GenerateImageOptions, GenerateRequest, GenerateResponse, GenerationTaskHandle, GenerationTaskProvider, ModelListResponse, PromptAssistantRequest, PromptAssistantResponse } from '../types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'
import { LocalStorage } from '../utils/storage'
import {
    getEndpointPath,
    isGrsaiEndpoint,
    isOpenAiImageModelId,
    resolveChatCompletionsEndpoint,
    resolveImageGenerationEndpoint,
    resolveModelEndpointCandidates,
    resolveSiblingEndpoint
} from '../utils/apiEndpoint'

type ApiProvider = 'openai-chat' | 'openai-image' | 'openai-image-edit' | 'grsai' | 'grsai-draw'

interface ApiProfile {
    provider: ApiProvider
    endpoint: string
    isGrsaiHost: boolean
}

interface GrsaiResultResponse {
    status?: unknown
    state?: unknown
    data?: unknown
    result?: unknown
    results?: unknown
    output?: unknown
    images?: unknown
    url?: unknown
    urls?: unknown
    message?: unknown
    error?: unknown
}

class TerminalGenerationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'TerminalGenerationError'
    }
}

const GRS_AI_FALLBACK_MODELS: ApiModel[] = [
    {
        id: 'nano-banana-2',
        name: 'Nano Banana 2',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-2-cl',
        name: 'Nano Banana 2 CL',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-2-4k-cl',
        name: 'Nano Banana 2 4K CL',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-pro',
        name: 'Nano Banana Pro',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-pro-vt',
        name: 'Nano Banana Pro VT',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-pro-cl',
        name: 'Nano Banana Pro CL',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-pro-vip',
        name: 'Nano Banana Pro VIP',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-pro-4k-vip',
        name: 'Nano Banana Pro 4K VIP',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana-fast',
        name: 'Nano Banana Fast',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'nano-banana',
        name: 'Nano Banana',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'gemini-3.1-pro',
        name: 'Gemini 3.1 Pro',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'gemini-3-pro',
        name: 'Gemini 3 Pro',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'gpt-image-2',
        name: 'GPT Image 2',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    },
    {
        id: 'gpt-image-2-vip',
        name: 'GPT Image 2 VIP',
        description: 'Grsai image generation model',
        capabilities: { image: true }
    }
]

const REFERENCE_IMAGE_MAX_SIDE = 1600
const REFERENCE_IMAGE_COMPRESSION_THRESHOLD = 1_000_000
const REFERENCE_IMAGE_JPEG_QUALITY = 0.88

export async function generateImage(request: GenerateRequest, _maxRetries: number = 1, options: GenerateImageOptions = {}): Promise<GenerateResponse> {
    const targetCount = normalizeImageCount(request.count)
    const batchMode = request.batchMode === 'single' ? 'single' : 'fill'
    const requestLimit = batchMode === 'fill' ? targetCount : 1

    const collectedUrls: string[] = []
    let lastError: Error | null = null

    for (let requestIndex = 1; requestIndex <= requestLimit && collectedUrls.length < targetCount; requestIndex += 1) {
        const remainingCount = targetCount - collectedUrls.length
        const countForRequest = requestIndex === 1 ? targetCount : remainingCount

        try {
            console.log(`Attempting image generation request ${requestIndex}/${requestLimit} with n=${countForRequest}...`)

            const profile = getApiProfile(request.endpoint, request.model, request.images.length > 0)
            const response = await generateWithProfile(profile, { ...request, count: countForRequest }, options)

            if (response.imageUrls.length > 0) {
                for (const imageUrl of response.imageUrls) {
                    if (!collectedUrls.includes(imageUrl)) {
                        collectedUrls.push(imageUrl)
                    }
                    if (collectedUrls.length >= targetCount) break
                }

                console.log(`Generated ${collectedUrls.length}/${targetCount} image(s) after request ${requestIndex}`)

                if (batchMode === 'single' || collectedUrls.length >= targetCount) {
                    return { imageUrls: collectedUrls.slice(0, targetCount) }
                }

                continue
            }

            lastError = new Error('The model did not return a valid image')
            console.warn(`Generation request ${requestIndex} returned no image`, lastError.message)
            break
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            console.error(`Generation request ${requestIndex} failed`, lastError.message)
            break
        }
    }

    if (collectedUrls.length > 0) {
        return { imageUrls: collectedUrls.slice(0, targetCount) }
    }

    if (isTerminalGenerationError(lastError)) {
        throw lastError
    }

    const lastErrorMessage = lastError ? (lastError as Error).message : 'unknown error'
    throw new Error(`Unable to generate ${targetCount} image(s). Last error: ${lastErrorMessage}`)
}

export async function fetchModels(apikey: string, endpoint: string, useProxy = false): Promise<ApiModel[]> {
    const profile = getApiProfile(endpoint)

    if (profile.provider === 'grsai' || profile.provider === 'grsai-draw' || profile.isGrsaiHost) {
        try {
            return await fetchModelsFromKnownEndpoints(apikey, profile.endpoint, useProxy)
        } catch (error) {
            console.warn('Unable to fetch Grsai models; using built-in model choices:', error)
            return GRS_AI_FALLBACK_MODELS
        }
    }

    return fetchModelsFromKnownEndpoints(apikey, profile.endpoint, useProxy)
}

export async function improvePrompt(request: PromptAssistantRequest): Promise<PromptAssistantResponse> {
    const isTemplateTranslation = request.task === 'translate-template'
    const isImageToPrompt = request.task === 'image-to-prompt'
    const targetLanguage = request.targetLanguage === 'en' ? 'English' : 'Chinese'
    const userContent = isImageToPrompt
        ? [
            {
                type: 'text',
                text: [
                    '请根据上传图片逆推出适合图像生成模型复刻该画面的提示词。',
                    '输出中文为主，可以保留必要英文摄影/设计术语。',
                    '请按以下结构输出：',
                    '1. 核心提示词：一段可直接用于生图的完整提示词。',
                    '2. 画面要素：主体、动作/姿态、服装/造型、场景、光线、镜头/构图、风格质感。',
                    '3. 负面约束：避免错误、不要生成的内容。',
                    '4. 可复用短词组：用逗号分隔。',
                    '不要识别或猜测真实人物姓名；不要添加水印、随机文字或不存在的品牌。',
                    request.context ? `当前工具上下文：\n${request.context}` : '',
                    request.prompt ? `用户补充要求：\n${request.prompt}` : ''
                ].filter(Boolean).join('\n\n')
            },
            ...(request.images || []).map(image => ({
                type: 'image_url',
                image_url: { url: image }
            }))
        ]
        : isTemplateTranslation
          ? [
              `Translate this image-generation template into ${targetLanguage}.`,
              'Keep the meaning, specificity, scene constraints, quality constraints, and negative instructions unchanged.',
              request.context ? `Template context:\n${request.context}` : '',
              `Source template:\n${request.prompt}`
          ].filter(Boolean).join('\n\n')
          : [
              '请优化下面的生图提示词，优先使用中文，必要的摄影/平台术语可保留英文。',
              '要求：结构清楚，适合图像模型理解；强调真实手机镜头、参考图使用方式、主体一致性和质量约束；不要改变用户原意。',
              request.context ? `当前创作上下文：\n${request.context}` : '',
              `用户原始提示词：\n${request.prompt}`
          ].filter(Boolean).join('\n\n')
    const payload: Record<string, unknown> = {
        model: request.model.trim(),
        messages: [
            {
                role: 'system',
                content: isImageToPrompt
                    ? [
                        '你是 Vistack 的图像反推提示词助手。',
                        '你的任务是观察用户上传的参考图，整理出可复刻画面的图像生成提示词。',
                        '描述画面视觉信息，不要猜测真实身份、隐私信息或未出现的事实。',
                        '输出要能直接被生图模型使用，语言清晰，结构稳定。'
                    ].join('\n')
                    : isTemplateTranslation
                    ? [
                        'You are Vistack template localization assistant.',
                        'Translate image-generation templates between Chinese and English while preserving all constraints, references, camera terms, negative instructions, aspect-ratio notes, and model-friendly structure.',
                        'Do not add new celebrities, brands, watermarks, random text, or extra explanation.',
                        'Output only the translated prompt text. Do not use Markdown.'
                    ].join('\n')
                    : [
                        '你是 Vistack 的中文生图提示词助手。',
                        '你的任务是把用户的中文想法整理成更稳定、更清晰的图像生成提示词。',
                        '保留用户指定的人物、参考图角色、服装、场景、文化语境和审美偏好。',
                        '不要添加真实艺人姓名、品牌商标、随机文字、水印或额外解释。',
                        '输出只包含优化后的提示词本身，不要使用 Markdown。'
                    ].join('\n')
            },
            {
                role: 'user',
                content: userContent
            }
        ],
        temperature: 0.4
    }

    const data = await postJson(resolveChatCompletionsEndpoint(request.endpoint), request.apikey, payload, request.useProxy)
    const content = extractTextContent(data).trim()

    if (!content) {
        throw new Error(`提示词助手没有返回文本: ${summarizeResponse(data)}`)
    }

    return { prompt: content }
}

async function generateWithProfile(profile: ApiProfile, request: GenerateRequest, options: GenerateImageOptions): Promise<GenerateResponse> {
    const requestToSend = request.images.length
        ? { ...request, images: await prepareReferenceImages(request.images) }
        : request

    if (profile.provider === 'grsai') {
        return generateWithGrsai(profile.endpoint, requestToSend, options)
    }

    if (profile.provider === 'grsai-draw') {
        return generateWithGrsaiDraw(profile.endpoint, requestToSend, options)
    }

    if (profile.provider === 'openai-image-edit') {
        return generateWithOpenAiImageEdit(profile.endpoint, requestToSend)
    }

    if (profile.provider === 'openai-image') {
        return generateWithOpenAiImage(profile.endpoint, requestToSend)
    }

    return generateWithOpenAiChat(profile.endpoint, requestToSend)
}

async function generateWithOpenAiChat(apiEndpoint: string, request: GenerateRequest): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || DEFAULT_MODEL_ID
    const isGemini3ProImage = modelId.toLowerCase().includes('gemini-3-pro-image')
    const isOpenAiImageModel = isOpenAiImageModelId(modelId)

    const messageContent = request.images.length === 0
        ? request.prompt
        : [
            { type: 'text', text: request.prompt },
            ...request.images.map(img => ({
                type: 'image_url',
                image_url: { url: img }
            }))
        ]

    const payload: Record<string, unknown> = {
        model: modelId,
        messages: [
            {
                role: 'user',
                content: messageContent
            }
        ],
        modalities: ['image', 'text']
    }

    if (request.count && request.count > 1) {
        payload.n = request.count
    }

    const imageConfig: Record<string, unknown> = {}

    if (request.aspectRatio) {
        imageConfig.aspect_ratio = request.aspectRatio
    }

    if (isGemini3ProImage || isOpenAiImageModel) {
        if (request.imageSize) {
            imageConfig.image_size = request.imageSize
        }
        imageConfig.size = aspectRatioToSize(request.aspectRatio || '1:1', request.imageSize)
    }

    if (isGemini3ProImage) {
        if (request.enableGoogleSearch) {
            payload.tools = [{ google_search: {} }]
        }
    }

    if (Object.keys(imageConfig).length > 0) {
        payload.image_config = imageConfig
    }

    const data = await postJson(apiEndpoint, request.apikey, payload, request.useProxy)
    const directImageUrls = extractImageUrls(data)
    if (directImageUrls.length > 0) {
        return { imageUrls: directImageUrls }
    }

    const message = getObject(getArray(getObject(data)?.choices)?.[0])?.message

    if (!isRecord(message)) {
        throwIfTerminalTaskResponse(data, 'Image generation request')
        throw new TerminalGenerationError(`Invalid response from API: ${summarizeResponse(data)}`)
    }

    const imageUrls = extractImageUrls(message)

    if (imageUrls.length > 0) {
        return { imageUrls }
    }

    throwIfTerminalTaskResponse(data, 'Image generation request')

    const textContent = typeof message.content === 'string' ? message.content : ''
    if (textContent.trim()) {
        throw new TerminalGenerationError(`The model returned text instead of an image: ${textContent}`)
    }

    throw new TerminalGenerationError('The model did not return a valid image')
}

async function generateWithOpenAiImage(apiEndpoint: string, request: GenerateRequest): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || 'gpt-image-2'
    const payload: Record<string, unknown> = {
        model: modelId,
        prompt: request.prompt,
        size: aspectRatioToSize(request.aspectRatio || '1:1', request.imageSize),
        n: normalizeImageCount(request.count)
    }

    if (isDallEModelId(modelId)) {
        payload.response_format = 'url'
    }

    if (request.images.length > 0) {
        payload.image = request.images
    }

    const data = await postJson(apiEndpoint, request.apikey, payload, request.useProxy)
    const imageUrls = extractImageUrls(data)

    if (imageUrls.length > 0) {
        return { imageUrls }
    }

    throwIfTerminalTaskResponse(data, 'Image generation request')

    throw new TerminalGenerationError(`The image generation API did not return an image: ${summarizeResponse(data)}`)
}

async function generateWithGrsai(apiEndpoint: string, request: GenerateRequest, options: GenerateImageOptions): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || 'nano-banana-2'
    const isGptImage = isOpenAiImageModelId(modelId)
    const payload: Record<string, unknown> = {
        model: modelId,
        prompt: request.prompt,
        images: request.images,
        replyType: 'json',
        count: normalizeImageCount(request.count)
    }

    if (isGptImage) {
        const size = aspectRatioToSize(request.aspectRatio || '1:1', request.imageSize)
        payload.aspectRatio = size
        payload.size = size
    } else if (request.aspectRatio) {
        payload.aspectRatio = request.aspectRatio
    }

    payload.imageSize = request.imageSize || '1K'

    const data = await postJson(apiEndpoint, request.apikey, payload, request.useProxy)
    const directUrls = extractImageUrls(data)

    if (directUrls.length > 0) {
        return { imageUrls: directUrls }
    }

    throwIfTerminalTaskResponse(data, 'Grsai image generation request')

    const taskId = extractTaskId(data)
    if (!taskId) {
        throw new TerminalGenerationError(`Grsai API did not return an image or task ID: ${summarizeResponse(data)}`)
    }

    const handle = createGenerationTaskHandle('grsai', apiEndpoint, modelId, taskId, request.useProxy)
    await options.onTaskCreated?.(handle)
    return pollGeneratedTask(handle, request.apikey)
}

async function generateWithOpenAiImageEdit(apiEndpoint: string, request: GenerateRequest): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || 'gpt-image-2'
    const formData = new FormData()
    formData.append('model', modelId)
    formData.append('prompt', request.prompt)
    formData.append('size', aspectRatioToSize(request.aspectRatio || '1:1', request.imageSize))
    formData.append('n', String(normalizeImageCount(request.count)))
    if (isDallEModelId(modelId)) {
        formData.append('response_format', 'url')
    }

    for (let index = 0; index < request.images.length; index += 1) {
        const blob = await imageReferenceToBlob(request.images[index])
        formData.append('image[]', blob, `reference-${index + 1}.${mimeToExtension(blob.type)}`)
    }

    const data = await postFormData(apiEndpoint, request.apikey, formData, request.useProxy)
    const imageUrls = extractImageUrls(data)

    if (imageUrls.length > 0) {
        return { imageUrls }
    }

    throwIfTerminalTaskResponse(data, 'Image edit request')

    throw new TerminalGenerationError(`The image edit API did not return an image: ${summarizeResponse(data)}`)
}

async function generateWithGrsaiDraw(apiEndpoint: string, request: GenerateRequest, options: GenerateImageOptions): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || 'nano-banana-pro'
    const isGptImage = isOpenAiImageModelId(modelId) || getEndpointPath(apiEndpoint).endsWith('/draw/completions')
    const payload: Record<string, unknown> = {
        model: modelId,
        prompt: request.prompt,
        webHook: '-1',
        shutProgress: false,
        count: normalizeImageCount(request.count)
    }

    if (request.images.length > 0) {
        payload.images = request.images
        payload.urls = request.images
    }

    if (request.aspectRatio) {
        payload.aspectRatio = isGptImage ? aspectRatioToSize(request.aspectRatio, request.imageSize) : request.aspectRatio
    }

    if (isGptImage) {
        payload.size = aspectRatioToSize(request.aspectRatio || '1:1', request.imageSize)
        payload.imageSize = request.imageSize || '1K'
    } else {
        payload.imageSize = request.imageSize || '1K'
    }

    const data = await postJson(apiEndpoint, request.apikey, payload, request.useProxy)
    const directUrls = extractImageUrls(data)

    if (directUrls.length > 0) {
        return { imageUrls: directUrls }
    }

    throwIfTerminalTaskResponse(data, 'Grsai draw request')

    const taskId = extractTaskId(data)
    if (!taskId) {
        throw new TerminalGenerationError(`Grsai draw API did not return an image or task ID: ${summarizeResponse(data)}`)
    }

    const handle = createGenerationTaskHandle('grsai-draw', apiEndpoint, modelId, taskId, request.useProxy)
    await options.onTaskCreated?.(handle)
    return pollGeneratedTask(handle, request.apikey)
}

export async function pollGeneratedTask(handle: GenerationTaskHandle, apikey: string): Promise<GenerateResponse> {
    return pollGrsaiResult(handle.apiEndpoint, apikey, handle.taskId, handle.resultEndpoint, handle.useProxy)
}

function createGenerationTaskHandle(provider: GenerationTaskProvider, apiEndpoint: string, model: string, taskId: string, useProxy?: boolean): GenerationTaskHandle {
    return {
        provider,
        taskId,
        apiEndpoint,
        resultEndpoint: resolveGrsaiResultEndpoint(apiEndpoint),
        model,
        createdAt: Date.now(),
        useProxy
    }
}

async function pollGrsaiResult(apiEndpoint: string, apikey: string, taskId: string, resultEndpointOverride?: string, useProxy = false): Promise<GenerateResponse> {
    const resultEndpoint = resultEndpointOverride || resolveGrsaiResultEndpoint(apiEndpoint)
    const maxPolls = 36
    const delayMs = 5000

    for (let index = 0; index < maxPolls; index++) {
        if (index > 0) {
            await delay(delayMs)
        }

        const data = await fetchGrsaiResult(resultEndpoint, apikey, taskId, useProxy) as GrsaiResultResponse
        const imageUrls = extractImageUrls(data)

        if (imageUrls.length > 0) {
            return { imageUrls }
        }

        throwIfTerminalTaskResponse(data, 'Grsai task')
    }

    throw new TerminalGenerationError('Grsai task timed out. Please try again later or check the task in the provider dashboard.')
}

async function fetchGrsaiResult(resultEndpoint: string, apikey: string, taskId: string, useProxy = false): Promise<unknown> {
    if (getEndpointPath(resultEndpoint).endsWith('/draw/result')) {
        return postJson(resultEndpoint, apikey, { id: taskId }, useProxy)
    }

    return getJson(`${resultEndpoint}?id=${encodeURIComponent(taskId)}`, apikey, useProxy)
}

async function fetchModelsFromKnownEndpoints(apikey: string, endpoint: string, useProxy = false): Promise<ApiModel[]> {
    const modelUrls = resolveModelEndpoints(endpoint)
    let lastError: Error | null = null

    for (const modelUrl of modelUrls) {
        try {
            const data = await getJson(modelUrl, apikey, useProxy) as ModelListResponse
            const models = normalizeModels(data)

            if (models.length > 0) {
                return models
            }

            lastError = new Error('Model list is empty')
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
        }
    }

    throw lastError || new Error('Unable to fetch model list')
}

async function postJson(endpoint: string, apikey: string, payload: Record<string, unknown>, useProxy = false): Promise<unknown> {
    const response = await fetchEndpoint(endpoint, apikey, 'POST', payload, useProxy)

    return readJsonResponse(response)
}

async function postFormData(endpoint: string, apikey: string, formData: FormData, useProxy = false): Promise<unknown> {
    const response = await fetchFormEndpoint(endpoint, apikey, formData, useProxy)

    return readJsonResponse(response)
}

async function getJson(endpoint: string, apikey: string, useProxy = false): Promise<unknown> {
    const response = await fetchEndpoint(endpoint, apikey, 'GET', undefined, useProxy)

    return readJsonResponse(response)
}

async function fetchFormEndpoint(endpoint: string, apikey: string, formData: FormData, useProxy = false): Promise<Response> {
    if (!useProxy) {
        return fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apikey}`
            },
            body: formData
        })
    }

    formData.append('_vistack_target', endpoint)
    return fetch(getProxyUrl(), {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apikey}`
        },
        body: formData
    })
}


async function fetchEndpoint(
    endpoint: string,
    apikey: string,
    method: 'GET' | 'POST',
    payload?: Record<string, unknown>,
    useProxy = false
): Promise<Response> {
    const headers = buildHeaders(apikey)

    if (!useProxy) {
        return fetch(endpoint, {
            method,
            headers,
            body: method === 'POST' ? JSON.stringify(payload || {}) : undefined
        })
    }

    return fetch(getProxyUrl(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            target: endpoint,
            method,
            headers,
            body: method === 'POST' ? payload || {} : undefined
        })
    })
}

async function readJsonResponse(response: Response): Promise<unknown> {
    const responseText = await response.text()

    if (!response.ok) {
        const message = formatHttpErrorMessage(response.status, responseText)
        if (response.status >= 400 && response.status < 500) {
            throw new TerminalGenerationError(message)
        }

        throw new Error(message)
    }

    if (!responseText.trim()) {
        return {}
    }

    try {
        return JSON.parse(responseText)
    } catch {
        throw new Error(`API did not return valid JSON: ${responseText}`)
    }
}

function formatHttpErrorMessage(status: number, responseText: string): string {
    const trimmed = responseText.trim()
    if (!trimmed) {
        return `API request failed (HTTP ${status})`
    }

    try {
        const parsed = JSON.parse(trimmed)
        return `API request failed (HTTP ${status}): ${extractFailureReason(parsed)}`
    } catch {
        return `API request failed (HTTP ${status}): ${trimmed}`
    }
}

function buildHeaders(apikey: string): Record<string, string> {
    return {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json'
    }
}

// 返回带 token 的代理地址。如果用户没设密码，就是 /api/proxy（开发态可放行）。
// 线上设了环境变量 VISTACK_PROXY_TOKEN 后，必须带对 token 才能调用。
function getProxyUrl(): string {
    const token = LocalStorage.getApiProxyToken().trim()
    if (!token) return '/api/proxy'
    // token 是用户自己设的，长度可控，走 query 即可。
    return `/api/proxy?token=${encodeURIComponent(token)}`
}

async function imageReferenceToBlob(image: string): Promise<Blob> {
    if (image.startsWith('data:')) {
        const response = await fetch(image)
        return response.blob()
    }

    const response = await fetch(image)
    if (!response.ok) {
        throw new TerminalGenerationError(`Unable to load reference image for edit request: HTTP ${response.status}`)
    }
    return response.blob()
}

function mimeToExtension(mime: string): string {
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
    if (mime.includes('webp')) return 'webp'
    if (mime.includes('gif')) return 'gif'
    return 'png'
}

function isDallEModelId(modelId: string): boolean {
    return /dall[\s_-]*e/i.test(modelId)
}

async function prepareReferenceImages(images: string[]): Promise<string[]> {
    return Promise.all(images.map(image => compressReferenceImageIfNeeded(image)))
}

async function compressReferenceImageIfNeeded(image: string): Promise<string> {
    if (!image.startsWith('data:image/') || image.length < REFERENCE_IMAGE_COMPRESSION_THRESHOLD) {
        return image
    }

    if (typeof document === 'undefined') {
        return image
    }

    try {
        const loadedImage = await loadHtmlImage(image)
        const scale = Math.min(1, REFERENCE_IMAGE_MAX_SIDE / Math.max(loadedImage.naturalWidth, loadedImage.naturalHeight))
        const width = Math.max(1, Math.round(loadedImage.naturalWidth * scale))
        const height = Math.max(1, Math.round(loadedImage.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) {
            return image
        }

        context.drawImage(loadedImage, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', REFERENCE_IMAGE_JPEG_QUALITY)
        return compressed.length < image.length ? compressed : image
    } catch (error) {
        console.warn('Unable to compress reference image before sending:', error)
        return image
    }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('Reference image failed to load for compression.'))
        image.src = src
    })
}

function getApiProfile(endpoint?: string, model?: string, hasReferenceImages = false): ApiProfile {
    const apiEndpoint = resolveImageGenerationEndpoint(endpoint?.trim() || DEFAULT_API_ENDPOINT, model, hasReferenceImages)
    const path = getEndpointPath(apiEndpoint)
    const isGrsai = isGrsaiEndpoint(apiEndpoint)

    return {
        provider: getApiProvider(path),
        endpoint: apiEndpoint,
        isGrsaiHost: isGrsai
    }
}

function getApiProvider(path: string): ApiProvider {
    if (path.endsWith('/images/generations')) {
        return 'openai-image'
    }

    if (path.endsWith('/images/edits')) {
        return 'openai-image-edit'
    }

    if (path.endsWith('/v1/api/generate') || path.endsWith('/api/generate')) {
        return 'grsai'
    }

    if (path.includes('/draw/') && !path.endsWith('/draw/result')) {
        return 'grsai-draw'
    }

    return 'openai-chat'
}

function resolveModelEndpoints(endpoint: string): string[] {
    return resolveModelEndpointCandidates(endpoint)
}

function resolveGrsaiResultEndpoint(endpoint: string): string {
    const path = getEndpointPath(endpoint)

    if (path.includes('/draw/')) {
        try {
            const url = new URL(endpoint)
            const segments = url.pathname.split('/').filter(Boolean)
            const drawIndex = segments.findIndex(segment => segment.toLowerCase() === 'draw')

            if (drawIndex >= 0) {
                url.pathname = '/' + [...segments.slice(0, drawIndex + 1), 'result'].join('/')
                return url.toString()
            }
        } catch {
            return endpoint.replace(/\/draw\/[^/]+\/?$/, '/draw/result')
        }
    }

    const resolved = resolveSiblingEndpoint(endpoint, 'result')
    if (resolved) {
        return resolved
    }

    return endpoint.replace(/\/generate\/?$/, '/result')
}

function aspectRatioToSize(aspectRatio: string, imageSize = '1K'): string {
    if (/^\d+x\d+$/i.test(aspectRatio)) {
        return aspectRatio
    }

    const sizeMap: Record<string, string> = {
        '1:1': '1024x1024',
        '2:3': '832x1248',
        '3:2': '1248x832',
        '3:4': '864x1184',
        '4:3': '1184x864',
        '4:5': '896x1152',
        '5:4': '1152x896',
        '9:16': '768x1344',
        '16:9': '1344x768',
        '21:9': '1536x672'
    }

    const baseSize = sizeMap[aspectRatio] || '1024x1024'
    return scaleSize(baseSize, imageSize)
}

function scaleSize(size: string, imageSize = '1K'): string {
    const match = size.match(/^(\d+)x(\d+)$/i)
    if (!match) return size

    const multiplier = imageSize.toUpperCase() === '4K'
        ? 4
        : imageSize.toUpperCase() === '2K'
          ? 2
          : 1

    if (multiplier === 1) return size

    const width = Number(match[1])
    const height = Number(match[2])
    return `${width * multiplier}x${height * multiplier}`
}

function normalizeModels(data: ModelListResponse): ApiModel[] {
    const rawModels = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.models)
          ? data.models
          : Array.isArray(data)
            ? data
            : []

    return rawModels
        .map(model => normalizeModel(model))
        .filter((model): model is ApiModel => Boolean(model))
}

function normalizeModel(model: unknown): ApiModel | null {
    if (typeof model === 'string') {
        return {
            id: model,
            capabilities: { image: true }
        }
    }

    if (!isRecord(model)) {
        return null
    }

    const id = getString(model.id) ||
        getString(model.model) ||
        getString(model.name) ||
        getString(model.value)

    if (!id) {
        return null
    }

    return {
        ...model,
        id,
        name: getString(model.name),
        description: getString(model.description) || getString(model.about),
        capabilities: isRecord(model.capabilities)
            ? model.capabilities
            : {
                image: true
            }
    }
}

function extractImageUrls(value: unknown): string[] {
    const urls: string[] = []
    const seen = new Set<string>()

    const addUrl = (candidate: unknown) => {
        if (typeof candidate !== 'string') return
        const trimmed = candidate.trim()
        if (!trimmed) return

        const dataMatches = trimmed.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[^\s"]+/g)
        if (dataMatches) {
            for (const match of dataMatches) {
                if (!seen.has(match)) {
                    seen.add(match)
                    urls.push(match)
                }
            }
            return
        }

        if (/^(https?:\/\/|blob:|data:image\/)/i.test(trimmed) && !seen.has(trimmed)) {
            seen.add(trimmed)
            urls.push(trimmed)
        }
    }

    const visit = (item: unknown, depth = 0) => {
        if (depth > 8) return

        if (typeof item === 'string') {
            addUrl(item)
            return
        }

        if (Array.isArray(item)) {
            for (const entry of item) {
                visit(entry, depth + 1)
            }
            return
        }

        if (!isRecord(item)) {
            return
        }

        const base64Json = getString(item.b64_json)
        if (base64Json) {
            addUrl(`data:image/png;base64,${base64Json}`)
        }

        for (const key of [
            'url',
            'urls',
            'image',
            'images',
            'image_url',
            'imageURL',
            'imageUrl',
            'imageUrls',
            'b64_json',
            'output',
            'outputs',
            'result',
            'results',
            'data',
            'content'
        ]) {
            if (key in item) {
                visit(item[key], depth + 1)
            }
        }
    }

    visit(value)
    return urls
}

function extractTextContent(value: unknown): string {
    const root = getObject(value)
    const choices = getArray(root?.choices)
    const message = getObject(getObject(choices?.[0])?.message)
    const directContent = message?.content

    if (typeof directContent === 'string') {
        return directContent
    }

    if (Array.isArray(directContent)) {
        return directContent
            .map(part => {
                if (typeof part === 'string') return part
                if (!isRecord(part)) return ''
                return getString(part.text) || getString(part.content)
            })
            .filter(Boolean)
            .join('\n')
    }

    return getString(root?.output_text) || getString(root?.text) || getString(root?.content)
}

function extractTaskId(value: unknown): string | null {
    if (!isRecord(value)) {
        return null
    }

    for (const key of ['id', 'taskId', 'task_id', 'jobId', 'job_id', 'requestId', 'request_id']) {
        const candidate = getString(value[key])
        if (candidate) {
            return candidate
        }
    }

    for (const key of ['data', 'result']) {
        const nested = value[key]
        if (isRecord(nested)) {
            const nestedId = extractTaskId(nested)
            if (nestedId) {
                return nestedId
            }
        }
    }

    return null
}

const FAILURE_STATUSES = new Set([
    'failed',
    'fail',
    'failure',
    'error',
    'errored',
    'cancel',
    'canceled',
    'cancelled',
    'abort',
    'aborted',
    'reject',
    'rejected',
    'denied',
    'blocked',
    'invalid',
    'expired',
    'timeout',
    'timed_out',
    'terminated',
    'unsafe',
    'safety',
    'content_filter',
    'content_policy_violation'
])

const SUCCESS_STATUSES = new Set([
    'success',
    'succeeded',
    'complete',
    'completed',
    'done',
    'finished'
])

function throwIfTerminalTaskResponse(value: unknown, context: string): void {
    const failedStatus = findStatus(value, isFailureStatus)
    if (failedStatus) {
        throw new TerminalGenerationError(`${context} failed (${failedStatus}): ${extractFailureReason(value)}`)
    }

    if (hasExplicitFailureSignal(value)) {
        throw new TerminalGenerationError(`${context} failed: ${extractFailureReason(value)}`)
    }

    const successStatus = findStatus(value, isSuccessStatus)
    if (successStatus) {
        throw new TerminalGenerationError(`${context} completed but did not return an image: ${summarizeResponse(value)}`)
    }
}

function isTerminalGenerationError(error: unknown): error is TerminalGenerationError {
    return error instanceof TerminalGenerationError ||
        (isRecord(error) && getString(error.name) === 'TerminalGenerationError')
}

function findStatus(value: unknown, matcher: (status: string) => boolean, depth = 0): string | null {
    if (depth > 6) return null

    if (Array.isArray(value)) {
        for (const item of value) {
            const nested = findStatus(item, matcher, depth + 1)
            if (nested) return nested
        }
        return null
    }

    if (!isRecord(value)) return null

    for (const key of ['status', 'state', 'taskStatus', 'task_status', 'jobStatus', 'job_status', 'phase']) {
        const status = normalizeStatus(value[key])
        if (status && matcher(status)) return status
    }

    for (const key of ['data', 'result', 'results', 'output', 'task', 'job']) {
        if (key in value) {
            const nested = findStatus(value[key], matcher, depth + 1)
            if (nested) return nested
        }
    }

    return null
}

function isFailureStatus(status: string): boolean {
    return FAILURE_STATUSES.has(status) ||
        status.includes('fail') ||
        status.includes('error') ||
        status.includes('cancel') ||
        status.includes('abort') ||
        status.includes('reject') ||
        status.includes('block') ||
        status.includes('denied') ||
        status.includes('safety') ||
        status.includes('violation') ||
        status.includes('expired') ||
        status.includes('timeout')
}

function isSuccessStatus(status: string): boolean {
    return SUCCESS_STATUSES.has(status)
}

function hasExplicitFailureSignal(value: unknown, depth = 0): boolean {
    if (depth > 6) return false

    if (Array.isArray(value)) {
        return value.some(item => hasExplicitFailureSignal(item, depth + 1))
    }

    if (!isRecord(value)) return false

    if (value.success === false || value.ok === false) return true

    for (const key of ['error', 'errors', 'errorMessage', 'error_message', 'errorCode', 'error_code']) {
        if (hasMeaningfulErrorValue(value[key])) return true
    }

    if (hasFailureCode(value) && Boolean(findFailureMessage(value))) {
        return true
    }

    for (const key of ['data', 'result', 'results', 'output', 'task', 'job']) {
        if (key in value && hasExplicitFailureSignal(value[key], depth + 1)) return true
    }

    return false
}

function hasMeaningfulErrorValue(value: unknown): boolean {
    if (value === null || value === undefined || value === false) return false

    if (typeof value === 'string') {
        const numeric = getNumber(value)
        if (numeric !== null) return numeric !== 0

        const normalized = normalizeStatus(value)
        return Boolean(normalized) && !['ok', 'none', 'null', 'success', 'succeeded'].includes(normalized)
    }

    if (typeof value === 'number') {
        return value !== 0
    }

    if (Array.isArray(value)) {
        return value.some(hasMeaningfulErrorValue)
    }

    if (isRecord(value)) {
        const message = findFailureMessage(value)
        const keys = Object.keys(value)
        if (!message && keys.length === 1 && getNumber(value.code) === 0) return false
        return Boolean(message) || Object.keys(value).length > 0
    }

    return Boolean(value)
}

function hasFailureCode(value: Record<string, unknown>): boolean {
    for (const key of ['code', 'statusCode', 'status_code', 'errno']) {
        const code = getNumber(value[key])
        if (code !== null && (code < 0 || code >= 400)) {
            return true
        }
    }

    return false
}

function extractFailureReason(value: unknown): string {
    return findFailureMessage(value) || summarizeResponse(value)
}

function findFailureMessage(value: unknown, depth = 0): string {
    if (depth > 6) return ''

    if (typeof value === 'string') return value.trim()

    if (Array.isArray(value)) {
        return value.map(item => findFailureMessage(item, depth + 1)).find(Boolean) || ''
    }

    if (!isRecord(value)) return ''

    for (const key of ['message', 'msg', 'detail', 'reason', 'description', 'error_description', 'errorMessage', 'error_message']) {
        const direct = getString(value[key])
        if (direct) return direct
    }

    for (const key of ['error', 'errors', 'data', 'result', 'output']) {
        if (key in value) {
            const nested = findFailureMessage(value[key], depth + 1)
            if (nested) return nested
        }
    }

    return ''
}

function normalizeStatus(value: unknown): string {
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    return getString(value).toLowerCase().replace(/[\s-]+/g, '_')
}

function getNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
    return null
}

function summarizeResponse(value: unknown): string {
    try {
        const summary = JSON.stringify(value)
        return summary.length > 500 ? `${summary.slice(0, 500)}...` : summary
    } catch {
        return String(value)
    }
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms))
}

function normalizeImageCount(count?: number): number {
    if (!Number.isFinite(count)) return 1
    return Math.min(Math.max(Math.floor(count || 1), 1), 4)
}

function getArray(value: unknown): unknown[] | null {
    return Array.isArray(value) ? value : null
}

function getObject(value: unknown): Record<string, unknown> | null {
    return isRecord(value) ? value : null
}

function getString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}
