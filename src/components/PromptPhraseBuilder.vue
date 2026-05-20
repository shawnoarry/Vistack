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
                    @click="$emit('add', activeGroup?.id || groups[0]?.id || '')"
                >
                    新增
                </button>
                <span class="rounded-md bg-brand-line/60 px-2 py-1 text-xs text-brand-muted">{{ groups.length }} 类</span>
            </div>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-1">
            <button
                v-for="group in groups"
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
            <p class="mb-3 text-xs text-brand-muted">{{ activeGroup.description }}</p>
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
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PromptPhraseGroup } from '../data/promptPhrases'

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
}>()

const activeGroupId = ref(props.groups[0]?.id || '')

watch(
    () => props.groups,
    groups => {
        if (!groups.some(group => group.id === activeGroupId.value)) {
            activeGroupId.value = groups[0]?.id || ''
        }
    },
    { deep: true }
)

const activeGroup = computed(() => props.groups.find(group => group.id === activeGroupId.value))
</script>
