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
            <p class="mt-1 text-xs text-brand-muted">可一次上传多张。每张上传后可标注它代表的人物、主体、服装或背景。</p>
        </div>

        <div v-if="thumbnails.length > 0" class="space-y-2">
            <div v-for="(thumbnail, index) in thumbnails" :key="`${thumbnail}-${index}`" class="rounded-lg border border-brand-line bg-white p-2">
                <div class="flex gap-2">
                    <div class="group relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-brand-line bg-brand-surface">
                        <img :src="thumbnail" :alt="`Image ${index + 1}`" class="h-full w-full object-cover" />
                        <button
                            type="button"
                            @click="removeThumbnail(index)"
                            class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-brand-ink/90 text-sm font-semibold text-brand-surface opacity-0 transition hover:bg-brand-accent group-hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                    <div class="min-w-0 flex-1">
                        <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-muted">这张图代表</label>
                        <input
                            :value="labels[index] || defaultLabel(index)"
                            @input="updateLabel(index, ($event.target as HTMLInputElement).value)"
                            class="mt-1 w-full rounded-md border border-brand-line bg-brand-surface px-2 py-1.5 text-xs text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10"
                            :placeholder="`${defaultLabel(index)} / 服装参考 / 背景参考`"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    modelValue: string[]
    labels?: string[]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string[]]
    'update:labels': [value: string[]]
}>()

const fileInput = ref<HTMLInputElement>()
const uploadArea = ref<HTMLElement>()
const isDragOver = ref(false)

const thumbnails = computed(() => props.modelValue)
const labels = computed(() => props.labels || [])

const defaultLabel = (index: number) => `角色${index + 1}`

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
            }
        }
        reader.readAsDataURL(file)
    })
}

const removeThumbnail = (index: number) => {
    const newImages = props.modelValue.filter((_, i) => i !== index)
    emit('update:modelValue', newImages)
    emit('update:labels', labels.value.filter((_, i) => i !== index))
}

const updateLabel = (index: number, label: string) => {
    const nextLabels = [...labels.value]
    nextLabels[index] = label
    emit('update:labels', nextLabels)
}
</script>
