import type { IdentityFidelity } from '../types'

export const DEFAULT_IDENTITY_FIDELITY: IdentityFidelity = 'balanced'

export const IDENTITY_FIDELITY_OPTIONS: ReadonlyArray<{
    value: IdentityFidelity
    label: string
    description: string
}> = [
    {
        value: 'free',
        label: '自由',
        description: '保留人物辨识度，允许明显改变发型、表情、角度、动作和造型。'
    },
    {
        value: 'balanced',
        label: '平衡',
        description: '保留核心身份，同时按目标画面重新生成自然的头部、身体和动作。'
    },
    {
        value: 'strict',
        label: '严格',
        description: '优先保持脸、发型和整体外观，只改变提示词明确要求的内容。'
    }
]

export const normalizeIdentityFidelity = (value: unknown): IdentityFidelity =>
    value === 'free' || value === 'balanced' || value === 'strict'
        ? value
        : DEFAULT_IDENTITY_FIDELITY

export const buildIdentityFidelityPrompt = (value: unknown): string => {
    const fidelity = normalizeIdentityFidelity(value)

    if (fidelity === 'free') {
        return 'Identity fidelity: flexible. Use character references to retain recognizable facial identity cues while freely reconstructing the face, hairstyle, expression, head angle, pose, body, and styling for the requested scene. The requested composition takes priority over the source portrait. Build one anatomically coherent person; avoid a copied or pasted head, a rigid frontal gaze, or mismatched head-to-body proportions.'
    }

    if (fidelity === 'strict') {
        return 'Identity fidelity: strict. Preserve the same person\'s facial geometry, age impression, skin tone, defining hairstyle, and overall appearance with high priority. Only change attributes explicitly requested by the prompt. Re-render the head, neck, and body as one anatomically coherent person for the requested perspective and lighting; avoid a copied or pasted head, and do not force the source portrait angle when the requested camera angle differs.'
    }

    return 'Identity fidelity: balanced. Preserve identity-defining facial relationships, age impression, and skin tone, but re-render the entire head and body naturally for the requested camera angle, expression, hairstyle, pose, lighting, and perspective. Requested changes take priority over the source portrait\'s frontal angle, expression, hairstyle, and crop. Avoid a copied or pasted head, rigid frontal gaze, frozen expression, or mismatched head-to-body proportions.'
}
