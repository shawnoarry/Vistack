import { describe, expect, it } from 'vitest'
import {
    CALENDAR_LAYOUT_CONSTRAINT,
    CALENDAR_LAYOUT_CONSTRAINTS,
    CALENDAR_NO_PEOPLE_CONSTRAINT,
    calendarSourceAllowsPeople,
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

    it('applies assigned style routes to the final prompts without repeating them in card copy', () => {
        const styleRoutes: CalendarStyleRoute[] = [
            { id: 'photo', label: '摄影路线', prompt: '真实摄影质感。' },
            { id: 'paint', label: '绘画路线', prompt: '手绘插画质感。' },
            { id: 'design', label: '设计路线', prompt: '实验平面设计。' }
        ]
        const options = parseCalendarPromptResponse(response, { styleRoutes })

        expect(options.map(option => option.style)).toEqual(['摄影路线', '绘画路线', '设计路线'])
        expect(options[0].prompt).toContain('真实摄影质感。')
        expect(options[0].creativePrompt).not.toContain('真实摄影质感。')
    })

    it('accepts fenced JSON responses', () => {
        const options = parseCalendarPromptResponse(`\`\`\`json\n${response}\n\`\`\``)
        expect(options.map(option => option.title)).toEqual(['几何', '拼贴', '静物'])
    })

    it('replaces unwanted people routes with non-figurative fallbacks', () => {
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

    it('allows at most one people route when the source calls for it', () => {
        const peopleResponse = JSON.stringify({
            options: [
                { title: '儿童', direction: '跳跃', prompt: '一群孩子在开阔草地上自然跳跃。', people: true },
                { title: '朋友', direction: '同行', prompt: '两个朋友沿着明亮街道同行。', people: true },
                { title: '风筝', direction: '风与色彩', prompt: '彩色风筝掠过安静天空，轻盈而自由。', people: false }
            ]
        })
        const options = parseCalendarPromptResponse(peopleResponse, { allowPeople: true, random: () => 0 })

        expect(options).toHaveLength(3)
        expect(options.filter(option => option.includesPeople)).toHaveLength(1)
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
})

describe('calendar style routes', () => {
    it('selects three distinct routes for automatic diversification', () => {
        const routes = selectCalendarStyleRoutes('diverse', () => 0)

        expect(routes).toHaveLength(3)
        expect(new Set(routes.map(route => route.id)).size).toBe(3)
    })

    it('keeps a selected style strategy within its route family', () => {
        const routes = selectCalendarStyleRoutes('photography', () => 0)

        expect(routes).toHaveLength(3)
        expect(routes.every(route => ['自然光摄影', '微距静物', '电影静帧', '实验摄影'].includes(route.label))).toBe(true)
    })
})
