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
const PERSON_TERMS = /人物|人脸|人形|人体|情侣|伴侣|男人|女人|男孩|女孩|男性|女性|老人|孩子|儿童|夫妇|夫妻|肖像|人像|背影|侧后方|侧影|剪影|身影|手部|手指|手掌|半身|局部身体|\bperson\b|\bpeople\b|\bportrait\b|\bcouple\b|\bman\b|\bwoman\b|\bhuman\b|\bfigure\b|\bsilhouette\b|\bback view\b|\brear view\b|\bside profile\b|\bpartial body\b|\bhand(?:s)?\b/i
const EXPLICIT_PEOPLE_CONTEXT = /孩子|儿童|少年|少女|男孩|女孩|老人|母亲|妈妈|父亲|爸爸|老师|同学|朋友|人群|人物|人脸|人体|青年|背影|侧后方|侧影|剪影|身影|手部|手指|半身|局部身体|跳跃|奔跑|拥抱|牵手|合影|儿童节|母亲节|父亲节|教师节|\bperson\b|\bpeople\b|\bportrait\b|\bcouple\b|\bman\b|\bwoman\b|\bhuman\b|\bsilhouette\b|\bback view\b|\bside profile\b/i

export const CALENDAR_BOTTOM_DETAIL_CONSTRAINT = '画面底部约20%~25%保持较低视觉密度，以连续大形、柔和纹理和少量环境层次为主，避免密集小物件、复杂纹理和高对比焦点，方便后期叠加日历板但不要求纯空白'

export const CALENDAR_LAYOUT_CONSTRAINTS: Record<CalendarAspectRatio, string> = {
    '9:16': '9:16竖幅满版底图，主体位置、景别和尺度可灵活变化，可偏置、出界或局部特写；保留一处相对安静的区域供后期排版，' + CALENDAR_BOTTOM_DETAIL_CONSTRAINT + '；画面内不出现文字、数字、日期、日历网格、Logo、水印或二维码。',
    '4:5': '4:5竖幅满版底图，主体位置、景别和尺度可灵活变化，可偏置、出界或局部特写；保留一处相对安静的区域供后期排版，' + CALENDAR_BOTTOM_DETAIL_CONSTRAINT + '；画面内不出现文字、数字、日期、日历网格、Logo、水印或二维码。'
}
export const CALENDAR_LAYOUT_CONSTRAINT = CALENDAR_LAYOUT_CONSTRAINTS['9:16']
export const CALENDAR_NO_PEOPLE_CONSTRAINT = '不出现人物、人物局部、手部、人脸或可辨认的人形/人体轮廓。'

export const isCurrentCalendarPromptRequest = (requestVersion: number, currentRequestVersion: number): boolean =>
    requestVersion === currentRequestVersion

const styleRoutePools: Record<Exclude<CalendarStyleStrategy, 'diverse'>, CalendarStyleRoute[]> = {
    photography: [
        { id: 'cinematic-frame', label: '电影静帧', prompt: '电影静帧式摄影，以克制光影和真实空间层次组织画面。' },
        { id: 'documentary-film', label: '纪实胶片', prompt: '纪实摄影与胶片颗粒，保留自然瞬间、真实材质和不摆拍的观察感。' },
        { id: 'natural-photography', label: '自然光摄影', prompt: '自然光摄影，保留可信的空间、光线变化和材质细节，不做广告化布光。' },
        { id: 'backlit-photography', label: '自然逆光', prompt: '自然逆光摄影，利用轮廓光、透射光和空气层次塑造真实场景。' },
        { id: 'macro-still-life', label: '微距静物', prompt: '真实微距静物摄影，强调触感、尺度变化、局部细节和景深层次。' },
        { id: 'experimental-photography', label: '实验摄影', prompt: '实验摄影，通过折射、投影、长曝光或动态模糊形成有物理依据的画面。' }
    ],
    illustration: [
        { id: 'transparent-watercolor', label: '透明水彩', prompt: '透明水彩插画，以水色晕染和纸张肌理建立轻盈层次。' },
        { id: 'gouache-painting', label: '厚涂绘画', prompt: '厚涂绘画质感，以清晰笔触和颜料堆叠塑造画面。' },
        { id: 'colored-pencil', label: '彩铅手绘', prompt: '彩铅手绘插画，保留细密排线、纸面触感和克制色层。' },
        { id: 'printmaking', label: '版画插画', prompt: '版画插画质感，以套色、刻痕、压印边缘和有限色层组织画面。' },
        { id: 'comic-storyboard', label: '漫画分镜', prompt: '漫画分镜式插画，以明确形体、动作节奏和视线关系组织画面，不使用对白框或拟声字。' },
        { id: 'picture-book', label: '绘本插画', prompt: '绘本插画语言，以具体场景、温和笔触和可想象的空间层次建立叙事感。' }
    ],
    experimental: [
        { id: 'material-collage', label: '材料拼贴', prompt: '实验材料拼贴，以纸张、透明材质和层叠边缘构成画面。' },
        { id: 'paper-relief', label: '纸雕构成', prompt: '纸雕与浮雕构成，通过切面、投影和层级关系建立空间。' },
        { id: 'screen-print', label: '丝网印刷', prompt: '丝网印刷与平面设计语言，以套色错位、颗粒网点和有限色块形成层次。' },
        { id: 'graphic-composition', label: '实验平面构成', prompt: '实验平面构成，以具体物件或自然形态、尺度关系和有限色块组织画面，不依赖文字装饰。' },
        { id: 'material-render', label: '三维材质', prompt: '克制的三维材质表现，以半透明、磨砂、流体表面或硬质切面建立触感。' }
    ]
}

const fallbackCores = [
    {
        title: '光影场景',
        direction: '具体空间 × 克制光影',
        prompt: '从文案中提取一个具体空间、自然物或静物作为视觉锚点，让它处在有层次的光影场景中，含蓄而不广告化。'
    },
    {
        title: '纪实片段',
        direction: '日常观察 × 胶片颗粒',
        prompt: '把文案转成一个可观察的日常或自然片段，保留真实材质、偶然构图和胶片颗粒，不摆拍、不写成完整故事。'
    },
    {
        title: '自然逆光',
        direction: '轮廓光 × 空气层次',
        prompt: '选择一种具体自然物或场景，让逆光、透射光与空气变化承载文案情绪，画面有呼吸感，避免符号堆叠。'
    },
    {
        title: '微距静物',
        direction: '触感细节 × 景深',
        prompt: '用一个具体静物或自然细节承载文案语义，放大表面纹理、触感与尺度错觉，保持安静而有观察性。'
    },
    {
        title: '水色晕染',
        direction: '水彩纸面 × 具体意象',
        prompt: '以文案中的具体意象为画面锚点，让透明水色、纸张纹理和适度留白形成轻盈层次，避免泛泛的梦幻装饰。'
    },
    {
        title: '厚涂色层',
        direction: '颜料笔触 × 形体关系',
        prompt: '把文案转译为可辨认的物件、自然形态或空间，用厚重笔触和色层变化塑造形体，不堆叠无关元素。'
    },
    {
        title: '漫画节奏',
        direction: '形体动作 × 画面节奏',
        prompt: '从文案提取一个明确的动作、物件或场景，以漫画式形体和节奏组织画面，不依赖对白、标题或套路化恋爱海报。'
    },
    {
        title: '绘本观察',
        direction: '叙事空间 × 温和笔触',
        prompt: '用一个具体场景或自然观察建立绘本般的空间关系，保留可想象的空白和温度，不展开完整故事。'
    },
    {
        title: '纸张拼贴',
        direction: '材质层叠 × 语义联想',
        prompt: '把具体意象拆成纸张、透明层和边缘关系重新组合，保留手工痕迹与清晰主次，避免无意义的几何堆砌。'
    },
    {
        title: '纸雕空间',
        direction: '切面投影 × 层级景深',
        prompt: '将文案中的具体意象转成纸雕或浅浮雕空间，以切面、投影和前后层级形成可触的景深，构图克制。'
    },
    {
        title: '套色版画',
        direction: '刻痕线条 × 有限色层',
        prompt: '以具体物件、自然形态或空间为主体，用刻痕、套色和有限色层表达文案，保留印刷错位与手工温度。'
    },
    {
        title: '丝网套色',
        direction: '网点色块 × 平面秩序',
        prompt: '选择一个明确视觉锚点，用丝网印刷的网点、套色错位和有限色块建立平面层次，不使用文字或装饰堆砌。'
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

    const hasPersonTerms = PERSON_TERMS.test(creativePrompt)
    const requestedPeople = raw.people === true
    const includesPeople = allowPeople && (requestedPeople || hasPersonTerms)
    if (!allowPeople && (requestedPeople || hasPersonTerms)) return null

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

    for (const raw of rawOptions) {
        const option = normalizeOption(raw, normalized.length, allowPeople, aspectRatio, styleRoutes[normalized.length])
        if (!option || normalized.some(item => item.creativePrompt === option.creativePrompt)) continue
        normalized.push(option)
        if (normalized.length === 3) break
    }

    if (normalized.length < 3) {
        const usedPrompts = new Set(normalized.map(item => item.creativePrompt))
        normalized.push(...buildFallbackOptions(3 - normalized.length, usedPrompts, normalized.length, aspectRatio, styleRoutes, random))
    }

    return normalized.slice(0, 3)
}
