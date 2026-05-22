<template>
    <div class="flex h-full flex-col gap-3">
        <div
            ref="uploadArea"
            @click="fileInput?.click()"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            :class="[
                'flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition',
                isDragOver ? 'border-brand-accent bg-brand-accent/10' : 'border-brand-line bg-white hover:border-brand-accent/50 hover:bg-brand-surface'
            ]"
        >
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />

            <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-brand-line bg-brand-surface text-brand-ink">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>
            </div>

            <h3 class="text-sm font-semibold text-brand-ink">拖拽或点击上传参考图</h3>
            <p class="mt-1 text-xs leading-5 text-brand-muted">上传后先给每张图标注用途。人物、服装、背景、产品会被写进最终提示词，帮助模型知道该参考哪里。</p>
        </div>

        <div v-if="thumbnails.length > 0" class="space-y-2">
            <div v-for="(thumbnail, index) in thumbnails" :key="`${thumbnail}-${index}`" class="rounded-lg border border-brand-line bg-white p-2">
                <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p class="text-xs font-semibold text-brand-ink">参考图 {{ index + 1 }} · {{ roleLabel(metaFor(index).role) }}</p>
                    <p class="text-[11px] text-brand-muted">{{ usageHint(metaFor(index).role) }}</p>
                </div>
                <div class="flex gap-2">
                    <div class="group relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-brand-line bg-brand-surface">
                        <img :src="thumbnail" :alt="`Image ${index + 1}`" class="h-full w-full object-cover" />
                        <button
                            type="button"
                            @click.stop="previewImage = thumbnail"
                            class="absolute bottom-1 left-1 rounded-md bg-brand-ink/90 px-1.5 py-1 text-[10px] font-semibold text-brand-surface shadow-sm transition hover:bg-brand-accent sm:opacity-0 sm:group-hover:opacity-100"
                        >
                            预览
                        </button>
                        <button
                            type="button"
                            @click.stop="removeThumbnail(index)"
                            class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-brand-ink/90 text-sm font-semibold text-brand-surface shadow-sm transition hover:bg-brand-accent sm:opacity-0 sm:group-hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                    <div class="min-w-0 flex-1 space-y-2">
                        <div class="grid grid-cols-[110px_minmax(0,1fr)] gap-2">
                            <label class="min-w-0">
                                <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">用途类型</span>
                                <select
                                    :value="metaFor(index).role"
                                    @change="updateMeta(index, { role: ($event.target as HTMLSelectElement).value as ReferenceImageRole })"
                                    class="mt-1 w-full rounded-md border border-brand-line bg-brand-surface px-2 py-1.5 text-xs text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
                                >
                                    <option v-for="option in roleOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                                </select>
                            </label>
                            <label class="min-w-0">
                                <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">名称 / 同人分组</span>
                                <input
                                    :value="metaFor(index).label"
                                    @input="updateMeta(index, { label: ($event.target as HTMLInputElement).value })"
                                    class="mt-1 w-full rounded-md border border-brand-line bg-brand-surface px-2 py-1.5 text-xs text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
                                    :placeholder="defaultLabel(index)"
                                />
                            </label>
                        </div>
                        <label class="block">
                            <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">给模型的补充说明</span>
                            <input
                                :value="metaFor(index).note || ''"
                                @input="updateMeta(index, { note: ($event.target as HTMLInputElement).value })"
                                class="mt-1 w-full rounded-md border border-brand-line bg-brand-surface px-2 py-1.5 text-xs text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
                                placeholder="例如：保持发型和脸型 / 只参考衣服 / 作为室内背景"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="previewImage" class="fixed inset-0 z-[90] flex items-center justify-center bg-brand-ink/85 p-4" @click.self="previewImage = ''">
        <div class="max-h-full w-full max-w-5xl rounded-lg border border-brand-surface/20 bg-brand-ink p-3 shadow-2xl">
            <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-brand-surface">参考图预览</p>
                <button type="button" class="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-accent/90" @click="previewImage = ''">关闭</button>
            </div>
            <div class="max-h-[78vh] overflow-auto rounded-lg bg-black/20">
                <img :src="previewImage" alt="参考图放大预览" class="mx-auto max-h-[78vh] w-auto max-w-full object-contain" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReferenceImageMeta, ReferenceImageRole } from '../types'

const props = defineProps<{
    modelValue: string[]
    labels?: string[]
    metadata?: ReferenceImageMeta[]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:labels': [value: string[]]
    'update:metadata': [value: ReferenceImageMeta[]]
}>()

const fileInput = ref<HTMLInputElement>()
const uploadArea = ref<HTMLElement>()
const isDragOver = ref(false)
const previewImage = ref('')

const thumbnails = computed(() => props.modelValue)
const labels = computed(() => props.labels || [])
const metadata = computed(() => props.metadata || [])

const roleOptions: Array<{ value: ReferenceImageRole; label: string }> = [
    { value: 'character', label: '人物/角色' },
    { value: 'outfit', label: '服装' },
    { value: 'background', label: '背景' },
    { value: 'product', label: '产品/主体' },
    { value: 'style', label: '风格' },
    { value: 'other', label: '其他' }
]

const defaultLabel = (index: number) => `角色${index + 1}`

const roleLabel = (role: ReferenceImageRole) => roleOptions.find(option => option.value === role)?.label || '其他'

const usageHint = (role: ReferenceImageRole) => {
    if (role === 'character') return '同一个人请填同一个名称'
    if (role === 'outfit') return '主要参考衣服和造型'
    if (role === 'background') return '主要参考环境和空间'
    if (role === 'product') return '作为主体或产品参考'
    if (role === 'style') return '只参考视觉风格'
    return '按说明参与生成'
}

const defaultMeta = (index: number): ReferenceImageMeta => ({
    role: 'character',
    label: labels.value[index] || defaultLabel(index),
    note: ''
})

const metaFor = (index: number): ReferenceImageMeta => ({
    ...defaultMeta(index),
    ...(metadata.value[index] || {})
})

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        handleFiles(Array.from(target.files))
        // 重置input的value，允许重新上传相同的文件
        target.value = ''
    }
}

const handleDragEnter = () => {
    isDragOver.value = true
}

const handleDragOver = () => {
    isDragOver.value = true
}

const handleDragLeave = (event: DragEvent) => {
    if (!uploadArea.value?.contains(event.relatedTarget as Node)) {
        isDragOver.value = false
    }
}

const handleDrop = (event: DragEvent) => {
    isDragOver.value = false
    if (event.dataTransfer?.files) {
        handleFiles(Array.from(event.dataTransfer.files))
    }
}

const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    imageFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = e => {
            if (e.target?.result) {
                const newImages = [...props.modelValue, e.target.result as string]
                emit('update:modelValue', newImages)
                emit('update:labels', [...labels.value, defaultLabel(newImages.length - 1)])
                emit('update:metadata', [...metadata.value, defaultMeta(newImages.length - 1)])
            }
        }
        reader.readAsDataURL(file)
    })
}

const removeThumbnail = (index: number) => {
    const newImages = props.modelValue.filter((_, i) => i !== index)
    emit('update:modelValue', newImages)
    emit('update:labels', labels.value.filter((_, i) => i !== index))
    emit('update:metadata', metadata.value.filter((_, i) => i !== index))
}

const updateMeta = (index: number, patch: Partial<ReferenceImageMeta>) => {
    const current = metaFor(index)
    const nextMeta = { ...current, ...patch }
    const nextMetadata = [...metadata.value]
    nextMetadata[index] = nextMeta
    emit('update:metadata', nextMetadata)

    if (patch.label !== undefined) {
        updateLabel(index, patch.label)
    }
}

const updateLabel = (index: number, label: string) => {
    const nextLabels = [...labels.value]
    nextLabels[index] = label
    emit('update:labels', nextLabels)
}
</script>
