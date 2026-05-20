<template>
    <div class="rounded-lg border border-brand-line bg-white p-4 shadow-sm shadow-black/5">
        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h3 class="text-sm font-semibold text-brand-ink">API 配置</h3>
                <p class="mt-1 text-xs text-brand-muted">可使用 OpenRouter，也可填写 Grsai 或其他兼容端点。</p>
            </div>
            <span v-if="modelValue" class="w-fit rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-xs font-medium text-brand-accent">密钥已保存</span>
        </div>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px]">
            <div>
                <label class="mb-1 block wb-label">API 密钥</label>
                <div class="flex gap-2">
                    <input
                        type="password"
                        :value="modelValue"
                        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                        placeholder="输入 API 密钥"
                        class="wb-input min-w-0 flex-1"
                    />
                    <button
                        v-if="modelValue"
                        type="button"
                        @click="clearApiKey"
                        class="rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-3 py-2 text-sm font-semibold text-brand-accent transition hover:bg-brand-accent/15"
                        title="清除缓存的 API 密钥"
                    >
                        清除
                    </button>
                </div>
                <div class="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <p class="text-xs text-brand-muted">
                        默认 OpenRouter，其他供应商请同时修改端点。
                    </p>
                    <p v-if="modelValue" class="text-xs text-brand-accent">已自动保存到本地</p>
                </div>
            </div>

            <div>
                <label class="mb-1 block wb-label">API 端点</label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        :value="endpoint"
                        @input="$emit('update:endpoint', ($event.target as HTMLInputElement).value)"
                        placeholder="例如 https://grsai.dakka.com.cn/v1/api/generate"
                        class="wb-input min-w-0 flex-1"
                    />
                    <button
                        v-if="isCustomEndpoint"
                        type="button"
                        @click="resetEndpoint"
                        class="wb-secondary"
                        title="恢复默认端点"
                    >
                        默认
                    </button>
                </div>
                <p class="mt-1 text-xs text-brand-muted">Grsai 生成接口、OpenAI Images、OpenRouter Chat 均会自动识别。</p>
            </div>

            <div>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                        type="button"
                        @click="$emit('fetch-models')"
                        :disabled="!canFetchModels || modelLoading"
                        :class="[
                            'inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-semibold transition',
                            modelLoading
                                ? 'cursor-wait bg-brand-line text-brand-muted'
                                : canFetchModels
                                  ? 'bg-brand-accent text-brand-surface hover:bg-brand-accent/90'
                                  : 'cursor-not-allowed bg-brand-line text-brand-muted'
                        ]"
                    >
                        {{ modelLoading ? '正在获取...' : '获取模型列表' }}
                    </button>
                    <span v-if="models.length" class="text-xs text-brand-muted">已载入 {{ models.length }} 个模型</span>
                </div>
                <p v-if="modelError" class="mt-2 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-xs text-brand-accent">{{ modelError }}</p>

                <div class="mt-3">
                    <label class="mb-1 block wb-label">模型</label>
                    <select
                        :value="model"
                        @change="handleModelChange"
                        class="wb-input w-full"
                    >
                        <option v-for="item in optionList" :key="item.id" :value="item.id">
                            {{ item.supportsImages ? '[image] ' : '' }}{{ item.label }}
                        </option>
                    </select>
                    <p v-if="selectedModelInfo" class="mt-1 text-xs text-brand-muted">{{ selectedModelInfo }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'
import { LocalStorage } from '../utils/storage'
import type { ModelOption } from '../types'

const props = defineProps<{
    modelValue: string
    endpoint: string
    models: ModelOption[]
    model: string
    modelLoading: boolean
    modelError: string | null
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'update:endpoint': [value: string]
    'update:model': [value: string]
    'fetch-models': []
    'model-picked': []
}>()

const { modelValue, endpoint, models, model } = toRefs(props)

const clearApiKey = () => {
    LocalStorage.clearApiKey()
    LocalStorage.clearModelId()
    emit('update:modelValue', '')
    emit('update:model', '')
}

const resetEndpoint = () => {
    emit('update:endpoint', DEFAULT_API_ENDPOINT)
    emit('update:model', '')
}

const isCustomEndpoint = computed(() => endpoint.value !== '' && endpoint.value !== DEFAULT_API_ENDPOINT)
const canFetchModels = computed(() => modelValue.value.trim() !== '' && endpoint.value.trim() !== '')
const optionList = computed<ModelOption[]>(() => {
    if (models.value.length) {
        return models.value
    }

    const fallbackId = model.value || DEFAULT_MODEL_ID

    return [
        {
            id: fallbackId,
            label: buildFallbackLabel(fallbackId),
            description: '',
            supportsImages: true
        }
    ]
})

const selectedModelInfo = computed(() => {
    const current = optionList.value.find(option => option.id === model.value)
    if (!current) return ''
    if (current.description) {
        return current.description
    }
    return current.supportsImages ? '支持生成图片' : ''
})

const handleModelChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value
    emit('update:model', value)
    emit('model-picked')
}

function buildFallbackLabel(modelId: string): string {
    const segments = modelId.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment || modelId
}
</script>
