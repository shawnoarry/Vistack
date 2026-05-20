<template>
    <div class="min-h-screen bg-brand-ink text-brand-ink">
        <header class="sticky top-0 z-40 border-b border-brand-line bg-brand-surface/95 backdrop-blur">
            <div class="wb-shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div class="min-w-0">
                    <p class="wb-label text-brand-accent">Image generation studio</p>
                    <div class="mt-1 flex flex-wrap items-end gap-3">
                        <h1 class="text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl">Nano Banana Workbench</h1>
                        <span class="rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-xs font-medium text-brand-accent">
                            {{ selectedModel || DEFAULT_MODEL_ID }}
                        </span>
                    </div>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div class="max-w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink sm:max-w-[440px]">
                        <div class="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-muted">Endpoint</div>
                        <div class="truncate">{{ apiEndpoint || DEFAULT_API_ENDPOINT }}</div>
                    </div>
                    <button
                        type="button"
                        @click="showApiSettings = !showApiSettings"
                        :class="[
                            'inline-flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-semibold transition',
                            apiKey
                                ? 'border-brand-accent bg-brand-accent text-brand-surface hover:bg-brand-accent/90'
                                : 'border-brand-accent/30 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15'
                        ]"
                    >
                        {{ apiKey ? 'API 已配置' : '配置 API' }}
                        <svg :class="['ml-2 h-4 w-4 transition-transform', showApiSettings ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>

        <section v-if="showApiSettings" class="border-b border-brand-line bg-brand-surface">
            <div class="wb-shell py-4">
                <ApiKeyInput
                    v-model="apiKey"
                    v-model:endpoint="apiEndpoint"
                    v-model:model="selectedModel"
                    :models="modelOptions"
                    :model-loading="isFetchingModels"
                    :model-error="modelsError"
                    @fetch-models="handleFetchModels"
                    @model-picked="handleModelPicked"
                />
            </div>
        </section>

        <main class="wb-shell grid gap-4 py-4 pb-64 lg:grid-cols-[320px_minmax(0,1fr)_360px] xl:grid-cols-[340px_minmax(0,1fr)_380px]">
            <aside class="space-y-4">
                <section class="wb-panel">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h2 class="text-sm font-semibold text-brand-ink">参考图</h2>
                            <p class="mt-1 text-xs text-brand-muted">用于图文生图或把生成结果继续送回工作流。</p>
                        </div>
                        <span class="wb-chip">{{ selectedImages.length }} 张</span>
                    </div>
                    <ImageUpload v-model="selectedImages" v-model:labels="referenceImageLabels" />
                </section>

                <section class="wb-panel">
                    <div class="mb-3">
                        <h2 class="text-sm font-semibold text-brand-ink">合影助手</h2>
                        <p class="mt-1 text-xs text-brand-muted">给多张参考图加角色语义，再选择合影动作，生成前会拼成一段结构化提示词。</p>
                    </div>
                    <div class="space-y-3">
                        <label class="flex items-center gap-2 text-sm font-semibold text-brand-ink">
                            <input v-model="portraitAssistEnabled" type="checkbox" class="h-4 w-4 rounded border-brand-line text-brand-accent focus:ring-brand-accent" />
                            启用合影伪预处理
                        </label>
                        <div class="grid grid-cols-2 gap-2">
                            <label class="min-w-0">
                                <span class="wb-label mb-1 block">合影动作</span>
                                <select v-model="portraitPose" class="wb-input w-full">
                                    <option v-for="pose in portraitPoseOptions" :key="pose.value" :value="pose.value">{{ pose.label }}</option>
                                </select>
                            </label>
                            <label class="min-w-0">
                                <span class="wb-label mb-1 block">场景关系</span>
                                <select v-model="portraitRelation" class="wb-input w-full">
                                    <option v-for="relation in portraitRelationOptions" :key="relation.value" :value="relation.value">{{ relation.label }}</option>
                                </select>
                            </label>
                        </div>
                        <textarea v-model="portraitExtraPrompt" class="wb-input min-h-[76px] w-full resize-none py-2" placeholder="补充：例如看向镜头、保持角色服装、自然互动。" />
                    </div>
                </section>

                <section class="wb-panel">
                    <div class="mb-3">
                        <h2 class="text-sm font-semibold text-brand-ink">风格与改图提示词</h2>
                        <p class="mt-1 text-xs text-brand-muted">选择模板或写入自定义提示词后，用底部按钮执行参考图生成。</p>
                    </div>
                    <StylePromptSelector
                        v-model:selectedStyle="selectedStyle"
                        v-model:customPrompt="customPrompt"
                        :templates="styleTemplates"
                        :phrase-groups="promptPhraseGroups"
                    />
                </section>
            </aside>

            <section class="min-w-0 rounded-lg border border-brand-line bg-white p-4 shadow-sm shadow-black/5">
                <div class="mb-4 flex flex-col gap-3 border-b border-brand-line pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 class="text-base font-semibold text-brand-ink">生成结果</h2>
                        <p class="mt-1 text-sm text-brand-muted">最新结果会显示在这里，可下载，也可推送为下一轮参考图。</p>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs">
                        <span class="wb-chip">{{ displayResults.length }} outputs</span>
                        <span v-if="displayLoading" class="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-1 text-brand-accent">生成中</span>
                        <span v-else class="wb-chip">待命</span>
                    </div>
                </div>
                <ResultDisplay
                    :results="displayResults"
                    :loading="displayLoading"
                    :error="displayError"
                    :can-push="canPushDisplayResult"
                    @download="handleDownloadResult"
                    @push="handlePushDisplayResult"
                />
            </section>

            <aside class="space-y-4">
                <section class="wb-panel">
                    <h2 class="text-sm font-semibold text-brand-ink">模型状态</h2>
                    <dl class="mt-4 space-y-3 text-sm">
                        <div>
                            <dt class="wb-label">当前模型</dt>
                            <dd class="mt-1 break-words text-brand-ink">{{ selectedModel || DEFAULT_MODEL_ID }}</dd>
                        </div>
                        <div>
                            <dt class="wb-label">模型类型</dt>
                            <dd class="mt-1 text-brand-ink">{{ selectedImageModelType || '自动识别' }}</dd>
                        </div>
                        <div>
                            <dt class="wb-label">Google Search</dt>
                            <dd class="mt-1 text-brand-ink">{{ supportsGoogleSearch ? (gemini3EnableGoogleSearch ? '已启用' : '可启用') : '当前模型不支持' }}</dd>
                        </div>
                    </dl>
                </section>

                <section class="wb-panel">
                    <PromptPhraseBuilder
                        :groups="promptPhraseGroups"
                        title="文生图词组"
                        description="点击后追加到底部文生图提示词。"
                        @insert="insertTextPromptPhrase"
                    />
                </section>

                <section v-if="showAspectRatioSelector" class="wb-panel">
                    <div class="mb-3">
                        <h2 class="text-sm font-semibold text-brand-ink">比例</h2>
                        <p class="mt-1 text-xs text-brand-muted">Nano Banana / Gemini / GPT Image 会按模型能力映射到对应请求参数。</p>
                    </div>
                    <AspectRatioSelector v-model="selectedAspectRatio" :model-type="selectedImageModelType" :image-size="gemini3ImageSize" />
                </section>

                <section v-if="showImageSizeConfig" class="wb-panel">
                    <div class="mb-3">
                        <h2 class="text-sm font-semibold text-brand-ink">分辨率</h2>
                        <p class="mt-1 text-xs text-brand-muted">支持 1K、2K、4K；仅在模型支持时显示额外配置。</p>
                    </div>
                    <Gemini3ProConfig
                        v-model:imageSize="gemini3ImageSize"
                        v-model:enableGoogleSearch="gemini3EnableGoogleSearch"
                        :model-type="selectedImageModelType"
                    />
                </section>

                <section class="wb-panel">
                    <h2 class="text-sm font-semibold text-brand-ink">运行信息</h2>
                    <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="text-xs text-brand-muted">比例</div>
                            <div class="mt-1 font-semibold text-brand-ink">{{ selectedAspectRatio }}</div>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="text-xs text-brand-muted">尺寸</div>
                            <div class="mt-1 font-semibold text-brand-ink">{{ gemini3ImageSize }}</div>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="text-xs text-brand-muted">参考图</div>
                            <div class="mt-1 font-semibold text-brand-ink">{{ selectedImages.length }}</div>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="text-xs text-brand-muted">模型数</div>
                            <div class="mt-1 font-semibold text-brand-ink">{{ modelOptions.length }}</div>
                        </div>
                    </div>
                </section>

                <section class="wb-panel">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h2 class="text-sm font-semibold text-brand-ink">生成历史</h2>
                            <p class="mt-1 text-xs text-brand-muted">成功结果会保存在本地浏览器，除非你手动清空或浏览器清理站点数据。</p>
                        </div>
                        <button
                            v-if="generationHistory.length"
                            type="button"
                            @click="clearGenerationHistory"
                            class="text-xs font-semibold text-brand-muted transition hover:text-brand-accent"
                        >
                            清空
                        </button>
                    </div>

                    <div v-if="generationHistory.length" class="mb-3 grid grid-cols-2 gap-2">
                        <select v-model="historyFilter" class="wb-input min-h-10 py-2 text-xs">
                            <option value="all">全部记录</option>
                            <option value="favorite">收藏</option>
                            <option value="text">文生图</option>
                            <option value="image">参考图生成</option>
                            <option v-for="category in historyCategories" :key="category" :value="`category:${category}`">{{ category }}</option>
                        </select>
                        <input v-model="historyNewCategory" class="wb-input min-h-10 py-2 text-xs" placeholder="新分类名" />
                    </div>

                    <div v-if="filteredGenerationHistory.length" class="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                        <article v-for="item in filteredGenerationHistory" :key="item.id" class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="text-xs font-semibold text-brand-ink">
                                        {{ item.source === 'text' ? '文生图' : '参考图生成' }}
                                        <span v-if="item.category" class="text-brand-muted"> · {{ item.category }}</span>
                                    </p>
                                    <p class="mt-1 truncate text-xs text-brand-muted">{{ item.prompt }}</p>
                                </div>
                                <button type="button" class="shrink-0 rounded-md bg-brand-line/60 px-2 py-1 text-[11px] text-brand-muted transition hover:text-brand-accent" @click="toggleHistoryFavorite(item)">
                                    {{ item.favorite ? '已收藏' : item.aspectRatio }}
                                </button>
                            </div>

                            <div class="mt-3 grid grid-cols-4 gap-2">
                                <button
                                    v-for="(image, index) in item.images.slice(0, 4)"
                                    :key="`${item.id}-${index}`"
                                    type="button"
                                    @click="restoreHistoryItem(item)"
                                    class="aspect-square overflow-hidden rounded-md border border-brand-line bg-brand-surface"
                                >
                                    <img :src="image" :alt="`历史结果 ${index + 1}`" class="h-full w-full object-cover" />
                                </button>
                            </div>

                            <div class="mt-3 flex flex-wrap gap-2">
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="restoreHistoryItem(item)">查看</button>
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="pushHistoryImages(item)">作为参考图</button>
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="reuseHistoryPrompt(item)">复用提示词</button>
                                <button v-if="historyNewCategory.trim()" type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="setHistoryCategory(item, historyNewCategory.trim())">归类</button>
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="toggleHistoryFavorite(item)">{{ item.favorite ? '取消收藏' : '收藏' }}</button>
                            </div>
                        </article>
                    </div>

                    <p v-else-if="historyLoading" class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm text-brand-muted">正在读取本地历史...</p>
                    <p v-else class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm text-brand-muted">{{ generationHistory.length ? '当前筛选下没有记录。' : '成功生成后，历史记录会出现在这里。' }}</p>
                </section>
            </aside>
        </main>

        <div class="fixed inset-x-0 bottom-0 z-50 border-t border-brand-line bg-brand-surface/95 px-4 py-3 backdrop-blur">
            <div class="mx-auto max-w-[1600px] rounded-lg border border-brand-line bg-white p-3 shadow-2xl shadow-black/20">
                <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
                    <label class="min-w-0">
                        <span class="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <span class="wb-label">文生图提示词</span>
                            <select v-model="quickTextTemplateId" class="rounded-md border border-brand-line bg-brand-surface px-2 py-1 text-xs text-brand-ink outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10">
                                <option value="">插入内置提示词</option>
                                <option v-for="template in textPromptTemplates" :key="template.id" :value="template.id">
                                    {{ template.title }}
                                </option>
                            </select>
                        </span>
                        <textarea
                            v-model="textToImagePrompt"
                            placeholder="例如：一张干净的产品级工作台截图，展示多模型图像生成流程"
                            class="wb-input min-h-[84px] w-full resize-none py-3"
                        />
                    </label>
                    <div class="grid gap-2 sm:grid-cols-2 lg:w-64 lg:grid-cols-1">
                        <button
                            type="button"
                            @click="handleTextToImageGenerate"
                            :disabled="!canGenerateTextImage"
                            :class="[
                                'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition',
                                canGenerateTextImage
                                    ? 'bg-brand-accent text-brand-surface hover:bg-brand-accent/90'
                                    : 'cursor-not-allowed bg-brand-line text-brand-muted'
                            ]"
                        >
                            {{ isTextToImageLoading ? '文生图生成中...' : '文生图生成' }}
                        </button>
                        <button
                            type="button"
                            @click="handleGenerate"
                            :disabled="!canGenerate"
                            :class="[
                                'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition',
                                canGenerate
                                    ? 'border border-brand-ink bg-brand-ink text-brand-surface hover:bg-brand-ink/90'
                                    : 'cursor-not-allowed bg-brand-line text-brand-muted'
                            ]"
                        >
                            {{ isLoading ? '参考图生成中...' : '参考图生成' }}
                        </button>
                    </div>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                    <span class="rounded-md bg-brand-line/60 px-2 py-1">比例 {{ selectedAspectRatio }}</span>
                    <span class="rounded-md bg-brand-line/60 px-2 py-1">尺寸 {{ gemini3ImageSize }}</span>
                    <span class="rounded-md bg-brand-line/60 px-2 py-1">参考图 {{ selectedImages.length }}</span>
                    <span v-if="displayError" class="rounded-md bg-brand-accent/10 px-2 py-1 text-brand-accent">{{ displayError }}</span>
                </div>
            </div>
        </div>

        <div class="wb-shell pb-64">
            <Footer />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ApiKeyInput from './components/ApiKeyInput.vue'
import ImageUpload from './components/ImageUpload.vue'
import StylePromptSelector from './components/StylePromptSelector.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import Footer from './components/Footer.vue'
import AspectRatioSelector from './components/AspectRatioSelector.vue'
import Gemini3ProConfig from './components/Gemini3ProConfig.vue'
import PromptPhraseBuilder from './components/PromptPhraseBuilder.vue'
import { fetchModels, generateImage } from './services/api'
import { styleTemplates } from './data/templates'
import { promptPhraseGroups } from './data/promptPhrases'
import { LocalStorage } from './utils/storage'
import {
    clearGenerationHistoryItems,
    getGenerationHistoryItems,
    putGenerationHistoryItem,
    type GenerationHistoryItem,
    type GenerationHistorySource
} from './utils/historyDb'
import type { ApiModel, GenerateRequest, ModelOption } from './types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID } from './config/api'

const apiKey = ref('')
const apiEndpoint = ref('')
const selectedImages = ref<string[]>([])
const referenceImageLabels = ref<string[]>([])
const selectedStyle = ref('')
const customPrompt = ref('')
const isLoading = ref(false)
const result = ref<string[]>([])
const error = ref<string | null>(null)
const textToImagePrompt = ref('')
const textToImageResult = ref<string[]>([])
const textToImageError = ref<string | null>(null)
const isTextToImageLoading = ref(false)
const latestResultSource = ref<'text' | 'image' | null>(null)
const showApiSettings = ref(false)
const modelOptions = ref<ModelOption[]>([])
const selectedModel = ref('')
const isFetchingModels = ref(false)
const modelsError = ref<string | null>(null)
const selectedAspectRatio = ref('1:1')
const quickTextTemplateId = ref('')
const portraitAssistEnabled = ref(false)
const portraitPose = ref('standing side by side')
const portraitRelation = ref('natural friendly group portrait')
const portraitExtraPrompt = ref('')
let hasSyncedInitialEndpoint = false

const portraitPoseOptions = [
    { label: '并肩站立', value: 'standing side by side' },
    { label: '自然合照', value: 'posing naturally for a group photo' },
    { label: '互相看向对方', value: 'looking at each other naturally' },
    { label: '一起走路', value: 'walking together in the same direction' },
    { label: '坐在一起', value: 'sitting together in a relaxed pose' },
    { label: '握手', value: 'shaking hands naturally' },
    { label: '拥抱', value: 'gentle friendly hug' }
]

const portraitRelationOptions = [
    { label: '朋友合影', value: 'natural friendly group portrait' },
    { label: '情侣合照', value: 'warm couple portrait' },
    { label: '搭档 / 伙伴', value: 'confident partner duo portrait' },
    { label: '团队照', value: 'professional team photo' },
    { label: '电影剧照', value: 'cinematic two-character still frame' }
]

// Gemini / Nano Banana image settings
const gemini3ImageSize = ref('2K')
const gemini3EnableGoogleSearch = ref(false)

const generationHistory = ref<GenerationHistoryItem[]>([])
const historyLoading = ref(false)
const historyFilter = ref('all')
const historyNewCategory = ref('')

// 组件挂载时从本地存储读取API密钥
onMounted(() => {
    loadGenerationHistory()

    const savedApiKey = LocalStorage.getApiKey()
    const savedEndpoint = LocalStorage.getApiEndpoint()
    const savedModelId = LocalStorage.getModelId()

    if (savedApiKey) {
        apiKey.value = savedApiKey
        showApiSettings.value = false
    } else {
        // 如果没有API密钥，自动展开设置面板
        showApiSettings.value = true
    }

    // 先设置端点，再恢复模型缓存，最后设置模型ID
    const endpointToUse = savedEndpoint.trim() || DEFAULT_API_ENDPOINT
    const modelIdToUse = savedModelId.trim() || DEFAULT_MODEL_ID

    // 恢复模型缓存
    restoreModelOptionsFromCache(endpointToUse)

    // Restore values before endpoint watchers begin syncing user edits.
    selectedModel.value = modelIdToUse
    apiEndpoint.value = endpointToUse

    ensureSelectedOptionPresent()

    // Mark initialization complete so later watcher updates are treated as user edits.
    hasSyncedInitialEndpoint = true
})

// 监听API密钥变化，自动保存到本地存储
watch(
    apiKey,
    (newApiKey: string, previousApiKey?: string) => {
        const trimmed = newApiKey.trim()
        if (trimmed) {
            LocalStorage.saveApiKey(trimmed)
        } else {
            LocalStorage.clearApiKey()
            if ((previousApiKey || '').trim()) {
                LocalStorage.clearModelCache()
                modelOptions.value = []
                selectedModel.value = DEFAULT_MODEL_ID
                modelsError.value = null
            }
            showApiSettings.value = true
        }
    },
    { immediate: false }
)

watch(
    apiEndpoint,
    (newEndpoint: string, previousEndpoint?: string) => {
        const trimmed = newEndpoint.trim()
        const previousTrimmed = (previousEndpoint || '').trim()

        if (trimmed) {
            LocalStorage.saveApiEndpoint(trimmed)
        } else {
            LocalStorage.clearApiEndpoint()
        }

        // 如果是初始化阶段（在 onMounted 中），直接返回，不做任何处理
        if (!hasSyncedInitialEndpoint) {
            return
        }

        // 只有在初始化完成后，用户主动修改端点时才重置模型
        if (trimmed !== previousTrimmed) {
            modelOptions.value = []
            modelsError.value = null
            if (previousTrimmed) {
                selectedModel.value = DEFAULT_MODEL_ID
                LocalStorage.clearModelCache(previousTrimmed)
            }
            showApiSettings.value = true
        }
    },
    { immediate: false }
)

watch(
    selectedModel,
    (newModel: string) => {
        const trimmed = newModel.trim()
        if (trimmed) {
            LocalStorage.saveModelId(trimmed)
        } else {
            LocalStorage.clearModelId()
            LocalStorage.clearModelCache(apiEndpoint.value)
            // Avoid resetting the model during initialization.
            if (hasSyncedInitialEndpoint) {
                selectedModel.value = DEFAULT_MODEL_ID
                showApiSettings.value = true
            }
        }
        // Only repair the selected option after initialization has completed.
        if (hasSyncedInitialEndpoint) {
            ensureSelectedOptionPresent()
        }
    },
    { immediate: false }
)

watch(
    selectedImages,
    images => {
        referenceImageLabels.value = images.map((_, index) => referenceImageLabels.value[index] || `角色${index + 1}`)
    },
    { deep: true }
)

// 注释掉：监听风格和提示词变化时清除结果的逻辑
// 改进：保留已生成的图片，让用户可以参考上次结果来调整参数
// watch([selectedStyle, customPrompt], () => {
//     if (result.value || error.value) {
//         result.value = null
//         error.value = null
//     }
// })

watch(
    textToImagePrompt,
    () => {
        if (textToImageError.value) {
            textToImageError.value = null
        }
    },
    { immediate: false }
)

const handleFetchModels = async () => {
    if (!apiKey.value.trim() || !apiEndpoint.value.trim()) return

    isFetchingModels.value = true
    modelsError.value = null

    try {
        const rawModels = await fetchModels(apiKey.value, apiEndpoint.value)
        const options = mapModelsToOptions(rawModels)

        if (!options.length) {
            throw new Error('未找到可用模型')
        }

        modelOptions.value = options
        LocalStorage.saveModelCache(apiEndpoint.value, options)

        const preferred =
            options.find(option => option.id === selectedModel.value) ||
            options.find(option => option.id === DEFAULT_MODEL_ID) ||
            options.find(option => option.supportsImages) ||
            options[0]

        selectedModel.value = preferred.id
        ensureSelectedOptionPresent()
    } catch (fetchError) {
        modelsError.value = fetchError instanceof Error ? fetchError.message : '无法获取模型列表'
        modelOptions.value = []
        selectedModel.value = DEFAULT_MODEL_ID
    } finally {
        isFetchingModels.value = false
    }
}

const mapModelsToOptions = (models: ApiModel[]): ModelOption[] => {
    const uniqueIds = new Set<string>()
    const options: ModelOption[] = []

    models.forEach(model => {
        if (!model?.id || uniqueIds.has(model.id)) return
        uniqueIds.add(model.id)

        const supportsImages = detectImageSupport(model)
        const label = buildModelLabel(model)
        const description = (typeof model.description === 'string' && model.description.trim()) ||
            (typeof (model as Record<string, unknown>).about === 'string' && String((model as Record<string, unknown>).about).trim()) ||
            ''

        options.push({
            id: model.id,
            label,
            description,
            supportsImages
        })
    })

    return options.sort((a, b) => {
        if (a.supportsImages !== b.supportsImages) {
            return a.supportsImages ? -1 : 1
        }
        return a.label.localeCompare(b.label)
    })
}

const detectImageSupport = (model: ApiModel): boolean => {
    const caps = model.capabilities
    if (caps && typeof caps === 'object') {
        if ((caps as Record<string, unknown>).image === true) return true
        if ((caps as Record<string, unknown>).images === true) return true
        if ((caps as Record<string, unknown>).vision === true) return true
        if ((caps as Record<string, unknown>).multimodal === true) return true
    }

    const tags = (model as Record<string, unknown>).tags
    if (Array.isArray(tags) && tags.some(tag => typeof tag === 'string' && /image|vision|photo|picture|art|draw/i.test(tag))) {
        return true
    }

    return /image|vision|flux|art|picture|photo|illustration/i.test(model.id)
}

const buildModelLabel = (model: ApiModel): string => {
    if (model.name && typeof model.name === 'string' && model.name.trim()) {
        return `${model.id} - ${model.name.trim()}`
    }
    return model.id
}

const handleModelPicked = () => {
    if (!selectedModel.value.trim()) return
    modelsError.value = null
    if (!showApiSettings.value) return

    setTimeout(() => {
        if (selectedModel.value.trim()) {
            showApiSettings.value = false
        }
    }, 600)
}

const restoreModelOptionsFromCache = (endpoint: string) => {
    const trimmedEndpoint = endpoint.trim()
    if (!trimmedEndpoint) return

    const cached = LocalStorage.getModelCache(trimmedEndpoint)
    if (!cached.length) return

    modelOptions.value = cached
    ensureSelectedOptionPresent()
}

const ensureSelectedOptionPresent = () => {
    const currentId = selectedModel.value.trim()
    if (!currentId) return

    const exists = modelOptions.value.some(option => option.id === currentId)
    if (!exists) {
        modelOptions.value = [
            ...modelOptions.value,
            {
                id: currentId,
                label: buildFallbackLabel(currentId),
                description: '',
                supportsImages: true
            }
        ]
    }

    modelOptions.value = modelOptions.value.sort((a, b) => {
        if (a.supportsImages !== b.supportsImages) {
            return a.supportsImages ? -1 : 1
        }
        return a.label.localeCompare(b.label)
    })
}

const buildFallbackLabel = (modelId: string): string => {
    const segments = modelId.split('/')
    const lastSegment = segments[segments.length - 1]
    return lastSegment || modelId
}

const pushImageToUpload = (image: string | null) => {
    if (!image) return
    const filtered = selectedImages.value.filter(existing => existing !== image)
    selectedImages.value = [image, ...filtered]
    referenceImageLabels.value = selectedImages.value.map((_, index) => referenceImageLabels.value[index] || `角色${index + 1}`)
}

const displayLoading = computed(() => {
    if (latestResultSource.value === 'image') return isLoading.value
    if (latestResultSource.value === 'text') return isTextToImageLoading.value
    return isLoading.value || isTextToImageLoading.value
})

const displayResults = computed(() => {
    if (latestResultSource.value === 'image') return result.value
    if (latestResultSource.value === 'text') return textToImageResult.value
    return result.value.length > 0 ? result.value : textToImageResult.value
})

const displayError = computed(() => {
    if (latestResultSource.value === 'image') return error.value
    if (latestResultSource.value === 'text') return textToImageError.value
    return error.value || textToImageError.value
})

const canPushDisplayResult = computed(() => Boolean(displayResults.value.length > 0))

const canGenerateTextImage = computed(
    () =>
        apiKey.value.trim() &&
        apiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        textToImagePrompt.value.trim() &&
        !isTextToImageLoading.value
)

const canGenerate = computed(
    () =>
        apiKey.value.trim() &&
        apiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        selectedImages.value.length > 0 &&
        (selectedStyle.value || customPrompt.value.trim()) &&
        !isLoading.value
)

const referenceImageRolePrompt = computed(() => {
    if (!selectedImages.value.length) return ''
    const roles = selectedImages.value.map((_, index) => referenceImageLabels.value[index]?.trim() || `角色${index + 1}`)
    return `Reference image mapping: ${roles.map((role, index) => `image ${index + 1} is ${role}`).join('; ')}. Preserve each referenced character or subject identity separately.`
})

const portraitAssistPrompt = computed(() => {
    if (!portraitAssistEnabled.value || selectedImages.value.length < 2) return ''

    const roles = selectedImages.value.map((_, index) => referenceImageLabels.value[index]?.trim() || `角色${index + 1}`)
    const roleText = roles.map((role, index) => `${role} from reference image ${index + 1}`).join(', ')
    const extra = portraitExtraPrompt.value.trim()

    return [
        `Create a coherent group photo featuring ${roleText}.`,
        `Interaction: ${portraitPose.value}.`,
        `Relationship and mood: ${portraitRelation.value}.`,
        'Keep each person visually distinct and faithful to their own reference image. Do not merge identities, swap faces, or duplicate one character into another.',
        'Unify lighting, perspective, scale, and camera angle so the final image looks like one real shared scene.',
        extra
    ].filter(Boolean).join(' ')
})

const textPromptTemplates = computed(() => styleTemplates.filter(template => template.mode !== 'image'))

watch(quickTextTemplateId, templateId => {
    if (!templateId) return

    const template = styleTemplates.find(item => item.id === templateId)
    if (template) {
        textToImagePrompt.value = template.prompt
    }
    quickTextTemplateId.value = ''
})

const insertTextPromptPhrase = (phrase: string) => {
    const current = textToImagePrompt.value.trim()
    textToImagePrompt.value = current ? `${current}, ${phrase}` : phrase
}

const composeImagePrompt = (basePrompt: string) => {
    return [referenceImageRolePrompt.value, portraitAssistPrompt.value, basePrompt]
        .filter(part => part.trim())
        .join('\n\n')
}

// Show ratio controls for image models that accept aspect ratio or mapped sizes.
const showAspectRatioSelector = computed(() => {
    const modelId = selectedModel.value.toLowerCase().trim()
    if (!modelId) return false

    const segments = modelId.split('/')
    const normalizedId = segments[segments.length - 1]
    return normalizedId === 'gemini-2.5-flash-image' ||
           normalizedId === 'gemini-2.5-flash-image-preview' ||
           modelId.includes('gemini-3-pro-image') ||
           modelId.includes('nano-banana') ||
           modelId.includes('gpt-image') ||
           modelId.includes('gemini-3.1-pro')
})


const selectedImageModelType = computed(() => {
    const modelId = selectedModel.value.toLowerCase().trim()
    if (modelId.includes('nano-banana')) return 'nano-banana'
    if (modelId.includes('gpt-image')) return 'gpt-image'
    if (modelId.includes('gemini-3-pro-image') || modelId.includes('gemini-3.1-pro')) return 'gemini-3-pro-image'
    return 'default'
})

const showImageSizeConfig = computed(() => {
    return selectedImageModelType.value === 'nano-banana' ||
           selectedImageModelType.value === 'gemini-3-pro-image'
})

const supportsGoogleSearch = computed(() => {
    const modelId = selectedModel.value.toLowerCase().trim()
    return modelId.includes('gemini-3-pro-image')
})

const loadGenerationHistory = async () => {
    historyLoading.value = true
    try {
        generationHistory.value = await getGenerationHistoryItems()
    } catch (historyError) {
        console.warn('无法读取生成历史:', historyError)
    } finally {
        historyLoading.value = false
    }
}

const addGenerationHistory = async (source: GenerationHistorySource, prompt: string, images: string[]) => {
    if (!images.length) return

    const createdAt = Date.now()
    const item: GenerationHistoryItem = {
        id: `${source}-${createdAt}`,
        source,
        prompt,
        model: selectedModel.value.trim() || DEFAULT_MODEL_ID,
        endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
        aspectRatio: selectedAspectRatio.value,
        imageSize: gemini3ImageSize.value,
        createdAt,
        images
    }

    generationHistory.value = [item, ...generationHistory.value]

    try {
        await putGenerationHistoryItem(item)
    } catch (historyError) {
        console.warn('无法保存生成历史:', historyError)
    }
}

const historyCategories = computed(() =>
    Array.from(new Set(generationHistory.value.map(item => item.category).filter(Boolean) as string[]))
)

const filteredGenerationHistory = computed(() => {
    if (historyFilter.value === 'all') return generationHistory.value
    if (historyFilter.value === 'favorite') return generationHistory.value.filter(item => item.favorite)
    if (historyFilter.value === 'text' || historyFilter.value === 'image') {
        return generationHistory.value.filter(item => item.source === historyFilter.value)
    }
    if (historyFilter.value.startsWith('category:')) {
        const category = historyFilter.value.replace('category:', '')
        return generationHistory.value.filter(item => item.category === category)
    }
    return generationHistory.value
})

const updateHistoryItem = async (nextItem: GenerationHistoryItem) => {
    generationHistory.value = generationHistory.value.map(item => (item.id === nextItem.id ? nextItem : item))
    try {
        await putGenerationHistoryItem(nextItem)
    } catch (historyError) {
        console.warn('无法更新生成历史:', historyError)
    }
}

const toggleHistoryFavorite = (item: GenerationHistoryItem) => {
    updateHistoryItem({ ...item, favorite: !item.favorite })
}

const setHistoryCategory = (item: GenerationHistoryItem, category: string) => {
    updateHistoryItem({ ...item, category })
}

const reuseHistoryPrompt = (item: GenerationHistoryItem) => {
    if (item.source === 'text') {
        textToImagePrompt.value = item.prompt
    } else {
        customPrompt.value = item.prompt
        selectedStyle.value = ''
    }
}

const restoreHistoryItem = (item: GenerationHistoryItem) => {
    latestResultSource.value = item.source
    if (item.source === 'text') {
        textToImageResult.value = item.images
        textToImagePrompt.value = item.prompt
        textToImageError.value = null
    } else {
        result.value = item.images
        customPrompt.value = item.prompt
        selectedStyle.value = ''
        error.value = null
    }
    selectedAspectRatio.value = item.aspectRatio
    gemini3ImageSize.value = item.imageSize
}

const pushHistoryImages = (item: GenerationHistoryItem) => {
    for (const image of [...item.images].reverse()) {
        pushImageToUpload(image)
    }
}

const clearGenerationHistory = async () => {
    generationHistory.value = []
    try {
        await clearGenerationHistoryItems()
    } catch (historyError) {
        console.warn('无法清空生成历史:', historyError)
    }
}

const handleTextToImageGenerate = async () => {
    if (!canGenerateTextImage.value) return

    latestResultSource.value = 'text'
    isTextToImageLoading.value = true
    textToImageError.value = null
    textToImageResult.value = []

    try {
        const request: GenerateRequest = {
            prompt: textToImagePrompt.value,
            images: [],
            apikey: apiKey.value,
            endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
            model: selectedModel.value.trim() || DEFAULT_MODEL_ID
        }

        // Attach aspect ratio when the selected model supports it.
        if (showAspectRatioSelector.value) {
            request.aspectRatio = selectedAspectRatio.value
        }

        // 如果显示 Gemini 3 Pro Image 配置，则添加相应参数
        if (showImageSizeConfig.value) {
            request.imageSize = gemini3ImageSize.value
        }

        if (supportsGoogleSearch.value) {
            request.enableGoogleSearch = gemini3EnableGoogleSearch.value
        }

        const response = await generateImage(request)
        textToImageResult.value = response.imageUrls
        latestResultSource.value = 'text'
        addGenerationHistory('text', textToImagePrompt.value, response.imageUrls)
    } catch (err) {
        textToImageError.value = err instanceof Error ? err.message : '生成失败'
        textToImageResult.value = []
    } finally {
        isTextToImageLoading.value = false
    }
}

const handlePushDisplayResult = (image: string) => {
    pushImageToUpload(image)
}

const handleDownloadResult = async (image: string) => {
    if (!image) return
    if (typeof window === 'undefined') return

    let downloadUrl = image
    let revokeUrl: string | null = null

    try {
        if (!image.startsWith('data:')) {
            const response = await fetch(image)
            const blob = await response.blob()
            downloadUrl = URL.createObjectURL(blob)
            revokeUrl = downloadUrl
        }

        const link = document.createElement('a')
        const dataMatch = image.match(/^data:image\/([a-zA-Z0-9+]+);/)
        const extension = dataMatch ? dataMatch[1] : 'png'

        link.href = downloadUrl
        link.download = `nano-banana-${Date.now()}.${extension}`
        link.rel = 'noopener'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        if (revokeUrl) {
            URL.revokeObjectURL(revokeUrl)
        }
    } catch (downloadError) {
        window.open(image, '_blank', 'noopener')
    }
}

const handleGenerate = async () => {
    if (!canGenerate.value) return

    latestResultSource.value = 'image'
    isLoading.value = true
    error.value = null
    // 立即清除之前的结果，确保用户看到新的生成过程
    result.value = []

    try {
        // 使用选中的样式模板或自定义提示词
        const basePrompt = selectedStyle.value ? styleTemplates.find(t => t.id === selectedStyle.value)?.prompt || customPrompt.value : customPrompt.value
        const prompt = composeImagePrompt(basePrompt)

        const request: GenerateRequest = {
            prompt,
            images: selectedImages.value,
            apikey: apiKey.value,
            endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
            model: selectedModel.value.trim() || DEFAULT_MODEL_ID
        }

        // Attach aspect ratio when the selected model supports it.
        if (showAspectRatioSelector.value) {
            request.aspectRatio = selectedAspectRatio.value
        }

        // 如果显示 Gemini 3 Pro Image 配置，则添加相应参数
        if (showImageSizeConfig.value) {
            request.imageSize = gemini3ImageSize.value
        }

        if (supportsGoogleSearch.value) {
            request.enableGoogleSearch = gemini3EnableGoogleSearch.value
        }

        const response = await generateImage(request)
        result.value = response.imageUrls
        latestResultSource.value = 'image'
        addGenerationHistory('image', prompt, response.imageUrls)
    } catch (err) {
        error.value = err instanceof Error ? err.message : '生成失败'
        // Clear stale output after a failed generation.
        result.value = []
    } finally {
        isLoading.value = false
    }
}

</script>
