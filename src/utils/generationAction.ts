export type GenerationMode = 'image' | 'text'

export const resolveGenerationMode = (referenceCount: number): GenerationMode =>
    referenceCount > 0 ? 'image' : 'text'

export const buildGenerationActionLabel = (mode: GenerationMode, hasRunningTask: boolean): string => {
    const modeLabel = mode === 'image' ? '图生图' : '文生图'
    return hasRunningTask ? `继续${modeLabel}` : modeLabel
}
