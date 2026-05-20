import type { ApiModel, GenerateRequest, GenerateResponse, ModelListResponse, PromptAssistantRequest, PromptAssistantResponse } from '../types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'

type ApiProvider = 'openai-chat' | 'openai-image' | 'grsai' | 'grsai-draw'

interface ApiProfile {
    provider: ApiProvider
    endpoint: string
    isGrsaiHost: boolean
}

interface GrsaiResultResponse {
    status?: string
    state?: string
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

export async function generateImage(request: GenerateRequest, maxRetries: number = 5): Promise<GenerateResponse> {
    const targetCount = normalizeImageCount(request.count)
    const collectedUrls: string[] = []
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries && collectedUrls.length < targetCount; attempt++) {
        try {
            console.log(`Attempting image generation (${attempt}/${maxRetries})...`)

            const profile = getApiProfile(request.endpoint)
            const response = await generateWithProfile(profile, { ...request, count: targetCount - collectedUrls.length })

            if (response.imageUrls.length > 0) {
                for (const imageUrl of response.imageUrls) {
                    if (!collectedUrls.includes(imageUrl)) {
                        collectedUrls.push(imageUrl)
                    }
                    if (collectedUrls.length >= targetCount) break
                }
                console.log(`Generated ${collectedUrls.length}/${targetCount} image(s) on attempt ${attempt}`)
                if (collectedUrls.length >= targetCount) {
                    return { imageUrls: collectedUrls }
                }
                continue
            }

            lastError = new Error('The model did not return a valid image')
            console.warn(`Attempt ${attempt} failed`, lastError.message)

            if (attempt < maxRetries) {
                console.log(`Preparing retry ${attempt + 1}...`)
                continue
            }
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err))
            console.error(`Attempt ${attempt} failed`, lastError.message)

            if (attempt >= maxRetries) {
                break
            }

            console.log(`Preparing retry ${attempt + 1}...`)
        }
    }

    if (collectedUrls.length > 0) {
        return { imageUrls: collectedUrls }
    }

    throw new Error(`Unable to generate an image after ${maxRetries} attempts. Last error: ${lastError?.message || 'unknown error'}`)
}

export async function fetchModels(apikey: string, endpoint: string): Promise<ApiModel[]> {
    const profile = getApiProfile(endpoint)

    if (profile.provider === 'grsai' || profile.provider === 'grsai-draw' || profile.isGrsaiHost) {
        try {
            return await fetchModelsFromKnownEndpoints(apikey, profile.endpoint)
        } catch (error) {
            console.warn('Unable to fetch Grsai models; using built-in model choices:', error)
            return GRS_AI_FALLBACK_MODELS
        }
    }

    return fetchModelsFromKnownEndpoints(apikey, profile.endpoint)
}

export async function improvePrompt(request: PromptAssistantRequest): Promise<PromptAssistantResponse> {
    const payload: Record<string, unknown> = {
        model: request.model.trim(),
        messages: [
            {
                role: 'system',
                content: [
                    '你是 Vistack 的中文生图提示词助手。',
                    '你的任务是把用户的中文想法整理成更稳定、更清晰的图像生成提示词。',
                    '保留用户指定的人物、参考图角色、服装、场景、文化语境和审美偏好。',
                    '不要添加真实艺人姓名、品牌商标、随机文字、水印或额外解释。',
                    '输出只包含优化后的提示词本身，不要使用 Markdown。'
                ].join('\n')
            },
            {
                role: 'user',
                content: [
                    '请优化下面的生图提示词，优先使用中文，必要的摄影/平台术语可保留英文。',
                    '要求：结构清楚，适合图像模型理解；强调真实手机镜头、参考图使用方式、主体一致性和质量约束；不要改变用户原意。',
                    request.context ? `当前创作上下文：\n${request.context}` : '',
                    `用户原始提示词：\n${request.prompt}`
                ].filter(Boolean).join('\n\n')
            }
        ],
        temperature: 0.4
    }

    const data = await postJson(request.endpoint, request.apikey, payload)
    const content = extractTextContent(data).trim()

    if (!content) {
        throw new Error(`提示词助手没有返回文本: ${summarizeResponse(data)}`)
    }

    return { prompt: content }
}

async function generateWithProfile(profile: ApiProfile, request: GenerateRequest): Promise<GenerateResponse> {
    if (profile.provider === 'grsai') {
        return generateWithGrsai(profile.endpoint, request)
    }

    if (profile.provider === 'grsai-draw') {
        return generateWithGrsaiDraw(profile.endpoint, request)
    }

    if (profile.provider === 'openai-image') {
        return generateWithOpenAiImage(profile.endpoint, request, profile.isGrsaiHost)
    }

    return generateWithOpenAiChat(profile.endpoint, request)
}

async function generateWithOpenAiChat(apiEndpoint: string, request: GenerateRequest): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || DEFAULT_MODEL_ID
    const isGemini3ProImage = modelId.toLowerCase().includes('gemini-3-pro-image')

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

    if (isGemini3ProImage) {
        if (request.imageSize) {
            imageConfig.image_size = request.imageSize
        }
        if (request.enableGoogleSearch) {
            payload.tools = [{ google_search: {} }]
        }
    }

    if (Object.keys(imageConfig).length > 0) {
        payload.image_config = imageConfig
    }

    const data = await postJson(apiEndpoint, request.apikey, payload)
    const message = getObject(getArray(getObject(data)?.choices)?.[0])?.message

    if (!isRecord(message)) {
        throw new Error(`Invalid response from API: ${summarizeResponse(data)}`)
    }

    const imageUrls = extractImageUrls(message)

    if (imageUrls.length > 0) {
        return { imageUrls }
    }

    const textContent = typeof message.content === 'string' ? message.content : ''
    if (textContent.trim()) {
        throw new Error(`The model returned text instead of an image: ${textContent}`)
    }

    throw new Error('The model did not return a valid image')
}

async function generateWithOpenAiImage(apiEndpoint: string, request: GenerateRequest, includeInputImages: boolean): Promise<GenerateResponse> {
    const payload: Record<string, unknown> = {
        model: request.model?.trim() || 'gpt-image-2',
        prompt: request.prompt,
        size: aspectRatioToSize(request.aspectRatio || '1:1'),
        response_format: 'url',
        n: normalizeImageCount(request.count)
    }

    if (includeInputImages && request.images.length > 0) {
        payload.image = request.images
    }

    const data = await postJson(apiEndpoint, request.apikey, payload)
    const imageUrls = extractImageUrls(data)

    if (imageUrls.length > 0) {
        return { imageUrls }
    }

    throw new Error(`The image generation API did not return an image: ${summarizeResponse(data)}`)
}

async function generateWithGrsai(apiEndpoint: string, request: GenerateRequest): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || 'nano-banana-2'
    const payload: Record<string, unknown> = {
        model: modelId,
        prompt: request.prompt,
        images: request.images,
        replyType: 'json',
        count: normalizeImageCount(request.count)
    }

    if (request.aspectRatio) {
        payload.aspectRatio = modelId.toLowerCase().includes('gpt-image')
            ? aspectRatioToSize(request.aspectRatio)
            : request.aspectRatio
    }

    if (!modelId.toLowerCase().includes('gpt-image')) {
        payload.imageSize = request.imageSize || '1K'
    }

    const data = await postJson(apiEndpoint, request.apikey, payload)
    const directUrls = extractImageUrls(data)

    if (directUrls.length > 0) {
        return { imageUrls: directUrls }
    }

    const taskId = extractTaskId(data)
    if (!taskId) {
        throw new Error(`Grsai API did not return an image or task ID: ${summarizeResponse(data)}`)
    }

    return pollGrsaiResult(apiEndpoint, request.apikey, taskId)
}

async function generateWithGrsaiDraw(apiEndpoint: string, request: GenerateRequest): Promise<GenerateResponse> {
    const modelId = request.model?.trim() || 'nano-banana-pro'
    const isGptImage = modelId.toLowerCase().includes('gpt-image') || getEndpointPath(apiEndpoint).endsWith('/draw/completions')
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
        payload.aspectRatio = isGptImage ? aspectRatioToSize(request.aspectRatio) : request.aspectRatio
    }

    if (isGptImage) {
        payload.size = aspectRatioToSize(request.aspectRatio || '1:1')
    } else {
        payload.imageSize = request.imageSize || '1K'
    }

    const data = await postJson(apiEndpoint, request.apikey, payload)
    const directUrls = extractImageUrls(data)

    if (directUrls.length > 0) {
        return { imageUrls: directUrls }
    }

    const taskId = extractTaskId(data)
    if (!taskId) {
        throw new Error(`Grsai draw API did not return an image or task ID: ${summarizeResponse(data)}`)
    }

    return pollGrsaiResult(apiEndpoint, request.apikey, taskId)
}

async function pollGrsaiResult(apiEndpoint: string, apikey: string, taskId: string): Promise<GenerateResponse> {
    const resultEndpoint = resolveGrsaiResultEndpoint(apiEndpoint)
    const maxPolls = 36
    const delayMs = 5000

    for (let index = 0; index < maxPolls; index++) {
        if (index > 0) {
            await delay(delayMs)
        }

        const data = await fetchGrsaiResult(resultEndpoint, apikey, taskId) as GrsaiResultResponse
        const imageUrls = extractImageUrls(data)

        if (imageUrls.length > 0) {
            return { imageUrls }
        }

        const status = getStatus(data)
        if (status && ['failed', 'fail', 'error', 'canceled', 'cancelled'].includes(status)) {
            throw new Error(`Grsai task failed: ${summarizeResponse(data)}`)
        }
    }

    throw new Error('Grsai task timed out. Please try again later or check the task in the provider dashboard.')
}

async function fetchGrsaiResult(resultEndpoint: string, apikey: string, taskId: string): Promise<unknown> {
    if (getEndpointPath(resultEndpoint).endsWith('/draw/result')) {
        return postJson(resultEndpoint, apikey, { id: taskId })
    }

    return getJson(`${resultEndpoint}?id=${encodeURIComponent(taskId)}`, apikey)
}

async function fetchModelsFromKnownEndpoints(apikey: string, endpoint: string): Promise<ApiModel[]> {
    const modelUrls = resolveModelEndpoints(endpoint)
    let lastError: Error | null = null

    for (const modelUrl of modelUrls) {
        try {
            const data = await getJson(modelUrl, apikey) as ModelListResponse
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

async function postJson(endpoint: string, apikey: string, payload: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: buildHeaders(apikey),
        body: JSON.stringify(payload)
    })

    return readJsonResponse(response)
}

async function getJson(endpoint: string, apikey: string): Promise<unknown> {
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: buildHeaders(apikey)
    })

    return readJsonResponse(response)
}

async function readJsonResponse(response: Response): Promise<unknown> {
    const responseText = await response.text()

    if (!response.ok) {
        throw new Error(`API error ${response.status}: ${responseText}`)
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

function buildHeaders(apikey: string): Record<string, string> {
    return {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json'
    }
}

function getApiProfile(endpoint?: string): ApiProfile {
    const apiEndpoint = endpoint?.trim() || DEFAULT_API_ENDPOINT
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

    if (path.endsWith('/v1/api/generate') || path.endsWith('/api/generate')) {
        return 'grsai'
    }

    if (path.includes('/draw/') && !path.endsWith('/draw/result')) {
        return 'grsai-draw'
    }

    return 'openai-chat'
}

function getEndpointPath(endpoint: string): string {
    try {
        return normalizePath(new URL(endpoint).pathname)
    } catch {
        return normalizePath(endpoint)
    }
}

function isGrsaiEndpoint(endpoint: string): boolean {
    try {
        return new URL(endpoint).hostname.toLowerCase().includes('grsai')
    } catch {
        return endpoint.toLowerCase().includes('grsai')
    }
}

function resolveModelEndpoints(endpoint: string): string[] {
    const candidates = new Set<string>()

    for (const candidate of [
        resolveModelsEndpoint(endpoint),
        resolveSiblingEndpoint(endpoint, 'models'),
        resolveSiblingEndpoint(endpoint, 'model'),
        resolveSiblingEndpoint(endpoint, 'models/list'),
        resolveSiblingEndpoint(endpoint, 'model/list'),
        resolveSiblingEndpoint(endpoint, 'list/models'),
        resolveSiblingEndpoint(endpoint, 'list/model')
    ]) {
        if (candidate) {
            candidates.add(candidate)
        }
    }

    return [...candidates]
}

function resolveModelsEndpoint(endpoint: string): string {
    try {
        const url = new URL(endpoint)
        const segments = url.pathname.split('/').filter(Boolean)

        if (segments.length === 0) {
            url.pathname = '/models'
            return url.toString()
        }

        const lastSegment = segments[segments.length - 1]

        if (lastSegment === 'models') {
            return url.toString()
        }

        if (lastSegment === 'completions' || lastSegment === 'complete' || lastSegment === 'generate' || lastSegment === 'generations') {
            segments.pop()
            const secondLast = segments[segments.length - 1]

            if (secondLast === 'chat' || secondLast === 'images') {
                segments[segments.length - 1] = 'models'
            } else {
                segments.push('models')
            }
        } else {
            segments.push('models')
        }

        url.pathname = '/' + segments.join('/')
        return url.toString()
    } catch (error) {
        console.warn('Unable to resolve model endpoint; using fallback rule:', error)
        return endpoint.replace(/\/$/, '') + '/models'
    }
}

function resolveSiblingEndpoint(endpoint: string, siblingPath: string): string | null {
    try {
        const url = new URL(endpoint)
        const segments = url.pathname.split('/').filter(Boolean)

        if (segments.length > 0 && segments[segments.length - 1] !== 'models') {
            segments.pop()
        }

        url.pathname = '/' + [...segments, ...siblingPath.split('/')].join('/')
        return url.toString()
    } catch {
        return null
    }
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

function aspectRatioToSize(aspectRatio: string): string {
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

    return sizeMap[aspectRatio] || '1024x1024'
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

function getStatus(value: unknown): string | null {
    if (!isRecord(value)) {
        return null
    }

    const direct = getString(value.status) || getString(value.state)
    if (direct) {
        return direct.toLowerCase()
    }

    if (isRecord(value.data)) {
        return getStatus(value.data)
    }

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

function normalizePath(pathname: string): string {
    return pathname.replace(/\/+$/, '').toLowerCase()
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
