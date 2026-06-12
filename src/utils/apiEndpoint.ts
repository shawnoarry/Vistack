import { DEFAULT_API_ENDPOINT, DEFAULT_PROMPT_ASSISTANT_ENDPOINT } from '../config/api'

type EndpointPurpose = 'chat' | 'image-generation' | 'image-edit' | 'models'

const CHAT_COMPLETIONS_SUFFIX = ['chat', 'completions']
const IMAGE_GENERATIONS_SUFFIX = ['images', 'generations']
const IMAGE_EDITS_SUFFIX = ['images', 'edits']
const MODELS_SUFFIX = ['models']

export function resolveChatCompletionsEndpoint(endpoint: string, fallback = DEFAULT_PROMPT_ASSISTANT_ENDPOINT): string {
    return resolveEndpoint(endpoint, 'chat', fallback)
}

export function resolveImageGenerationEndpoint(endpoint: string, model?: string, hasReferenceImages = false): string {
    const trimmed = endpoint.trim() || DEFAULT_API_ENDPOINT

    if (isCompleteEndpoint(trimmed)) {
        return trimmed
    }

    if (isGrsaiEndpoint(trimmed)) {
        return resolveGrsaiGenerateEndpoint(trimmed)
    }

    if (hasReferenceImages && shouldUseOpenAiImageEndpoint(model)) {
        return resolveEndpoint(trimmed, 'image-edit', DEFAULT_API_ENDPOINT)
    }

    if (shouldUseOpenAiImageEndpoint(model)) {
        return resolveEndpoint(trimmed, 'image-generation', DEFAULT_API_ENDPOINT)
    }

    return resolveEndpoint(trimmed, 'chat', DEFAULT_API_ENDPOINT)
}

export function resolveModelEndpointCandidates(endpoint: string): string[] {
    const trimmed = endpoint.trim() || DEFAULT_API_ENDPOINT
    const candidates = new Set<string>()

    for (const candidate of [
        resolveModelsEndpoint(trimmed),
        resolveSiblingEndpoint(trimmed, 'models'),
        resolveSiblingEndpoint(trimmed, 'model'),
        resolveSiblingEndpoint(trimmed, 'models/list'),
        resolveSiblingEndpoint(trimmed, 'model/list'),
        resolveSiblingEndpoint(trimmed, 'list/models'),
        resolveSiblingEndpoint(trimmed, 'list/model')
    ]) {
        if (candidate) {
            candidates.add(candidate)
        }
    }

    return [...candidates]
}

export function getEndpointPath(endpoint: string): string {
    try {
        return normalizePath(new URL(endpoint).pathname)
    } catch {
        return normalizePath(endpoint)
    }
}

export function isGrsaiEndpoint(endpoint: string): boolean {
    try {
        return new URL(endpoint).hostname.toLowerCase().includes('grsai')
    } catch {
        return endpoint.toLowerCase().includes('grsai')
    }
}

export function isOpenAiImageModelId(model?: string): boolean {
    const normalized = model?.trim().toLowerCase() || ''
    return /gpt[\s_-]*image|gptimage|dall[\s_-]*e/.test(normalized)
}

export function normalizeEndpointPath(pathname: string): string {
    return normalizePath(pathname)
}

function resolveEndpoint(endpoint: string, purpose: EndpointPurpose, fallback: string): string {
    const trimmed = endpoint.trim() || fallback

    if (isCompleteEndpoint(trimmed)) {
        return trimmed
    }

    const suffix = getPurposeSuffix(purpose)

    try {
        const url = new URL(trimmed)
        url.pathname = appendPurposeSuffix(url.pathname, suffix)
        return url.toString()
    } catch {
        return appendPurposeSuffixToString(trimmed, suffix)
    }
}

function getPurposeSuffix(purpose: EndpointPurpose): string[] {
    if (purpose === 'image-edit') {
        return IMAGE_EDITS_SUFFIX
    }

    if (purpose === 'image-generation') {
        return IMAGE_GENERATIONS_SUFFIX
    }

    if (purpose === 'models') {
        return MODELS_SUFFIX
    }

    return CHAT_COMPLETIONS_SUFFIX
}

function shouldUseOpenAiImageEndpoint(model?: string): boolean {
    return isOpenAiImageModelId(model)
}

function resolveGrsaiGenerateEndpoint(endpoint: string): string {
    try {
        const url = new URL(endpoint)
        const path = normalizePath(url.pathname)
        if (path.endsWith('/v1/api/generate') || path.endsWith('/api/generate') || path.includes('/draw/')) {
            return url.toString()
        }

        url.pathname = appendPurposeSuffix(url.pathname, ['api', 'generate'])
        return url.toString()
    } catch {
        const base = endpoint.trim().replace(/\/+$/, '')
        if (base.endsWith('/v1/api/generate') || base.endsWith('/api/generate') || base.includes('/draw/')) {
            return base
        }

        if (base.endsWith('/v1')) {
            return `${base}/api/generate`
        }

        return `${base}/v1/api/generate`
    }
}

function isCompleteEndpoint(endpoint: string): boolean {
    const path = getEndpointPath(endpoint)

    return path.endsWith('/chat/completions') ||
        path.endsWith('/images/generations') ||
        path.endsWith('/images/edits') ||
        path.endsWith('/v1/api/generate') ||
        path.endsWith('/api/generate') ||
        path.endsWith('/completions') ||
        path.endsWith('/responses') ||
        (path.includes('/draw/') && !path.endsWith('/draw/result'))
}

function resolveModelsEndpoint(endpoint: string): string {
    try {
        const url = new URL(endpoint)
        const segments = getModelBaseSegments(url.pathname)
        url.pathname = '/' + [...segments, 'models'].join('/')
        return url.toString()
    } catch (error) {
        console.warn('Unable to resolve model endpoint; using fallback rule:', error)
        return appendPurposeSuffixToString(stripKnownEndpointSuffix(endpoint), MODELS_SUFFIX)
    }
}

export function resolveSiblingEndpoint(endpoint: string, siblingPath: string): string | null {
    try {
        const url = new URL(endpoint)
        const baseSegments = getModelBaseSegments(url.pathname)
        url.pathname = '/' + [...baseSegments, ...siblingPath.split('/').filter(Boolean)].join('/')
        return url.toString()
    } catch {
        return null
    }
}

function getModelBaseSegments(pathname: string): string[] {
    const segments = pathname.split('/').filter(Boolean)
    const normalized = segments.map(segment => segment.toLowerCase())

    if (endsWithSegments(normalized, ['chat', 'completions']) || endsWithSegments(normalized, ['images', 'generations']) || endsWithSegments(normalized, ['images', 'edits'])) {
        return segments.slice(0, -2)
    }

    if (segments.length && ['models', 'model', 'completions', 'generate', 'generations', 'edits', 'responses'].includes(normalized[normalized.length - 1])) {
        return segments.slice(0, -1)
    }

    if (!segments.length) {
        return ['v1']
    }

    return ensureVersionSegment(segments)
}

function appendPurposeSuffix(pathname: string, suffix: string[]): string {
    const segments = pathname.split('/').filter(Boolean)
    const baseSegments = ensureVersionSegment(segments)
    return '/' + [...baseSegments, ...suffix].join('/')
}

function appendPurposeSuffixToString(endpoint: string, suffix: string[]): string {
    const base = stripKnownEndpointSuffix(endpoint).replace(/\/+$/, '')
    const baseSegments = base.split('/').filter(Boolean)
    const normalized = baseSegments.map(segment => segment.toLowerCase())

    if (normalized[normalized.length - 1] === 'v1') {
        return `${base}/${suffix.join('/')}`
    }

    if (normalized[normalized.length - 1] === 'api') {
        return `${base}/v1/${suffix.join('/')}`
    }

    return `${base}/v1/${suffix.join('/')}`
}

function ensureVersionSegment(segments: string[]): string[] {
    if (!segments.length) {
        return ['v1']
    }

    const normalized = segments.map(segment => segment.toLowerCase())
    if (normalized[normalized.length - 1] === 'v1') {
        return segments
    }

    return [...segments, 'v1']
}

function stripKnownEndpointSuffix(endpoint: string): string {
    return endpoint
        .replace(/\/chat\/completions\/?$/i, '')
        .replace(/\/images\/(?:generations|edits)\/?$/i, '')
        .replace(/\/(?:models|model|completions|generate|generations|edits|responses)\/?$/i, '')
}

function endsWithSegments(segments: string[], suffix: string[]): boolean {
    if (segments.length < suffix.length) return false
    return suffix.every((segment, index) => segments[segments.length - suffix.length + index] === segment)
}

function normalizePath(pathname: string): string {
    return pathname.replace(/\/+$/, '').toLowerCase()
}
