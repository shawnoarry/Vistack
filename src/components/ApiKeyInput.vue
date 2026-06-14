<template>
    <div class="rounded-lg border border-brand-line bg-white p-4 shadow-sm shadow-black/5">
        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h3 class="text-sm font-semibold text-brand-ink">生图 API 配置</h3>
                <p class="mt-1 text-xs text-brand-muted">这里仅用于生成图片和获取模型列表。提示词助手使用下方独立配置，不会和生图 Key / URL 合并。</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <span class="w-fit rounded-md border border-brand-line bg-brand-surface px-2 py-1 text-xs font-medium text-brand-muted">生图专用</span>
                <span v-if="modelValue" class="w-fit rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-xs font-medium text-brand-accent">密钥已保存</span>
            </div>
        </div>

        <div class="mb-4 rounded-lg border border-brand-line bg-brand-surface p-3">
            <div class="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p class="wb-label">生图配置预设</p>
                    <p class="mt-1 text-xs text-brand-muted">保存常用 URL / Key / Model / 代理设置，切换时会一起恢复。</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button
                        type="button"
                        class="wb-secondary min-h-9 px-3 text-xs"
                        :disabled="!canSavePreset"
                        @click="savePreset"
                    >
                        保存为新配置
                    </button>
                    <button
                        type="button"
                        class="wb-secondary min-h-9 px-3 text-xs"
                        :disabled="!selectedPresetId || !canSavePreset"
                        @click="$emit('update-preset', selectedPresetId)"
                    >
                        更新当前
                    </button>
                    <button
                        type="button"
                        class="rounded-lg border border-brand-accent/30 bg-brand-accent/10 px-3 py-2 text-xs font-semibold text-brand-accent transition hover:bg-brand-accent/15 disabled:cursor-not-allowed disabled:border-brand-line disabled:bg-brand-line disabled:text-brand-muted"
                        :disabled="!selectedPresetId"
                        @click="$emit('delete-preset', selectedPresetId)"
                    >
                        删除
                    </button>
                </div>
            </div>
            <div class="grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px]">
                <select
                    :value="selectedPresetId"
                    class="wb-input w-full"
                    @change="$emit('select-preset', ($event.target as HTMLSelectElement).value)"
                >
                    <option value="">未选择预设 / 使用当前填写</option>
                    <option v-for="preset in apiPresets" :key="preset.id" :value="preset.id">
                        {{ preset.name }} · {{ preset.model || '未指定模型' }}
                    </option>
                </select>
                <input
                    v-model="presetNameDraft"
                    type="text"
                    class="wb-input w-full"
                    placeholder="新配置名称，可不填"
                />
            </div>
            <p v-if="selectedPreset" class="mt-2 truncate text-xs text-brand-muted">
                当前预设：{{ selectedPreset.endpoint }} · {{ selectedPreset.useProxy ? '代理开启' : '直连' }}
            </p>
        </div>

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px]">
            <div>
                <label class="mb-1 block wb-label">生图 API 密钥</label>
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
                        生图 Key 只保存在当前浏览器本地，不会提交到仓库。
                    </p>
                    <p v-if="modelValue" class="text-xs text-brand-accent">已自动保存到本地</p>
                </div>
            </div>

            <div>
                <label class="mb-1 block wb-label">生图 API 端点</label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        :value="endpoint"
                        @input="$emit('update:endpoint', ($event.target as HTMLInputElement).value)"
                        placeholder="例如 https://duckcu.tech/v1 或 https://grsai.dakka.com.cn/v1/api/generate"
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
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span class="rounded-md border border-brand-line bg-brand-surface px-2 py-0.5 font-semibold text-brand-muted">{{ endpointModeLabel }}</span>
                    <span class="text-brand-muted">Base URL 会自动补全后缀；完整接口会保持原样。</span>
                </div>
                <label class="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-brand-line bg-brand-surface px-3 py-2 transition hover:border-brand-accent/40">
                    <input
                        type="checkbox"
                        :checked="useProxy"
                        @change="$emit('update:useProxy', ($event.target as HTMLInputElement).checked)"
                        class="mt-1 h-4 w-4 rounded border-brand-line text-brand-accent focus:ring-brand-accent"
                    />
                    <span class="min-w-0">
                        <span class="block text-sm font-semibold text-brand-ink">使用同源代理</span>
                        <span class="mt-1 block text-xs leading-5 text-brand-muted">
                            Cherry Studio 可用但浏览器请求失败时开启。模型列表、生图、任务轮询和图片保存会先走 /api/proxy。
                        </span>
                    </span>
                </label>
                <div v-if="useProxy" class="mt-2 rounded-lg border border-brand-line bg-brand-surface px-3 py-2">
                    <label class="mb-1 block wb-label">代理密码（可选）</label>
                    <input
                        type="password"
                        :value="proxyToken"
                        @input="$emit('update:proxyToken', ($event.target as HTMLInputElement).value)"
                        placeholder="留空表示服务器未设密码"
                        autocomplete="off"
                        class="wb-input w-full"
                    />
                    <p class="mt-1 text-xs leading-5 text-brand-muted">
                        需与 Vercel 环境变量 <code class="rounded bg-brand-line px-1 py-0.5 text-[11px]">VISTACK_PROXY_TOKEN</code> 完全一致。设置后只有你授权的人能调用此代理，可防止网址被滥用拖累 IP。
                    </p>
                </div>
            </div>

            <div>
                <label class="mb-1 block wb-label">模型列表</label>
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
                    <label class="mb-1 block wb-label">当前生图模型</label>
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

        <div class="mt-4 rounded-lg border border-brand-line bg-brand-surface p-3">
            <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h4 class="text-sm font-semibold text-brand-ink">提示词助手 API（独立，可选）</h4>
                    <p class="mt-1 text-xs text-brand-muted">只影响底部“AI 优化”按钮。它可以使用另一套 Key / URL / 文本模型，不影响正常生图。</p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <span class="w-fit rounded-md border border-brand-line bg-white px-2 py-1 text-xs font-medium text-brand-muted">不参与生图请求</span>
                    <span v-if="promptAssistantApiKey" class="w-fit rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-xs font-medium text-brand-accent">助手已配置</span>
                </div>
            </div>

            <div class="mb-3 rounded-md border border-brand-line bg-white px-3 py-2 text-xs leading-5 text-brand-muted">
                普通生图不需要依赖这里。助手端点填 Base URL 时会自动补全 /chat/completions。
            </div>

            <div class="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_260px]">
                <label>
                    <span class="mb-1 block wb-label">助手密钥</span>
                    <input
                        type="password"
                        :value="promptAssistantApiKey"
                        @input="$emit('update:promptAssistantApiKey', ($event.target as HTMLInputElement).value)"
                        placeholder="可与生图 API 不同"
                        class="wb-input w-full"
                    />
                </label>
                <label>
                    <span class="mb-1 block wb-label">助手端点</span>
                    <input
                        type="text"
                        :value="promptAssistantEndpoint"
                        @input="$emit('update:promptAssistantEndpoint', ($event.target as HTMLInputElement).value)"
                        placeholder="https://duckcu.tech/v1 或完整 chat/completions 地址"
                        class="wb-input w-full"
                    />
                </label>
                <label>
                    <span class="mb-1 block wb-label">助手模型</span>
                    <input
                        type="text"
                        :value="promptAssistantModel"
                        @input="$emit('update:promptAssistantModel', ($event.target as HTMLInputElement).value)"
                        placeholder="openai/gpt-4o-mini"
                        class="wb-input w-full"
                    />
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from '../config/api'
import { LocalStorage } from '../utils/storage'
import type { ApiConnectionPreset, ModelOption } from '../types'

const props = defineProps<{
    modelValue: string
    endpoint: string
    models: ModelOption[]
    model: string
    modelLoading: boolean
    modelError: string | null
    useProxy: boolean
    proxyToken: string
    promptAssistantApiKey: string
    promptAssistantEndpoint: string
    promptAssistantModel: string
    apiPresets: ApiConnectionPreset[]
    selectedPresetId: string
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'update:endpoint': [value: string]
    'update:model': [value: string]
    'update:useProxy': [value: boolean]
    'update:proxyToken': [value: string]
    'update:promptAssistantApiKey': [value: string]
    'update:promptAssistantEndpoint': [value: string]
    'update:promptAssistantModel': [value: string]
    'save-preset': [name?: string]
    'update-preset': [presetId: string]
    'delete-preset': [presetId: string]
    'select-preset': [presetId: string]
    'fetch-models': []
    'model-picked': []
}>()

const { modelValue, endpoint, models, model } = toRefs(props)
const presetNameDraft = ref('')

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
const canSavePreset = computed(() => modelValue.value.trim() !== '' && endpoint.value.trim() !== '')
const selectedPreset = computed(() => props.apiPresets.find(preset => preset.id === props.selectedPresetId))
const endpointModeLabel = computed(() => {
    const value = endpoint.value.trim().toLowerCase()
    if (!value) return '使用默认端点'
    if (value.includes('grsai') || value.endsWith('/api/generate') || value.endsWith('/v1/api/generate')) return 'Grsai 自动适配'
    if (value.includes('/draw/')) return 'Draw 任务接口'
    if (value.endsWith('/chat/completions')) return 'Chat Completions'
    if (value.endsWith('/images/generations')) return 'Images Generations'
    if (value.endsWith('/v1')) return 'Base URL'
    return '自动识别'
})

watch(
    () => props.selectedPresetId,
    () => {
        presetNameDraft.value = ''
    }
)

const savePreset = () => {
    emit('save-preset', presetNameDraft.value.trim() || undefined)
    presetNameDraft.value = ''
}

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
