<template>
    <div class="flex min-h-[520px] flex-col rounded-lg border border-brand-line bg-white p-3 shadow-sm shadow-black/5">
        <div v-if="tasks.length" class="mb-3 rounded-lg border border-brand-line bg-brand-surface p-3">
            <div class="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p class="text-sm font-semibold text-brand-ink">{{ queueTitleText }}</p>
                    <p class="mt-1 text-xs text-brand-muted">{{ queueDescriptionText }}</p>
                </div>
                <span class="wb-chip">{{ runningTasks.length }} 进行中</span>
            </div>
            <div class="columns-1 gap-3 md:columns-2 2xl:columns-3">
                <article
                    v-for="task in tasks"
                    :key="task.id"
                    class="mb-3 break-inside-avoid rounded-lg border border-brand-line bg-white p-3 shadow-sm shadow-black/5"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="truncate text-xs font-semibold text-brand-ink">{{ task.title }}</p>
                            <p class="mt-1 text-[11px] text-brand-muted">{{ task.count }} 张 · {{ task.aspectRatio }} · {{ task.model }}</p>
                        </div>
                        <span
                            :class="[
                                'shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold',
                                task.status === 'running' ? 'bg-brand-accent/10 text-brand-accent' : '',
                                task.status === 'done' ? 'bg-brand-ink text-brand-surface' : '',
                                task.status === 'error' ? 'bg-brand-accent text-brand-surface' : ''
                            ]"
                        >
                            {{ taskStatusLabel(task.status) }}
                        </span>
                    </div>

                    <div v-if="task.status === 'running'" class="mt-3 rounded-md border border-dashed border-brand-line bg-white p-3">
                        <div class="mb-2 h-1.5 overflow-hidden rounded-full bg-brand-line">
                            <div class="h-full w-1/2 animate-pulse rounded-full bg-brand-accent" />
                        </div>
                        <p class="text-xs leading-5 text-brand-muted">已提交给模型，正在等待返回图片。</p>
                    </div>

                    <button
                        v-else-if="task.images.length"
                        type="button"
                        class="mt-3 grid w-full grid-cols-2 gap-2"
                        @click="$emit('restore-task', task)"
                    >
                        <span
                            v-for="(image, index) in task.images.slice(0, 4)"
                            :key="`${task.id}-${index}`"
                            class="aspect-square overflow-hidden rounded-md border border-brand-line bg-white"
                        >
                            <img :src="image" :alt="`${task.title} 结果 ${index + 1}`" class="h-full w-full object-cover" />
                        </span>
                    </button>

                    <div v-if="task.status === 'done' && task.images.length" class="mt-3 grid grid-cols-2 gap-2">
                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="$emit('restore-task', task)">恢复预览</button>
                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="$emit('reuse-task', task)">复用提示词</button>
                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="$emit('push-task', task)">结果作参考</button>
                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="$emit('canvas-task', task)">加入画布</button>
                    </div>

                    <p v-else-if="task.error" class="mt-3 rounded-md border border-brand-accent/30 bg-brand-accent/10 p-2 text-xs leading-5 text-brand-accent">
                        {{ task.error }}
                    </p>
                </article>
            </div>
        </div>

        <div class="flex flex-1 items-center justify-center rounded-lg border border-brand-line bg-brand-surface p-4">
            <div v-if="error" class="max-w-xl text-center">
                <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-brand-accent/30 bg-brand-accent/10 text-brand-accent">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>
                <p class="text-base font-semibold text-brand-accent">生成失败</p>
                <p class="mt-2 break-words text-sm leading-6 text-brand-muted">{{ error }}</p>
            </div>

            <div v-else-if="results && results.length > 0" class="w-full">
                <div class="grid gap-4" :class="gridClass">
                    <div v-for="(img, index) in results" :key="`${img}-${index}`" class="group relative overflow-hidden rounded-lg border border-brand-line bg-white shadow-sm shadow-black/5">
                        <button type="button" class="block h-full w-full" @click="previewImage = img">
                            <img :src="img" alt="生成结果" class="h-full max-h-[720px] w-full object-contain" @load="e => onImageLoad(e, img)" />
                        </button>
                        <div class="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-brand-ink/85 p-2 opacity-0 backdrop-blur transition group-hover:opacity-100">
                            <span class="font-mono text-xs text-brand-line">{{ imageSizes[img] || `Result ${index + 1}` }} · {{ index + 1 }}/{{ results.length }}</span>
                            <div class="flex gap-2">
                                <button
                                    v-if="canReuse"
                                    type="button"
                                    @click="$emit('reuse')"
                                    class="rounded-md border border-brand-accent bg-brand-accent px-2.5 py-1 text-xs font-semibold text-brand-surface transition hover:bg-brand-accent/90"
                                >
                                    复用本次
                                </button>
                                <button
                                    type="button"
                                    @click="previewImage = img"
                                    class="rounded-md border border-brand-surface/20 bg-brand-surface/10 px-2.5 py-1 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/20"
                                >
                                    放大
                                </button>
                                <button
                                    v-if="canPush"
                                    type="button"
                                    @click="$emit('push', img)"
                                    class="rounded-md border border-brand-surface/20 bg-brand-surface/10 px-2.5 py-1 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/20"
                                >
                                    二次创作
                                </button>
                                <button
                                    type="button"
                                    @click="$emit('download', img)"
                                    class="rounded-md border border-brand-accent bg-brand-accent px-2.5 py-1 text-xs font-semibold text-brand-surface transition hover:bg-brand-accent/90"
                                >
                                    下载
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="max-w-sm text-center">
                <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-brand-line bg-brand-surface text-brand-muted">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4-4a3 3 0 014 0l8 8M14 14l1-1a3 3 0 014 0l1 1M5 8h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                </div>
                <h3 class="text-base font-semibold text-brand-ink">{{ emptyTitleText }}</h3>
                <p class="mt-2 text-sm leading-6 text-brand-muted">{{ emptyDescriptionText }}</p>
            </div>
        </div>

        <div v-if="results.length > 1" class="mt-3 flex items-center gap-2 overflow-x-auto">
            <button
                v-for="(img, index) in results"
                :key="`queue-${img}-${index}`"
                type="button"
                @click="previewImage = img"
                class="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-brand-line bg-white"
            >
                <img :src="img" :alt="`生成队列 ${index + 1}`" class="h-full w-full object-cover" />
                <span class="absolute bottom-0 right-0 bg-brand-ink/80 px-1 text-[10px] text-brand-surface">{{ index + 1 }}</span>
            </button>
        </div>
    </div>

    <div v-if="previewImage" class="fixed inset-0 z-[70] flex items-center justify-center bg-brand-ink/90 p-4" @click.self="previewImage = ''">
        <div class="flex max-h-full w-full max-w-6xl flex-col rounded-lg border border-brand-surface/20 bg-brand-ink p-3 shadow-2xl">
            <div class="mb-3 flex items-center justify-between gap-3">
                <div class="min-w-0">
                    <p class="text-sm font-semibold text-brand-surface">结果预览</p>
                    <p class="truncate text-xs text-brand-muted">{{ imageSizes[previewImage] || '点击背景关闭预览' }}</p>
                </div>
                <div class="flex gap-2">
                    <button type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="$emit('download', previewImage)">下载</button>
                    <button v-if="canPush" type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="$emit('push', previewImage)">作为参考图</button>
                    <button v-if="canReuse" type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="$emit('reuse')">复用本次</button>
                    <button type="button" class="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-accent/90" @click="previewImage = ''">关闭</button>
                </div>
            </div>
            <div class="min-h-0 flex-1 overflow-auto rounded-lg bg-black/20">
                <img :src="previewImage" alt="放大结果" class="mx-auto max-h-[78vh] w-auto max-w-full object-contain" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { GenerationTask, GenerationTaskStatus } from '../types'

const props = defineProps<{
    results: string[]
    tasks: GenerationTask[]
    loading: boolean
    error: string | null
    canPush: boolean
    canReuse: boolean
    emptyTitle?: string
    emptyDescription?: string
    queueTitle?: string
    queueDescription?: string
}>()

const imageSizes = ref<Record<string, string>>({})
const previewImage = ref('')
const runningTasks = computed(() => props.tasks.filter(task => task.status === 'running'))
const emptyTitleText = computed(() => props.emptyTitle || '等待生成结果')
const emptyDescriptionText = computed(() => props.emptyDescription || '配置 API、选择模型与参数后，从底部输入栏开始生成。')
const queueTitleText = computed(() => props.queueTitle || '任务队列')
const queueDescriptionText = computed(() => props.queueDescription || '可以连续提交多个任务。每个完成任务都能恢复预览、复用提示词或继续作为参考图。')

watch(
    () => props.results,
    () => {
        imageSizes.value = {}
        previewImage.value = ''
    },
    { deep: true }
)

const gridClass = computed(() => {
    const count = props.results.length
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    return 'grid-cols-3'
})

const onImageLoad = (event: Event, image: string) => {
    const img = event.currentTarget as HTMLImageElement | null
    if (img?.naturalWidth && img.naturalHeight) {
        imageSizes.value[image] = `${img.naturalWidth} × ${img.naturalHeight}`
    }
}

defineEmits<{
    download: [image: string]
    push: [image: string]
    reuse: []
    'restore-task': [task: GenerationTask]
    'reuse-task': [task: GenerationTask]
    'push-task': [task: GenerationTask]
    'canvas-task': [task: GenerationTask]
}>()

const taskStatusLabel = (status: GenerationTaskStatus) => {
    if (status === 'running') return '生成中'
    if (status === 'done') return '已完成'
    return '失败'
}
</script>
