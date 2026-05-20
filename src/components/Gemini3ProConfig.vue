<template>
    <div class="space-y-4">
        <div>
            <label class="wb-label block">图像尺寸</label>
            <select
                :value="imageSize"
                @change="$emit('update:imageSize', ($event.target as HTMLInputElement).value)"
                class="wb-input mt-2 w-full font-medium"
            >
                <option value="1K">1K - 标准清晰度</option>
                <option value="2K">2K - 高清晰度</option>
                <option value="4K">4K - 超高清晰度</option>
            </select>
        </div>

        <div v-if="showGoogleSearch" class="rounded-lg border border-brand-line bg-white p-3">
            <label class="flex cursor-pointer items-start gap-3">
                <input
                    type="checkbox"
                    :checked="enableGoogleSearch"
                    @change="$emit('update:enableGoogleSearch', ($event.target as HTMLInputElement).checked)"
                    class="mt-0.5 h-4 w-4 rounded border-brand-line bg-brand-surface text-brand-accent focus:ring-brand-accent"
                />
                <span>
                    <span class="block text-sm font-semibold text-brand-ink">启用 Google Search</span>
                    <span class="mt-1 block text-xs text-brand-muted">允许 Gemini 3 Pro Image 使用搜索信息生成图像。</span>
                </span>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    imageSize: string
    enableGoogleSearch: boolean
    modelType?: string
}>()

defineEmits<{
    'update:imageSize': [value: string]
    'update:enableGoogleSearch': [value: boolean]
}>()

const showGoogleSearch = computed(() => props.modelType === 'gemini-3-pro-image')
</script>
