<template>
    <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
            <div>
                <h3 class="text-sm font-semibold text-brand-ink">{{ title }}</h3>
                <p class="mt-1 text-xs text-brand-muted">{{ description }}</p>
            </div>
            <span class="shrink-0 rounded-md bg-brand-line/60 px-2 py-1 text-xs text-brand-muted">{{ groups.length }} 类</span>
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
                <button
                    v-for="phrase in activeGroup.phrases"
                    :key="phrase.value"
                    type="button"
                    @click="$emit('insert', phrase.value)"
                    class="rounded-md border border-brand-line bg-brand-surface px-2.5 py-1.5 text-xs font-semibold text-brand-ink transition hover:border-brand-accent hover:text-brand-accent"
                    :title="phrase.value"
                >
                    {{ phrase.label }}
                </button>
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
}>()

defineEmits<{
    insert: [value: string]
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
