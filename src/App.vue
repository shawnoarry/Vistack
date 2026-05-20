<template>
    <div class="min-h-screen bg-brand-ink text-brand-ink">
        <header class="sticky top-0 z-40 border-b border-brand-line bg-brand-surface/95 backdrop-blur">
            <div class="wb-shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div class="min-w-0">
                    <p class="wb-label text-brand-accent">Multi-model visual studio</p>
                    <div class="mt-1 flex flex-wrap items-end gap-3">
                        <h1 class="text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl">Vistack</h1>
                        <span class="rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-xs font-medium text-brand-accent">
                            {{ selectedModel || DEFAULT_MODEL_ID }}
                        </span>
                    </div>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div class="grid grid-cols-2 rounded-lg border border-brand-line bg-white p-1 text-sm font-semibold">
                        <button
                            type="button"
                            @click="currentView = 'studio'"
                            :class="[
                                'rounded-md px-3 py-2 transition',
                                currentView === 'studio' ? 'bg-brand-ink text-brand-surface' : 'text-brand-muted hover:text-brand-ink'
                            ]"
                        >
                            创作台
                        </button>
                        <button
                            type="button"
                            @click="currentView = 'assets'"
                            :class="[
                                'rounded-md px-3 py-2 transition',
                                currentView === 'assets' ? 'bg-brand-ink text-brand-surface' : 'text-brand-muted hover:text-brand-ink'
                            ]"
                        >
                            资产库
                        </button>
                    </div>
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
                    v-model:prompt-assistant-api-key="promptAssistantApiKey"
                    v-model:prompt-assistant-endpoint="promptAssistantEndpoint"
                    v-model:prompt-assistant-model="promptAssistantModel"
                    :models="modelOptions"
                    :model-loading="isFetchingModels"
                    :model-error="modelsError"
                    @fetch-models="handleFetchModels"
                    @model-picked="handleModelPicked"
                />
            </div>
        </section>

        <main v-if="currentView === 'studio'" class="wb-shell grid gap-4 py-4 pb-[420px] lg:grid-cols-[380px_minmax(0,1fr)_340px] lg:pb-[320px]">
            <aside class="space-y-4">
                <section class="wb-panel bg-white">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p class="wb-label text-brand-accent">Reference ingredients</p>
                            <h2 class="mt-1 text-base font-semibold text-brand-ink">参考图定义</h2>
                            <p class="mt-1 text-xs text-brand-muted">先放入人物、主体、服装或背景，再在底部描述要生成的画面。</p>
                        </div>
                        <span class="wb-chip">{{ selectedImages.length }} 张</span>
                    </div>
                    <ImageUpload v-model="selectedImages" v-model:labels="referenceImageLabels" v-model:metadata="referenceImageMetadata" />

                    <div v-if="selectedImages.length" class="mt-3 rounded-lg border border-brand-line bg-white p-3">
                        <div class="flex items-center justify-between gap-3">
                            <span class="wb-label">将发送给模型的参考图语义</span>
                            <span class="rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-[11px] font-semibold text-brand-accent">已生效</span>
                        </div>
                        <p class="mt-2 text-xs leading-5 text-brand-muted">{{ referenceImageRolePrompt }}</p>
                        <p class="mt-2 text-xs leading-5 text-brand-muted">
                            同一个人有多张参考图时，类型选“人物/角色”并填同一个名称；换装、换背景、产品主图等场景请分别选择“服装”“背景”“产品/主体”。
                        </p>
                    </div>

                    <div class="my-4 border-t border-brand-line" />

                    <div class="mb-3">
                        <div class="flex items-center justify-between gap-3">
                            <h3 class="text-sm font-semibold text-brand-ink">合影助手</h3>
                            <span :class="[
                                'rounded-md border px-2 py-1 text-[11px] font-semibold',
                                portraitAssistEnabled && portraitAssistAvailable
                                    ? 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent'
                                    : 'border-brand-line bg-brand-surface text-brand-muted'
                            ]">
                                {{ portraitAssistStatus }}
                            </span>
                        </div>
                        <p class="mt-1 text-xs text-brand-muted">多张人物参考图时启用。它会把角色映射、合照动作和防混脸约束拼进最终提示词，不做真实图像预处理。</p>
                    </div>
                    <div class="space-y-3">
                        <label :class="[
                            'flex items-center gap-2 text-sm font-semibold',
                            portraitAssistAvailable ? 'text-brand-ink' : 'text-brand-muted'
                        ]">
                            <input
                                v-model="portraitAssistEnabled"
                                type="checkbox"
                                :disabled="!portraitAssistAvailable"
                                class="h-4 w-4 rounded border-brand-line text-brand-accent focus:ring-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            启用合影提示增强
                        </label>
                        <div class="grid grid-cols-2 gap-2">
                            <label class="min-w-0">
                                <span class="wb-label mb-1 block">合影动作</span>
                                <select v-model="portraitPose" :disabled="!portraitAssistAvailable" class="wb-input w-full disabled:cursor-not-allowed disabled:opacity-60">
                                    <option v-for="pose in portraitPoseOptions" :key="pose.value" :value="pose.value">{{ pose.label }}</option>
                                </select>
                            </label>
                            <label class="min-w-0">
                                <span class="wb-label mb-1 block">场景关系</span>
                                <select v-model="portraitRelation" :disabled="!portraitAssistAvailable" class="wb-input w-full disabled:cursor-not-allowed disabled:opacity-60">
                                    <option v-for="relation in portraitRelationOptions" :key="relation.value" :value="relation.value">{{ relation.label }}</option>
                                </select>
                            </label>
                        </div>
                        <textarea
                            v-model="portraitExtraPrompt"
                            :disabled="!portraitAssistAvailable"
                            class="wb-input min-h-[76px] w-full resize-none py-2 disabled:cursor-not-allowed disabled:opacity-60"
                            placeholder="补充：例如看向镜头、保持角色服装、自然互动。"
                        />
                        <div v-if="portraitAssistEnabled && portraitAssistAvailable" class="rounded-lg border border-brand-line bg-brand-surface p-3 text-xs leading-5 text-brand-muted">
                            {{ portraitAssistPrompt }}
                        </div>
                    </div>

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
                <div v-if="selectedImages.length" class="mb-4 rounded-lg border border-brand-line bg-brand-surface p-3">
                    <div class="mb-2 flex items-center justify-between gap-3">
                        <span class="wb-label">Active ingredients</span>
                        <span class="text-xs text-brand-muted">{{ selectedImages.length }} reference images</span>
                    </div>
                    <div class="flex gap-2 overflow-x-auto pb-1">
                        <div
                            v-for="(image, index) in selectedImages"
                            :key="`active-${image}-${index}`"
                            class="w-24 shrink-0"
                        >
                            <div class="aspect-square overflow-hidden rounded-md border border-brand-line bg-white">
                                <img :src="image" :alt="`参考图 ${index + 1}`" class="h-full w-full object-cover" />
                            </div>
                            <p class="mt-1 truncate text-xs font-semibold text-brand-ink">{{ referenceImageMetadata[index]?.label || referenceImageLabels[index] || `角色${index + 1}` }}</p>
                            <p class="truncate text-[11px] text-brand-muted">{{ roleLabel(referenceImageMetadata[index]?.role || 'character') }}</p>
                        </div>
                    </div>
                </div>
                <ResultDisplay
                    :results="displayResults"
                    :loading="displayLoading"
                    :error="displayError"
                    :can-push="canPushDisplayResult"
                    :can-reuse="Boolean(displayResults.length)"
                    @download="handleDownloadResult"
                    @push="handlePushDisplayResult"
                    @reuse="handleReuseCurrentRecipe"
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
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h2 class="text-sm font-semibold text-brand-ink">提示词预览</h2>
                            <p class="mt-1 text-xs text-brand-muted">这里展示下一次生成会提交给模型的文本内容。</p>
                        </div>
                        <span class="wb-chip">{{ selectedImages.length ? '参考图模式' : '文生图模式' }}</span>
                    </div>
                    <div class="max-h-[240px] overflow-y-auto rounded-lg border border-brand-line bg-white p-3 text-xs leading-5 text-brand-muted">
                        <pre class="whitespace-pre-wrap font-sans">{{ promptPreview || '填写主提示词后会显示预览。' }}</pre>
                    </div>
                </section>

                <section class="wb-panel">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h2 class="text-sm font-semibold text-brand-ink">近期资产</h2>
                            <p class="mt-1 text-xs text-brand-muted">首页只展示近期和收藏入口；全量管理进入资产库。</p>
                        </div>
                        <button
                            v-if="generationHistory.length"
                            type="button"
                            @click="currentView = 'assets'"
                            class="text-xs font-semibold text-brand-accent transition hover:text-brand-ink"
                        >
                            查看资产库
                        </button>
                    </div>

                    <div v-if="generationHistory.length" class="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div class="rounded-lg border border-brand-line bg-white p-2">
                            <div class="text-brand-muted">全部</div>
                            <div class="mt-1 text-base font-semibold text-brand-ink">{{ generationHistory.length }}</div>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-2">
                            <div class="text-brand-muted">收藏</div>
                            <div class="mt-1 text-base font-semibold text-brand-ink">{{ favoriteHistory.length }}</div>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-2">
                            <div class="text-brand-muted">收藏夹</div>
                            <div class="mt-1 text-base font-semibold text-brand-ink">{{ historyCategories.length }}</div>
                        </div>
                    </div>

                    <div v-if="recentGenerationHistory.length" class="space-y-3">
                        <article v-for="item in recentGenerationHistory" :key="item.id" class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="text-xs font-semibold text-brand-ink">
                                        {{ item.source === 'text' ? '文生图' : '参考图生成' }}
                                        <span v-if="item.recipe?.referenceImages?.length" class="text-brand-muted"> · {{ item.recipe.referenceImages.length }} 张参考图</span>
                                        <span v-if="item.category" class="text-brand-muted"> · {{ item.category }}</span>
                                    </p>
                                    <p class="mt-1 truncate text-xs text-brand-muted">{{ item.recipe?.mainPrompt || item.prompt }}</p>
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
                                <button type="button" class="wb-primary min-h-8 px-2 text-xs" @click="reuseHistoryRecipe(item)">一键复用</button>
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="pushHistoryImages(item)">结果作参考</button>
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="reuseHistoryPrompt(item)">仅提示词</button>
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="toggleHistoryFavorite(item)">{{ item.favorite ? '取消收藏' : '收藏' }}</button>
                            </div>
                        </article>
                    </div>

                    <p v-else-if="historyLoading" class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm text-brand-muted">正在读取本地历史...</p>
                    <p v-else class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm text-brand-muted">成功生成后，近期资产会出现在这里。</p>
                </section>
            </aside>
        </main>

        <section
            v-if="currentView === 'studio'"
            class="fixed inset-x-0 bottom-0 z-30 border-t border-brand-line bg-brand-surface/95 shadow-2xl shadow-black/25 backdrop-blur"
        >
            <div class="wb-shell py-4">
                <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div class="rounded-lg border border-brand-line bg-white p-3">
                        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span class="wb-label">Prompt box</span>
                                <p class="mt-1 text-xs text-brand-muted">底部固定输入器。参考图语义、合影助手和模板补充会自动拼入最终提示词。</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="showPromptTools = !showPromptTools">
                                    {{ showPromptTools ? '收起词组' : '词组' }}
                                </button>
                                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="showTemplatePanel = true">
                                    模板
                                    <span v-if="activeSupplementLabel" class="ml-1 text-brand-accent">已选</span>
                                </button>
                                <button
                                    type="button"
                                    :disabled="!canImprovePrompt"
                                    :class="[
                                        'inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold transition',
                                        canImprovePrompt
                                            ? 'bg-brand-accent text-brand-surface hover:bg-brand-accent/90'
                                            : 'cursor-not-allowed bg-brand-line text-brand-muted'
                                    ]"
                                    @click="handleImprovePrompt"
                                >
                                    {{ isPromptAssistantLoading ? '优化中...' : 'AI 优化' }}
                                </button>
                            </div>
                        </div>

                        <textarea
                            v-model="textToImagePrompt"
                            placeholder="描述你想生成或改动的画面。参考图会作为素材参与生成，可以写：让角色1穿着服装参考，在背景参考中拍摄产品级主视觉。"
                            class="wb-input min-h-[150px] w-full resize-none bg-white py-3 text-base leading-7"
                        />

                        <div v-if="showPromptTools" class="mt-3 rounded-lg border border-brand-line bg-brand-surface p-3">
                            <PromptPhraseBuilder
                                :groups="promptPhraseGroups"
                                title="提示词词组"
                                description="点击后追加到主提示词。"
                                @insert="insertTextPromptPhrase"
                            />
                        </div>

                        <p v-if="promptAssistantError" class="mt-2 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-xs text-brand-accent">
                            {{ promptAssistantError }}
                        </p>
                        <p v-else-if="!promptAssistantReady" class="mt-2 text-xs text-brand-muted">
                            配置提示词助手 URL / Key / Model 后，可用低费率文本模型先整理中文提示词。
                        </p>
                    </div>

                    <div class="flex flex-col gap-2 rounded-lg border border-brand-line bg-white p-3">
                        <div class="grid grid-cols-3 gap-2 text-center text-xs">
                            <div class="rounded-md bg-brand-surface p-2">
                                <div class="text-brand-muted">参考图</div>
                                <div class="mt-1 font-semibold text-brand-ink">{{ selectedImages.length }}</div>
                            </div>
                            <div class="rounded-md bg-brand-surface p-2">
                                <div class="text-brand-muted">比例</div>
                                <div class="mt-1 font-semibold text-brand-ink">{{ showAspectRatioSelector ? selectedAspectRatio : '自动' }}</div>
                            </div>
                            <div class="rounded-md bg-brand-surface p-2">
                                <div class="text-brand-muted">尺寸</div>
                                <div class="mt-1 font-semibold text-brand-ink">{{ showImageSizeConfig ? gemini3ImageSize : '自动' }}</div>
                            </div>
                        </div>

                        <div v-if="showAspectRatioSelector" class="rounded-lg border border-brand-line bg-brand-surface p-3">
                            <div class="mb-2 flex items-center justify-between gap-2">
                                <span class="wb-label">比例</span>
                                <span class="text-[11px] text-brand-muted">按当前模型映射</span>
                            </div>
                            <AspectRatioSelector v-model="selectedAspectRatio" :model-type="selectedImageModelType" :image-size="gemini3ImageSize" />
                        </div>

                        <div v-if="showImageSizeConfig" class="rounded-lg border border-brand-line bg-brand-surface p-3">
                            <div class="mb-2 flex items-center justify-between gap-2">
                                <span class="wb-label">分辨率</span>
                                <span class="text-[11px] text-brand-muted">生成前参数</span>
                            </div>
                            <Gemini3ProConfig
                                v-model:imageSize="gemini3ImageSize"
                                v-model:enableGoogleSearch="gemini3EnableGoogleSearch"
                                :model-type="selectedImageModelType"
                            />
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div class="rounded-md bg-brand-surface p-2">
                                <div class="text-brand-muted">模型</div>
                                <div class="mt-1 truncate font-semibold text-brand-ink">{{ selectedImageModelType || '自动识别' }}</div>
                            </div>
                            <div class="rounded-md bg-brand-surface p-2">
                                <div class="text-brand-muted">模板</div>
                                <div class="mt-1 truncate font-semibold text-brand-ink">{{ activeSupplementLabel || '未选' }}</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            @click="handleGenerate"
                            :disabled="!canGenerate"
                            :class="[
                                'inline-flex min-h-12 items-center justify-center rounded-lg px-4 text-sm font-semibold transition',
                                canGenerate
                                    ? 'border border-brand-ink bg-brand-ink text-brand-surface hover:bg-brand-ink/90'
                                    : 'cursor-not-allowed bg-brand-line text-brand-muted'
                            ]"
                        >
                            {{ isLoading ? '生成中...' : '使用参考图生成' }}
                        </button>
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
                            {{ isTextToImageLoading ? '生成中...' : '无参考图生成' }}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <div v-if="showTemplatePanel" class="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/55 p-4 sm:items-center">
            <section class="max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-lg border border-brand-line bg-brand-surface shadow-2xl shadow-black/30">
                <div class="flex items-start justify-between gap-3 border-b border-brand-line bg-white p-4">
                    <div>
                        <p class="wb-label text-brand-accent">Prompt assist</p>
                        <h2 class="mt-1 text-lg font-semibold text-brand-ink">创作模板与补充提示词</h2>
                        <p class="mt-1 text-sm text-brand-muted">模板只是快捷辅助，不占用主创作台。选择后会拼入底部提示词预览。</p>
                    </div>
                    <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="showTemplatePanel = false">关闭</button>
                </div>
                <div class="max-h-[calc(86vh-88px)] overflow-y-auto p-4">
                    <StylePromptSelector
                        v-model:selectedStyle="selectedStyle"
                        v-model:customPrompt="customPrompt"
                        :templates="availableStyleTemplates"
                        :phrase-groups="promptPhraseGroups"
                    />
                </div>
            </section>
        </div>

        <main v-if="currentView === 'assets'" class="wb-shell py-4 pb-10">
            <section class="rounded-lg border border-brand-line bg-brand-surface p-4 shadow-sm shadow-black/5">
                <div class="mb-4 flex flex-col gap-3 border-b border-brand-line pb-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p class="wb-label text-brand-accent">Local asset library</p>
                        <h1 class="mt-1 text-2xl font-semibold text-brand-ink">资产库</h1>
                        <p class="mt-1 text-sm text-brand-muted">管理本地生成历史、收藏和自定义收藏夹。数据保存在当前浏览器。</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" class="wb-secondary" @click="currentView = 'studio'">返回创作台</button>
                        <button v-if="generationHistory.length" type="button" class="wb-secondary text-brand-accent" @click="clearGenerationHistory">清空历史</button>
                    </div>
                </div>

                <div class="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)]">
                    <aside class="space-y-3">
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <label class="wb-label mb-2 block">筛选</label>
                            <select v-model="historyFilter" class="wb-input w-full min-h-10 py-2 text-xs">
                                <option value="all">全部记录</option>
                                <option value="favorite">收藏</option>
                                <option value="text">文生图</option>
                                <option value="image">参考图生成</option>
                                <option v-for="category in historyCategories" :key="category" :value="`category:${category}`">{{ category }}</option>
                            </select>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <label class="wb-label mb-2 block">新收藏夹</label>
                            <input v-model="historyNewCategory" class="wb-input w-full min-h-10 py-2 text-xs" placeholder="例如：头像 / 商业主图" />
                            <p class="mt-2 text-xs leading-5 text-brand-muted">输入名称后，可把任意资产归入这个收藏夹。</p>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="wb-label mb-2">概览</div>
                            <div class="grid grid-cols-3 gap-2 text-center text-xs lg:grid-cols-1">
                                <div class="rounded-md bg-brand-surface p-2">
                                    <div class="text-brand-muted">全部</div>
                                    <div class="mt-1 font-semibold text-brand-ink">{{ generationHistory.length }}</div>
                                </div>
                                <div class="rounded-md bg-brand-surface p-2">
                                    <div class="text-brand-muted">收藏</div>
                                    <div class="mt-1 font-semibold text-brand-ink">{{ favoriteHistory.length }}</div>
                                </div>
                                <div class="rounded-md bg-brand-surface p-2">
                                    <div class="text-brand-muted">收藏夹</div>
                                    <div class="mt-1 font-semibold text-brand-ink">{{ historyCategories.length }}</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section>
                        <div v-if="filteredGenerationHistory.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <article v-for="item in filteredGenerationHistory" :key="item.id" class="rounded-lg border border-brand-line bg-white p-3">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="min-w-0">
                                        <p class="text-xs font-semibold text-brand-ink">
                                            {{ item.source === 'text' ? '文生图' : '参考图生成' }}
                                            <span v-if="item.recipe?.referenceImages?.length" class="text-brand-muted"> · {{ item.recipe.referenceImages.length }} 张参考图</span>
                                            <span v-if="item.category" class="text-brand-muted"> · {{ item.category }}</span>
                                        </p>
                                        <p class="mt-1 line-clamp-2 text-xs leading-5 text-brand-muted">{{ item.recipe?.mainPrompt || item.prompt }}</p>
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
                                    <button type="button" class="wb-primary min-h-8 px-2 text-xs" @click="reuseHistoryRecipe(item)">一键复用</button>
                                    <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="pushHistoryImages(item)">结果作参考</button>
                                    <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="reuseHistoryPrompt(item)">仅提示词</button>
                                    <button v-if="historyNewCategory.trim()" type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="setHistoryCategory(item, historyNewCategory.trim())">归入 {{ historyNewCategory.trim() }}</button>
                                    <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="toggleHistoryFavorite(item)">{{ item.favorite ? '取消收藏' : '收藏' }}</button>
                                </div>
                            </article>
                        </div>

                        <p v-else-if="historyLoading" class="rounded-lg border border-dashed border-brand-line bg-white p-6 text-sm text-brand-muted">正在读取本地历史...</p>
                        <p v-else class="rounded-lg border border-dashed border-brand-line bg-white p-6 text-sm text-brand-muted">{{ generationHistory.length ? '当前筛选下没有记录。' : '成功生成后，资产会出现在这里。' }}</p>
                    </section>
                </div>
            </section>
        </main>

        <div class="wb-shell pb-10">
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
import { fetchModels, generateImage, improvePrompt } from './services/api'
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
import type { ApiModel, GenerateRecipe, GenerateRequest, ModelOption, PromptAssistantRequest, ReferenceImageMeta, ReferenceImageRole } from './types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID, DEFAULT_PROMPT_ASSISTANT_ENDPOINT, DEFAULT_PROMPT_ASSISTANT_MODEL_ID } from './config/api'

const apiKey = ref('')
const apiEndpoint = ref('')
const selectedImages = ref<string[]>([])
const referenceImageLabels = ref<string[]>([])
const referenceImageMetadata = ref<ReferenceImageMeta[]>([])
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
const latestGenerationRecipe = ref<GenerationRecipe | null>(null)
const currentView = ref<'studio' | 'assets'>('studio')
const showPromptTools = ref(false)
const showTemplatePanel = ref(false)
const showApiSettings = ref(false)
const modelOptions = ref<ModelOption[]>([])
const selectedModel = ref('')
const isFetchingModels = ref(false)
const modelsError = ref<string | null>(null)
const promptAssistantApiKey = ref('')
const promptAssistantEndpoint = ref('')
const promptAssistantModel = ref('')
const isPromptAssistantLoading = ref(false)
const promptAssistantError = ref<string | null>(null)
const selectedAspectRatio = ref('1:1')
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

const referenceRoleLabels: Record<ReferenceImageRole, string> = {
    character: '人物/角色',
    outfit: '服装',
    background: '背景',
    product: '产品/主体',
    style: '风格',
    other: '其他'
}

// Image model settings
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
    const savedPromptAssistantApiKey = LocalStorage.getPromptAssistantApiKey()
    const savedPromptAssistantEndpoint = LocalStorage.getPromptAssistantEndpoint()
    const savedPromptAssistantModel = LocalStorage.getPromptAssistantModelId()

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
    promptAssistantApiKey.value = savedPromptAssistantApiKey
    promptAssistantEndpoint.value = savedPromptAssistantEndpoint.trim() || DEFAULT_PROMPT_ASSISTANT_ENDPOINT
    promptAssistantModel.value = savedPromptAssistantModel.trim() || DEFAULT_PROMPT_ASSISTANT_MODEL_ID

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
    promptAssistantApiKey,
    (newApiKey: string) => {
        const trimmed = newApiKey.trim()
        if (trimmed) {
            LocalStorage.savePromptAssistantApiKey(trimmed)
        } else {
            LocalStorage.clearPromptAssistantApiKey()
        }
    },
    { immediate: false }
)

watch(
    promptAssistantEndpoint,
    (newEndpoint: string) => {
        const trimmed = newEndpoint.trim()
        if (trimmed) {
            LocalStorage.savePromptAssistantEndpoint(trimmed)
        } else {
            LocalStorage.clearPromptAssistantEndpoint()
        }
    },
    { immediate: false }
)

watch(
    promptAssistantModel,
    (newModel: string) => {
        const trimmed = newModel.trim()
        if (trimmed) {
            LocalStorage.savePromptAssistantModelId(trimmed)
        } else {
            LocalStorage.clearPromptAssistantModelId()
        }
    },
    { immediate: false }
)

watch(
    selectedImages,
    images => {
        referenceImageLabels.value = images.map((_, index) => referenceImageLabels.value[index] || `角色${index + 1}`)
        referenceImageMetadata.value = images.map((_, index) => normalizeReferenceMeta(referenceImageMetadata.value[index], index))
        if (images.length < 2) {
            portraitAssistEnabled.value = false
        }
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

const roleLabel = (role: ReferenceImageRole): string => referenceRoleLabels[role] || referenceRoleLabels.other

const normalizeReferenceMeta = (meta: ReferenceImageMeta | undefined, index: number): ReferenceImageMeta => ({
    role: meta?.role || 'character',
    label: meta?.label?.trim() || referenceImageLabels.value[index]?.trim() || `角色${index + 1}`,
    note: meta?.note?.trim() || ''
})

const normalizeReferenceRecipeMeta = (meta: ReferenceImageMeta | undefined, index: number): ReferenceImageMeta => ({
    role: meta?.role || 'character',
    label: meta?.label?.trim() || `角色${index + 1}`,
    note: meta?.note?.trim() || ''
})

const buildGenerationRecipe = (compiledPrompt: string): GenerationRecipe => ({
    mainPrompt: textToImagePrompt.value.trim(),
    compiledPrompt,
    supplementPrompt: supplementPrompt.value,
    selectedStyle: selectedStyle.value,
    customPrompt: customPrompt.value,
    referenceImages: [...selectedImages.value],
    referenceImageLabels: selectedImages.value.map((_, index) => referenceImageLabels.value[index] || `角色${index + 1}`),
    referenceImageMetadata: selectedImages.value.map((_, index) => normalizeReferenceMeta(referenceImageMetadata.value[index], index))
})

const pushImageToUpload = (image: string | null) => {
    if (!image) return
    const filtered = selectedImages.value.filter(existing => existing !== image)
    selectedImages.value = [image, ...filtered]
    referenceImageLabels.value = selectedImages.value.map((_, index) => referenceImageLabels.value[index] || `角色${index + 1}`)
    referenceImageMetadata.value = selectedImages.value.map((_, index) => normalizeReferenceMeta(referenceImageMetadata.value[index], index))
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
        (textToImagePrompt.value.trim() || selectedStyle.value || customPrompt.value.trim()) &&
        !isLoading.value
)

const promptAssistantReady = computed(
    () =>
        Boolean(promptAssistantApiKey.value.trim()) &&
        Boolean(promptAssistantEndpoint.value.trim()) &&
        Boolean(promptAssistantModel.value.trim())
)

const canImprovePrompt = computed(
    () =>
        promptAssistantReady.value &&
        textToImagePrompt.value.trim() &&
        !isPromptAssistantLoading.value
)

const referenceImageRolePrompt = computed(() => {
    if (!selectedImages.value.length) return ''
    const mappings = selectedImages.value.map((_, index) => {
        const meta = normalizeReferenceMeta(referenceImageMetadata.value[index], index)
        const note = meta.note ? `; note: ${meta.note}` : ''
        return `image ${index + 1}: ${roleLabel(meta.role)} "${meta.label}"${note}`
    })

    return [
        `Reference image mapping: ${mappings.join('; ')}.`,
        'Use character references to preserve identity; use outfit references for clothing and styling only; use background references for environment only; use product references as the main subject when present; use style references for visual treatment only.',
        'Do not merge separate character identities unless the prompt explicitly asks for it.'
    ].join(' ')
})

const characterReferenceCount = computed(() =>
    selectedImages.value.filter((_, index) => normalizeReferenceMeta(referenceImageMetadata.value[index], index).role === 'character').length
)
const portraitAssistAvailable = computed(() => characterReferenceCount.value >= 2)
const portraitAssistStatus = computed(() => {
    if (!portraitAssistAvailable.value) return '需要 2 张以上人物参考图'
    return portraitAssistEnabled.value ? '将拼入提示词' : '未启用'
})

const portraitAssistPrompt = computed(() => {
    if (!portraitAssistEnabled.value || !portraitAssistAvailable.value) return ''

    const characterRefs = selectedImages.value
        .map((_, index) => ({ index, meta: normalizeReferenceMeta(referenceImageMetadata.value[index], index) }))
        .filter(item => item.meta.role === 'character')
    const roleText = (characterRefs.length ? characterRefs : selectedImages.value.map((_, index) => ({ index, meta: normalizeReferenceMeta(referenceImageMetadata.value[index], index) })))
        .map(item => `${item.meta.label} from reference image ${item.index + 1}`)
        .join(', ')
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

const selectedTemplatePrompt = computed(() => selectedStyle.value ? styleTemplates.find(template => template.id === selectedStyle.value)?.prompt || '' : '')
const activeSupplementLabel = computed(() => {
    if (selectedStyle.value) {
        return styleTemplates.find(template => template.id === selectedStyle.value)?.title || '模板'
    }
    if (customPrompt.value.trim()) {
        return '自定义'
    }
    return ''
})
const supplementPrompt = computed(() => selectedTemplatePrompt.value || customPrompt.value.trim())
const availableStyleTemplates = computed(() => selectedImages.value.length ? styleTemplates : styleTemplates.filter(template => template.mode !== 'image'))

const insertTextPromptPhrase = (phrase: string) => {
    const current = textToImagePrompt.value.trim()
    textToImagePrompt.value = current ? `${current}, ${phrase}` : phrase
}

const buildPromptAssistantContext = () => {
    return [
        selectedImages.value.length ? `参考图数量：${selectedImages.value.length}` : '',
        referenceImageRolePrompt.value ? `参考图语义：${referenceImageRolePrompt.value}` : '',
        portraitAssistPrompt.value ? `合影助手：${portraitAssistPrompt.value}` : '',
        supplementPrompt.value ? `当前模板/补充：${supplementPrompt.value}` : '',
        showAspectRatioSelector.value ? `目标比例：${selectedAspectRatio.value}` : '',
        showImageSizeConfig.value ? `目标分辨率：${gemini3ImageSize.value}` : '',
        '用户偏好：中文提示词优先，偏真实手机镜头、韩系 OOTD、K-pop 生态、自拍、直拍封面、机场/下班路透。'
    ].filter(Boolean).join('\n')
}

const resolvePromptAssistantEndpoint = (endpoint: string) => {
    const trimmed = endpoint.trim() || DEFAULT_PROMPT_ASSISTANT_ENDPOINT

    try {
        const url = new URL(trimmed)
        const path = url.pathname.replace(/\/+$/, '')

        if (!path || path === '/') {
            url.pathname = '/v1/chat/completions'
            return url.toString()
        }

        if (path.endsWith('/chat/completions')) {
            url.pathname = path
            return url.toString()
        }

        if (path.endsWith('/v1')) {
            url.pathname = `${path}/chat/completions`
            return url.toString()
        }

        url.pathname = `${path}/v1/chat/completions`
        return url.toString()
    } catch {
        const base = trimmed.replace(/\/+$/, '')
        if (base.endsWith('/chat/completions')) return base
        if (base.endsWith('/v1')) return `${base}/chat/completions`
        return `${base}/v1/chat/completions`
    }
}

const handleImprovePrompt = async () => {
    if (!canImprovePrompt.value) return

    isPromptAssistantLoading.value = true
    promptAssistantError.value = null

    try {
        const request: PromptAssistantRequest = {
            prompt: textToImagePrompt.value.trim(),
            context: buildPromptAssistantContext(),
            apikey: promptAssistantApiKey.value.trim(),
            endpoint: resolvePromptAssistantEndpoint(promptAssistantEndpoint.value),
            model: promptAssistantModel.value.trim() || DEFAULT_PROMPT_ASSISTANT_MODEL_ID
        }
        const response = await improvePrompt(request)
        textToImagePrompt.value = response.prompt
    } catch (assistantError) {
        promptAssistantError.value = assistantError instanceof Error ? assistantError.message : '提示词助手调用失败'
    } finally {
        isPromptAssistantLoading.value = false
    }
}

const composeTextPrompt = () => {
    return [textToImagePrompt.value.trim(), supplementPrompt.value]
        .filter(part => part.trim())
        .join('\n\n')
}

const composeImagePrompt = () => {
    return [referenceImageRolePrompt.value, portraitAssistPrompt.value, textToImagePrompt.value.trim(), supplementPrompt.value]
        .filter(part => part.trim())
        .join('\n\n')
}

const promptPreview = computed(() => selectedImages.value.length ? composeImagePrompt() : composeTextPrompt())

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

const addGenerationHistory = async (source: GenerationHistorySource, prompt: string, images: string[], recipe: GenerationRecipe) => {
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
        images,
        recipe
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

const favoriteHistory = computed(() => generationHistory.value.filter(item => item.favorite))
const recentGenerationHistory = computed(() => generationHistory.value.slice(0, 3))

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
    textToImagePrompt.value = item.recipe?.mainPrompt || item.prompt
    customPrompt.value = item.recipe?.customPrompt || ''
    selectedStyle.value = item.recipe?.selectedStyle || ''
    currentView.value = 'studio'
}

const applyGenerationRecipe = (recipe: GenerationRecipe | undefined, fallbackPrompt = '') => {
    textToImagePrompt.value = recipe?.mainPrompt || fallbackPrompt
    customPrompt.value = recipe?.customPrompt || ''
    selectedStyle.value = recipe?.selectedStyle || ''

    if (recipe?.referenceImages?.length) {
        selectedImages.value = [...recipe.referenceImages]
        referenceImageLabels.value = recipe.referenceImages.map((_, index) => recipe.referenceImageLabels?.[index] || `角色${index + 1}`)
        referenceImageMetadata.value = recipe.referenceImages.map((_, index) => normalizeReferenceRecipeMeta(recipe.referenceImageMetadata?.[index], index))
    }
}

const reuseHistoryRecipe = (item: GenerationHistoryItem) => {
    applyGenerationRecipe(item.recipe, item.prompt)

    selectedAspectRatio.value = item.aspectRatio
    gemini3ImageSize.value = item.imageSize
    currentView.value = 'studio'
}

const restoreHistoryItem = (item: GenerationHistoryItem) => {
    latestResultSource.value = item.source
    latestGenerationRecipe.value = item.recipe || null
    if (item.source === 'text') {
        textToImageResult.value = item.images
        textToImagePrompt.value = item.recipe?.mainPrompt || item.prompt
        textToImageError.value = null
    } else {
        result.value = item.images
        textToImagePrompt.value = item.recipe?.mainPrompt || item.prompt
        customPrompt.value = item.recipe?.customPrompt || ''
        selectedStyle.value = item.recipe?.selectedStyle || ''
        error.value = null
    }
    selectedAspectRatio.value = item.aspectRatio
    gemini3ImageSize.value = item.imageSize
    currentView.value = 'studio'
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
        const prompt = composeTextPrompt()
        const request: GenerateRequest = {
            prompt,
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
        const recipe = buildGenerationRecipe(prompt)
        latestGenerationRecipe.value = recipe
        addGenerationHistory('text', prompt, response.imageUrls, recipe)
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

const handleReuseCurrentRecipe = () => {
    applyGenerationRecipe(latestGenerationRecipe.value || undefined, textToImagePrompt.value)
    currentView.value = 'studio'
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
        link.download = `vistack-${Date.now()}.${extension}`
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
        const prompt = composeImagePrompt()

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
        const recipe = buildGenerationRecipe(prompt)
        latestGenerationRecipe.value = recipe
        addGenerationHistory('image', prompt, response.imageUrls, recipe)
    } catch (err) {
        error.value = err instanceof Error ? err.message : '生成失败'
        // Clear stale output after a failed generation.
        result.value = []
    } finally {
        isLoading.value = false
    }
}

</script>
