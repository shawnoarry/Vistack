<template>
    <img
        v-if="src && failedSource !== src"
        :src="src"
        :alt="alt"
        class="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        @error="failedSource = src"
    />
    <span v-else class="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-brand-muted" role="status">
        {{ loading && !src ? '正在读取…' : '图片暂不可用' }}
    </span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ src: string; alt: string; loading: boolean }>()
const failedSource = ref<string | null>(null)
watch(() => props.src, () => { failedSource.value = null })
</script>
