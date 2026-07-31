<template>
    <div class="min-w-0">
        <section v-if="tasks.length || failureRecords.length" class="mb-4 border-b border-brand-line pb-4 dark:border-night-muted/35">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-sm font-semibold text-brand-ink">任务状态</h3>
                    <span v-if="runningTasks.length" class="wb-chip">{{ runningTasks.length }} 进行中</span>
                    <span v-if="failedTasks.length" class="wb-chip">{{ failedTasks.length }} 失败</span>
                </div>
                <button
                    v-if="failureRecords.length"
                    type="button"
                    class="wb-secondary min-h-9 px-3 text-xs"
                    :aria-expanded="showFailureRecords"
                    @click="showFailureRecords = !showFailureRecords"
                >
                    <AlertTriangle :size="15" :stroke-width="1.8" aria-hidden="true" />
                    <span class="ml-1.5">失败记录 {{ failureRecords.length }}</span>
                    <ChevronDown :size="14" :stroke-width="1.8" :class="['ml-1 transition-transform', showFailureRecords ? 'rotate-180' : '']" aria-hidden="true" />
                </button>
            </div>

            <div v-if="tasks.length" class="mt-3 space-y-2">
                <article
                    v-for="task in tasks"
                    :key="task.id"
                    data-testid="generation-task"
                    :class="[
                        'grid gap-3 rounded-lg border bg-white p-3 transition md:grid-cols-[minmax(0,1fr)_auto] md:items-center dark:bg-night-panel',
                        selectedTaskId === task.id ? 'border-brand-accent ring-2 ring-brand-accent/15' : 'border-brand-line dark:border-night-muted/35'
                    ]"
                >
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <p class="truncate text-xs font-semibold text-brand-ink">{{ task.title }}</p>
                            <span :class="['rounded-md px-2 py-1 text-[11px] font-semibold', task.status === 'running' ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-accent text-brand-surface']">
                                {{ task.status === 'running' ? '生成中' : '失败' }}
                            </span>
                        </div>
                        <p class="mt-1 truncate text-[11px] text-brand-muted">{{ task.model }} · {{ task.aspectRatio }} · {{ task.count }} 张</p>
                        <div v-if="task.status === 'running'" class="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-line dark:bg-night-surface">
                            <div class="h-full w-1/2 animate-pulse rounded-full bg-brand-accent" />
                        </div>
                        <p v-else class="mt-2 line-clamp-2 text-xs leading-5 text-brand-accent">{{ task.error || '生成失败，未返回可用图片。' }}</p>
                    </div>

                    <div v-if="task.status === 'error'" class="flex flex-wrap gap-2 md:justify-end">
                        <button
                            type="button"
                            data-testid="copy-task-diagnostic"
                            class="wb-secondary min-h-9 px-3 text-xs"
                            :disabled="taskDiagnosticCopyTaskId === task.id && taskDiagnosticCopyStatus === '复制中…'"
                            aria-live="polite"
                            @click="$emit('copy-task-diagnostic', task)"
                        >
                            {{ taskDiagnosticCopyTaskId === task.id && taskDiagnosticCopyStatus ? taskDiagnosticCopyStatus : '复制本次诊断' }}
                        </button>
                        <button type="button" data-testid="dismiss-task" class="wb-secondary min-h-9 px-3 text-xs" @click="$emit('dismiss-task', task)">关闭</button>
                    </div>
                </article>
            </div>

            <div v-if="showFailureRecords && failureRecords.length" class="mt-3 border-t border-brand-line pt-3 dark:border-night-muted/35">
                <div class="space-y-2">
                    <article v-for="record in failureRecords" :key="record.id" class="rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-panel">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div class="min-w-0 flex-1">
                                <div class="flex flex-wrap items-center gap-2">
                                    <p class="truncate text-xs font-semibold text-brand-ink">{{ record.title }}</p>
                                    <span class="wb-chip">{{ record.origin === 'toolbox' ? '工具箱' : '创作台' }}</span>
                                    <span class="text-[11px] text-brand-muted">{{ formatTime(record.createdAt) }}</span>
                                </div>
                                <p class="mt-1 line-clamp-2 text-xs leading-5 text-brand-accent">{{ record.errorSummary }}</p>
                                <p class="mt-1 truncate text-[11px] text-brand-muted">{{ record.model }} · {{ record.aspectRatio }}</p>
                            </div>
                            <div v-if="pendingFailureDeleteId !== record.id" class="flex flex-wrap gap-2">
                                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="$emit('copy-failure-diagnostic', record)">
                                    {{ failureDiagnosticCopyId === record.id && failureDiagnosticCopyStatus ? failureDiagnosticCopyStatus : '复制诊断' }}
                                </button>
                                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="$emit('reuse-failure', record)">复用提示词</button>
                                <button type="button" class="wb-icon-button h-9 w-9 text-brand-accent" title="删除失败记录" aria-label="删除失败记录" @click="pendingFailureDeleteId = record.id">
                                    <Trash2 :size="15" :stroke-width="1.8" aria-hidden="true" />
                                </button>
                            </div>
                            <div v-else class="flex flex-wrap gap-2">
                                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="pendingFailureDeleteId = ''">保留记录</button>
                                <button type="button" class="wb-primary min-h-9 px-3 text-xs" @click="$emit('delete-failure', record.id); pendingFailureDeleteId = ''">删除记录</button>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <div v-if="hiddenNotice" class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-line bg-brand-surface px-3 py-2 text-xs text-brand-muted dark:border-night-muted/35 dark:bg-night-panel" role="status" aria-live="polite">
            <span>已从创作台隐藏，资产仍保留在资产库。</span>
            <button type="button" class="font-semibold text-brand-accent hover:underline" @click="$emit('undo-hide')">撤销</button>
        </div>

        <div v-if="assets.length" class="grid grid-cols-1 gap-3 md:auto-rows-[1px] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]" data-testid="studio-waterfall">
            <article
                v-for="asset in assets"
                :key="asset.id"
                v-masonry-item
                :data-history-id="asset.item.id"
                :data-image-index="asset.index"
                :class="[
                    'group relative self-start overflow-hidden rounded-lg border bg-white shadow-sm shadow-black/5 transition-colors dark:bg-night-panel dark:shadow-black/25',
                    selectedHistoryId === asset.item.id && selectedImageIndex === asset.index
                        ? 'border-brand-accent ring-2 ring-brand-accent/15'
                        : 'border-brand-line hover:border-brand-muted dark:border-night-muted/35'
                ]"
            >
                <button
                    type="button"
                    data-testid="hide-studio-asset"
                    class="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-white/50 bg-brand-ink/80 text-brand-surface shadow-lg transition hover:bg-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    title="从瀑布流隐藏"
                    :aria-label="`从瀑布流隐藏第 ${asset.index + 1} 张图片`"
                    @click.stop="$emit('hide', asset)"
                >
                    <X :size="16" :stroke-width="2" aria-hidden="true" />
                </button>

                <button
                    type="button"
                    class="block w-full bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent dark:bg-night-surface"
                    :aria-label="`查看${asset.item.source === 'image' ? '图生图' : '文生图'}结果，第 ${asset.index + 1} 张`"
                    @click="$emit('open', asset)"
                >
                    <img
                        :src="asset.image"
                        :alt="`${asset.item.source === 'image' ? '图生图' : '文生图'}结果 ${asset.index + 1}`"
                        class="h-auto w-full object-cover"
                        loading="lazy"
                        @load="event => onImageLoad(event, asset.image)"
                    />
                </button>

                <div class="p-3">
                    <div class="flex items-start justify-between gap-2">
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-brand-ink">{{ asset.item.source === 'image' ? '图生图' : '文生图' }} · {{ formatTime(asset.item.createdAt) }}</p>
                            <p class="mt-1 line-clamp-2 text-xs leading-5 text-brand-muted">{{ asset.item.recipe?.mainPrompt || asset.item.prompt }}</p>
                        </div>
                        <span class="shrink-0 text-[10px] text-brand-muted">{{ asset.index + 1 }}/{{ asset.item.images.length }}</span>
                    </div>
                    <div class="mt-2 flex items-center justify-between gap-2 border-t border-brand-line pt-2 dark:border-night-muted/35">
                        <span class="min-w-0 truncate text-[10px] text-brand-muted">{{ imageSizes[asset.image] || asset.item.aspectRatio }}</span>
                        <div class="flex gap-1.5">
                            <button type="button" class="wb-icon-button h-9 w-9" title="下载当前图片" aria-label="下载当前图片" @click="$emit('download', asset)">
                                <Download :size="15" :stroke-width="1.8" aria-hidden="true" />
                            </button>
                            <button type="button" class="wb-icon-button h-9 w-9" title="作为参考图" aria-label="作为参考图" @click="$emit('reference', asset)">
                                <ImagePlus :size="15" :stroke-width="1.8" aria-hidden="true" />
                            </button>
                            <button type="button" class="wb-icon-button h-9 w-9" title="复用本次生成" aria-label="复用本次生成" @click="$emit('reuse', asset.item)">
                                <RotateCcw :size="15" :stroke-width="1.8" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        </div>

        <div v-else-if="historyLoading" class="rounded-lg border border-dashed border-brand-line bg-white p-8 text-center dark:border-night-muted/35 dark:bg-night-panel">
            <p class="text-sm font-semibold text-brand-ink">正在读取本地结果...</p>
        </div>

        <div v-else class="rounded-lg border border-dashed border-brand-line bg-brand-surface p-8 text-center dark:border-night-muted/35 dark:bg-night-panel">
            <p class="text-sm font-semibold text-brand-ink">还没有可展示的生成结果</p>
            <p class="mt-1 text-xs text-brand-muted">成功生成的图片会保存在这里；已隐藏图片仍可从资产库找到。</p>
        </div>

        <div v-if="hasMoreHistory" class="mt-4 flex justify-center">
            <button type="button" class="wb-secondary min-h-10 px-4 text-xs" @click="$emit('load-more')">加载更早结果</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, type ObjectDirective } from 'vue'
import { AlertTriangle, ChevronDown, Download, ImagePlus, RotateCcw, Trash2, X } from '@lucide/vue'
import type { GenerationTask } from '../types'
import type { HistoryAsset } from '../utils/assetLibrary'
import type { GenerationFailureRecord } from '../utils/failureRecords'
import type { GenerationHistoryItem } from '../utils/historyDb'

const props = withDefaults(defineProps<{
    assets: HistoryAsset[]
    tasks: GenerationTask[]
    failureRecords: GenerationFailureRecord[]
    selectedHistoryId?: string
    selectedImageIndex?: number
    selectedTaskId?: string
    historyLoading: boolean
    hasMoreHistory: boolean
    hiddenNotice: boolean
    taskDiagnosticCopyTaskId?: string
    taskDiagnosticCopyStatus?: string
    failureDiagnosticCopyId?: string
    failureDiagnosticCopyStatus?: string
}>(), {
    selectedHistoryId: '',
    selectedImageIndex: 0,
    selectedTaskId: '',
    taskDiagnosticCopyTaskId: '',
    taskDiagnosticCopyStatus: '',
    failureDiagnosticCopyId: '',
    failureDiagnosticCopyStatus: ''
})

defineEmits<{
    open: [asset: HistoryAsset]
    hide: [asset: HistoryAsset]
    download: [asset: HistoryAsset]
    reference: [asset: HistoryAsset]
    reuse: [item: GenerationHistoryItem]
    'undo-hide': []
    'load-more': []
    'copy-task-diagnostic': [task: GenerationTask]
    'dismiss-task': [task: GenerationTask]
    'copy-failure-diagnostic': [record: GenerationFailureRecord]
    'reuse-failure': [record: GenerationFailureRecord]
    'delete-failure': [id: string]
}>()

const showFailureRecords = ref(false)
const pendingFailureDeleteId = ref('')
const imageSizes = ref<Record<string, string>>({})
const runningTasks = computed(() => props.tasks.filter(task => task.status === 'running'))
const failedTasks = computed(() => props.tasks.filter(task => task.status === 'error'))
const masonryObservers = new WeakMap<HTMLElement, ResizeObserver>()

const updateMasonrySpan = (element: HTMLElement) => {
    const container = element.parentElement
    if (!container) return

    const containerStyles = getComputedStyle(container)
    const rowHeight = Number.parseFloat(containerStyles.gridAutoRows)
    if (!Number.isFinite(rowHeight)) {
        element.style.gridRowEnd = 'auto'
        return
    }

    const rowGap = Number.parseFloat(containerStyles.rowGap) || 0
    const elementHeight = element.getBoundingClientRect().height
    const rowSpan = Math.max(1, Math.ceil((elementHeight + rowGap) / (rowHeight + rowGap)))
    element.style.gridRowEnd = `span ${rowSpan}`
}

const vMasonryItem: ObjectDirective<HTMLElement> = {
    mounted(element) {
        const observer = new ResizeObserver(() => updateMasonrySpan(element))
        masonryObservers.set(element, observer)
        observer.observe(element)
        updateMasonrySpan(element)
    },
    updated: updateMasonrySpan,
    beforeUnmount(element) {
        masonryObservers.get(element)?.disconnect()
        masonryObservers.delete(element)
    }
}

const onImageLoad = (event: Event, image: string) => {
    const element = event.currentTarget as HTMLImageElement | null
    if (element?.naturalWidth && element.naturalHeight) {
        imageSizes.value[image] = `${element.naturalWidth} × ${element.naturalHeight}`
    }
}

const formatTime = (timestamp: number) => new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}).format(new Date(timestamp))
</script>
