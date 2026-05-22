<template>
    <div class="flex h-full flex-col gap-3">
        <div class="grid grid-cols-3 rounded-lg border border-brand-line bg-brand-line/60 p-1">
            <button
                type="button"
                @click="activeTab = 'style'"
                :class="[
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    activeTab === 'style' ? 'bg-brand-accent text-brand-surface' : 'text-brand-muted hover:text-brand-ink'
                ]"
            >
                创作模板
            </button>
            <button
                type="button"
                @click="activeTab = 'pool'"
                :class="[
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    activeTab === 'pool' ? 'bg-brand-accent text-brand-surface' : 'text-brand-muted hover:text-brand-ink'
                ]"
            >
                Prompt Pool
            </button>
            <button
                type="button"
                @click="activeTab = 'custom'"
                :class="[
                    'rounded-md px-3 py-2 text-sm font-semibold transition',
                    activeTab === 'custom' ? 'bg-brand-accent text-brand-surface' : 'text-brand-muted hover:text-brand-ink'
                ]"
            >
                自定义补充
            </button>
        </div>

        <div v-if="activeTab === 'style'" class="flex flex-1 flex-col gap-3">
            <div class="rounded-lg border border-brand-line bg-brand-surface px-3 py-2 text-xs leading-5 text-brand-muted">
                点模板会把模板文本插入底部主提示词框，方便本次直接修改；模板库本身不会被改动。
            </div>
            <div class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-line bg-white px-3 py-2">
                <div>
                    <p class="text-xs font-semibold text-brand-ink">模板语言</p>
                    <p class="mt-0.5 text-[11px] text-brand-muted">内置模板已提供双语；自定义模板也可以在保存时补齐英文版本。</p>
                </div>
                <div class="grid grid-cols-3 rounded-md border border-brand-line bg-brand-surface p-1 text-xs font-semibold">
                    <button
                        v-for="option in templateLanguageOptions"
                        :key="option.value"
                        type="button"
                        @click="emit('update:templateLanguage', option.value)"
                        :class="[
                            'rounded px-2 py-1.5 transition',
                            templateLanguage === option.value ? 'bg-brand-ink text-brand-surface' : 'text-brand-muted hover:bg-white hover:text-brand-ink'
                        ]"
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>
            <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input v-model="searchQuery" type="search" placeholder="搜索提示词、分类或标签" class="wb-input w-full" />
                <button type="button" class="wb-secondary min-h-10 px-3 text-xs" @click="$emit('new-template')">新建模板</button>
            </div>

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
                    @click="applyTemplateToPrompt(template)"
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
                                <span v-if="template.promptEn" class="rounded bg-brand-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-brand-accent">双语</span>
                            </div>
                            <p class="mt-1 line-clamp-2 text-xs leading-5 text-brand-muted">{{ template.description }}</p>

                            <div v-if="template.tags?.length" class="mt-2 flex flex-wrap gap-1.5">
                                <span v-for="tag in template.tags" :key="tag" class="rounded bg-brand-surface px-1.5 py-0.5 text-[11px] text-brand-muted">{{ tag }}</span>
                            </div>

                            <div class="mt-2 flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    class="rounded bg-brand-ink px-1.5 py-0.5 text-[11px] font-semibold text-brand-surface transition hover:bg-brand-accent"
                                    @click.stop="applyTemplateToPrompt(template)"
                                >
                                    插入主提示词
                                </button>
                                <span v-if="template.source === 'custom'" class="rounded bg-brand-accent/10 px-1.5 py-0.5 text-[11px] font-semibold text-brand-accent">自定义</span>
                                <button
                                    v-if="template.source === 'custom'"
                                    type="button"
                                    class="rounded bg-brand-surface px-1.5 py-0.5 text-[11px] font-semibold text-brand-muted transition hover:text-brand-accent"
                                    @click.stop="$emit('edit-template', template)"
                                >
                                    编辑
                                </button>
                                <button
                                    v-if="template.source === 'custom'"
                                    type="button"
                                    class="rounded bg-brand-surface px-1.5 py-0.5 text-[11px] font-semibold text-brand-muted transition hover:text-brand-accent"
                                    @click.stop="$emit('delete-template', template.id)"
                                >
                                    删除
                                </button>
                            </div>

                            <details class="group mt-2" @click.stop>
                                <summary class="flex cursor-pointer items-center gap-1 text-xs text-brand-muted hover:text-brand-ink">
                                    <span>查看完整提示词</span>
                                    <svg class="h-3 w-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div class="mt-2 rounded-md border border-brand-line bg-brand-surface p-2 text-xs leading-5 text-brand-muted">
                                    {{ templatePrompt(template) }}
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

        <div v-else-if="activeTab === 'pool'" class="grid flex-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside class="rounded-lg border border-brand-line bg-white p-3">
                <p class="wb-label text-brand-accent">Prompt pool</p>
                <p class="mt-1 text-sm font-semibold text-brand-ink">提示块池</p>
                <p class="mt-1 text-xs leading-5 text-brand-muted">Prompt Pool 是成段灵感池，可一次选择多个提示块追加到自定义补充；不会和底部短词组混在一起。</p>
                <div class="mt-3 space-y-1">
                    <button
                        v-for="group in promptPoolGroups"
                        :key="group.id"
                        type="button"
                        @click="activePoolGroupId = group.id"
                        :class="[
                            'w-full rounded-md px-2.5 py-2 text-left text-xs font-semibold transition',
                            activePoolGroupId === group.id ? 'bg-brand-ink text-brand-surface' : 'bg-brand-surface text-brand-muted hover:text-brand-ink'
                        ]"
                    >
                        {{ group.title }}
                    </button>
                </div>
            </aside>

            <div class="min-w-0 rounded-lg border border-brand-line bg-white p-3">
                <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 class="text-sm font-semibold text-brand-ink">{{ activePoolGroup?.title || '提示块池' }}</h3>
                        <p class="mt-1 text-xs text-brand-muted">{{ activePoolGroup?.description || '选择一个分类后开始组合。' }}</p>
                    </div>
                    <button type="button" class="wb-secondary min-h-9 px-3 text-xs" :disabled="!poolSelection.length" @click="applyPoolSelection">
                        追加 {{ poolSelection.length || '' }} 个提示块
                    </button>
                </div>

                <div v-if="activePoolGroup" class="grid max-h-[470px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    <button
                        v-for="item in activePoolGroup.items"
                        :key="item.id"
                        type="button"
                        @click="togglePoolItem(item.id)"
                        :class="[
                            'rounded-lg border p-3 text-left transition',
                            poolSelection.includes(item.id) ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-line bg-brand-surface hover:border-brand-muted'
                        ]"
                    >
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="text-sm font-semibold text-brand-ink">{{ item.title }}</p>
                                <p class="mt-1 text-xs leading-5 text-brand-muted">{{ item.description }}</p>
                            </div>
                            <span :class="['mt-0.5 h-4 w-4 shrink-0 rounded border', poolSelection.includes(item.id) ? 'border-brand-accent bg-brand-accent' : 'border-brand-line bg-white']" />
                        </div>
                        <div v-if="item.tags?.length" class="mt-2 flex flex-wrap gap-1.5">
                            <span v-for="tag in item.tags" :key="tag" class="rounded bg-white px-1.5 py-0.5 text-[11px] text-brand-muted">{{ tag }}</span>
                        </div>
                        <p class="mt-2 line-clamp-3 text-xs leading-5 text-brand-muted">{{ item.prompt }}</p>
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-1 flex-col gap-2">
            <label class="wb-label">补充提示词</label>

            <textarea
                :value="customPrompt"
                @input="updateCustomPrompt(($event.target as HTMLTextAreaElement).value)"
                placeholder="例如：保持主体构图，将画面改成干净的产品海报风格，提升质感与光影。"
                class="wb-input min-h-[180px] w-full flex-1 resize-none py-3 leading-6"
            />

            <p class="text-xs leading-5 text-brand-muted">这段内容会作为主提示词的补充。短词组适合补细节，Prompt Pool 适合追加成段 UI、场景或风格描述。</p>

            <PromptPhraseBuilder
                :groups="phraseGroups"
                title="词组积木"
                description="点击词组追加到自定义补充提示词。"
                @insert="insertPhrase"
                @add="groupId => $emit('new-phrase', groupId)"
                @edit="(groupId, phrase) => $emit('edit-phrase', groupId, phrase)"
                @add-group="$emit('new-phrase-group')"
                @edit-group="group => $emit('edit-phrase-group', group)"
                editable
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PromptPoolGroup, StyleTemplate } from '../types'
import PromptPhraseBuilder from './PromptPhraseBuilder.vue'
import type { PromptPhrase, PromptPhraseGroup } from '../data/promptPhrases'

const props = defineProps<{
    selectedStyle: string
    customPrompt: string
    templateLanguage: 'zh' | 'en' | 'bilingual'
    templates: StyleTemplate[]
    promptPoolGroups: PromptPoolGroup[]
    phraseGroups: PromptPhraseGroup[]
}>()

const emit = defineEmits<{
    'update:selectedStyle': [value: string]
    'update:customPrompt': [value: string]
    'update:templateLanguage': [value: 'zh' | 'en' | 'bilingual']
    'insert-template': [prompt: string]
    'new-template': []
    'edit-template': [template: StyleTemplate]
    'delete-template': [templateId: string]
    'new-phrase': [groupId: string]
    'edit-phrase': [groupId: string, phrase: PromptPhrase]
    'new-phrase-group': []
    'edit-phrase-group': [group: PromptPhraseGroup]
}>()

const activeTab = ref<'style' | 'pool' | 'custom'>('style')
const searchQuery = ref('')
const activeCategory = ref('全部')
const activePoolGroupId = ref(props.promptPoolGroups[0]?.id || '')
const poolSelection = ref<string[]>([])
const templateLanguageOptions = [
    { value: 'zh' as const, label: '中文' },
    { value: 'en' as const, label: 'English' },
    { value: 'bilingual' as const, label: '双语' }
]

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
    if (mode === 'image') return '需参考图'
    return '通用'
}

const templatePrompt = (template: StyleTemplate) => {
    if (props.templateLanguage === 'en') {
        return template.promptEn || template.prompt
    }

    if (props.templateLanguage === 'bilingual' && template.promptEn) {
        return `${template.prompt}\n\nEnglish version:\n${template.promptEn}`
    }

    return template.prompt
}

const activePoolGroup = computed(() =>
    props.promptPoolGroups.find(group => group.id === activePoolGroupId.value) || props.promptPoolGroups[0] || null
)

const poolItemsById = computed(() => new Map(
    props.promptPoolGroups.flatMap(group => group.items).map(item => [item.id, item])
))

const togglePoolItem = (itemId: string) => {
    poolSelection.value = poolSelection.value.includes(itemId)
        ? poolSelection.value.filter(id => id !== itemId)
        : [...poolSelection.value, itemId]
}

const applyPoolSelection = () => {
    const prompts = poolSelection.value
        .map(id => poolItemsById.value.get(id)?.prompt || '')
        .filter(Boolean)

    if (!prompts.length) return

    const current = props.customPrompt.trim()
    updateCustomPrompt(current ? `${current}\n${prompts.join('\n')}` : prompts.join('\n'))
    poolSelection.value = []
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
        if (newValue && activeTab.value !== 'custom' && activeTab.value !== 'pool') {
            activeTab.value = 'custom'
        }
    }
)

watch(
    () => props.promptPoolGroups,
    groups => {
        if (!groups.some(group => group.id === activePoolGroupId.value)) {
            activePoolGroupId.value = groups[0]?.id || ''
            poolSelection.value = []
        }
    },
    { deep: true }
)

const applyTemplateToPrompt = (template: StyleTemplate) => {
    emit('update:selectedStyle', '')
    emit('insert-template', templatePrompt(template))
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
