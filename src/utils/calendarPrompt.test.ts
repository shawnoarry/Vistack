import { describe, expect, it } from 'vitest'
import {
    CALENDAR_LAYOUT_CONSTRAINT,
    CALENDAR_LAYOUT_CONSTRAINTS,
    CALENDAR_NO_PEOPLE_CONSTRAINT,
    calendarSourceAllowsPeople,
    isCurrentCalendarPromptRequest,
    parseCalendarPromptResponse,
    selectCalendarStyleRoutes,
    type CalendarStyleRoute
} from './calendarPrompt'

describe('calendar prompt context', () => {
    it('allows a people route only for explicit people or activity contexts', () => {
        expect(calendarSourceAllowsPeople('开心的人都不笨。', '儿童节')).toBe(true)
        expect(calendarSourceAllowsPeople('孩子们在山坡上奔跑。', '6月上旬')).toBe(true)
        expect(calendarSourceAllowsPeople('我总是黑白分明，而她是全部色彩。', '7月中旬')).toBe(false)
    })

    it('recognizes non-facing people expressions as explicit people context', () => {
        expect(calendarSourceAllowsPeople('远处一个人的背影停在海边。', '')).toBe(true)
        expect(calendarSourceAllowsPeople('只留下侧后方的剪影和伸出的手部。', '')).toBe(true)
    })
})

describe('calendar prompt response parsing', () => {
    const response = JSON.stringify({
        options: [
            { title: '几何', direction: '硬边与色彩', prompt: '黑白硬边结构被流动色彩打破，现代编辑插画，克制而非具象。', people: false },
            { title: '拼贴', direction: '纸张与透明层', prompt: '纸张、透明材质与不规则留白形成偶然的色彩关系，实验拼贴。', people: false },
            { title: '静物', direction: '物体与折射', prompt: '单色物体被彩色折射和阴影改变，安静的艺术静物。', people: false }
        ]
    })

    it('returns three short prompts with local calendar constraints', () => {
        const options = parseCalendarPromptResponse(response)

        expect(options).toHaveLength(3)
        expect(options[0].source).toBe('assistant')
        expect(options[0].prompt).toContain(options[0].creativePrompt)
        expect(options[0].prompt).toContain(CALENDAR_NO_PEOPLE_CONSTRAINT)
        expect(options[0].prompt).toContain(CALENDAR_LAYOUT_CONSTRAINT)
        expect(options[0].prompt).not.toContain('无字日历底图')
    })

    it('keeps each assigned style route bound to its final prompt without repeating it in card copy', () => {
        const styleRoutes: CalendarStyleRoute[] = [
            { id: 'photo', label: '摄影路线', prompt: '真实摄影质感。' },
            { id: 'paint', label: '绘画路线', prompt: '手绘插画质感。' },
            { id: 'design', label: '设计路线', prompt: '实验平面设计。' }
        ]
        const options = parseCalendarPromptResponse(response, { styleRoutes })

        expect(options.map(option => option.style)).toEqual(['摄影路线', '绘画路线', '设计路线'])
        expect(options.every((option, index) => option.prompt.includes(styleRoutes[index].prompt))).toBe(true)
        expect(options.every((option, index) => !option.creativePrompt.includes(styleRoutes[index].prompt))).toBe(true)
    })

    it('accepts fenced JSON responses', () => {
        const options = parseCalendarPromptResponse(`\`\`\`json\n${response}\n\`\`\``)
        expect(options.map(option => option.title)).toEqual(['几何', '拼贴', '静物'])
    })

    it('replaces unwanted people routes with person-free fallbacks', () => {
        const peopleResponse = JSON.stringify({
            options: [
                { title: '人物', direction: '情侣', prompt: '一对情侣站在彩色光线中。', people: true }
            ]
        })
        const options = parseCalendarPromptResponse(peopleResponse, { random: () => 0 })

        expect(options).toHaveLength(3)
        expect(options.every(option => !option.includesPeople)).toBe(true)
        expect(options.every(option => option.prompt.includes(CALENDAR_NO_PEOPLE_CONSTRAINT))).toBe(true)
    })

    it('keeps multiple non-facing people routes when people are allowed', () => {
        const peopleResponse = JSON.stringify({
            options: [
                { title: '背影', direction: '远望', prompt: '一个人的背影站在开阔海边，风吹动衣角，电影静帧般克制。', people: true },
                { title: '剪影', direction: '侧后方', prompt: '侧后方人物与树影重叠，只见清晰剪影和自然逆光。', people: true },
                { title: '手部', direction: '局部特写', prompt: '局部手部捧着一枚自然物，微距景深强调皮肤与材质触感。', people: true }
            ]
        })
        const options = parseCalendarPromptResponse(peopleResponse, { allowPeople: true, random: () => 0 })

        expect(options).toHaveLength(3)
        expect(options.filter(option => option.includesPeople)).toHaveLength(3)
        expect(options.every(option => !option.prompt.includes(CALENDAR_NO_PEOPLE_CONSTRAINT))).toBe(true)
    })

    it('falls back to three usable options for malformed responses', () => {
        const options = parseCalendarPromptResponse('not json', { random: () => 0 })
        expect(options).toHaveLength(3)
        expect(options.every(option => option.source === 'fallback')).toBe(true)
        expect(options.every(option => option.prompt.includes('9:16'))).toBe(true)
    })

    it('applies the selected 4:5 layout to assistant and fallback options', () => {
        const assistantOptions = parseCalendarPromptResponse(response, { aspectRatio: '4:5' })
        const fallbackOptions = parseCalendarPromptResponse('not json', { aspectRatio: '4:5', random: () => 0 })

        expect(assistantOptions.every(option => option.prompt.includes(CALENDAR_LAYOUT_CONSTRAINTS['4:5']))).toBe(true)
        expect(fallbackOptions.every(option => option.prompt.includes(CALENDAR_LAYOUT_CONSTRAINTS['4:5']))).toBe(true)
        expect(fallbackOptions.every(option => !option.prompt.includes('9:16'))).toBe(true)
    })

    it('keeps layout constraints flexible while retaining full-bleed calendar exclusions', () => {
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).toContain('满版底图')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).toContain('可偏置、出界或局部特写')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).toContain('底部约20%~25%')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).toContain('必须自然延续上方场景')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).toContain('不留空白、不做纯色块或明显分区')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).toContain('未叠加日历板时画面仍完整和谐')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).toContain('不出现文字、数字、日期、日历网格、Logo、水印或二维码')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).not.toContain('底部约三分之一')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).not.toContain('相对安静的区域')
        expect(CALENDAR_LAYOUT_CONSTRAINTS['9:16']).not.toContain('不要求纯空白')
    })
})

describe('calendar style routes', () => {
    it('selects three distinct routes for automatic diversification', () => {
        const routes = selectCalendarStyleRoutes('diverse', () => 0)

        expect(routes).toHaveLength(3)
        expect(new Set(routes.map(route => route.id)).size).toBe(3)
        expect(routes.every(route => route.label && route.prompt)).toBe(true)
    })

    it('keeps a selected style strategy within its route family', () => {
        const routes = selectCalendarStyleRoutes('photography', () => 0)

        expect(routes).toHaveLength(3)
        expect(routes.every(route => ['自然光摄影', '自然逆光', '微距静物', '电影静帧', '纪实胶片', '实验摄影'].includes(route.label))).toBe(true)
    })
})

describe('calendar prompt request versions', () => {
    it('only lets the current request release the loading state', () => {
        expect(isCurrentCalendarPromptRequest(7, 8)).toBe(false)
        expect(isCurrentCalendarPromptRequest(8, 8)).toBe(true)
    })
})
