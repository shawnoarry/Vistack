export interface CalendarPromptOption {
    id: string
    title: string
    direction: string
    style: string
    creativePrompt: string
    prompt: string
    includesPeople: boolean
    source: 'assistant' | 'fallback'
}

export type CalendarAspectRatio = '9:16' | '4:5'
export type CalendarPeopleStrategy = 'avoid' | 'auto' | 'allow'
export type CalendarStyleStrategy = 'diverse' | 'photography' | 'illustration' | 'experimental'

export interface CalendarStyleRoute {
    id: string
    label: string
    prompt: string
}

interface RawCalendarPromptOption {
    title?: unknown
    direction?: unknown
    prompt?: unknown
    people?: unknown
}

interface ParseCalendarPromptOptions {
    allowPeople?: boolean
    aspectRatio?: CalendarAspectRatio
    styleRoutes?: CalendarStyleRoute[]
    random?: () => number
}

const MAX_CREATIVE_PROMPT_LENGTH = 120
const PERSON_TERMS = /人物|人脸|人形|情侣|伴侣|男人|女人|男孩|女孩|男性|女性|老人|孩子|儿童|夫妇|夫妻|肖像|人像|背影|身影|\bperson\b|\bpeople\b|\bportrait\b|\bcouple\b|\bman\b|\bwoman\b/i
const EXPLICIT_PEOPLE_CONTEXT = /孩子|儿童|少年|少女|男孩|女孩|老人|母亲|妈妈|父亲|爸爸|老师|同学|朋友|人群|人物|青年|跳跃|奔跑|拥抱|牵手|合影|儿童节|母亲节|父亲节|教师节/

export const CALENDAR_LAYOUT_CONSTRAINTS: Record<CalendarAspectRatio, string> = {
    '9:16': '9:16竖幅构图，视觉重心位于中上部，重要主体远离边缘，底部约三分之一保持简洁低细节；画面内不出现文字、数字、日期、日历网格、Logo、水印或二维码。',
    '4:5': '4:5竖幅构图，视觉重心位于中上部，重要主体远离边缘，底部约四分之一保持简洁低细节；画面内不出现文字、数字、日期、日历网格、Logo、水印或二维码。'
}
export const CALENDAR_LAYOUT_CONSTRAINT = CALENDAR_LAYOUT_CONSTRAINTS['9:16']
export const CALENDAR_NO_PEOPLE_CONSTRAINT = '不出现人物、人脸或人形轮廓。'

const styleRoutePools: Record<Exclude<CalendarStyleStrategy, 'diverse'>, CalendarStyleRoute[]> = {
    photography: [
        { id: 'natural-photography', label: '自然光摄影', prompt: '真实自然光摄影，保留可信的空间、光线和材质细节。' },
        { id: 'macro-still-life', label: '微距静物', prompt: '真实微距静物摄影，强调触感、尺度变化和景深层次。' },
        { id: 'cinematic-frame', label: '电影静帧', prompt: '电影静帧式摄影，以克制光影和真实空间层次组织画面。' },
        { id: 'experimental-photography', label: '实验摄影', prompt: '实验摄影，通过折射、投影或动态模糊形成真实可拍摄的画面。' }
    ],
    illustration: [
        { id: 'transparent-watercolor', label: '透明水彩', prompt: '透明水彩插画，以水色晕染和纸张肌理建立轻盈层次。' },
        { id: 'gouache-painting', label: '厚涂绘画', prompt: '厚涂绘画质感，以清晰笔触和颜料堆叠塑造画面。' },
        { id: 'colored-pencil', label: '彩铅手绘', prompt: '彩铅手绘插画，保留细密排线、纸面触感和克制色层。' },
        { id: 'printmaking', label: '版画插画', prompt: '版画插画质感，以套色、刻痕和有限色层组织画面。' }
    ],
    experimental: [
        { id: 'material-collage', label: '材料拼贴', prompt: '实验材料拼贴，以纸张、透明材质和层叠边缘构成画面。' },
        { id: 'paper-relief', label: '纸雕构成', prompt: '纸雕与浮雕构成，通过切面、投影和层级关系建立空间。' },
        { id: 'screen-print', label: '丝网印刷', prompt: '丝网印刷与平面设计语言，以套色错位和颗粒网点形成层次。' },
        { id: 'material-render', label: '三维材质', prompt: '克制的三维材质表现，以半透明、磨砂或流体表面建立触感。' }
    ]
}

const fallbackCores = [
    {
        title: '几何抽象',
        direction: '硬边结构 × 流动色彩',
        prompt: '用彼此冲突又互相改变的几何关系转译文案，让克制秩序被少量流动色彩打破。现代编辑插画，非具象、平面而有留白。'
    },
    {
        title: '材料拼贴',
        direction: '纸张 × 透明材质',
        prompt: '把文案化成纸张、透明材质与留白之间的关系，让色彩像偶然发生的变化。实验拼贴，简洁、有触感，避免卡通感。'
    },
    {
        title: '光影静物',
        direction: '单色物体 × 彩色折射',
        prompt: '用单色物体与彩色折射、阴影或反光表达文案中的关系。艺术静物，含蓄、克制，不做商品广告。'
    },
    {
        title: '自然变奏',
        direction: '单色形态 × 色彩生长',
        prompt: '让单色自然形态逐渐出现不规则色彩，表达被另一种存在改变的感觉。抽象自然观察，安静、有呼吸感。'
    },
    {
        title: '版画实验',
        direction: '线条 × 透明色层',
        prompt: '把文案转成色块、线条和透明层的自由组合，保留冲突与温度。丝网印刷与版画质感，克制、非具象。'
    }
]

const readString = (value: unknown): string => typeof value === 'string' ? value.trim() : ''

const clipCreativePrompt = (value: string): string => {
    const normalized = value.replace(/\s+/g, ' ').trim()
    if (normalized.length <= MAX_CREATIVE_PROMPT_LENGTH) return normalized

    const clipped = normalized.slice(0, MAX_CREATIVE_PROMPT_LENGTH)
    const punctuationIndex = Math.max(
        clipped.lastIndexOf('。'),
        clipped.lastIndexOf('；'),
        clipped.lastIndexOf('，')
    )
    return (punctuationIndex >= 56 ? clipped.slice(0, punctuationIndex + 1) : clipped).trim()
}

const stripJsonFence = (value: string): string => {
    const trimmed = value.trim()
    const withoutFence = trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim()
    const objectStart = withoutFence.indexOf('{')
    const objectEnd = withoutFence.lastIndexOf('}')
    if (objectStart >= 0 && objectEnd > objectStart) {
        return withoutFence.slice(objectStart, objectEnd + 1)
    }
    return withoutFence
}

const shuffle = <T>(items: T[], random: () => number): T[] => {
    const next = [...items]
    for (let index = next.length - 1; index > 0; index -= 1) {
        const target = Math.floor(random() * (index + 1))
        const current = next[index]
        next[index] = next[target]
        next[target] = current
    }
    return next
}

export const selectCalendarStyleRoutes = (
    strategy: CalendarStyleStrategy,
    random: () => number = Math.random
): CalendarStyleRoute[] => {
    if (strategy !== 'diverse') {
        return shuffle(styleRoutePools[strategy], random).slice(0, 3)
    }

    const routes = (['photography', 'illustration', 'experimental'] as const).map(group => {
        const pool = styleRoutePools[group]
        return pool[Math.floor(random() * pool.length)] || pool[0]
    })
    return shuffle(routes, random)
}

const composeCalendarPrompt = (
    creativePrompt: string,
    stylePrompt: string,
    includesPeople: boolean,
    aspectRatio: CalendarAspectRatio
): string => [
    stylePrompt,
    creativePrompt,
    includesPeople ? '' : CALENDAR_NO_PEOPLE_CONSTRAINT,
    CALENDAR_LAYOUT_CONSTRAINTS[aspectRatio]
].filter(Boolean).join(' ')

const normalizeOption = (
    raw: RawCalendarPromptOption,
    index: number,
    allowPeople: boolean,
    aspectRatio: CalendarAspectRatio,
    styleRoute?: CalendarStyleRoute
): CalendarPromptOption | null => {
    const creativePrompt = clipCreativePrompt(readString(raw.prompt))
    if (!creativePrompt) return null

    const requestedPeople = raw.people === true
    const hasPersonTerms = PERSON_TERMS.test(creativePrompt)
    const includesPeople = allowPeople && requestedPeople
    if (hasPersonTerms && !includesPeople) return null

    return {
        id: `calendar-option-${index + 1}`,
        title: readString(raw.title) || `方案 ${index + 1}`,
        direction: readString(raw.direction) || '自由视觉',
        style: styleRoute?.label || '自由风格',
        creativePrompt,
        prompt: composeCalendarPrompt(creativePrompt, styleRoute?.prompt || '', includesPeople, aspectRatio),
        includesPeople,
        source: 'assistant'
    }
}

const buildFallbackOptions = (
    count: number,
    usedPrompts: Set<string>,
    startIndex: number,
    aspectRatio: CalendarAspectRatio,
    styleRoutes: CalendarStyleRoute[],
    random: () => number
): CalendarPromptOption[] => shuffle(fallbackCores, random)
    .filter(item => !usedPrompts.has(item.prompt))
    .slice(0, count)
    .map((item, index) => ({
        id: `calendar-fallback-${startIndex + index + 1}`,
        title: item.title,
        direction: item.direction,
        style: styleRoutes[startIndex + index]?.label || item.title,
        creativePrompt: item.prompt,
        prompt: composeCalendarPrompt(item.prompt, styleRoutes[startIndex + index]?.prompt || '', false, aspectRatio),
        includesPeople: false,
        source: 'fallback' as const
    }))

export const calendarSourceAllowsPeople = (sourceCopy: string, timeContext: string): boolean =>
    EXPLICIT_PEOPLE_CONTEXT.test(`${sourceCopy}\n${timeContext}`)

export const parseCalendarPromptResponse = (
    value: string,
    options: ParseCalendarPromptOptions = {}
): CalendarPromptOption[] => {
    const allowPeople = options.allowPeople === true
    const aspectRatio = options.aspectRatio || '9:16'
    const styleRoutes = options.styleRoutes || []
    const random = options.random || Math.random
    let rawOptions: RawCalendarPromptOption[] = []

    try {
        const parsed = JSON.parse(stripJsonFence(value)) as { options?: unknown } | unknown[]
        const candidate = Array.isArray(parsed) ? parsed : parsed.options
        if (Array.isArray(candidate)) {
            rawOptions = candidate as RawCalendarPromptOption[]
        }
    } catch {
        rawOptions = []
    }

    const normalized: CalendarPromptOption[] = []
    let peopleOptionUsed = false

    for (const raw of rawOptions) {
        const option = normalizeOption(raw, normalized.length, allowPeople && !peopleOptionUsed, aspectRatio, styleRoutes[normalized.length])
        if (!option || normalized.some(item => item.creativePrompt === option.creativePrompt)) continue
        if (option.includesPeople) peopleOptionUsed = true
        normalized.push(option)
        if (normalized.length === 3) break
    }

    if (normalized.length < 3) {
        const usedPrompts = new Set(normalized.map(item => item.creativePrompt))
        normalized.push(...buildFallbackOptions(3 - normalized.length, usedPrompts, normalized.length, aspectRatio, styleRoutes, random))
    }

    return normalized.slice(0, 3)
}
