<template>
    <section class="flex min-h-[660px] flex-col rounded-lg border border-brand-line bg-white p-4 shadow-sm shadow-black/5">
        <div class="mb-4 flex flex-col gap-3 border-b border-brand-line pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p class="wb-label text-brand-accent">Canvas workbench</p>
                <h2 class="mt-1 text-base font-semibold text-brand-ink">画布工作台</h2>
                <p class="mt-1 text-sm text-brand-muted">辅助整理区，不替代快速生成。把结果图、参考图、历史资产放到这里编排，再选择单张或全部送回参考图。</p>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="wb-chip">{{ items.length }} items</span>
                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" :disabled="!selectedItem" @click="selectedItem && $emit('use-reference', selectedItem.image)">
                    选中作参考
                </button>
                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" :disabled="!items.length" @click="$emit('use-all-references', items.map(item => item.image))">
                    全部作参考
                </button>
                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" :disabled="!selectedItem" @click="selectedItem && $emit('download', selectedItem.image)">
                    下载
                </button>
                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" :disabled="!selectedItem?.prompt" @click="selectedItem?.prompt && $emit('reuse-prompt', selectedItem.prompt)">
                    复用提示词
                </button>
                <button type="button" class="wb-secondary min-h-9 px-3 text-xs text-brand-accent" :disabled="!items.length" @click="$emit('clear')">
                    清空
                </button>
            </div>
        </div>

        <div class="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div
                ref="stageRef"
                class="relative min-h-[560px] overflow-hidden rounded-lg border border-brand-line bg-[#FAFAFB]"
                @pointerdown.self="selectItem('')"
            >
                <div class="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:linear-gradient(#E6E6E9_1px,transparent_1px),linear-gradient(90deg,#E6E6E9_1px,transparent_1px)] [background-size:32px_32px]" />

                <div v-if="!items.length" class="absolute inset-0 flex items-center justify-center p-8">
                    <div class="max-w-sm rounded-lg border border-dashed border-brand-line bg-white p-5 text-center">
                        <p class="text-sm font-semibold text-brand-ink">画布还是空的</p>
                        <p class="mt-2 text-sm leading-6 text-brand-muted">从生成结果、历史资产或参考图区点击“加入画布”。画布只负责整理素材，真正生成仍从底部提示词按钮提交。</p>
                    </div>
                </div>

                <article
                    v-for="item in items"
                    :key="item.id"
                    class="group absolute select-none rounded-lg border bg-white shadow-md shadow-black/10"
                    :class="selectedItemId === item.id ? 'border-brand-accent ring-2 ring-brand-accent/20' : 'border-brand-line'"
                    :style="itemStyle(item)"
                    @pointerdown.stop="startDrag(item, $event)"
                >
                    <button type="button" class="block h-full w-full overflow-hidden rounded-[7px]" @click.stop="selectItem(item.id)">
                        <img :src="item.image" :alt="item.title" class="h-full w-full object-cover" draggable="false" />
                    </button>
                    <div class="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-[7px] bg-brand-ink/82 px-2 py-1 opacity-0 transition group-hover:opacity-100">
                        <p class="truncate text-[11px] font-semibold text-brand-surface">{{ item.title }}</p>
                    </div>
                    <button
                        type="button"
                        class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-brand-line bg-white text-xs font-semibold text-brand-muted opacity-0 shadow-sm transition hover:text-brand-accent group-hover:opacity-100"
                        title="移出画布"
                        @click.stop="$emit('remove', item.id)"
                    >
                        ×
                    </button>
                    <button
                        type="button"
                        class="absolute bottom-1 right-1 h-4 w-4 cursor-nwse-resize rounded-sm border border-white/70 bg-brand-ink/70 opacity-0 transition group-hover:opacity-100"
                        title="调整大小"
                        @pointerdown.stop="startResize(item, $event)"
                    />
                </article>
            </div>

            <aside class="min-h-0 rounded-lg border border-brand-line bg-brand-surface p-3">
                <div v-if="selectedItem" class="space-y-3">
                    <div class="overflow-hidden rounded-md border border-brand-line bg-white">
                        <img :src="selectedItem.image" :alt="selectedItem.title" class="h-40 w-full object-cover" />
                    </div>
                    <div>
                        <p class="wb-label">选中图片</p>
                        <h3 class="mt-1 text-sm font-semibold text-brand-ink">{{ selectedItem.title }}</h3>
                        <p class="mt-1 text-xs text-brand-muted">{{ sourceLabel(selectedItem.source) }} · {{ Math.round(selectedItem.width) }} × {{ Math.round(selectedItem.height) }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <button type="button" class="wb-primary min-h-9 px-3 text-xs" @click="$emit('use-reference', selectedItem.image)">选中作参考</button>
                        <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="$emit('download', selectedItem.image)">下载</button>
                        <button type="button" class="wb-secondary min-h-9 px-3 text-xs" :disabled="!selectedItem.prompt" @click="selectedItem.prompt && $emit('reuse-prompt', selectedItem.prompt)">复用提示词</button>
                        <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="$emit('remove', selectedItem.id)">移出</button>
                        <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="nudgeSelected(-24, 0)">左移</button>
                        <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="nudgeSelected(24, 0)">右移</button>
                        <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="nudgeSelected(0, -24)">上移</button>
                        <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="nudgeSelected(0, 24)">下移</button>
                    </div>
                    <button type="button" class="wb-primary w-full min-h-9 px-3 text-xs" :disabled="!items.length" @click="$emit('use-all-references', items.map(item => item.image))">
                        全部设为参考图
                    </button>
                </div>
                <div v-else class="space-y-3">
                    <div class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm leading-6 text-brand-muted">
                        先点选画布上的图片，再决定是把选中图送回参考图、下载，还是复用它携带的提示词。
                    </div>
                    <button type="button" class="wb-primary w-full min-h-9 px-3 text-xs" :disabled="!items.length" @click="$emit('use-all-references', items.map(item => item.image))">
                        全部设为参考图
                    </button>
                </div>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CanvasWorkbenchItem } from '../types'

const props = defineProps<{
    items: CanvasWorkbenchItem[]
}>()

const emit = defineEmits<{
    update: [items: CanvasWorkbenchItem[]]
    remove: [id: string]
    clear: []
    'use-reference': [image: string]
    'use-all-references': [images: string[]]
    download: [image: string]
    'reuse-prompt': [prompt: string]
}>()

const stageRef = ref<HTMLElement | null>(null)
const selectedItemId = ref('')

const selectedItem = computed(() => props.items.find(item => item.id === selectedItemId.value) || null)

const itemStyle = (item: CanvasWorkbenchItem) => ({
    width: `${item.width}px`,
    height: `${item.height}px`,
    transform: `translate(${item.x}px, ${item.y}px)`
})

const selectItem = (id: string) => {
    selectedItemId.value = id
}

const startDrag = (item: CanvasWorkbenchItem, event: PointerEvent) => {
    selectItem(item.id)
    const startX = event.clientX
    const startY = event.clientY
    const originX = item.x
    const originY = item.y

    const move = (moveEvent: PointerEvent) => {
        updateItem(item.id, {
            x: clamp(originX + moveEvent.clientX - startX, 0, stageWidth() - item.width),
            y: clamp(originY + moveEvent.clientY - startY, 0, stageHeight() - item.height)
        })
    }

    trackPointer(move)
}

const startResize = (item: CanvasWorkbenchItem, event: PointerEvent) => {
    selectItem(item.id)
    const startX = event.clientX
    const startY = event.clientY
    const originWidth = item.width
    const originHeight = item.height

    const move = (moveEvent: PointerEvent) => {
        const nextWidth = clamp(originWidth + moveEvent.clientX - startX, 120, 520)
        const nextHeight = clamp(originHeight + moveEvent.clientY - startY, 120, 520)
        updateItem(item.id, {
            width: Math.min(nextWidth, stageWidth() - item.x),
            height: Math.min(nextHeight, stageHeight() - item.y)
        })
    }

    trackPointer(move)
}

const nudgeSelected = (x: number, y: number) => {
    if (!selectedItem.value) return

    updateItem(selectedItem.value.id, {
        x: clamp(selectedItem.value.x + x, 0, stageWidth() - selectedItem.value.width),
        y: clamp(selectedItem.value.y + y, 0, stageHeight() - selectedItem.value.height)
    })
}

const updateItem = (id: string, patch: Partial<CanvasWorkbenchItem>) => {
    emit('update', props.items.map(item => item.id === id ? { ...item, ...patch } : item))
}

const trackPointer = (move: (event: PointerEvent) => void) => {
    const stop = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', stop)
        window.removeEventListener('pointercancel', stop)
    }

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop, { once: true })
    window.addEventListener('pointercancel', stop, { once: true })
}

const stageWidth = () => stageRef.value?.clientWidth || 960
const stageHeight = () => stageRef.value?.clientHeight || 560

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

const sourceLabel = (source: CanvasWorkbenchItem['source']) => {
    if (source === 'result') return '生成结果'
    if (source === 'history') return '历史资产'
    if (source === 'reference') return '参考图'
    return '手动加入'
}
</script>
