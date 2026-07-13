<template>
    <div
        :class="[
            'fixed inset-0 z-[80] flex bg-brand-ink/45 sm:p-3',
            themeMode === 'dark' ? 'dark bg-black/85' : ''
        ]"
        @click.self="$emit('close')"
    >
        <section class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white sm:mx-auto sm:max-w-[1600px] sm:rounded-lg sm:border sm:border-brand-line sm:shadow-2xl dark:bg-night-surface">
            <header class="flex min-h-14 items-center justify-between gap-3 border-b border-brand-line px-3 sm:px-4">
                <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-brand-ink">
                        {{ item.source === 'text' ? '文生图' : '参考图生成' }} · 图片 {{ currentIndex + 1 }}/{{ item.images.length }}
                    </p>
                    <p class="truncate text-xs text-brand-muted">{{ formatDetailDate(item.createdAt) }} · {{ item.model }}</p>
                </div>
                <button type="button" class="wb-icon-button" aria-label="关闭详情" title="关闭详情" @click="$emit('close')">×</button>
            </header>

            <div class="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div class="flex min-h-[44vh] min-w-0 flex-col bg-brand-surface dark:bg-black/25">
                    <div class="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-5">
                        <img
                            :src="image"
                            alt="历史结果预览"
                            :class="[
                                'mx-auto h-auto w-auto object-contain',
                                originalMode ? 'max-w-none' : 'max-h-full max-w-full'
                            ]"
                        />
                    </div>
                    <div v-if="item.images.length > 1" class="border-t border-brand-line bg-white/80 p-2 dark:bg-night-surface/90">
                        <div class="flex gap-2 overflow-x-auto pb-1">
                            <button
                                v-for="(batchImage, index) in item.images"
                                :key="`${item.id}-detail-${index}`"
                                type="button"
                                :class="[
                                    'h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/25',
                                    image === batchImage ? 'border-brand-accent ring-1 ring-brand-accent/20' : 'border-brand-line'
                                ]"
                                :aria-label="`查看同批次图片 ${index + 1}`"
                                @click="$emit('select-image', batchImage)"
                            >
                                <img :src="batchImage" :alt="`历史结果 ${index + 1}`" class="h-full w-full object-cover" />
                            </button>
                        </div>
                    </div>
                </div>

                <aside class="min-h-0 overflow-y-auto border-t border-brand-line bg-white p-4 lg:border-l lg:border-t-0 dark:bg-night-surface">
                    <div class="grid grid-cols-3 gap-2">
                        <button type="button" class="wb-primary min-h-10 px-2 text-xs" @click="$emit('download')">下载</button>
                        <button type="button" class="wb-secondary min-h-10 px-2 text-xs" @click="$emit('reference')">当前图作参考</button>
                        <button type="button" class="wb-secondary min-h-10 px-2 text-xs" @click="$emit('reuse')">一键复用</button>
                    </div>

                    <div class="mt-3 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            :class="['wb-secondary min-h-9 px-2 text-xs', originalMode ? 'border-brand-accent text-brand-accent' : '']"
                            :aria-pressed="originalMode"
                            @click="$emit('toggle-original')"
                        >
                            {{ originalMode ? '适应窗口' : '原图尺寸' }}
                        </button>
                        <button
                            type="button"
                            :class="['wb-secondary min-h-9 px-2 text-xs', item.favorite ? 'border-brand-accent text-brand-accent' : '']"
                            :aria-pressed="item.favorite === true"
                            @click="$emit('favorite')"
                        >
                            {{ item.favorite ? '已收藏本组' : '收藏本组' }}
                        </button>
                    </div>

                    <section class="mt-5 border-t border-brand-line pt-4">
                        <div class="mb-2 flex items-center justify-between gap-2">
                            <h2 class="text-sm font-semibold text-brand-ink">生成提示词</h2>
                            <button type="button" class="text-xs font-semibold text-brand-accent hover:underline" @click="$emit('copy-prompt')">{{ promptCopyStatus || '复制' }}</button>
                        </div>
                        <p class="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-brand-muted">{{ item.prompt }}</p>
                    </section>

                    <section class="mt-5 border-t border-brand-line pt-4">
                        <h2 class="mb-3 text-sm font-semibold text-brand-ink">生成信息</h2>
                        <dl class="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs leading-5">
                            <dt class="text-brand-muted">模型</dt>
                            <dd class="break-all font-medium text-brand-ink">{{ item.model }}</dd>
                            <dt class="text-brand-muted">比例</dt>
                            <dd class="text-brand-ink">{{ item.aspectRatio }}</dd>
                            <dt class="text-brand-muted">分辨率</dt>
                            <dd class="text-brand-ink">{{ item.imageSize }}</dd>
                            <dt class="text-brand-muted">生成张数</dt>
                            <dd class="text-brand-ink">{{ item.images.length }} 张</dd>
                            <dt class="text-brand-muted">代理</dt>
                            <dd class="text-brand-ink">{{ item.useProxy ? '开启' : '关闭' }}</dd>
                        </dl>
                    </section>

                    <section class="mt-5 border-t border-brand-line pt-4">
                        <label class="block">
                            <span class="mb-1 block text-xs font-semibold text-brand-ink">本组收藏夹</span>
                            <select :value="item.category || ''" class="wb-input w-full" @change="$emit('category', ($event.target as HTMLSelectElement).value)">
                                <option value="">未归类</option>
                                <option v-for="category in collections" :key="category" :value="category">{{ category }}</option>
                            </select>
                            <span class="mt-1 block text-[11px] leading-4 text-brand-muted">同一批生成的图片会一起归类。</span>
                        </label>
                    </section>

                    <section class="mt-5 border-t border-brand-line pt-4">
                        <div class="flex items-center justify-between gap-2">
                            <div>
                                <h2 class="text-sm font-semibold text-brand-ink">本次生成诊断</h2>
                                <p class="mt-1 text-xs text-brand-muted">复制当前历史记录对应的模型、端点、参数和提示词。</p>
                            </div>
                            <button type="button" class="wb-secondary min-h-9 shrink-0 px-3 text-xs" @click="$emit('copy-diagnostic')">{{ diagnosticStatus || '复制诊断' }}</button>
                        </div>
                    </section>

                    <details class="mt-5 border-t border-brand-line pt-4">
                        <summary class="cursor-pointer text-sm font-semibold text-brand-muted">更多操作</summary>
                        <div class="mt-3 grid gap-2">
                            <button type="button" class="wb-secondary min-h-9 justify-start px-3 text-xs" @click="$emit('canvas')">加入画布</button>
                            <button type="button" class="wb-secondary min-h-9 justify-start px-3 text-xs text-brand-accent" @click="$emit('delete-image')">删除当前图</button>
                            <button type="button" class="wb-secondary min-h-9 justify-start px-3 text-xs text-brand-accent" @click="$emit('delete-group')">删除整组</button>
                        </div>
                    </details>
                </aside>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GenerationHistoryItem } from '../utils/historyDb'

const props = defineProps<{
    item: GenerationHistoryItem
    image: string
    originalMode: boolean
    collections: string[]
    themeMode: 'light' | 'dark'
    diagnosticStatus: string
    promptCopyStatus: string
}>()

defineEmits<{
    close: []
    'select-image': [image: string]
    download: []
    reference: []
    reuse: []
    'toggle-original': []
    favorite: []
    'copy-prompt': []
    category: [category: string]
    'copy-diagnostic': []
    canvas: []
    'delete-image': []
    'delete-group': []
}>()

const currentIndex = computed(() => Math.max(props.item.images.indexOf(props.image), 0))

const formatDetailDate = (timestamp: number) => new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}).format(new Date(timestamp))
</script>
