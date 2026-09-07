<template>
    <div class="flex min-h-32 items-center justify-center gap-2 p-4 text-sm text-brand-muted" :role="error ? 'alert' : 'status'">
        <AlertTriangle v-if="error" :size="18" aria-hidden="true" />
        <LoaderCircle v-else :size="18" class="animate-spin" aria-hidden="true" />
        <span>{{ error ? '面板加载失败，请检查网络后刷新页面。' : '正在加载...' }}</span>
    </div>
</template>

<script setup lang="ts">
import { AlertTriangle, LoaderCircle } from '@lucide/vue'
defineProps<{ error?: Error }>()
</script>
