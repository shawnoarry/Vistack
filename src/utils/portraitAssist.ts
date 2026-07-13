export interface PortraitAssistReference {
    index: number
    label: string
}

export type PortraitAssistUiState = 'unavailable' | 'available' | 'enabled'

export const resolvePortraitAssistUiState = (available: boolean, enabled: boolean): PortraitAssistUiState => {
    if (!available) return 'unavailable'
    return enabled ? 'enabled' : 'available'
}

export const portraitAssistIconTitle = (state: PortraitAssistUiState): string => {
    if (state === 'unavailable') return '合影助手（需至少 2 张人物参考图）'
    if (state === 'enabled') return '合影助手已启用'
    return '打开合影助手'
}

export const buildPortraitAssistPrompt = (input: {
    enabled: boolean
    available: boolean
    references: PortraitAssistReference[]
    pose: string
    relation: string
    extraPrompt: string
}): string => {
    if (!input.enabled || !input.available) return ''

    const roleText = input.references
        .map(reference => `${reference.label} from reference image ${reference.index + 1}`)
        .join(', ')

    return [
        `Create a coherent group photo featuring ${roleText}.`,
        `Interaction: ${input.pose}.`,
        `Relationship and mood: ${input.relation}.`,
        'Keep each person visually distinct and faithful to their own reference image. Do not merge identities, swap faces, or duplicate one character into another.',
        'Unify lighting, perspective, scale, and camera angle so the final image looks like one real shared scene.',
        input.extraPrompt.trim()
    ].filter(Boolean).join(' ')
}
