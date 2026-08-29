import type { PromptPhrase } from '../data/promptPhrases'

const removeExactPhrase = (prompt: string, phrase: string) => {
    let nextPrompt = prompt
    let phraseIndex = nextPrompt.indexOf(phrase)

    while (phraseIndex !== -1) {
        const before = nextPrompt.slice(0, phraseIndex)
        const after = nextPrompt.slice(phraseIndex + phrase.length)

        if (/[,，。；;]\s*$/.test(before)) {
            nextPrompt = `${before.replace(/[,，。；;]\s*$/, '')}${after}`
        } else if (/^\s*[,，。；;]/.test(after)) {
            nextPrompt = `${before}${after.replace(/^\s*[,，。；;]\s*/, '')}`
        } else {
            nextPrompt = `${before}${after}`
        }

        phraseIndex = nextPrompt.indexOf(phrase)
    }

    return nextPrompt.trim()
}

export const composePromptWithPhrase = (
    currentPrompt: string,
    phrase: PromptPhrase,
    availablePhrases: PromptPhrase[]
) => {
    let nextPrompt = currentPrompt.trim()

    if (phrase.conflictGroup) {
        for (const candidate of availablePhrases) {
            if (candidate.value !== phrase.value && candidate.conflictGroup === phrase.conflictGroup) {
                nextPrompt = removeExactPhrase(nextPrompt, candidate.value)
            }
        }
    }

    if (nextPrompt.includes(phrase.value)) return nextPrompt
    if (!nextPrompt) return phrase.value
    const separator = /[。！？.!?]\s*$/.test(nextPrompt) ? '' : '。'
    return `${nextPrompt}${separator}${phrase.value}`
}
