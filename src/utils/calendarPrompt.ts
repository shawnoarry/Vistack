export interface CalendarPromptOption {
    id: string
    title: string
    direction: string
    creativePrompt: string
    prompt: string
    includesPeople: boolean
    source: 'assistant' | 'fallback'
}

export type CalendarAspectRatio = '9:16' | '4:5'

interface RawCalendarPromptOption {
    title?: unknown
    direction?: unknown
    prompt?: unknown
    people?: unknown
}

interface ParseCalendarPromptOptions {
    allowPeople?: boolean
    aspectRatio?: CalendarAspectRatio
    random?: () => number
}

const MAX_CREATIVE_PROMPT_LENGTH = 120
const PERSON_TERMS = /人物|人脸|人形|情侣|伴侣|男人|女人|男孩|女孩|男性|女性|老人|孩子|儿童|夫妇|夫妻|肖像|人像|背影|身影|\bperson\b|\bpeople\b|\bportrait\b|\bcouple\b|\bman\b|\bwoman\b/i
const EXPLICIT_PEOPLE_CONTEXT = /孩子|儿童|少年|少女|男孩|女孩|老人|母亲|妈妈|父亲|爸爸|老师|同学|朋友|人群|人物|青年|跳跃|奔跑|拥抱|牵手|合影|儿童节|母亲节|父亲节|教师节/

export const CALENDAR_LAYOUT_CONSTRAINTS: Record<CalendarAspectRatio, string> = {
    '9:16': '9:16竖幅无字日历底图，视觉重心位于中上部，重要主体远离边缘，底部约三分之一保持低细节；不出现文字、数字、Logo、水印、二维码或日历。',
    '4:5': '4:5竖幅无字日历底图，视觉重心位于中上部，重要主体远离边缘，底部约四分之一保持低细节；不出现文字、数字、Logo、水印、二维码或日历。'
}
export const CALENDAR_LAYOUT_CONSTRAINT = CALENDAR_LAYOUT_CONSTRAINTS['9:16']
export const CALENDAR_NO_PEOPLE_CONSTRAINT = '不出现人物、人脸或人形轮廓。'

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

const composeCalendarPrompt = (creativePrompt: string, includesPeople: boolean, aspectRatio: CalendarAspectRatio): string => [
    creativePrompt,
    includesPeople ? '' : CALENDAR_NO_PEOPLE_CONSTRAINT,
    CALENDAR_LAYOUT_CONSTRAINTS[aspectRatio]
].filter(Boolean).join(' ')

const normalizeOption = (
    raw: RawCalendarPromptOption,
    index: number,
    allowPeople: boolean,
    aspectRatio: CalendarAspectRatio
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
        creativePrompt,
        prompt: composeCalendarPrompt(creativePrompt, includesPeople, aspectRatio),
        includesPeople,
        source: 'assistant'
    }
}

const buildFallbackOptions = (
    count: number,
    usedPrompts: Set<string>,
    startIndex: number,
    aspectRatio: CalendarAspectRatio,
    random: () => number
): CalendarPromptOption[] => shuffle(fallbackCores, random)
    .filter(item => !usedPrompts.has(item.prompt))
    .slice(0, count)
    .map((item, index) => ({
        id: `calendar-fallback-${startIndex + index + 1}`,
        title: item.title,
        direction: item.direction,
        creativePrompt: item.prompt,
        prompt: composeCalendarPrompt(item.prompt, false, aspectRatio),
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
        const option = normalizeOption(raw, normalized.length, allowPeople && !peopleOptionUsed, aspectRatio)
        if (!option || normalized.some(item => item.creativePrompt === option.creativePrompt)) continue
        if (option.includesPeople) peopleOptionUsed = true
        normalized.push(option)
        if (normalized.length === 3) break
    }

    if (normalized.length < 3) {
        const usedPrompts = new Set(normalized.map(item => item.creativePrompt))
        normalized.push(...buildFallbackOptions(3 - normalized.length, usedPrompts, normalized.length, aspectRatio, random))
    }

    return normalized.slice(0, 3)
}
