<template>
    <Teleport to="body" :disabled="desktop">
        <div
            v-if="open"
            class="fixed inset-0 z-50 flex items-end bg-brand-ink/55 lg:absolute lg:inset-auto lg:bottom-[calc(100%+10px)] lg:right-4 lg:z-40 lg:block lg:w-[780px] lg:max-w-[calc(100vw-32px)] lg:bg-transparent 2xl:right-6"
            @click.self="emitClose"
        >
            <section
                id="calendar-prompt-assistant"
                role="dialog"
                aria-modal="true"
                aria-labelledby="calendar-prompt-title"
                data-testid="calendar-prompt-assistant"
                class="max-h-[90vh] w-full overflow-y-auto rounded-t-lg border border-brand-line bg-white p-4 shadow-2xl shadow-black/25 dark:border-night-muted/35 dark:bg-night-surface dark:text-brand-surface lg:max-h-[calc(100vh-280px)] lg:rounded-lg"
            >
                <header class="flex items-start justify-between gap-3 border-b border-brand-line pb-3 dark:border-night-muted/35">
                    <div class="min-w-0">
                        <p class="wb-label text-brand-accent">Calendar prompt</p>
                        <h2 id="calendar-prompt-title" class="mt-1 text-base font-semibold text-brand-ink dark:text-brand-surface">日历配图助手</h2>
                    </div>
                    <button
                        ref="closeButtonRef"
                        type="button"
                        class="wb-icon-button"
                        title="关闭日历配图助手"
                        aria-label="关闭日历配图助手"
                        @click="emitClose"
                    >
                        <X :size="16" :stroke-width="1.8" aria-hidden="true" />
                    </button>
                </header>

                <div class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.45fr)_minmax(210px,0.55fr)]">
                    <label class="min-w-0">
                        <span class="wb-label mb-1 block">文案</span>
                        <textarea
                            :value="sourceCopy"
                            data-testid="calendar-source-copy"
                            class="wb-input min-h-[112px] w-full resize-y py-2.5 leading-6"
                            placeholder="粘贴文案，可包含作者和作品信息"
                            @input="$emit('update:sourceCopy', ($event.target as HTMLTextAreaElement).value)"
                        />
                    </label>

                    <div class="flex min-w-0 flex-col gap-3">
                        <label class="min-w-0">
                            <span class="wb-label mb-1 block">时间语境</span>
                            <input
                                :value="timeContext"
                                data-testid="calendar-time-context"
                                class="wb-input w-full"
                                placeholder="中秋节、7月中旬、周五傍晚"
                                @input="$emit('update:timeContext', ($event.target as HTMLInputElement).value)"
                            />
                        </label>

                        <div class="mt-auto space-y-2.5">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="wb-label">画幅</span>
                                    <div class="grid grid-cols-2 rounded-md border border-brand-line bg-brand-surface p-0.5 text-xs font-semibold dark:border-night-muted/35 dark:bg-night-panel" role="group" aria-label="日历底图画幅">
                                        <button
                                            v-for="ratio in aspectRatios"
                                            :key="ratio"
                                            type="button"
                                            class="min-h-7 min-w-12 rounded px-2 transition-colors"
                                            :class="aspectRatio === ratio ? 'bg-brand-ink text-white dark:bg-brand-surface dark:text-brand-ink' : 'text-brand-muted hover:text-brand-ink dark:text-night-muted dark:hover:text-brand-surface'"
                                            :aria-pressed="aspectRatio === ratio"
                                            @click="$emit('update:aspectRatio', ratio)"
                                        >
                                            {{ ratio }}
                                        </button>
                                    </div>
                                </div>
                                <span class="wb-chip">三组 · 非人物优先</span>
                            </div>

                            <div class="flex justify-end">
                                <button
                                    type="button"
                                    data-testid="calendar-draw-button"
                                    class="wb-primary min-h-10 gap-2 px-3"
                                    :disabled="!canDraw"
                                    @click="$emit('draw')"
                                >
                                    <RefreshCw v-if="loading" :size="15" :stroke-width="1.8" class="animate-spin" aria-hidden="true" />
                                    <Shuffle v-else :size="15" :stroke-width="1.8" aria-hidden="true" />
                                    {{ loading ? '正在构思' : options.length ? '再抽 3 组' : '抽取 3 组' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <p v-if="!assistantReady" class="mt-3 rounded-md border border-brand-accent/25 bg-brand-accent/10 px-3 py-2 text-xs leading-5 text-brand-accent">
                    请先配置提示词助手 URL、Key 和 Model。
                </p>
                <p v-else-if="error" class="mt-3 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-3 py-2 text-xs leading-5 text-brand-accent" role="alert">
                    {{ error }}
                </p>

                <div v-if="loading" class="mt-4 grid gap-2 sm:grid-cols-3" aria-live="polite" aria-label="正在生成日历配图提示词">
                    <div v-for="index in 3" :key="index" class="min-h-[168px] animate-pulse rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-panel">
                        <div class="h-3 w-20 rounded bg-brand-line dark:bg-night-muted/25" />
                        <div class="mt-4 h-2.5 w-full rounded bg-brand-line/80 dark:bg-night-muted/20" />
                        <div class="mt-2 h-2.5 w-11/12 rounded bg-brand-line/80 dark:bg-night-muted/20" />
                        <div class="mt-2 h-2.5 w-4/5 rounded bg-brand-line/80 dark:bg-night-muted/20" />
                    </div>
                </div>

                <div v-else-if="options.length" class="mt-4 grid gap-2 sm:grid-cols-3" data-testid="calendar-prompt-options">
                    <article
                        v-for="option in options"
                        :key="option.id"
                        class="flex min-h-[190px] flex-col rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-panel"
                    >
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <h3 class="truncate text-sm font-semibold text-brand-ink dark:text-brand-surface">{{ option.title }}</h3>
                                <p class="mt-1 truncate text-[11px] font-medium text-brand-accent" :title="option.direction">{{ option.direction }}</p>
                            </div>
                            <span v-if="option.source === 'fallback'" class="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-brand-muted dark:bg-night-surface dark:text-night-muted">安全补位</span>
                        </div>

                        <p class="mt-3 line-clamp-5 text-xs leading-5 text-brand-muted dark:text-night-muted" :title="option.prompt">{{ option.prompt }}</p>

                        <button
                            type="button"
                            class="wb-secondary mt-auto min-h-9 gap-1.5 px-2 text-xs"
                            @click="$emit('apply', option)"
                        >
                            <ArrowDownToLine :size="14" :stroke-width="1.8" aria-hidden="true" />
                            写入主提示词
                        </button>
                    </article>
                </div>
            </section>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowDownToLine, RefreshCw, Shuffle, X } from '@lucide/vue'
import type { CalendarAspectRatio, CalendarPromptOption } from '../utils/calendarPrompt'

const props = defineProps<{
    open: boolean
    desktop: boolean
    assistantReady: boolean
    loading: boolean
    error: string
    sourceCopy: string
    timeContext: string
    aspectRatio: CalendarAspectRatio
    options: CalendarPromptOption[]
}>()

const emit = defineEmits<{
    close: []
    draw: []
    apply: [option: CalendarPromptOption]
    'update:sourceCopy': [value: string]
    'update:timeContext': [value: string]
    'update:aspectRatio': [value: CalendarAspectRatio]
}>()

const closeButtonRef = ref<HTMLButtonElement | null>(null)
const aspectRatios: CalendarAspectRatio[] = ['9:16', '4:5']
const canDraw = computed(() => props.assistantReady && props.sourceCopy.trim().length > 0 && !props.loading)

const emitClose = () => emit('close')

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !props.open) return
    event.preventDefault()
    emitClose()
}

watch(
    () => props.open,
    open => {
        if (open) nextTick(() => closeButtonRef.value?.focus())
    }
)

onMounted(() => document.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown))
</script>
