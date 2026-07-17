<template>
    <main class="wb-shell py-5 pb-24">
        <header class="mb-5 flex flex-col gap-3 border-b border-brand-line pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p class="wb-label text-brand-accent">Local asset library</p>
                <h1 class="mt-1 text-2xl font-semibold text-brand-ink">资产库</h1>
                <p class="mt-1 text-sm text-brand-muted">查找、下载和复用保存在当前浏览器中的生成结果。</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button type="button" class="wb-secondary" @click="$emit('back')">返回创作台</button>
                <button
                    v-if="allHistoryCount"
                    type="button"
                    :class="['wb-secondary', selectionMode ? 'border-brand-accent text-brand-accent' : '']"
                    @click="$emit('toggle-selection-mode')"
                >
                    {{ selectionMode ? '退出选择' : '批量选择' }}
                </button>
            </div>
        </header>

        <div class="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
            <aside class="hidden border-r border-brand-line pr-4 lg:block">
                <div class="mb-5">
                    <div class="mb-2 flex items-center justify-between gap-2">
                        <span class="wb-label">查看范围</span>
                        <span class="text-xs tabular-nums text-brand-muted">{{ allHistoryCount }}</span>
                    </div>
                    <nav class="space-y-1" aria-label="资产筛选">
                        <button
                            v-for="option in primaryFilters"
                            :key="option.value"
                            type="button"
                            :class="[
                                'flex min-h-9 w-full items-center justify-between rounded-md px-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/20',
                                filter === option.value
                                    ? 'bg-brand-ink font-semibold text-brand-surface dark:bg-night-accent'
                                    : 'text-brand-muted hover:bg-white hover:text-brand-ink dark:hover:bg-night-panel'
                            ]"
                            @click="$emit('update:filter', option.value)"
                        >
                            <span>{{ option.label }}</span>
                            <span v-if="option.count !== undefined" class="text-xs tabular-nums opacity-75">{{ option.count }}</span>
                        </button>
                    </nav>
                </div>

                <div class="border-t border-brand-line pt-4">
                    <div class="mb-2 flex items-center justify-between gap-2">
                        <span class="wb-label">本组收藏夹</span>
                        <button type="button" class="text-xs font-semibold text-brand-accent hover:underline" @click="$emit('new-collection')">新建</button>
                    </div>
                    <div v-if="collections.length" class="space-y-1">
                        <button
                            v-for="category in collections"
                            :key="category"
                            type="button"
                            :class="[
                                'block min-h-9 w-full truncate rounded-md px-2.5 text-left text-sm transition',
                                filter === `category:${category}`
                                    ? 'bg-brand-accent/10 font-semibold text-brand-accent'
                                    : 'text-brand-muted hover:bg-white hover:text-brand-ink dark:hover:bg-night-panel'
                            ]"
                            @click="$emit('update:filter', `category:${category}`)"
                        >
                            {{ category }}
                        </button>
                    </div>
                    <p v-else class="text-xs leading-5 text-brand-muted">暂无收藏夹。</p>
                </div>
            </aside>

            <section class="min-w-0">
                <div class="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px] lg:grid-cols-[minmax(240px,1fr)_160px]">
                    <label class="relative block">
                        <span class="sr-only">搜索提示词或模型</span>
                        <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" stroke-width="1.8" />
                            <path d="m16.5 16.5 4 4" stroke-linecap="round" stroke-width="1.8" />
                        </svg>
                        <input
                            :value="search"
                            class="wb-input w-full pl-9"
                            placeholder="搜索提示词或模型"
                            @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
                        />
                    </label>
                    <label>
                        <span class="sr-only">时间排序</span>
                        <select :value="sort" class="wb-input w-full" @change="$emit('update:sort', ($event.target as HTMLSelectElement).value as AssetSortOrder)">
                            <option value="newest">最新优先</option>
                            <option value="oldest">最早优先</option>
                        </select>
                    </label>
                </div>

                <div class="mb-4 grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:hidden">
                    <label>
                        <span class="sr-only">资产筛选</span>
                        <select :value="filter" class="wb-input w-full" @change="$emit('update:filter', ($event.target as HTMLSelectElement).value)">
                            <option v-for="option in primaryFilters" :key="option.value" :value="option.value">{{ option.label }}</option>
                            <option v-for="category in collections" :key="category" :value="`category:${category}`">收藏夹：{{ category }}</option>
                        </select>
                    </label>
                    <button type="button" class="wb-secondary px-3" @click="$emit('new-collection')">新建收藏夹</button>
                </div>

                <div class="mb-3 flex min-h-6 items-center justify-between gap-3 text-xs text-brand-muted">
                    <span>{{ assets.length }} 张图片</span>
                    <span v-if="search.trim()">搜索：{{ search.trim() }}</span>
                </div>

                <div v-if="assets.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    <article
                        v-for="asset in assets"
                        :key="asset.id"
                        :class="[
                            'group relative rounded-lg border bg-white transition-colors dark:bg-night-surface',
                            selectedIds.includes(asset.id)
                                ? 'border-brand-accent bg-brand-accent/5 ring-2 ring-brand-accent/15'
                                : 'border-brand-line hover:border-brand-muted'
                        ]"
                    >
                        <button
                            type="button"
                            class="relative block aspect-square w-full overflow-hidden rounded-t-[7px] bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent/40 dark:bg-night-panel"
                            :aria-label="selectionMode ? `${selectedIds.includes(asset.id) ? '取消选择' : '选择'}资产 ${asset.index + 1}` : `查看资产 ${asset.index + 1}`"
                            @click="selectionMode ? $emit('toggle-selection', asset.id) : $emit('open', asset)"
                        >
                            <img :src="asset.image" :alt="`历史资产 ${asset.index + 1}`" class="h-full w-full object-cover" />
                            <span v-if="selectionMode" class="absolute left-2 top-2 flex min-h-7 items-center gap-1.5 rounded-md border border-white/60 bg-brand-ink/80 px-2 text-xs font-semibold text-brand-surface">
                                <span class="flex h-4 w-4 items-center justify-center rounded border border-current" aria-hidden="true">{{ selectedIds.includes(asset.id) ? '✓' : '' }}</span>
                                {{ selectedIds.includes(asset.id) ? '已选' : '选择' }}
                            </span>
                            <span class="absolute bottom-2 right-2 rounded bg-brand-ink/75 px-2 py-1 text-[11px] font-semibold text-brand-surface">{{ asset.item.aspectRatio }}</span>
                            <span v-if="isHistoryImageHidden(asset.item, asset.index)" class="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[11px] font-semibold text-brand-ink shadow-sm dark:bg-night-surface/90">创作台已隐藏</span>
                        </button>

                        <div class="space-y-2.5 p-3">
                            <div class="flex items-start justify-between gap-2">
                                <div class="min-w-0">
                                    <p class="line-clamp-2 min-h-10 text-xs leading-5 text-brand-ink">{{ asset.item.recipe?.mainPrompt || asset.item.prompt }}</p>
                                    <p class="mt-1 truncate text-[11px] text-brand-muted">{{ asset.item.model }} · {{ formatAssetDate(asset.item.createdAt) }}</p>
                                </div>
                                <button
                                    v-if="!selectionMode"
                                    type="button"
                                    :aria-pressed="asset.item.favorite === true"
                                    :title="asset.item.favorite ? '取消收藏本组' : '收藏本组'"
                                    :class="[
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/20',
                                        asset.item.favorite
                                            ? 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent'
                                            : 'border-brand-line text-brand-muted hover:border-brand-accent/35 hover:text-brand-accent'
                                    ]"
                                    @click="$emit('favorite', asset.item)"
                                >
                                    <span aria-hidden="true">{{ asset.item.favorite ? '★' : '☆' }}</span>
                                    <span class="sr-only">{{ asset.item.favorite ? '取消收藏本组' : '收藏本组' }}</span>
                                </button>
                            </div>

                            <div v-if="!selectionMode" class="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                                <button type="button" class="wb-secondary min-h-9 px-2 text-xs" @click="$emit('download', asset)">下载</button>
                                <button type="button" class="wb-secondary min-h-9 px-2 text-xs" @click="$emit('reference', asset)">作参考</button>
                                <details class="group/menu relative">
                                    <summary class="wb-secondary h-9 min-h-9 w-9 cursor-pointer list-none px-0 text-lg" title="更多操作" aria-label="更多操作">⋯</summary>
                                    <div class="absolute bottom-11 right-0 z-20 w-44 rounded-lg border border-brand-line bg-white p-1.5 shadow-xl shadow-black/15 dark:bg-night-surface">
                                        <button type="button" class="block min-h-9 w-full rounded-md px-2 text-left text-xs font-semibold text-brand-ink hover:bg-brand-surface" @click="$emit('reuse', asset.item)">一键复用整组</button>
                                        <button type="button" class="block min-h-9 w-full rounded-md px-2 text-left text-xs font-semibold text-brand-ink hover:bg-brand-surface" @click="$emit('canvas', asset)">加入画布</button>
                                        <button type="button" class="block min-h-9 w-full rounded-md px-2 text-left text-xs font-semibold text-brand-ink hover:bg-brand-surface" @click="$emit('toggle-studio-visibility', asset)">
                                            {{ isHistoryImageHidden(asset.item, asset.index) ? '在创作台显示' : '从创作台隐藏' }}
                                        </button>
                                        <label class="mt-1 block border-t border-brand-line px-2 pt-2">
                                            <span class="block text-[10px] font-semibold text-brand-muted">本组收藏夹</span>
                                            <select :value="asset.item.category || ''" class="mt-1 min-h-8 w-full rounded-md border border-brand-line bg-white px-2 text-xs" @change="$emit('category', asset.item, ($event.target as HTMLSelectElement).value)">
                                                <option value="">未归类</option>
                                                <option v-for="category in collections" :key="category" :value="category">{{ category }}</option>
                                            </select>
                                        </label>
                                        <button type="button" class="mt-1 block min-h-9 w-full border-t border-brand-line px-2 pt-1 text-left text-xs font-semibold text-brand-accent" @click="$emit('delete-image', asset)">删除当前图</button>
                                    </div>
                                </details>
                            </div>
                        </div>
                    </article>
                </div>

                <p v-else-if="loading" class="rounded-lg border border-dashed border-brand-line bg-white p-8 text-center text-sm text-brand-muted">正在读取本地历史...</p>
                <div v-else class="rounded-lg border border-dashed border-brand-line bg-white p-8 text-center">
                    <p class="text-sm font-semibold text-brand-ink">{{ allHistoryCount ? '没有符合条件的图片' : '还没有生成资产' }}</p>
                    <p class="mt-1 text-xs text-brand-muted">{{ allHistoryCount ? '请调整搜索或筛选条件。' : '成功生成后，图片会自动保存在这里。' }}</p>
                </div>
            </section>
        </div>

        <div v-if="selectionMode" class="fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
            <div class="flex w-full max-w-2xl flex-wrap items-center justify-between gap-2 rounded-lg border border-brand-line bg-white/95 p-2 shadow-xl shadow-black/15 backdrop-blur dark:bg-night-surface/95">
                <div class="min-w-0 px-2">
                    <p class="text-sm font-semibold text-brand-ink">已选择 {{ selectedIds.length }} 张</p>
                    <p v-if="downloadStatus" class="truncate text-xs text-brand-muted" aria-live="polite">{{ downloadStatus }}</p>
                    <p v-else class="text-xs text-brand-muted">只处理当前选中的图片</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" class="wb-primary min-h-9 px-3 text-xs" :disabled="!selectedIds.length || downloading" @click="$emit('download-selected')">
                        {{ downloading ? '正在下载' : `下载所选${selectedIds.length ? ` ${selectedIds.length}` : ''}` }}
                    </button>
                    <button type="button" class="wb-secondary min-h-9 px-3 text-xs text-brand-accent" :disabled="!selectedIds.length || downloading" @click="$emit('delete-selected')">删除所选</button>
                    <button type="button" class="wb-secondary min-h-9 px-3 text-xs" :disabled="downloading" @click="$emit('toggle-selection-mode')">取消</button>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GenerationHistoryItem } from '../utils/historyDb'
import type { AssetSortOrder, HistoryAsset } from '../utils/assetLibrary'
import { isHistoryImageHidden } from '../utils/generationRecords'

const props = defineProps<{
    assets: HistoryAsset[]
    allHistoryCount: number
    favoriteCount: number
    collections: string[]
    loading: boolean
    filter: string
    search: string
    sort: AssetSortOrder
    selectionMode: boolean
    selectedIds: string[]
    downloading: boolean
    downloadStatus: string
}>()

defineEmits<{
    back: []
    'update:filter': [value: string]
    'update:search': [value: string]
    'update:sort': [value: AssetSortOrder]
    'toggle-selection-mode': []
    'toggle-selection': [assetId: string]
    'new-collection': []
    open: [asset: HistoryAsset]
    download: [asset: HistoryAsset]
    reference: [asset: HistoryAsset]
    reuse: [item: GenerationHistoryItem]
    canvas: [asset: HistoryAsset]
    'toggle-studio-visibility': [asset: HistoryAsset]
    favorite: [item: GenerationHistoryItem]
    category: [item: GenerationHistoryItem, category: string]
    'delete-image': [asset: HistoryAsset]
    'download-selected': []
    'delete-selected': []
}>()

const primaryFilters = computed(() => [
    { label: '全部图片', value: 'all', count: props.allHistoryCount },
    { label: '已收藏组', value: 'favorite', count: props.favoriteCount },
    { label: '文生图', value: 'text' },
    { label: '参考图生成', value: 'image' }
])

const formatAssetDate = (timestamp: number) => new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}).format(new Date(timestamp))
</script>
