<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
            <div>
                <h3 class="text-sm font-semibold text-brand-ink">{{ title }}</h3>
                <p class="mt-1 text-xs text-brand-muted">{{ description }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
                <button
                    v-if="editable"
                    type="button"
                    class="rounded-md border border-brand-line bg-white px-2 py-1 text-xs font-semibold text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
                    @click="$emit('add-group')"
                >
                    新建分类
                </button>
                <button
                    v-if="editable"
                    type="button"
                    class="rounded-md border border-brand-line bg-white px-2 py-1 text-xs font-semibold text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
                    @click="$emit('add', activeGroup?.id || groups[0]?.id || '')"
                >
                    新建词组
                </button>
                <span class="rounded-md bg-brand-line/60 px-2 py-1 text-xs text-brand-muted">{{ groups.length }} 个分类</span>
            </div>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-1">
            <button
                v-for="section in sections"
                :key="section.id"
                type="button"
                @click="activeSectionId = section.id"
                :class="[
                    'shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition',
                    activeSectionId === section.id
                        ? 'border-brand-ink bg-brand-ink text-brand-surface'
                        : 'border-brand-line bg-white text-brand-muted hover:text-brand-ink'
                ]"
            >
                {{ section.title }}
            </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-1">
            <button
                v-for="group in visibleGroups"
                :key="group.id"
                type="button"
                @click="activeGroupId = group.id"
                :class="[
                    'shrink-0 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition',
                    activeGroupId === group.id
                        ? 'border-brand-accent bg-brand-accent text-brand-surface'
                        : 'border-brand-line bg-white text-brand-muted hover:text-brand-ink'
                ]"
            >
                {{ group.title }}
            </button>
        </div>

        <div v-if="activeGroup" class="rounded-lg border border-brand-line bg-white p-3">
            <div class="mb-3 flex items-start justify-between gap-3">
                <p class="text-xs leading-5 text-brand-muted">{{ activeGroup.description }}</p>
                <button
                    v-if="editable"
                    type="button"
                    class="shrink-0 rounded-md bg-brand-surface px-2 py-1 text-[11px] font-semibold text-brand-muted transition hover:text-brand-accent"
                    @click="$emit('edit-group', activeGroup)"
                >
                    编辑分类
                </button>
            </div>
            <div class="flex flex-wrap gap-2">
                <div
                    v-for="phrase in activeGroup.phrases"
                    :key="phrase.id || phrase.value"
                    class="group inline-flex max-w-full items-center overflow-hidden rounded-md border border-brand-line bg-brand-surface text-xs font-semibold text-brand-ink transition hover:border-brand-accent"
                >
                    <button
                        type="button"
                        @click="$emit('insert', phrase.value)"
                        class="min-h-8 min-w-0 truncate px-2.5 py-1.5 transition group-hover:text-brand-accent"
                        :title="phrase.value"
                    >
                        {{ phrase.label }}
                    </button>
                    <button
                        v-if="editable"
                        type="button"
                        class="min-h-8 border-l border-brand-line px-2 text-[11px] text-brand-muted transition hover:bg-white hover:text-brand-accent"
                        @click="$emit('edit', activeGroup.id, phrase)"
                    >
                        {{ phrase.source === 'custom' || phrase.isCustomized ? '编辑' : '改写' }}
                    </button>
                </div>
                <p v-if="!activeGroup.phrases.length" class="rounded-md border border-dashed border-brand-line bg-brand-surface px-3 py-2 text-xs text-brand-muted">
                    这个分类还没有词组。新建词组后，也可以随时移动到其他分类。
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PromptPhrase, PromptPhraseGroup } from '../data/promptPhrases'

const DEFAULT_SECTION_ID = 'all'
const defaultSectionTitle = '全部大类'

const props = defineProps<{
    groups: PromptPhraseGroup[]
    title?: string
    description?: string
    editable?: boolean
}>()

defineEmits<{
    insert: [value: string]
    add: [groupId: string]
    edit: [groupId: string, phrase: PromptPhrase]
    'add-group': []
    'edit-group': [group: PromptPhraseGroup]
}>()

const activeGroupId = ref(props.groups[0]?.id || '')
const activeSectionId = ref(DEFAULT_SECTION_ID)

const sections = computed(() => [
    { id: DEFAULT_SECTION_ID, title: defaultSectionTitle },
    ...Array.from(new Set(props.groups.map(group => group.section || '其他'))).sort((first, second) => {
        const firstIndex = sectionOrder.indexOf(first)
        const secondIndex = sectionOrder.indexOf(second)
        if (firstIndex !== -1 || secondIndex !== -1) {
            if (firstIndex === -1) return 1
            if (secondIndex === -1) return -1
            return firstIndex - secondIndex
        }
        return first.localeCompare(second, 'zh-Hans-CN')
    }).map(section => ({
        id: section,
        title: section
    }))
])

const sectionOrder = ['通用基础', '自拍场景', '人像造型', '韩娱场景', '商业视觉', '产品 UI', '自定义', '其他']

const visibleGroups = computed(() => {
    if (activeSectionId.value === DEFAULT_SECTION_ID) return props.groups
    return props.groups.filter(group => (group.section || '其他') === activeSectionId.value)
})

watch(
    () => props.groups,
    groups => {
        if (!sections.value.some(section => section.id === activeSectionId.value)) {
            activeSectionId.value = DEFAULT_SECTION_ID
        }
        if (!visibleGroups.value.some(group => group.id === activeGroupId.value)) {
            activeGroupId.value = visibleGroups.value[0]?.id || groups[0]?.id || ''
        }
    },
    { deep: true }
)

watch(
    activeSectionId,
    () => {
        if (!visibleGroups.value.some(group => group.id === activeGroupId.value)) {
            activeGroupId.value = visibleGroups.value[0]?.id || ''
        }
    }
)

const activeGroup = computed(() => props.groups.find(group => group.id === activeGroupId.value))
</script>
