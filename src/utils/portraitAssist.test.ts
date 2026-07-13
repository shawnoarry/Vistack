import { describe, expect, it } from 'vitest'
import { buildPortraitAssistPrompt, portraitAssistIconTitle, resolvePortraitAssistUiState } from './portraitAssist'

describe('couple-photo assistant state', () => {
    it('distinguishes unavailable, available, and enabled states', () => {
        expect(resolvePortraitAssistUiState(false, false)).toBe('unavailable')
        expect(resolvePortraitAssistUiState(false, true)).toBe('unavailable')
        expect(resolvePortraitAssistUiState(true, false)).toBe('available')
        expect(resolvePortraitAssistUiState(true, true)).toBe('enabled')
    })

    it('uses concise tooltips for each state', () => {
        expect(portraitAssistIconTitle('unavailable')).toBe('合影助手（需至少 2 张人物参考图）')
        expect(portraitAssistIconTitle('available')).toBe('打开合影助手')
        expect(portraitAssistIconTitle('enabled')).toBe('合影助手已启用')
    })
})

describe('couple-photo prompt composition', () => {
    const input = {
        enabled: true,
        available: true,
        references: [
            { index: 0, label: '角色1' },
            { index: 2, label: '角色2' }
        ],
        pose: 'standing side by side',
        relation: 'natural friendly group portrait',
        extraPrompt: ' look at the camera '
    }

    it('preserves the existing composed prompt text', () => {
        expect(buildPortraitAssistPrompt(input)).toBe(
            'Create a coherent group photo featuring 角色1 from reference image 1, 角色2 from reference image 3. ' +
            'Interaction: standing side by side. ' +
            'Relationship and mood: natural friendly group portrait. ' +
            'Keep each person visually distinct and faithful to their own reference image. Do not merge identities, swap faces, or duplicate one character into another. ' +
            'Unify lighting, perspective, scale, and camera angle so the final image looks like one real shared scene. ' +
            'look at the camera'
        )
    })

    it('does not compose a prompt while disabled or unavailable', () => {
        expect(buildPortraitAssistPrompt({ ...input, enabled: false })).toBe('')
        expect(buildPortraitAssistPrompt({ ...input, available: false })).toBe('')
    })
})
