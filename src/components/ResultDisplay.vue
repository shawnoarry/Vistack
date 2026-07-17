<template>
    <div class="flex min-h-[520px] flex-col rounded-lg border border-brand-line bg-white p-3 shadow-sm shadow-black/5 dark:border-night-muted/35 dark:bg-night-panel">
        <section v-if="visibleTasks.length" class="mb-3 rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-surface">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p class="text-sm font-semibold text-brand-ink">{{ queueTitleText }}</p>
                    <p class="mt-1 text-xs text-brand-muted">{{ queueDescriptionText }}</p>
                </div>
                <span class="wb-chip">{{ runningTasks.length }} 进行中 · {{ failedTasks.length }} 失败</span>
            </div>

            <div class="grid gap-2 md:grid-cols-2">
                <article
                    v-for="task in visibleTasks"
                    :key="task.id"
                    data-testid="generation-task"
                    :class="[
                        'rounded-lg border bg-white p-3 transition dark:bg-night-panel',
                        selectedTaskId === task.id ? 'border-brand-accent ring-2 ring-brand-accent/15' : 'border-brand-line dark:border-night-muted/35'
                    ]"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="truncate text-xs font-semibold text-brand-ink">{{ task.title }}</p>
                            <p class="mt-1 text-[11px] leading-4 text-brand-muted">{{ task.count }} 张 · {{ task.aspectRatio }} · {{ task.model }}</p>
                            <p v-if="taskToolSummary(task)" class="mt-1 text-[11px] leading-4 text-brand-muted">{{ taskToolSummary(task) }}</p>
                        </div>
                        <span
                            :class="[
                                'shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold',
                                task.status === 'running' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-accent text-brand-surface'
                            ]"
                        >
                            {{ taskStatusLabel(task.status) }}
                        </span>
                    </div>

                    <div v-if="task.status === 'running'" class="mt-3 rounded-md border border-dashed border-brand-line bg-white p-3 dark:border-night-muted/35 dark:bg-night-surface">
                        <div class="mb-2 h-1.5 overflow-hidden rounded-full bg-brand-line">
                            <div class="h-full w-1/2 animate-pulse rounded-full bg-brand-accent" />
                        </div>
                        <p class="text-xs leading-5 text-brand-muted">已提交给模型，正在等待返回图片。</p>
                    </div>

                    <div v-else class="mt-3">
                        <p class="rounded-md border border-brand-accent/30 bg-brand-accent/10 p-2 text-xs leading-5 text-brand-accent">
                            {{ task.error || '生成失败，未返回可用图片。' }}
                        </p>
                        <div class="mt-2 grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                data-testid="copy-task-diagnostic"
                                class="wb-secondary min-h-10 px-3 text-xs"
                                :disabled="taskDiagnosticCopyTaskId === task.id && taskDiagnosticCopyStatus === '复制中…'"
                                aria-live="polite"
                                @click="$emit('copy-task-diagnostic', task)"
                            >
                                {{ taskDiagnosticCopyTaskId === task.id && taskDiagnosticCopyStatus ? taskDiagnosticCopyStatus : '复制本次诊断' }}
                            </button>
                            <button type="button" data-testid="dismiss-task" class="wb-secondary min-h-10 px-3 text-xs" @click="$emit('dismiss-task', task)">关闭</button>
                        </div>
                    </div>
                </article>
            </div>
        </section>

        <section v-if="currentImage" class="flex flex-1 flex-col">
            <header class="mb-3 flex flex-col gap-3 border-b border-brand-line pb-3 sm:flex-row sm:items-start sm:justify-between dark:border-night-muted/35">
                <div class="min-w-0">
                    <p class="text-sm font-semibold text-brand-ink">{{ resultTitle || '当前结果' }}</p>
                    <p class="mt-1 text-xs text-brand-muted">
                        <span v-if="resultCreatedAt">{{ formatResultTime(resultCreatedAt) }} · </span>
                        第 {{ normalizedSelectedIndex + 1 }}/{{ results.length }} 张
                    </p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" class="wb-primary min-h-10 px-3 text-xs" @click="$emit('download', currentImage)">下载当前图</button>
                    <button v-if="canPush" type="button" class="wb-secondary min-h-10 px-3 text-xs" @click="$emit('push', currentImage)">作为参考图</button>
                    <button v-if="canReuse" type="button" class="wb-secondary min-h-10 px-3 text-xs" @click="$emit('reuse')">复用本次</button>
                    <button type="button" class="wb-secondary min-h-10 px-3 text-xs" @click="previewImage = currentImage">放大</button>
                </div>
            </header>

            <p v-if="error" class="mb-3 rounded-md border border-brand-accent/30 bg-brand-accent/10 p-3 text-xs leading-5 text-brand-accent" role="status">
                {{ error }}
            </p>

            <button
                type="button"
                data-testid="current-result"
                class="flex min-h-[360px] flex-1 items-center justify-center overflow-hidden rounded-lg border border-brand-line bg-brand-surface p-3 transition hover:border-brand-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent dark:border-night-muted/35 dark:bg-night-surface"
                aria-label="放大当前生成结果"
                @click="previewImage = currentImage"
            >
                <img
                    :src="currentImage"
                    :alt="`当前生成结果，第 ${normalizedSelectedIndex + 1} 张`"
                    class="max-h-[680px] w-full object-contain"
                    @load="event => onImageLoad(event, currentImage)"
                />
            </button>

            <div v-if="results.length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="同批次生成结果">
                <button
                    v-for="(image, index) in results"
                    :key="`result-thumb-${image}-${index}`"
                    type="button"
                    data-testid="result-thumbnail"
                    :aria-current="normalizedSelectedIndex === index ? 'true' : undefined"
                    :aria-label="`查看同批次第 ${index + 1} 张结果`"
                    :class="[
                        'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent dark:bg-night-panel',
                        normalizedSelectedIndex === index
                            ? 'border-brand-accent ring-2 ring-brand-accent/15'
                            : 'border-brand-line hover:border-brand-accent/40 dark:border-night-muted/35'
                    ]"
                    @click="$emit('select-image', index)"
                >
                    <img :src="image" :alt="`同批次第 ${index + 1} 张结果`" class="h-full w-full object-cover" />
                    <span class="absolute bottom-0 right-0 bg-brand-ink/80 px-1 text-[10px] text-brand-surface">{{ index + 1 }}</span>
                </button>
            </div>

            <div v-if="resultPrompt || resultMeta.length || currentImageSize || resultRevisedPrompt" class="mt-3 rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-surface">
                <div class="flex flex-wrap gap-2 text-[11px] text-brand-muted">
                    <span v-for="item in resultMeta" :key="item" class="wb-chip">{{ item }}</span>
                    <span v-if="currentImageSize" class="wb-chip">{{ currentImageSize }}</span>
                </div>
                <div v-if="resultPrompt" class="mt-3">
                    <p class="wb-label">本次提示词</p>
                    <p class="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-brand-ink">{{ resultPrompt }}</p>
                </div>
                <div v-if="resultRevisedPrompt" class="mt-3 border-t border-brand-line pt-3 dark:border-night-muted/35">
                    <p class="wb-label">上游修订提示词</p>
                    <p class="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-brand-muted">{{ resultRevisedPrompt }}</p>
                </div>
            </div>
        </section>

        <section v-else-if="error" class="flex flex-1 items-center justify-center rounded-lg border border-brand-line bg-brand-surface p-4 dark:border-night-muted/35 dark:bg-night-surface">
            <div class="max-w-xl text-center">
                <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-brand-accent/30 bg-brand-accent/10 text-brand-accent">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                </div>
                <p class="text-base font-semibold text-brand-accent">生成失败</p>
                <p class="mt-2 break-words text-sm leading-6 text-brand-muted">{{ error }}</p>
                <p v-if="resultTitle" class="mt-3 text-xs text-brand-muted">{{ resultTitle }}</p>
            </div>
        </section>

        <section v-else class="flex flex-1 items-center justify-center rounded-lg border border-brand-line bg-brand-surface p-4 dark:border-night-muted/35 dark:bg-night-surface">
            <div class="max-w-sm text-center">
                <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-muted dark:border-night-muted/35 dark:bg-night-panel">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4-4a3 3 0 014 0l8 8M14 14l1-1a3 3 0 014 0l1 1M5 8h.01M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                </div>
                <h3 class="text-base font-semibold text-brand-ink">{{ loading ? '正在生成' : emptyTitleText }}</h3>
                <p class="mt-2 text-sm leading-6 text-brand-muted">{{ loading ? '任务已提交，结果返回后会自动显示在这里。' : emptyDescriptionText }}</p>
            </div>
        </section>
    </div>

    <div v-if="previewImage" class="fixed inset-0 z-[70] flex items-center justify-center bg-brand-ink/90 p-4" role="dialog" aria-modal="true" aria-label="生成结果预览" @click.self="previewImage = ''">
        <div class="flex max-h-full w-full max-w-6xl flex-col rounded-lg border border-brand-surface/20 bg-brand-ink p-3 shadow-2xl">
            <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                    <p class="text-sm font-semibold text-brand-surface">结果预览</p>
                    <p class="truncate text-xs text-brand-line">{{ imageSizes[previewImage] || '点击背景关闭预览' }}</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" class="min-h-10 rounded-md border border-brand-surface/20 px-3 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="$emit('download', previewImage)">下载</button>
                    <button v-if="canPush" type="button" class="min-h-10 rounded-md border border-brand-surface/20 px-3 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="$emit('push', previewImage)">作为参考图</button>
                    <button v-if="canReuse" type="button" class="min-h-10 rounded-md border border-brand-surface/20 px-3 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="$emit('reuse')">复用本次</button>
                    <button type="button" class="min-h-10 rounded-md bg-brand-accent px-3 text-xs font-semibold text-brand-surface transition hover:bg-brand-accent/90" @click="previewImage = ''">关闭</button>
                </div>
            </div>
            <div class="min-h-0 flex-1 overflow-auto rounded-lg bg-black/20">
                <img :src="previewImage" alt="放大的生成结果" class="mx-auto max-h-[78vh] w-auto max-w-full object-contain" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GenerationTask, GenerationTaskStatus } from '../types'

const props = withDefaults(defineProps<{
    results: string[]
    tasks: GenerationTask[]
    loading: boolean
    error: string | null
    canPush: boolean
    canReuse: boolean
    selectedIndex?: number
    selectedTaskId?: string
    taskDiagnosticCopyTaskId?: string
    taskDiagnosticCopyStatus?: string
    resultTitle?: string
    resultPrompt?: string
    resultRevisedPrompt?: string
    resultMeta?: string[]
    resultCreatedAt?: number
    emptyTitle?: string
    emptyDescription?: string
    queueTitle?: string
    queueDescription?: string
}>(), {
    selectedIndex: 0,
    selectedTaskId: '',
    taskDiagnosticCopyTaskId: '',
    taskDiagnosticCopyStatus: '',
    resultTitle: '',
    resultPrompt: '',
    resultRevisedPrompt: '',
    resultMeta: () => [],
    resultCreatedAt: 0,
    emptyTitle: '',
    emptyDescription: '',
    queueTitle: '',
    queueDescription: ''
})

const imageSizes = ref<Record<string, string>>({})
const previewImage = ref('')
const visibleTasks = computed(() => props.tasks.filter(task => task.status !== 'done'))
const runningTasks = computed(() => visibleTasks.value.filter(task => task.status === 'running'))
const failedTasks = computed(() => visibleTasks.value.filter(task => task.status === 'error'))
const normalizedSelectedIndex = computed(() => {
    if (!props.results.length) return 0
    return Math.min(Math.max(Math.trunc(props.selectedIndex), 0), props.results.length - 1)
})
const currentImage = computed(() => props.results[normalizedSelectedIndex.value] || '')
const currentImageSize = computed(() => currentImage.value ? imageSizes.value[currentImage.value] || '' : '')
const emptyTitleText = computed(() => props.emptyTitle || '等待生成结果')
const emptyDescriptionText = computed(() => props.emptyDescription || '配置 API、选择模型与参数后，从底部输入栏开始生成。')
const queueTitleText = computed(() => props.queueTitle || '任务状态')
const queueDescriptionText = computed(() => props.queueDescription || '这里只保留进行中和失败任务；成功结果会进入右侧生成历史。')

watch(
    () => props.results,
    () => {
        imageSizes.value = {}
        previewImage.value = ''
    },
    { deep: true }
)

const onImageLoad = (event: Event, image: string) => {
    const img = event.currentTarget as HTMLImageElement | null
    if (img?.naturalWidth && img.naturalHeight) {
        imageSizes.value[image] = `${img.naturalWidth} × ${img.naturalHeight}`
    }
}

const formatResultTime = (timestamp: number) => new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}).format(new Date(timestamp))

defineEmits<{
    download: [image: string]
    push: [image: string]
    reuse: []
    'select-image': [index: number]
    'copy-task-diagnostic': [task: GenerationTask]
    'dismiss-task': [task: GenerationTask]
    'restore-task': [task: GenerationTask]
    'reuse-task': [task: GenerationTask]
    'push-task': [task: GenerationTask]
    'canvas-task': [task: GenerationTask]
}>()

const taskStatusLabel = (status: GenerationTaskStatus) => status === 'running' ? '生成中' : '失败'

const taskToolSummary = (task: GenerationTask) => {
    if (!task.toolboxTool && !task.toolboxReferences?.length) return ''
    const toolText = task.toolboxTool ? toolboxToolLabel(task.toolboxTool) : '工具箱任务'
    const references = task.toolboxReferences || []
    if (!references.length) return toolText

    const counts = references.reduce<Record<string, number>>((acc, reference) => {
        const label = referenceRoleLabel(reference.role)
        acc[label] = (acc[label] || 0) + 1
        return acc
    }, {})
    return `${toolText} · ${Object.entries(counts).map(([label, count]) => `${label}${count}`).join(' / ')}`
}

const toolboxToolLabel = (tool: NonNullable<GenerationTask['toolboxTool']>) => {
    if (tool === 'model-asset') return '自定义模特'
    if (tool === 'outfit-swap') return '一键换装'
    if (tool === 'couple-photo') return '合影助手'
    if (tool === 'mask-edit') return '遮罩编辑'
    if (tool === 'image-to-prompt') return '图片反推'
    return '可编辑提示词'
}

const referenceRoleLabel = (role: string) => {
    if (role === 'character') return '人物'
    if (role === 'outfit') return '服装'
    if (role === 'background') return '背景'
    if (role === 'product') return '产品'
    if (role === 'style') return '风格'
    return '参考'
}
</script>
