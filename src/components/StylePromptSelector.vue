<template>
    <div class="flex h-full flex-col gap-3">
        <div class="grid grid-cols-2 rounded-lg border border-brand-line bg-brand-line/60 p-1">
            <button
                type="button"
                @click="activeTab = 'style'"
                :class="[
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    activeTab === 'style' ? 'bg-brand-accent text-brand-surface' : 'text-brand-muted hover:text-brand-ink'
                ]"
            >
                预设风格
            </button>
            <button
                type="button"
                @click="activeTab = 'custom'"
                :class="[
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    activeTab === 'custom' ? 'bg-brand-accent text-brand-surface' : 'text-brand-muted hover:text-brand-ink'
                ]"
            >
                自定义
            </button>
        </div>

        <div v-if="activeTab === 'style'" class="flex flex-1 flex-col gap-3">
            <input v-model="searchQuery" type="search" placeholder="搜索提示词、分类或标签" class="wb-input w-full" />

            <div class="flex gap-2 overflow-x-auto pb-1">
                <button
                    v-for="category in categories"
                    :key="category"
                    type="button"
                    @click="activeCategory = category"
                    :class="[
                        'shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition',
                        activeCategory === category
                            ? 'border-brand-accent bg-brand-accent text-brand-surface'
                            : 'border-brand-line bg-white text-brand-muted hover:text-brand-ink'
                    ]"
                >
                    {{ category }}
                </button>
            </div>

            <div class="max-h-[420px] flex-1 space-y-2 overflow-y-auto pr-1">
                <button
                    v-for="template in filteredTemplates"
                    :key="template.id"
                    type="button"
                    @click="selectStyle(template.id)"
                    :class="[
                        'w-full rounded-lg border p-3 text-left transition',
                        selectedStyle === template.id ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-line bg-white hover:border-brand-muted hover:bg-brand-surface'
                    ]"
                >
                    <div class="flex items-start gap-3">
                        <img v-if="template.image" :src="template.image" :alt="template.title" class="h-16 w-16 flex-shrink-0 rounded-md border border-brand-line object-cover" />
                        <div v-else class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border border-brand-line bg-brand-surface text-xs font-semibold text-brand-muted">
                            {{ template.category || 'Prompt' }}
                        </div>

                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <div class="text-sm font-semibold text-brand-ink">{{ template.title }}</div>
                                <span v-if="template.mode" class="rounded bg-brand-line/70 px-1.5 py-0.5 text-[11px] text-brand-muted">{{ modeLabel(template.mode) }}</span>
                            </div>
                            <p class="mt-1 line-clamp-2 text-xs leading-5 text-brand-muted">{{ template.description }}</p>

                            <div v-if="template.tags?.length" class="mt-2 flex flex-wrap gap-1.5">
                                <span v-for="tag in template.tags" :key="tag" class="rounded bg-brand-surface px-1.5 py-0.5 text-[11px] text-brand-muted">{{ tag }}</span>
                            </div>

                            <details class="group mt-2" @click.stop>
                                <summary class="flex cursor-pointer items-center gap-1 text-xs text-brand-muted hover:text-brand-ink">
                                    <span>查看完整提示词</span>
                                    <svg class="h-3 w-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div class="mt-2 rounded-md border border-brand-line bg-brand-surface p-2 text-xs leading-5 text-brand-muted">
                                    {{ template.prompt }}
                                </div>
                            </details>
                        </div>
                    </div>
                </button>

                <div v-if="filteredTemplates.length === 0" class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm text-brand-muted">
                    没有找到匹配的提示词。
                </div>
            </div>
        </div>

        <div v-else class="flex flex-1 flex-col gap-2">
            <label class="wb-label">改图提示词</label>

            <textarea
                :value="customPrompt"
                @input="updateCustomPrompt(($event.target as HTMLTextAreaElement).value)"
                placeholder="例如：保持主体构图，将图片改成干净的产品海报风格，提升质感与光影。"
                class="wb-input min-h-[180px] w-full flex-1 resize-none py-3 leading-6"
            />

            <p class="text-xs text-brand-muted">描述越具体，模型越容易保持主体并执行指定风格。</p>

            <PromptPhraseBuilder
                :groups="phraseGroups"
                title="词组积木"
                description="点击词组追加到自定义改图提示词。"
                @insert="insertPhrase"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { StyleTemplate } from '../types'
import PromptPhraseBuilder from './PromptPhraseBuilder.vue'
import type { PromptPhraseGroup } from '../data/promptPhrases'

const props = defineProps<{
    selectedStyle: string
    customPrompt: string
    templates: StyleTemplate[]
    phraseGroups: PromptPhraseGroup[]
}>()

const emit = defineEmits<{
    'update:selectedStyle': [value: string]
    'update:customPrompt': [value: string]
}>()

const activeTab = ref<'style' | 'custom'>('style')
const searchQuery = ref('')
const activeCategory = ref('全部')

const categories = computed(() => ['全部', ...Array.from(new Set(props.templates.map(template => template.category || '其他')))])

const filteredTemplates = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return props.templates.filter(template => {
        const matchesCategory = activeCategory.value === '全部' || (template.category || '其他') === activeCategory.value
        if (!matchesCategory) return false
        if (!query) return true

        const haystack = [
            template.title,
            template.description,
            template.category || '',
            template.prompt,
            ...(template.tags || [])
        ]
            .join(' ')
            .toLowerCase()

        return haystack.includes(query)
    })
})

const modeLabel = (mode: StyleTemplate['mode']) => {
    if (mode === 'text') return '文生图'
    if (mode === 'image') return '图文'
    return '通用'
}

// 监听选择状态，自动切换标签页
watch(
    () => props.selectedStyle,
    newValue => {
        if (newValue && activeTab.value !== 'style') {
            activeTab.value = 'style'
        }
    }
)

watch(
    () => props.customPrompt,
    newValue => {
        if (newValue && activeTab.value !== 'custom') {
            activeTab.value = 'custom'
        }
    }
)

const selectStyle = (styleId: string) => {
    // 选择风格时清空自定义提示词
    emit('update:customPrompt', '')
    emit('update:selectedStyle', props.selectedStyle === styleId ? '' : styleId)
}

const updateCustomPrompt = (value: string) => {
    // 输入自定义提示词时清空风格选择
    if (value) {
        emit('update:selectedStyle', '')
    }
    emit('update:customPrompt', value)
}

const insertPhrase = (phrase: string) => {
    const current = props.customPrompt.trim()
    updateCustomPrompt(current ? `${current}, ${phrase}` : phrase)
}
</script>
