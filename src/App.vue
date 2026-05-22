<template>
    <div class="min-h-screen bg-brand-surface text-brand-ink">
        <header class="sticky top-0 z-40 border-b border-brand-line bg-white/95 shadow-sm shadow-black/5 backdrop-blur">
            <div class="wb-shell flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
                <div class="min-w-0">
                    <p class="wb-label text-brand-accent">Multi-model visual studio</p>
                    <div class="mt-1 flex flex-wrap items-end gap-3">
                        <h1 class="text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl">Vistack</h1>
                        <span class="rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-xs font-medium text-brand-accent" title="当前生图模型，会随 API 配置中的模型选择变化">
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

        <section v-if="showApiSettings" class="border-b border-brand-line bg-white">
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

        <main v-if="currentView === 'studio'" class="wb-shell grid items-start gap-4 py-4 lg:pb-[260px] xl:grid-cols-[minmax(320px,0.72fr)_minmax(520px,1.7fr)_minmax(300px,0.62fr)] 2xl:grid-cols-[minmax(340px,0.66fr)_minmax(720px,1.9fr)_minmax(320px,0.58fr)]">
            <aside class="space-y-4">
                <section class="wb-panel bg-white">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p class="wb-label text-brand-accent">Reference ingredients</p>
                            <h2 class="mt-1 text-base font-semibold text-brand-ink">参考图定义</h2>
                            <p class="mt-1 text-xs leading-5 text-brand-muted">上传参考图后先标注用途。这里决定模型把每张图当人物、服装、背景、产品还是风格参考。</p>
                        </div>
                        <span class="wb-chip">{{ selectedImages.length }} 张</span>
                    </div>
                    <ImageUpload v-model="selectedImages" v-model:labels="referenceImageLabels" v-model:metadata="referenceImageMetadata" />

                    <div v-if="selectedImages.length" class="mt-3 rounded-lg border border-brand-line bg-white p-3">
                        <div class="flex items-center justify-between gap-3">
                            <span class="wb-label">参考图核对清单</span>
                            <span class="rounded-md border border-brand-accent/20 bg-brand-accent/10 px-2 py-1 text-[11px] font-semibold text-brand-accent">已生效</span>
                        </div>
                        <div class="mt-2 space-y-2">
                            <div
                                v-for="item in referenceImageChecklist"
                                :key="item.index"
                                class="rounded-md border border-brand-line bg-brand-surface px-2.5 py-2 text-xs leading-5"
                            >
                                <div class="flex flex-wrap items-center gap-1.5">
                                    <span class="font-semibold text-brand-ink">图 {{ item.index }}</span>
                                    <span class="rounded bg-white px-1.5 py-0.5 font-semibold text-brand-accent">{{ item.role }}</span>
                                    <span class="text-brand-ink">{{ item.label }}</span>
                                </div>
                                <p v-if="item.note" class="mt-1 text-brand-muted">说明：{{ item.note }}</p>
                            </div>
                        </div>
                        <p class="mt-2 text-xs leading-5 text-brand-muted">
                            请确认每张图的用途和名称是否对上。多张图是同一个人时，类型都选“人物/角色”，并填写同一个名称；服装、背景、产品请选对应类型。
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

            <section class="min-w-0 space-y-3">
                <div class="wb-panel p-2">
                    <div class="grid grid-cols-2 gap-1 rounded-md bg-brand-line/60 p-1 text-sm font-semibold" role="tablist" aria-label="工作区模式">
                        <button
                            type="button"
                            :aria-pressed="workspaceMode === 'quick'"
                            @click="workspaceMode = 'quick'"
                            :class="[
                                'rounded-md px-3 py-2 transition',
                                workspaceMode === 'quick' ? 'bg-brand-ink text-brand-surface shadow-sm' : 'text-brand-muted hover:bg-white hover:text-brand-ink'
                            ]"
                        >
                            快速生成
                        </button>
                        <button
                            type="button"
                            :aria-pressed="workspaceMode === 'canvas'"
                            @click="workspaceMode = 'canvas'"
                            :class="[
                                'rounded-md px-3 py-2 transition',
                                workspaceMode === 'canvas' ? 'bg-brand-ink text-brand-surface shadow-sm' : 'text-brand-muted hover:bg-white hover:text-brand-ink'
                            ]"
                        >
                            画布工作台
                            <span v-if="canvasItems.length" class="ml-1 rounded bg-white/15 px-1.5 py-0.5 text-[11px]">{{ canvasItems.length }}</span>
                        </button>
                    </div>
                </div>

                <div v-if="workspaceMode === 'quick'" class="wb-panel p-4">
                    <div class="mb-4 flex flex-col gap-3 border-b border-brand-line pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 class="text-base font-semibold text-brand-ink">生成结果</h2>
                            <p class="mt-1 text-sm text-brand-muted">最新结果和多任务队列会显示在这里。完成后的任务可恢复预览、复用提示词、作参考图或加入画布。</p>
                        </div>
                        <div class="flex flex-wrap gap-2 text-xs">
                            <span class="wb-chip">{{ displayResults.length }} outputs</span>
                            <span v-if="activeGenerationTasks.length" class="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2.5 py-1 text-brand-accent">{{ activeGenerationTasks.length }} 个任务生成中</span>
                            <span v-else class="wb-chip">待命</span>
                            <button v-if="displayResults.length" type="button" class="wb-secondary min-h-7 px-2 text-xs" @click="addDisplayResultsToCanvas">加入画布</button>
                        </div>
                    </div>
                    <div v-if="selectedImages.length" class="mb-4 rounded-lg border border-brand-line bg-brand-surface p-3">
                        <div class="mb-2 flex items-center justify-between gap-3">
                            <span class="wb-label">当前会发送给模型的参考图</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-brand-muted">{{ selectedImages.length }} reference images</span>
                                <button type="button" class="rounded-md border border-brand-line bg-white px-2 py-1 text-xs font-semibold text-brand-muted transition hover:text-brand-accent" @click="addReferencesToCanvas">
                                    加入画布
                                </button>
                            </div>
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
                        :tasks="generationTasks"
                        :loading="displayLoading"
                        :error="displayError"
                        :can-push="canPushDisplayResult"
                        :can-reuse="Boolean(displayResults.length)"
                        @restore-task="restoreTaskResult"
                        @download="handleDownloadResult"
                        @push="handlePushDisplayResult"
                        @reuse="handleReuseCurrentRecipe"
                        @reuse-task="reuseTaskPrompt"
                        @push-task="pushTaskImages"
                        @canvas-task="addTaskToCanvas"
                    />
                </div>
                <CanvasWorkbench
                    v-else
                    :items="canvasItems"
                    @update="updateCanvasItems"
                    @remove="removeCanvasItem"
                    @clear="clearCanvasItems"
                    @use-reference="pushImageToUpload"
                    @use-all-references="pushCanvasImagesToUpload"
                    @download="handleDownloadResult"
                    @reuse-prompt="reuseCanvasPrompt"
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
                                <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="addHistoryItemToCanvas(item)">加入画布</button>
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
            class="border-t border-brand-line bg-white/95 shadow-[0_-18px_45px_rgba(25,25,25,0.10)] backdrop-blur lg:fixed lg:inset-x-0 lg:bottom-0 lg:z-30"
        >
            <div class="wb-shell py-3">
                <div v-if="showPromptTools" class="absolute bottom-[calc(100%+10px)] left-1/2 z-40 w-[min(1040px,calc(100vw-32px))] -translate-x-1/2 rounded-lg border border-brand-line bg-white p-3 shadow-2xl shadow-black/20">
                    <PromptPhraseBuilder
                        :groups="mergedPromptPhraseGroups"
                        title="提示词词组"
                        description="点击后追加到主提示词。"
                        @insert="insertTextPromptPhrase"
                        @add="openPhraseEditor"
                        @edit="openPhraseEditor"
                        @add-group="openBlankPhraseGroupEditor"
                        @edit-group="openPhraseGroupEditor"
                        editable
                    />
                </div>

                <div class="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div class="min-w-0 rounded-lg border border-brand-line bg-white p-3">
                        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span class="wb-label">Prompt box</span>
                                <p class="mt-1 text-xs text-brand-muted">这里写你要生成的画面。若左侧有参考图，“使用参考图生成”会把参考图用途说明一起提交。</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    :disabled="!canUndoPromptPhrase"
                                    class="wb-secondary min-h-9 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                                    title="撤销上一次通过词组追加的内容"
                                    @click="undoLastPromptPhrase"
                                >
                                    撤销词组
                                </button>
                                <button
                                    type="button"
                                    :disabled="!textToImagePrompt.trim()"
                                    class="wb-secondary min-h-9 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                                    title="清空提示词框"
                                    @click="clearPromptText"
                                >
                                    清除
                                </button>
                                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="showPromptTools = !showPromptTools">
                                    {{ showPromptTools ? '收起词组' : '词组' }}
                                </button>
                                <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="showTemplatePanel = true">
                                    模板
                                    <span v-if="activeSupplementLabel" class="ml-1 text-brand-accent">已选</span>
                                </button>
                                <button
                                    type="button"
                                    :disabled="!textToImagePrompt.trim() && !supplementPrompt"
                                    class="wb-secondary min-h-9 px-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                                    @click="openTemplateEditorFromCurrentPrompt"
                                >
                                    存模板
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
                            @input="handlePromptManualInput"
                            placeholder="描述你想生成或改动的画面。参考图会作为素材参与生成，可以写：让角色1穿着服装参考，在背景参考中拍摄产品级主视觉。"
                            class="wb-input min-h-[116px] max-h-[180px] w-full resize-y bg-white py-3 text-base leading-7"
                        />

                        <p v-if="promptAssistantError" class="mt-2 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-xs text-brand-accent">
                            {{ promptAssistantError }}
                        </p>
                        <p v-else-if="!promptAssistantReady" class="mt-2 text-xs text-brand-muted">
                            配置提示词助手 URL / Key / Model 后，可用低费率文本模型先整理中文提示词。
                        </p>
                    </div>

                    <div class="flex min-w-0 flex-col gap-2 rounded-lg border border-brand-line bg-white p-3">
                        <div class="grid grid-cols-3 gap-2 text-center text-xs">
                            <div class="rounded-md bg-brand-surface px-2 py-1.5">
                                <div class="text-brand-muted">参考图</div>
                                <div class="font-semibold text-brand-ink">{{ selectedImages.length }}</div>
                            </div>
                            <div class="rounded-md bg-brand-surface px-2 py-1.5">
                                <div class="text-brand-muted">比例</div>
                                <div class="font-semibold text-brand-ink">{{ showAspectRatioSelector ? selectedAspectRatio : '自动' }}</div>
                            </div>
                            <div class="rounded-md bg-brand-surface px-2 py-1.5">
                                <div class="text-brand-muted">尺寸</div>
                                <div class="font-semibold text-brand-ink">{{ showImageSizeConfig ? gemini3ImageSize : '自动' }}</div>
                            </div>
                        </div>

                        <div
                            :class="[
                                'rounded-lg border px-3 py-2 text-xs leading-5',
                                selectedImages.length
                                    ? 'border-brand-ink/15 bg-brand-ink text-brand-surface'
                                    : 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent'
                            ]"
                        >
                            当前提交方式：{{ selectedImages.length ? `参考图生成，会发送 ${selectedImages.length} 张参考图` : '无参考图生成，只发送提示词' }}
                        </div>

                        <div class="grid grid-cols-3 gap-2">
                            <label class="min-w-0">
                                <span class="sr-only">生成张数</span>
                                <select v-model.number="generationCount" class="wb-input min-h-10 w-full py-2 text-xs font-semibold">
                                    <option v-for="count in generationCountOptions" :key="count" :value="count">{{ count }} 张</option>
                                </select>
                            </label>
                            <label v-if="showAspectRatioSelector" class="min-w-0">
                                <span class="sr-only">图像宽高比</span>
                                <select v-model="selectedAspectRatio" class="wb-input min-h-10 w-full py-2 text-xs font-semibold">
                                    <option v-for="ratio in availableAspectRatios" :key="ratio.value" :value="ratio.value">{{ ratio.label }}</option>
                                </select>
                            </label>
                            <label v-if="showImageSizeConfig" class="min-w-0">
                                <span class="sr-only">图像尺寸</span>
                                <select v-model="gemini3ImageSize" class="wb-input min-h-10 w-full py-2 text-xs font-semibold">
                                    <option value="1K">1K - 标准</option>
                                    <option value="2K">2K - 高清晰度</option>
                                    <option value="4K">4K - 超高清</option>
                                </select>
                            </label>
                        </div>

                        <label v-if="supportsGoogleSearch" class="flex items-center gap-2 rounded-md bg-brand-surface px-2 py-1.5 text-xs font-semibold text-brand-muted">
                            <input v-model="gemini3EnableGoogleSearch" type="checkbox" class="h-3.5 w-3.5 rounded border-brand-line text-brand-accent focus:ring-brand-accent" />
                            Google Search
                        </label>
                        <button
                            type="button"
                            @click="handleGenerate"
                            :disabled="!canGenerate"
                            :title="selectedImages.length ? '使用当前参考图和提示词生成' : '左侧上传参考图后此按钮会启用'"
                            :class="[
                                'inline-flex min-h-12 items-center justify-center rounded-lg px-4 text-sm font-semibold transition',
                                canGenerate
                                    ? 'border border-brand-ink bg-brand-ink text-brand-surface hover:bg-brand-ink/90'
                                    : 'cursor-not-allowed bg-brand-line text-brand-muted'
                            ]"
                        >
                            {{ selectedImages.length ? (isLoading ? '参考图生成中...' : `使用 ${selectedImages.length} 张参考图生成`) : '先上传参考图' }}
                        </button>
                        <button
                            type="button"
                            @click="handleTextToImageGenerate"
                            :disabled="!canGenerateTextImage"
                            :title="selectedImages.length ? '已上传参考图，请使用参考图生成；移除参考图后可无参考图生成' : '不使用参考图，直接按提示词生成'"
                            :class="[
                                'inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition',
                                canGenerateTextImage
                                    ? 'bg-brand-accent text-brand-surface hover:bg-brand-accent/90'
                                    : 'cursor-not-allowed bg-brand-line text-brand-muted'
                            ]"
                        >
                            {{ selectedImages.length ? '移除参考图后可用' : (isTextToImageLoading ? '无参考图生成中...' : '无参考图生成') }}
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
                        <p class="mt-1 text-sm text-brand-muted">点击模板会插入到底部主提示词框，之后可以直接为本次生成微调。</p>
                    </div>
                    <button type="button" class="wb-secondary min-h-9 px-3 text-xs" @click="showTemplatePanel = false">关闭</button>
                </div>
                <div class="max-h-[calc(86vh-88px)] overflow-y-auto p-4">
                    <StylePromptSelector
                        v-model:selectedStyle="selectedStyle"
                        v-model:customPrompt="customPrompt"
                        v-model:template-language="templateLanguage"
                        :templates="availableStyleTemplates"
                        :prompt-pool-groups="promptPoolGroups"
                        :phrase-groups="mergedPromptPhraseGroups"
                        @new-template="openBlankTemplateEditor"
                        @edit-template="openTemplateEditor"
                        @delete-template="deleteCustomTemplate"
                        @insert-template="insertTemplatePrompt"
                        @new-phrase="openPhraseEditor"
                        @edit-phrase="openPhraseEditor"
                        @new-phrase-group="openBlankPhraseGroupEditor"
                        @edit-phrase-group="openPhraseGroupEditor"
                    />
                </div>
            </section>
        </div>

        <div v-if="showPhraseEditor" class="fixed inset-0 z-[95] flex items-center justify-center bg-brand-ink/70 p-4" @click.self="closePhraseEditor">
            <form class="w-full max-w-md rounded-lg border border-brand-line bg-white p-4 shadow-2xl" @submit.prevent="savePhraseEdit">
                <div class="mb-4">
                    <p class="wb-label text-brand-accent">Prompt phrase</p>
                    <h2 class="mt-1 text-base font-semibold text-brand-ink">{{ editingPhraseOriginalId ? '编辑词组' : '新增词组' }}</h2>
                    <p class="mt-1 text-xs leading-5 text-brand-muted">词组会保存在当前浏览器。内置词组被改写后，可在这里重置回内置版本。</p>
                </div>
                <div class="space-y-3">
                    <label class="block">
                        <span class="mb-1 block wb-label">分类</span>
                        <select v-model="editingPhraseGroupId" class="wb-input w-full">
                            <option v-for="group in mergedPromptPhraseGroups" :key="group.id" :value="group.id">{{ group.title }}</option>
                        </select>
                        <p class="mt-1 text-xs text-brand-muted">编辑已有词组时切换分类，即可把它移动到新的分类。</p>
                    </label>
                    <label class="block">
                        <span class="mb-1 block wb-label">短标签</span>
                        <input v-model="phraseFormLabel" class="wb-input w-full" placeholder="例如：蜂腰 / 直角肩 / 概念棚拍" />
                    </label>
                    <label class="block">
                        <span class="mb-1 block wb-label">实际注入提示词</span>
                        <textarea v-model="phraseFormValue" class="wb-input min-h-[96px] w-full resize-y py-2" placeholder="点击词组时会追加到提示词框里的内容。" />
                    </label>
                </div>
                <div class="mt-4 flex flex-wrap justify-between gap-2">
                    <button
                        v-if="editingPhraseOriginalId"
                        type="button"
                        class="wb-secondary text-brand-accent"
                        @click="deletePhraseEdit"
                    >
                        {{ editingPhraseIsCustom ? '删除词组' : '重置内置' }}
                    </button>
                    <span v-else />
                    <div class="flex gap-2">
                        <button type="button" class="wb-secondary" @click="closePhraseEditor">取消</button>
                        <button type="submit" class="wb-primary" :disabled="!phraseFormLabel.trim() || !phraseFormValue.trim()">保存</button>
                    </div>
                </div>
            </form>
        </div>

        <div v-if="showPhraseGroupEditor" class="fixed inset-0 z-[96] flex items-center justify-center bg-brand-ink/70 p-4" @click.self="closePhraseGroupEditor">
            <form class="w-full max-w-md rounded-lg border border-brand-line bg-white p-4 shadow-2xl" @submit.prevent="savePhraseGroupEdit">
                <div class="mb-4">
                    <p class="wb-label text-brand-accent">Prompt category</p>
                    <h2 class="mt-1 text-base font-semibold text-brand-ink">{{ editingPromptPhraseGroupId ? '编辑分类' : '新建分类' }}</h2>
                    <p class="mt-1 text-xs leading-5 text-brand-muted">
                        分类名称和说明会保存在当前浏览器。修改内置分类名称，不会删除原来的内置词组。
                    </p>
                </div>
                <div class="space-y-3">
                    <label class="block">
                        <span class="mb-1 block wb-label">分类名称</span>
                        <input v-model="phraseGroupFormTitle" class="wb-input w-full" placeholder="例如：我的常用 / 产品主图 / 角色设定" />
                    </label>
                    <label class="block">
                        <span class="mb-1 block wb-label">分类说明</span>
                        <textarea v-model="phraseGroupFormDescription" class="wb-input min-h-[84px] w-full resize-y py-2" placeholder="说明这个分类适合放什么词组。" />
                    </label>
                </div>
                <div v-if="editingPromptPhraseGroupId" class="mt-4 rounded-lg border border-brand-line bg-brand-surface p-3">
                    <p class="wb-label">把词组移到当前分类</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <button
                            v-for="group in movablePromptPhraseGroups"
                            :key="group.id"
                            type="button"
                            class="rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-muted transition hover:border-brand-accent hover:text-brand-accent"
                            @click="moveAllPhrasesToEditingGroup(group.id)"
                        >
                            移入 {{ group.title }} 的词组
                        </button>
                        <span v-if="!movablePromptPhraseGroups.length" class="text-xs text-brand-muted">暂无其他分类可移动。</span>
                    </div>
                    <p class="mt-2 text-xs leading-5 text-brand-muted">
                        需要只移动某一个词组时，打开词组编辑，把“分类”改成目标分类即可。
                    </p>
                </div>
                <div class="mt-4 flex flex-wrap justify-between gap-2">
                    <button
                        v-if="editingPromptPhraseGroupId && isEditingCustomOnlyPhraseGroup"
                        type="button"
                        class="wb-secondary text-brand-accent"
                        :disabled="editingPromptPhraseGroupHasPhrases"
                        @click="deletePhraseGroupEdit"
                    >
                        {{ editingPromptPhraseGroupHasPhrases ? '先移动词组' : '删除分类' }}
                    </button>
                    <span v-else />
                    <div class="flex gap-2">
                        <button type="button" class="wb-secondary" @click="closePhraseGroupEditor">取消</button>
                        <button type="submit" class="wb-primary" :disabled="!phraseGroupFormTitle.trim()">保存</button>
                    </div>
                </div>
            </form>
        </div>

        <div v-if="showTemplateEditor" class="fixed inset-0 z-[100] flex items-center justify-center bg-brand-ink/75 p-4" @click.self="closeTemplateEditor">
            <form class="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-lg border border-brand-line bg-white shadow-2xl" @submit.prevent="saveCustomTemplate">
                <div class="border-b border-brand-line p-4">
                    <p class="wb-label text-brand-accent">Custom template</p>
                    <h2 class="mt-1 text-base font-semibold text-brand-ink">{{ editingTemplateId ? '编辑模板' : '保存为模板' }}</h2>
                    <p class="mt-1 text-xs leading-5 text-brand-muted">自定义模板会出现在模板面板中，之后可以继续编辑或删除。</p>
                </div>
                <div class="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                    <div class="grid gap-3 sm:grid-cols-2">
                        <label class="block">
                            <span class="mb-1 block wb-label">模板名称</span>
                            <input v-model="templateFormTitle" class="wb-input w-full" placeholder="例如：概念 MV 冷感棚拍" />
                        </label>
                        <label class="block">
                            <span class="mb-1 block wb-label">分类</span>
                            <input v-model="templateFormCategory" class="wb-input w-full" placeholder="我的模板" />
                        </label>
                    </div>
                    <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                        <label class="block">
                            <span class="mb-1 block wb-label">标签</span>
                            <input v-model="templateFormTags" class="wb-input w-full" placeholder="用逗号分隔，例如：自拍, K-pop, 棚拍" />
                        </label>
                        <label class="block">
                            <span class="mb-1 block wb-label">模式</span>
                            <select v-model="templateFormMode" class="wb-input w-full">
                                <option value="both">通用</option>
                                <option value="text">文生图</option>
                                <option value="image">需参考图</option>
                            </select>
                        </label>
                    </div>
                    <label class="block">
                        <span class="mb-1 block wb-label">说明</span>
                        <input v-model="templateFormDescription" class="wb-input w-full" placeholder="这个模板适合什么场景。" />
                    </label>
                    <div class="rounded-lg border border-brand-line bg-brand-surface p-3">
                        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <span class="wb-label">语言版本</span>
                                <p class="mt-1 text-xs text-brand-muted">保存模板时可只填一种语言，也可以用提示词助手补齐另一种语言。</p>
                            </div>
                            <div class="grid grid-cols-3 rounded-md border border-brand-line bg-white p-1 text-xs font-semibold">
                                <button
                                    v-for="option in templateFormLanguageOptions"
                                    :key="option.value"
                                    type="button"
                                    @click="templateFormSourceLanguage = option.value"
                                    :class="[
                                        'rounded px-2 py-1.5 transition',
                                        templateFormSourceLanguage === option.value ? 'bg-brand-ink text-brand-surface' : 'text-brand-muted hover:bg-brand-surface hover:text-brand-ink'
                                    ]"
                                >
                                    {{ option.label }}
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <button
                                type="button"
                                class="wb-secondary min-h-9 px-3 text-xs"
                                :disabled="!canTranslateTemplateToEnglish"
                                @click="translateTemplatePrompt('en')"
                            >
                                {{ templateTranslationTarget === 'en' ? '正在补英文...' : '用助手补英文' }}
                            </button>
                            <button
                                type="button"
                                class="wb-secondary min-h-9 px-3 text-xs"
                                :disabled="!canTranslateTemplateToChinese"
                                @click="translateTemplatePrompt('zh')"
                            >
                                {{ templateTranslationTarget === 'zh' ? '正在补中文...' : '用助手补中文' }}
                            </button>
                            <span v-if="templateAssistantError" class="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-xs text-brand-accent">{{ templateAssistantError }}</span>
                        </div>
                    </div>
                    <label class="block">
                        <span class="mb-1 block wb-label">中文模板提示词</span>
                        <textarea v-model="templateFormPrompt" class="wb-input min-h-[170px] w-full resize-y py-3 leading-6" placeholder="保存后，选择中文或双语模式时会使用这段内容。" />
                    </label>
                    <label class="block">
                        <span class="mb-1 block wb-label">English template prompt</span>
                        <textarea v-model="templateFormPromptEn" class="wb-input min-h-[170px] w-full resize-y py-3 leading-6" placeholder="Optional. Used when template language is English or bilingual." />
                    </label>
                </div>
                <div class="flex flex-wrap justify-between gap-2 border-t border-brand-line p-4">
                    <button v-if="editingTemplateId" type="button" class="wb-secondary text-brand-accent" @click="deleteCustomTemplate(editingTemplateId)">删除模板</button>
                    <span v-else />
                    <div class="flex gap-2">
                        <button type="button" class="wb-secondary" @click="closeTemplateEditor">取消</button>
                        <button type="submit" class="wb-primary" :disabled="!templateFormTitle.trim() || !templateFormPrompt.trim()">保存</button>
                    </div>
                </div>
            </form>
        </div>

        <main v-if="currentView === 'assets'" class="wb-shell py-4 pb-10">
            <section class="min-h-[calc(100vh-170px)] rounded-lg border border-brand-line bg-brand-surface p-4 shadow-sm shadow-black/5">
                <div class="mb-4 flex flex-col gap-3 border-b border-brand-line pb-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p class="wb-label text-brand-accent">Local asset library</p>
                        <h1 class="mt-1 text-2xl font-semibold text-brand-ink">资产库</h1>
                        <p class="mt-1 text-sm text-brand-muted">管理本地生成历史、收藏和自定义收藏夹。数据保存在当前浏览器。</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" class="wb-secondary" @click="currentView = 'studio'">返回创作台</button>
                        <button
                            v-if="generationHistory.length"
                            type="button"
                            class="wb-secondary"
                            @click="toggleAssetSelectionMode"
                        >
                            {{ assetSelectionMode ? '退出选择' : '批量选择' }}
                        </button>
                        <button
                            v-if="assetSelectionMode && selectedAssetIds.length"
                            type="button"
                            class="wb-secondary text-brand-accent"
                            @click="showBulkDeleteDialog = true"
                        >
                            删除所选 {{ selectedAssetIds.length }}
                        </button>
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
                            <div class="mb-2 flex items-center justify-between gap-2">
                                <span class="wb-label">收藏夹</span>
                                <button type="button" class="rounded-md bg-brand-accent px-2.5 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-accent/90" @click="showCollectionDialog = true">
                                    新建
                                </button>
                            </div>
                            <div v-if="collectionOptions.length" class="flex flex-wrap gap-2">
                                <button
                                    v-for="category in collectionOptions"
                                    :key="category"
                                    type="button"
                                    :class="[
                                        'rounded-md border px-2.5 py-1.5 text-xs font-semibold transition',
                                        historyFilter === `category:${category}`
                                            ? 'border-brand-accent bg-brand-accent text-brand-surface'
                                            : 'border-brand-line bg-brand-surface text-brand-muted hover:text-brand-ink'
                                    ]"
                                    @click="historyFilter = `category:${category}`"
                                >
                                    {{ category }}
                                </button>
                            </div>
                            <p v-else class="text-xs leading-5 text-brand-muted">还没有收藏夹。新建后，可在资产卡片中归类。</p>
                        </div>
                        <div class="rounded-lg border border-brand-line bg-white p-3">
                            <div class="wb-label mb-2">概览</div>
                            <div class="grid grid-cols-3 gap-2 text-center text-xs lg:grid-cols-1">
                                <button type="button" class="rounded-md bg-brand-surface p-2 transition hover:bg-brand-line" @click="historyFilter = 'all'">
                                    <div class="text-brand-muted">全部</div>
                                    <div class="mt-1 font-semibold text-brand-ink">{{ generationHistory.length }}</div>
                                </button>
                                <button type="button" class="rounded-md bg-brand-surface p-2 transition hover:bg-brand-line" @click="historyFilter = 'favorite'">
                                    <div class="text-brand-muted">收藏</div>
                                    <div class="mt-1 font-semibold text-brand-ink">{{ favoriteHistory.length }}</div>
                                </button>
                                <button type="button" class="rounded-md bg-brand-surface p-2 transition hover:bg-brand-line" @click="historyFilter = historyCategories[0] ? `category:${historyCategories[0]}` : 'all'">
                                    <div class="text-brand-muted">收藏夹</div>
                                    <div class="mt-1 font-semibold text-brand-ink">{{ historyCategories.length }}</div>
                                </button>
                            </div>
                            <div v-if="historyCategories.length" class="mt-3 flex flex-wrap gap-2">
                                <button
                                    v-for="category in historyCategories"
                                    :key="category"
                                    type="button"
                                    :class="[
                                        'rounded-md border px-2.5 py-1.5 text-xs font-semibold transition',
                                        historyFilter === `category:${category}`
                                            ? 'border-brand-accent bg-brand-accent text-brand-surface'
                                            : 'border-brand-line bg-brand-surface text-brand-muted hover:text-brand-ink'
                                    ]"
                                    @click="historyFilter = `category:${category}`"
                                >
                                    {{ category }}
                                </button>
                            </div>
                        </div>
                    </aside>

                    <section>
                        <div v-if="filteredHistoryAssets.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                            <article
                                v-for="asset in filteredHistoryAssets"
                                :key="asset.id"
                                :class="[
                                    'overflow-hidden rounded-lg border bg-white',
                                    selectedAssetIds.includes(asset.id) ? 'border-brand-accent ring-2 ring-brand-accent/15' : 'border-brand-line'
                                ]"
                            >
                                <button
                                    type="button"
                                    class="relative block aspect-square w-full bg-brand-surface"
                                    @click="assetSelectionMode ? toggleAssetSelection(asset.id) : openHistoryPreview(asset.item, asset.image)"
                                >
                                    <img :src="asset.image" :alt="`历史资产 ${asset.index + 1}`" class="h-full w-full object-cover" />
                                    <span v-if="assetSelectionMode" class="absolute left-2 top-2 rounded-md border border-white/60 bg-brand-ink/75 px-2 py-1 text-xs font-semibold text-brand-surface">
                                        {{ selectedAssetIds.includes(asset.id) ? '已选' : '选择' }}
                                    </span>
                                </button>
                                <div class="space-y-2 p-3">
                                    <div class="flex items-start justify-between gap-2">
                                        <div class="min-w-0">
                                            <p class="truncate text-xs font-semibold text-brand-ink">
                                                {{ asset.item.source === 'text' ? '文生图' : '参考图生成' }}
                                                <span class="text-brand-muted"> · {{ asset.index + 1 }}/{{ asset.item.images.length }}</span>
                                            </p>
                                            <p class="mt-1 line-clamp-2 text-xs leading-5 text-brand-muted">{{ asset.item.recipe?.mainPrompt || asset.item.prompt }}</p>
                                        </div>
                                        <button type="button" class="shrink-0 rounded-md bg-brand-line/60 px-2 py-1 text-[11px] text-brand-muted transition hover:text-brand-accent" @click="toggleHistoryFavorite(asset.item)">
                                            {{ asset.item.favorite ? '已收藏' : asset.item.aspectRatio }}
                                        </button>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="openHistoryPreview(asset.item, asset.image)">详情</button>
                                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="pushImageToUpload(asset.image)">作参考</button>
                                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="addHistoryItemToCanvas(asset.item, asset.image)">加入画布</button>
                                        <button type="button" class="wb-secondary min-h-8 px-2 text-xs text-brand-accent" @click="deleteHistoryImageAt(asset.item, asset.index)">删除</button>
                                    </div>
                                    <select
                                        :value="asset.item.category || ''"
                                        class="wb-input min-h-9 w-full py-1.5 text-xs"
                                        @change="setHistoryCategory(asset.item, ($event.target as HTMLSelectElement).value)"
                                    >
                                        <option value="">未归类</option>
                                        <option v-for="category in collectionOptions" :key="category" :value="category">{{ category }}</option>
                                    </select>
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

        <div v-if="historyPreviewItem" class="fixed inset-0 z-[80] flex items-center justify-center bg-brand-ink/90 p-4" @click.self="historyPreviewItem = null">
            <div class="flex max-h-full w-full max-w-6xl flex-col rounded-lg border border-brand-surface/20 bg-brand-ink p-3 shadow-2xl">
                <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0">
                        <p class="text-sm font-semibold text-brand-surface">
                            {{ historyPreviewItem.source === 'text' ? '文生图' : '参考图生成' }}
                            <span v-if="historyPreviewItem.category" class="text-brand-muted"> · {{ historyPreviewItem.category }}</span>
                        </p>
                        <p class="mt-1 line-clamp-1 text-xs text-brand-muted">{{ historyPreviewItem.recipe?.mainPrompt || historyPreviewItem.prompt }}</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="openOriginalImage(historyPreviewImage)">原图查看</button>
                        <button type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="handleDownloadResult(historyPreviewImage)">下载</button>
                        <button type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="pushHistoryImages(historyPreviewItem)">结果作参考</button>
                        <button type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="addHistoryItemToCanvas(historyPreviewItem, historyPreviewImage)">加入画布</button>
                        <button type="button" class="rounded-md border border-brand-surface/20 px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-surface/10" @click="reuseHistoryRecipe(historyPreviewItem)">一键复用</button>
                        <button type="button" class="rounded-md border border-brand-accent/50 px-3 py-1.5 text-xs font-semibold text-brand-accent transition hover:bg-brand-accent/10" @click="deleteHistoryImageAt(historyPreviewItem, historyPreviewItem.images.indexOf(historyPreviewImage))">删除当前图</button>
                        <button type="button" class="rounded-md border border-brand-accent/50 px-3 py-1.5 text-xs font-semibold text-brand-accent transition hover:bg-brand-accent/10" @click="deleteHistoryItem(historyPreviewItem)">删除整组</button>
                        <button type="button" class="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-semibold text-brand-surface transition hover:bg-brand-accent/90" @click="historyPreviewItem = null">关闭</button>
                    </div>
                </div>
                <div class="min-h-0 flex-1 overflow-auto rounded-lg bg-black/20">
                    <img :src="historyPreviewImage" alt="历史结果预览" class="mx-auto max-h-[74vh] w-auto max-w-full object-contain" />
                </div>
                <div v-if="historyPreviewItem.images.length > 1" class="mt-3 flex gap-2 overflow-x-auto">
                    <button
                        v-for="(image, index) in historyPreviewItem.images"
                        :key="`${historyPreviewItem.id}-preview-${index}`"
                        type="button"
                        :class="[
                            'h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-brand-surface',
                            historyPreviewImage === image ? 'border-brand-accent' : 'border-brand-surface/20'
                        ]"
                        @click="historyPreviewImage = image"
                    >
                        <img :src="image" :alt="`历史结果 ${index + 1}`" class="h-full w-full object-cover" />
                    </button>
                </div>
                <div class="mt-3 grid gap-3 text-xs leading-5 text-brand-muted lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div class="rounded-lg border border-brand-surface/15 bg-brand-surface/5 p-3">
                        <div class="mb-1 font-semibold text-brand-surface">生成提示词</div>
                        <p class="max-h-24 overflow-y-auto whitespace-pre-wrap">{{ historyPreviewItem.prompt }}</p>
                    </div>
                    <div class="rounded-lg border border-brand-surface/15 bg-brand-surface/5 p-3">
                        <div class="mb-1 font-semibold text-brand-surface">批次信息</div>
                        <p>生成组：{{ historyPreviewItem.images.length }} 张</p>
                        <p>比例：{{ historyPreviewItem.aspectRatio }} · 尺寸：{{ historyPreviewItem.imageSize }}</p>
                        <p>模型：{{ historyPreviewItem.model }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showCollectionDialog" class="fixed inset-0 z-[90] flex items-center justify-center bg-brand-ink/70 p-4" @click.self="showCollectionDialog = false">
            <form class="w-full max-w-sm rounded-lg border border-brand-line bg-white p-4 shadow-2xl" @submit.prevent="createCollection">
                <div class="mb-4">
                    <p class="wb-label text-brand-accent">Collection</p>
                    <h2 class="mt-1 text-base font-semibold text-brand-ink">新建收藏夹</h2>
                    <p class="mt-1 text-xs leading-5 text-brand-muted">命名后会出现在资产库侧栏，之后可把单张资产归入这个收藏夹。</p>
                </div>
                <label class="block">
                    <span class="mb-1 block wb-label">收藏夹名称</span>
                    <input v-model="newCollectionName" class="wb-input w-full" placeholder="例如：自拍 / 商业主图 / K-pop 路透" autofocus />
                </label>
                <div class="mt-4 flex justify-end gap-2">
                    <button type="button" class="wb-secondary" @click="showCollectionDialog = false">取消</button>
                    <button type="submit" class="wb-primary" :disabled="!newCollectionName.trim()">创建</button>
                </div>
            </form>
        </div>

        <div v-if="showBulkDeleteDialog" class="fixed inset-0 z-[95] flex items-center justify-center bg-brand-ink/75 p-4" @click.self="showBulkDeleteDialog = false">
            <form class="w-full max-w-md rounded-lg border border-brand-line bg-white p-4 shadow-2xl" @submit.prevent="confirmBulkDeleteAssets">
                <div class="mb-4">
                    <p class="wb-label text-brand-accent">Danger zone</p>
                    <h2 class="mt-1 text-base font-semibold text-brand-ink">确认批量删除</h2>
                    <p class="mt-2 text-sm leading-6 text-brand-muted">
                        将删除当前选中的 {{ selectedAssetIds.length }} 张资产。这个操作只影响选中图片；同组未选中的图片会保留。
                    </p>
                    <p class="mt-2 text-xs leading-5 text-brand-accent">请输入“删除”以确认。</p>
                </div>
                <input v-model="bulkDeleteConfirmText" class="wb-input w-full" placeholder="删除" />
                <div class="mt-4 flex justify-end gap-2">
                    <button type="button" class="wb-secondary" @click="showBulkDeleteDialog = false">取消</button>
                    <button type="submit" class="wb-primary" :disabled="bulkDeleteConfirmText.trim() !== '删除'">确认删除</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ApiKeyInput from './components/ApiKeyInput.vue'
import ImageUpload from './components/ImageUpload.vue'
import StylePromptSelector from './components/StylePromptSelector.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import CanvasWorkbench from './components/CanvasWorkbench.vue'
import Footer from './components/Footer.vue'
import PromptPhraseBuilder from './components/PromptPhraseBuilder.vue'
import { fetchModels, generateImage, improvePrompt } from './services/api'
import { styleTemplates } from './data/templates'
import { promptPoolGroups } from './data/promptPool'
import { promptPhraseGroups, type PromptPhrase, type PromptPhraseGroup } from './data/promptPhrases'
import { LocalStorage, type StoredPromptPhrase, type StoredPromptPhraseGroup, type StoredPromptPhraseOverride } from './utils/storage'
import { resolveChatCompletionsEndpoint } from './utils/apiEndpoint'
import { getCanvasWorkbenchItems, saveCanvasWorkbenchItems } from './utils/canvasStorage'
import {
    deleteGenerationHistoryItem,
    deleteStoredImage,
    getGenerationHistoryItems,
    persistGeneratedImages,
    putGenerationHistoryItem,
    resolveHistoryItemImages,
    type GenerationHistoryItem,
    type GenerationHistorySource
} from './utils/historyDb'
import type { ApiModel, CanvasWorkbenchItem, CanvasWorkbenchItemSource, GenerateRequest, GenerationRecipe, GenerationTask, ModelOption, PromptAssistantRequest, ReferenceImageMeta, ReferenceImageRole, StyleTemplate, WorkspaceMode } from './types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID, DEFAULT_PROMPT_ASSISTANT_ENDPOINT, DEFAULT_PROMPT_ASSISTANT_MODEL_ID } from './config/api'

const apiKey = ref('')
const apiEndpoint = ref('')
const selectedImages = ref<string[]>([])
const referenceImageLabels = ref<string[]>([])
const referenceImageMetadata = ref<ReferenceImageMeta[]>([])
const selectedStyle = ref('')
const customPrompt = ref('')
const templateLanguage = ref<'zh' | 'en' | 'bilingual'>('zh')
const isLoading = ref(false)
const result = ref<string[]>([])
const error = ref<string | null>(null)
const textToImagePrompt = ref('')
const promptPhraseUndoStack = ref<string[]>([])
const isApplyingPromptHistory = ref(false)
const textToImageResult = ref<string[]>([])
const textToImageError = ref<string | null>(null)
const isTextToImageLoading = ref(false)
const latestResultSource = ref<'text' | 'image' | null>(null)
const latestGenerationRecipe = ref<GenerationRecipe | null>(null)
const generationTasks = ref<GenerationTask[]>([])
const currentView = ref<'studio' | 'assets'>('studio')
const workspaceMode = ref<WorkspaceMode>('quick')
const canvasItems = ref<CanvasWorkbenchItem[]>([])
const showPromptTools = ref(false)
const showTemplatePanel = ref(false)
const showApiSettings = ref(false)
const customPromptPhraseGroups = ref<StoredPromptPhraseGroup[]>([])
const promptPhraseOverrides = ref<StoredPromptPhraseOverride[]>([])
const customStyleTemplates = ref<StyleTemplate[]>([])
const showPhraseEditor = ref(false)
const editingPhraseGroupId = ref('')
const editingPhraseOriginalId = ref('')
const editingPhraseIsCustom = ref(false)
const phraseFormLabel = ref('')
const phraseFormValue = ref('')
const showPhraseGroupEditor = ref(false)
const editingPromptPhraseGroupId = ref('')
const phraseGroupFormTitle = ref('')
const phraseGroupFormDescription = ref('')
const showTemplateEditor = ref(false)
const editingTemplateId = ref('')
const templateFormTitle = ref('')
const templateFormCategory = ref('我的模板')
const templateFormTags = ref('')
const templateFormDescription = ref('')
const templateFormPrompt = ref('')
const templateFormPromptEn = ref('')
const templateFormSourceLanguage = ref<'zh' | 'en' | 'bilingual'>('zh')
const templateTranslationTarget = ref<'zh' | 'en' | null>(null)
const templateAssistantError = ref<string | null>(null)
const templateFormMode = ref<StyleTemplate['mode']>('both')
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
const generationCount = ref(1)
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
const assetCollections = ref<string[]>([])
const newCollectionName = ref('')
const showCollectionDialog = ref(false)
const historyPreviewItem = ref<GenerationHistoryItem | null>(null)
const historyPreviewImage = ref('')
const assetSelectionMode = ref(false)
const selectedAssetIds = ref<string[]>([])
const showBulkDeleteDialog = ref(false)
const bulkDeleteConfirmText = ref('')

// 组件挂载时从本地存储读取API密钥
onMounted(() => {
    loadGenerationHistory()

    const savedApiKey = LocalStorage.getApiKey()
    const savedEndpoint = LocalStorage.getApiEndpoint()
    const savedModelId = LocalStorage.getModelId()
    const savedPromptAssistantApiKey = LocalStorage.getPromptAssistantApiKey()
    const savedPromptAssistantEndpoint = LocalStorage.getPromptAssistantEndpoint()
    const savedPromptAssistantModel = LocalStorage.getPromptAssistantModelId()
    assetCollections.value = LocalStorage.getAssetCollections()
    customPromptPhraseGroups.value = LocalStorage.getCustomPromptPhraseGroups()
    promptPhraseOverrides.value = LocalStorage.getPromptPhraseOverrides()
    customStyleTemplates.value = LocalStorage.getCustomStyleTemplates()
    canvasItems.value = getCanvasWorkbenchItems()

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
        if (!isApplyingPromptHistory.value) {
            promptPhraseUndoStack.value = []
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

const getReferenceMetaByImage = (image: string): ReferenceImageMeta | undefined => {
    const index = selectedImages.value.findIndex(existing => existing === image)
    if (index < 0) return undefined
    return normalizeReferenceMeta(referenceImageMetadata.value[index], index)
}

const getReferenceLabelByImage = (image: string): string | undefined => {
    const index = selectedImages.value.findIndex(existing => existing === image)
    if (index < 0) return undefined
    return referenceImageLabels.value[index] || normalizeReferenceMeta(referenceImageMetadata.value[index], index).label
}

const buildGenerationRecipe = (compiledPrompt: string): GenerationRecipe => ({
    mainPrompt: textToImagePrompt.value.trim(),
    compiledPrompt,
    supplementPrompt: supplementPrompt.value,
    selectedStyle: selectedStyle.value,
    customPrompt: customPrompt.value,
    referenceImages: [...selectedImages.value],
    referenceImageLabels: selectedImages.value.map((_, index) => referenceImageLabels.value[index] || `角色${index + 1}`),
    referenceImageMetadata: selectedImages.value.map((_, index) => normalizeReferenceMeta(referenceImageMetadata.value[index], index)),
    count: generationCount.value
})

const buildGenerateRequest = (prompt: string, images: string[], count = generationCount.value): GenerateRequest => {
    const request: GenerateRequest = {
        prompt,
        images,
        apikey: apiKey.value,
        endpoint: apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT,
        model: selectedModel.value.trim() || DEFAULT_MODEL_ID,
        count
    }

    if (showAspectRatioSelector.value) {
        request.aspectRatio = selectedAspectRatio.value
    }

    if (showImageSizeConfig.value) {
        request.imageSize = gemini3ImageSize.value
    }

    if (supportsGoogleSearch.value) {
        request.enableGoogleSearch = gemini3EnableGoogleSearch.value
    }

    return request
}

const createGenerationTask = (source: GenerationTask['source'], prompt: string, recipe: GenerationRecipe): GenerationTask => {
    const createdAt = Date.now()
    const taskNumber = generationTasks.value.length + 1
    return {
        id: `${source}-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
        source,
        title: `${source === 'image' ? '参考图生成' : '无参考图生成'} #${taskNumber}`,
        prompt,
        status: 'running',
        createdAt,
        model: selectedModel.value.trim() || DEFAULT_MODEL_ID,
        aspectRatio: selectedAspectRatio.value,
        imageSize: gemini3ImageSize.value,
        count: recipe.count,
        images: [],
        recipe
    }
}

const updateGenerationTask = (taskId: string, patch: Partial<GenerationTask>) => {
    generationTasks.value = generationTasks.value.map(task => task.id === taskId ? { ...task, ...patch } : task)
}

const syncGenerationLoadingState = () => {
    isLoading.value = activeGenerationTasks.value.some(task => task.source === 'image')
    isTextToImageLoading.value = activeGenerationTasks.value.some(task => task.source === 'text')
}

const pushImageToUpload = (image: string | null) => {
    if (!image) return
    pushImagesToUpload([image])
}

const pushImagesToUpload = (images: string[]) => {
    const currentMetaByImage = new Map(selectedImages.value.map((image, index) => [image, normalizeReferenceMeta(referenceImageMetadata.value[index], index)]))
    const currentLabelByImage = new Map(selectedImages.value.map((image, index) => [image, referenceImageLabels.value[index] || currentMetaByImage.get(image)?.label || `角色${index + 1}`]))
    const nextImages = [...images.filter(Boolean), ...selectedImages.value]
        .filter((image, index, list) => list.indexOf(image) === index)

    selectedImages.value = nextImages
    referenceImageLabels.value = nextImages.map((image, index) => currentLabelByImage.get(image) || `角色${index + 1}`)
    referenceImageMetadata.value = nextImages.map((image, index) => currentMetaByImage.get(image) || normalizeReferenceRecipeMeta(undefined, index))
}

const updateCanvasItems = (items: CanvasWorkbenchItem[]) => {
    canvasItems.value = items
    saveCanvasWorkbenchItems(items)
}

const createCanvasItem = (
    image: string,
    source: CanvasWorkbenchItemSource,
    title: string,
    prompt?: string,
    offset = canvasItems.value.length
): CanvasWorkbenchItem => {
    const createdAt = Date.now()

    return {
        id: `canvas-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
        image,
        title,
        source,
        x: 40 + (offset % 5) * 34,
        y: 40 + (offset % 4) * 30,
        width: 260,
        height: 260,
        createdAt,
        prompt
    }
}

const addImagesToCanvas = (images: string[], source: CanvasWorkbenchItemSource, title: string, prompt?: string) => {
    const uniqueImages = images.filter(Boolean)
    if (!uniqueImages.length) return

    const existingImages = new Set(canvasItems.value.map(item => item.image))
    const additions = uniqueImages
        .filter(image => !existingImages.has(image))
        .map((image, index) => createCanvasItem(
            image,
            source,
            uniqueImages.length > 1 ? `${title} ${index + 1}` : title,
            prompt,
            canvasItems.value.length + index
        ))

    if (!additions.length) {
        workspaceMode.value = 'canvas'
        currentView.value = 'studio'
        return
    }

    updateCanvasItems([...additions, ...canvasItems.value])
    workspaceMode.value = 'canvas'
    currentView.value = 'studio'
}

const syncImagesToCanvas = (images: string[], source: CanvasWorkbenchItemSource, title: string, prompt?: string) => {
    const uniqueImages = images.filter(Boolean)
    if (!uniqueImages.length) return

    const existingImages = new Set(canvasItems.value.map(item => item.image))
    const additions = uniqueImages
        .filter(image => !existingImages.has(image))
        .map((image, index) => createCanvasItem(
            image,
            source,
            uniqueImages.length > 1 ? `${title} ${index + 1}` : title,
            prompt,
            canvasItems.value.length + index
        ))

    if (additions.length) {
        updateCanvasItems([...additions, ...canvasItems.value])
    }
}

const addDisplayResultsToCanvas = () => {
    const title = latestResultSource.value === 'text' ? '文生图结果' : '参考图结果'
    addImagesToCanvas(displayResults.value, 'result', title, latestGenerationRecipe.value?.mainPrompt || textToImagePrompt.value)
}

const addReferencesToCanvas = () => {
    const existingImages = new Set(canvasItems.value.map(item => item.image))
    const additions = selectedImages.value
        .filter(image => image && !existingImages.has(image))
        .map((image, index) => createCanvasItem(
            image,
            'reference',
            getReferenceLabelByImage(image) || getReferenceMetaByImage(image)?.label || `参考图 ${index + 1}`,
            textToImagePrompt.value,
            canvasItems.value.length + index
        ))

    if (additions.length) {
        updateCanvasItems([...additions, ...canvasItems.value])
    }
    workspaceMode.value = 'canvas'
    currentView.value = 'studio'
}

const addHistoryItemToCanvas = (item: GenerationHistoryItem, image?: string) => {
    const prompt = item.recipe?.mainPrompt || item.prompt
    addImagesToCanvas(image ? [image] : item.images, 'history', item.category || '历史资产', prompt)
    if (historyPreviewItem.value?.id === item.id) {
        historyPreviewItem.value = null
        historyPreviewImage.value = ''
    }
}

const removeCanvasItem = (id: string) => {
    updateCanvasItems(canvasItems.value.filter(item => item.id !== id))
}

const clearCanvasItems = () => {
    updateCanvasItems([])
}

const pushCanvasImagesToUpload = (images: string[]) => {
    pushImagesToUpload(images)
    workspaceMode.value = 'quick'
    currentView.value = 'studio'
}

const reuseCanvasPrompt = (prompt: string) => {
    textToImagePrompt.value = prompt
    selectedStyle.value = ''
    customPrompt.value = ''
    workspaceMode.value = 'quick'
    currentView.value = 'studio'
}

const reuseTaskPrompt = (task: GenerationTask) => {
    textToImagePrompt.value = task.recipe.mainPrompt || task.prompt
    customPrompt.value = task.recipe.customPrompt || ''
    selectedStyle.value = task.recipe.selectedStyle || ''
    generationCount.value = task.count || task.recipe.count || 1
    selectedAspectRatio.value = task.aspectRatio
    workspaceMode.value = 'quick'
    currentView.value = 'studio'
}

const pushTaskImages = (task: GenerationTask) => {
    pushImagesToUpload(task.images)
    workspaceMode.value = 'quick'
    currentView.value = 'studio'
}

const addTaskToCanvas = (task: GenerationTask) => {
    const title = task.source === 'text' ? '文生图任务' : '参考图任务'
    addImagesToCanvas(task.images, 'result', title, task.recipe.mainPrompt || task.prompt)
}

const activeGenerationTasks = computed(() => generationTasks.value.filter(task => task.status === 'running'))
const displayLoading = computed(() => activeGenerationTasks.value.length > 0)

const displayResults = computed(() => {
    if (latestResultSource.value === 'image') return result.value
    if (latestResultSource.value === 'text') return textToImageResult.value
    return result.value.length > 0 ? result.value : textToImageResult.value
})

const displayError = computed(() => {
    const latestErroredTask = generationTasks.value.find(task => task.status === 'error')
    if (latestErroredTask?.error && !displayResults.value.length) return latestErroredTask.error
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
        selectedImages.value.length === 0
)

const canGenerate = computed(
    () =>
        apiKey.value.trim() &&
        apiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        selectedImages.value.length > 0 &&
        (textToImagePrompt.value.trim() || selectedStyle.value || customPrompt.value.trim())
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

const referenceImageChecklist = computed(() =>
    selectedImages.value.map((_, index) => {
        const meta = normalizeReferenceMeta(referenceImageMetadata.value[index], index)
        return {
            index: index + 1,
            role: roleLabel(meta.role),
            label: meta.label,
            note: meta.note
        }
    })
)

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

const getPhraseId = (groupId: string, phrase: PromptPhrase) => phrase.id || `${groupId}:${phrase.label}:${phrase.value}`
const builtInPromptPhraseGroupIds = new Set(promptPhraseGroups.map(group => group.id))
const builtInPromptPhraseGroupOrder = new Map(promptPhraseGroups.map((group, index) => [group.id, index]))
const promptPhraseGroupSections: Record<string, string> = {
    'universal-subject': '通用基础',
    'camera-general': '通用基础',
    'art-style': '通用基础',
    shot: '通用基础',
    lighting: '通用基础',
    composition: '通用基础',
    mood: '通用基础',
    quality: '通用基础',
    'phone-camera': '自拍场景',
    'selfie-background': '自拍场景',
    makeup: '人像造型',
    'hair-styling': '人像造型',
    'beauty-body': '人像造型',
    ootd: '人像造型',
    'kpop-scene': '韩娱场景',
    'celebrity-material': '韩娱场景',
    commercial: '商业视觉',
    'ui-visual-style': '产品 UI',
    'product-ui-design': '产品 UI'
}
const commonPromptPhraseGroupOrder = [
    'universal-subject',
    'camera-general',
    'art-style',
    'shot',
    'lighting',
    'composition',
    'mood',
    'quality',
    'phone-camera',
    'selfie-background',
    'ui-visual-style',
    'product-ui-design'
]

const resolvePromptPhraseGroupSection = (groupId: string) => {
    if (!builtInPromptPhraseGroupIds.has(groupId)) return '自定义'
    return promptPhraseGroupSections[groupId] || '其他'
}

const sortPromptPhraseGroups = (groups: PromptPhraseGroup[]) => {
    return [...groups].sort((first, second) => {
        const firstCommonIndex = commonPromptPhraseGroupOrder.indexOf(first.id)
        const secondCommonIndex = commonPromptPhraseGroupOrder.indexOf(second.id)

        if (firstCommonIndex !== -1 || secondCommonIndex !== -1) {
            if (firstCommonIndex === -1) return 1
            if (secondCommonIndex === -1) return -1
            return firstCommonIndex - secondCommonIndex
        }

        const firstIsCustom = !builtInPromptPhraseGroupIds.has(first.id)
        const secondIsCustom = !builtInPromptPhraseGroupIds.has(second.id)
        if (firstIsCustom !== secondIsCustom) return firstIsCustom ? -1 : 1

    return (builtInPromptPhraseGroupOrder.get(first.id) ?? 999) - (builtInPromptPhraseGroupOrder.get(second.id) ?? 999)
    })
}

const getPromptPhraseGroupShell = (groupId: string): StoredPromptPhraseGroup => {
    const group = mergedPromptPhraseGroups.value.find(item => item.id === groupId)
    return {
        id: groupId,
        title: group?.title || '我的词组',
        description: group?.description || '我的自定义词组。',
        phrases: []
    }
}

const hasPromptPhraseGroupMetaOverride = (group: StoredPromptPhraseGroup) => {
    const builtInGroup = promptPhraseGroups.find(item => item.id === group.id)
    if (!builtInGroup) return true
    return group.title !== builtInGroup.title || group.description !== builtInGroup.description
}

const mergedPromptPhraseGroups = computed<PromptPhraseGroup[]>(() => {
    const overrides = new Map(promptPhraseOverrides.value.map(override => [override.id, override]))
    const groupMap = new Map<string, PromptPhraseGroup>()

    for (const group of promptPhraseGroups) {
        groupMap.set(group.id, {
            ...group,
            section: resolvePromptPhraseGroupSection(group.id),
            phrases: []
        })
    }

    for (const customGroup of customPromptPhraseGroups.value) {
        const existingGroup = groupMap.get(customGroup.id)
        if (existingGroup) {
            existingGroup.title = customGroup.title || existingGroup.title
            existingGroup.description = customGroup.description || existingGroup.description
        } else {
            groupMap.set(customGroup.id, {
                id: customGroup.id,
                title: customGroup.title,
                description: customGroup.description || '我的自定义词组。',
                section: resolvePromptPhraseGroupSection(customGroup.id),
                phrases: []
            })
        }
    }

    for (const group of promptPhraseGroups) {
        for (const phrase of group.phrases) {
            const id = getPhraseId(group.id, phrase)
            const override = overrides.get(id)
            const targetGroupId = override?.groupId || group.id
            if (!groupMap.has(targetGroupId)) {
                groupMap.set(targetGroupId, {
                    id: targetGroupId,
                    title: '我的词组',
                    description: '我的自定义词组。',
                    section: resolvePromptPhraseGroupSection(targetGroupId),
                    phrases: []
                })
            }

            groupMap.get(targetGroupId)?.phrases.push({
                ...phrase,
                id,
                label: override?.label || phrase.label,
                value: override?.value || phrase.value,
                source: 'builtin' as const,
                isCustomized: Boolean(override)
            })
        }
    }

    for (const customGroup of customPromptPhraseGroups.value) {
        const phrases = customGroup.phrases.map(phrase => ({
            ...phrase,
            source: 'custom' as const
        }))
        const existingGroup = groupMap.get(customGroup.id)
        if (existingGroup) {
            existingGroup.phrases = [...existingGroup.phrases, ...phrases]
        }
    }

    return sortPromptPhraseGroups(Array.from(groupMap.values()))
})

const allStyleTemplates = computed<StyleTemplate[]>(() => [
    ...styleTemplates.map(template => ({ ...template, source: 'builtin' as const })),
    ...customStyleTemplates.value.map(template => ({ ...template, source: 'custom' as const }))
])

const resolveTemplatePrompt = (template: StyleTemplate) => {
    if (templateLanguage.value === 'en') {
        return template.promptEn || template.prompt
    }

    if (templateLanguage.value === 'bilingual' && template.promptEn) {
        return `${template.prompt}\n\nEnglish version:\n${template.promptEn}`
    }

    return template.prompt
}

const selectedTemplatePrompt = computed(() => {
    if (!selectedStyle.value) return ''
    const template = allStyleTemplates.value.find(item => item.id === selectedStyle.value)
    return template ? resolveTemplatePrompt(template) : ''
})
const generationCountOptions = [1, 2, 3, 4]
const activeSupplementLabel = computed(() => {
    if (selectedStyle.value) {
        return allStyleTemplates.value.find(template => template.id === selectedStyle.value)?.title || '模板'
    }
    if (customPrompt.value.trim()) {
        return '自定义'
    }
    return ''
})
const supplementPrompt = computed(() => selectedTemplatePrompt.value || customPrompt.value.trim())
const availableStyleTemplates = computed(() => selectedImages.value.length ? allStyleTemplates.value : allStyleTemplates.value.filter(template => template.mode !== 'image'))
const canUndoPromptPhrase = computed(() => promptPhraseUndoStack.value.length > 0)

const setTextToImagePromptFromHistory = (nextPrompt: string) => {
    isApplyingPromptHistory.value = true
    textToImagePrompt.value = nextPrompt
    queueMicrotask(() => {
        isApplyingPromptHistory.value = false
    })
}

const insertTextPromptPhrase = (phrase: string) => {
    const current = textToImagePrompt.value
    promptPhraseUndoStack.value = [...promptPhraseUndoStack.value, current]
    const normalizedCurrent = current.trim()
    setTextToImagePromptFromHistory(normalizedCurrent ? `${normalizedCurrent}, ${phrase}` : phrase)
}

const undoLastPromptPhrase = () => {
    const previousPrompt = promptPhraseUndoStack.value[promptPhraseUndoStack.value.length - 1]
    if (previousPrompt === undefined) return

    promptPhraseUndoStack.value = promptPhraseUndoStack.value.slice(0, -1)
    setTextToImagePromptFromHistory(previousPrompt)
}

const clearPromptText = () => {
    if (!textToImagePrompt.value.trim()) return

    promptPhraseUndoStack.value = []
    setTextToImagePromptFromHistory('')
}

const insertTemplatePrompt = (templatePrompt: string) => {
    const nextPrompt = templatePrompt.trim()
    if (!nextPrompt) return

    const current = textToImagePrompt.value.trim()
    promptPhraseUndoStack.value = [...promptPhraseUndoStack.value, textToImagePrompt.value]
    setTextToImagePromptFromHistory(current ? `${current}\n\n${nextPrompt}` : nextPrompt)
    selectedStyle.value = ''
    showTemplatePanel.value = false
}

const handlePromptManualInput = () => {
    if (!isApplyingPromptHistory.value) {
        promptPhraseUndoStack.value = []
    }
}

const ensureCustomPromptPhraseGroup = (groupId: string) => {
    const existingGroup = customPromptPhraseGroups.value.find(group => group.id === groupId)
    if (existingGroup) return existingGroup

    const shell = getPromptPhraseGroupShell(groupId)
    customPromptPhraseGroups.value = [...customPromptPhraseGroups.value, shell]
    return shell
}

const upsertCustomPromptPhraseGroup = (nextGroup: StoredPromptPhraseGroup) => {
    const existingGroup = customPromptPhraseGroups.value.find(group => group.id === nextGroup.id)
    customPromptPhraseGroups.value = existingGroup
        ? customPromptPhraseGroups.value.map(group =>
            group.id === nextGroup.id
                ? { ...group, title: nextGroup.title, description: nextGroup.description, phrases: nextGroup.phrases }
                : group
        )
        : [...customPromptPhraseGroups.value, nextGroup]
}

const persistPromptPhraseGroups = () => {
    LocalStorage.saveCustomPromptPhraseGroups(customPromptPhraseGroups.value)
}

const closePhraseEditor = () => {
    showPhraseEditor.value = false
    editingPhraseGroupId.value = ''
    editingPhraseOriginalId.value = ''
    editingPhraseIsCustom.value = false
    phraseFormLabel.value = ''
    phraseFormValue.value = ''
}

const openPhraseEditor = (groupId: string, phrase?: PromptPhrase) => {
    const originalGroupId = groupId || mergedPromptPhraseGroups.value[0]?.id || ''
    editingPhraseOriginalId.value = phrase ? getPhraseId(originalGroupId, phrase) : ''
    editingPhraseGroupId.value = phrase && !phrase.source && editingPhraseOriginalId.value
        ? promptPhraseOverrides.value.find(override => override.id === editingPhraseOriginalId.value)?.groupId || originalGroupId
        : originalGroupId
    editingPhraseIsCustom.value = phrase?.source === 'custom'
    phraseFormLabel.value = phrase?.label || ''
    phraseFormValue.value = phrase?.value || ''
    showPhraseEditor.value = true
}

const savePhraseEdit = () => {
    const groupId = editingPhraseGroupId.value || mergedPromptPhraseGroups.value[0]?.id || 'custom'
    const label = phraseFormLabel.value.trim()
    const value = phraseFormValue.value.trim()
    if (!label || !value) return

    if (editingPhraseOriginalId.value && !editingPhraseIsCustom.value) {
        const nextOverride: StoredPromptPhraseOverride = {
            id: editingPhraseOriginalId.value,
            groupId,
            label,
            value
        }
        promptPhraseOverrides.value = [
            ...promptPhraseOverrides.value.filter(override => override.id !== nextOverride.id),
            nextOverride
        ]
        LocalStorage.savePromptPhraseOverrides(promptPhraseOverrides.value)
        closePhraseEditor()
        return
    }

    const phraseId = editingPhraseOriginalId.value || `custom-phrase-${Date.now()}`
    const nextPhrase: StoredPromptPhrase = { id: phraseId, label, value }
    ensureCustomPromptPhraseGroup(groupId)
    customPromptPhraseGroups.value = customPromptPhraseGroups.value.map(group => {
        const phrases = group.phrases.filter(phrase => phrase.id !== phraseId)
        return group.id === groupId
            ? { ...group, phrases: [...phrases, nextPhrase] }
            : { ...group, phrases }
    })

    persistPromptPhraseGroups()
    closePhraseEditor()
}

const deletePhraseEdit = () => {
    if (!editingPhraseOriginalId.value) return

    if (editingPhraseIsCustom.value) {
        customPromptPhraseGroups.value = customPromptPhraseGroups.value
            .map(group => ({
                ...group,
                phrases: group.phrases.filter(phrase => phrase.id !== editingPhraseOriginalId.value)
            }))
            .filter(group => group.phrases.length || hasPromptPhraseGroupMetaOverride(group))
        persistPromptPhraseGroups()
    } else {
        promptPhraseOverrides.value = promptPhraseOverrides.value.filter(override => override.id !== editingPhraseOriginalId.value)
        LocalStorage.savePromptPhraseOverrides(promptPhraseOverrides.value)
    }

    closePhraseEditor()
}

const closePhraseGroupEditor = () => {
    showPhraseGroupEditor.value = false
    editingPromptPhraseGroupId.value = ''
    phraseGroupFormTitle.value = ''
    phraseGroupFormDescription.value = ''
}

const openBlankPhraseGroupEditor = () => {
    editingPromptPhraseGroupId.value = ''
    phraseGroupFormTitle.value = ''
    phraseGroupFormDescription.value = ''
    showPhraseGroupEditor.value = true
}

const openPhraseGroupEditor = (group: PromptPhraseGroup) => {
    editingPromptPhraseGroupId.value = group.id
    phraseGroupFormTitle.value = group.title
    phraseGroupFormDescription.value = group.description
    showPhraseGroupEditor.value = true
}

const isEditingCustomOnlyPhraseGroup = computed(() =>
    Boolean(editingPromptPhraseGroupId.value) && !builtInPromptPhraseGroupIds.has(editingPromptPhraseGroupId.value)
)

const editingPromptPhraseGroupHasPhrases = computed(() =>
    Boolean(mergedPromptPhraseGroups.value.find(group => group.id === editingPromptPhraseGroupId.value)?.phrases.length)
)

const movablePromptPhraseGroups = computed(() =>
    mergedPromptPhraseGroups.value.filter(group => group.id !== editingPromptPhraseGroupId.value && group.phrases.length)
)

const savePhraseGroupEdit = () => {
    const title = phraseGroupFormTitle.value.trim()
    if (!title) return

    const groupId = editingPromptPhraseGroupId.value || `custom-group-${Date.now()}`
    const existingGroup = customPromptPhraseGroups.value.find(group => group.id === groupId)
    const sourceGroup = mergedPromptPhraseGroups.value.find(group => group.id === groupId)
    const nextGroup: StoredPromptPhraseGroup = {
        id: groupId,
        title,
        description: phraseGroupFormDescription.value.trim() || sourceGroup?.description || '我的自定义词组。',
        phrases: existingGroup?.phrases || []
    }

    upsertCustomPromptPhraseGroup(nextGroup)
    persistPromptPhraseGroups()
    closePhraseGroupEditor()
}

const moveAllPhrasesToEditingGroup = (sourceGroupId: string) => {
    const targetGroupId = editingPromptPhraseGroupId.value
    if (!sourceGroupId || !targetGroupId || sourceGroupId === targetGroupId) return

    const sourceGroup = mergedPromptPhraseGroups.value.find(group => group.id === sourceGroupId)
    if (!sourceGroup) return

    ensureCustomPromptPhraseGroup(targetGroupId)

    const movedCustomPhrases: StoredPromptPhrase[] = []
    const movedBuiltinOverrides: StoredPromptPhraseOverride[] = []

    for (const phrase of sourceGroup.phrases) {
        const phraseId = getPhraseId(sourceGroupId, phrase)
        if (phrase.source === 'custom') {
            movedCustomPhrases.push({
                id: phraseId,
                label: phrase.label,
                value: phrase.value
            })
        } else {
            movedBuiltinOverrides.push({
                id: phraseId,
                groupId: targetGroupId,
                label: phrase.label,
                value: phrase.value
            })
        }
    }

    if (movedCustomPhrases.length) {
        const movedCustomIds = new Set(movedCustomPhrases.map(phrase => phrase.id))
        customPromptPhraseGroups.value = customPromptPhraseGroups.value.map(group => {
            const remainingPhrases = group.phrases.filter(phrase => !movedCustomIds.has(phrase.id))
            return group.id === targetGroupId
                ? { ...group, phrases: [...remainingPhrases, ...movedCustomPhrases] }
                : { ...group, phrases: remainingPhrases }
        })
        persistPromptPhraseGroups()
    }

    if (movedBuiltinOverrides.length) {
        const movedBuiltinIds = new Set(movedBuiltinOverrides.map(override => override.id))
        promptPhraseOverrides.value = [
            ...promptPhraseOverrides.value.filter(override => !movedBuiltinIds.has(override.id)),
            ...movedBuiltinOverrides
        ]
        LocalStorage.savePromptPhraseOverrides(promptPhraseOverrides.value)
    }
}

const deletePhraseGroupEdit = () => {
    const groupId = editingPromptPhraseGroupId.value
    if (!groupId || builtInPromptPhraseGroupIds.has(groupId) || editingPromptPhraseGroupHasPhrases.value) return

    customPromptPhraseGroups.value = customPromptPhraseGroups.value.filter(group => group.id !== groupId)
    persistPromptPhraseGroups()
    closePhraseGroupEditor()
}

const closeTemplateEditor = () => {
    showTemplateEditor.value = false
    editingTemplateId.value = ''
    templateFormTitle.value = ''
    templateFormCategory.value = '我的模板'
    templateFormTags.value = ''
    templateFormDescription.value = ''
    templateFormPrompt.value = ''
    templateFormPromptEn.value = ''
    templateFormSourceLanguage.value = 'zh'
    templateTranslationTarget.value = null
    templateAssistantError.value = null
    templateFormMode.value = 'both'
}

const openTemplateEditor = (template: StyleTemplate) => {
    if (template.source !== 'custom') return
    editingTemplateId.value = template.id
    templateFormTitle.value = template.title
    templateFormCategory.value = template.category || '我的模板'
    templateFormTags.value = (template.tags || []).join(', ')
    templateFormDescription.value = template.description
    templateFormPrompt.value = template.prompt
    templateFormPromptEn.value = template.promptEn || ''
    templateFormSourceLanguage.value = template.promptEn ? 'bilingual' : 'zh'
    templateAssistantError.value = null
    templateFormMode.value = template.mode || 'both'
    showTemplateEditor.value = true
}

const openBlankTemplateEditor = () => {
    closeTemplateEditor()
    showTemplateEditor.value = true
}

const openTemplateEditorFromCurrentPrompt = () => {
    const prompt = [textToImagePrompt.value.trim(), supplementPrompt.value].filter(Boolean).join('\n\n')
    if (!prompt) return

    closeTemplateEditor()
    templateFormTitle.value = textToImagePrompt.value.trim().slice(0, 16) || activeSupplementLabel.value || '我的模板'
    templateFormCategory.value = '我的模板'
    templateFormTags.value = activeSupplementLabel.value ? activeSupplementLabel.value : ''
    templateFormDescription.value = '从当前提示词保存。'
    templateFormPrompt.value = prompt
    templateFormPromptEn.value = ''
    templateFormSourceLanguage.value = detectTemplateSourceLanguage(prompt)
    templateAssistantError.value = null
    templateFormMode.value = selectedImages.value.length ? 'image' : 'both'
    showTemplateEditor.value = true
}

const templateFormLanguageOptions = [
    { value: 'zh' as const, label: '中文' },
    { value: 'en' as const, label: '英文' },
    { value: 'bilingual' as const, label: '双语' }
]

const detectTemplateSourceLanguage = (value: string): 'zh' | 'en' | 'bilingual' => {
    const hasChinese = /[\u4e00-\u9fff]/.test(value)
    const hasEnglish = /[a-zA-Z]/.test(value)
    if (hasChinese && hasEnglish) return 'bilingual'
    if (hasEnglish) return 'en'
    return 'zh'
}

const promptAssistantConfigured = computed(() =>
    Boolean(promptAssistantApiKey.value.trim()) &&
    Boolean(promptAssistantEndpoint.value.trim()) &&
    Boolean(promptAssistantModel.value.trim())
)

const canTranslateTemplateToEnglish = computed(() =>
    promptAssistantConfigured.value &&
    Boolean(templateFormPrompt.value.trim()) &&
    templateTranslationTarget.value !== 'en'
)

const canTranslateTemplateToChinese = computed(() =>
    promptAssistantConfigured.value &&
    Boolean((templateFormPromptEn.value || templateFormPrompt.value).trim()) &&
    templateTranslationTarget.value !== 'zh'
)

const translateTemplatePrompt = async (targetLanguage: 'zh' | 'en') => {
    if (templateTranslationTarget.value) return
    if (!promptAssistantConfigured.value) {
        templateAssistantError.value = '请先配置提示词助手 API。'
        return
    }

    const sourcePrompt = targetLanguage === 'en'
        ? templateFormPrompt.value.trim()
        : (templateFormPromptEn.value.trim() || templateFormPrompt.value.trim())

    if (!sourcePrompt) return

    templateTranslationTarget.value = targetLanguage
    templateAssistantError.value = null

    try {
        const response = await improvePrompt({
            prompt: sourcePrompt,
            context: [
                `模板名称：${templateFormTitle.value.trim() || '未命名模板'}`,
                `模板分类：${templateFormCategory.value.trim() || '我的模板'}`,
                `模板模式：${templateFormMode.value || 'both'}`,
                `语言来源：${templateFormSourceLanguage.value}`
            ].join('\n'),
            apikey: promptAssistantApiKey.value.trim(),
            endpoint: resolveChatCompletionsEndpoint(promptAssistantEndpoint.value, DEFAULT_PROMPT_ASSISTANT_ENDPOINT),
            model: promptAssistantModel.value.trim() || DEFAULT_PROMPT_ASSISTANT_MODEL_ID,
            task: 'translate-template',
            targetLanguage
        })

        if (targetLanguage === 'en') {
            templateFormPromptEn.value = response.prompt
            templateFormSourceLanguage.value = 'bilingual'
        } else {
            templateFormPrompt.value = response.prompt
            templateFormSourceLanguage.value = 'bilingual'
        }
    } catch (error) {
        templateAssistantError.value = error instanceof Error ? error.message : '模板语言补全失败'
    } finally {
        templateTranslationTarget.value = null
    }
}

const saveCustomTemplate = () => {
    const title = templateFormTitle.value.trim()
    const prompt = templateFormPrompt.value.trim()
    if (!title || !prompt) return

    const template: StyleTemplate = {
        id: editingTemplateId.value || `custom-template-${Date.now()}`,
        title,
        prompt,
        promptEn: templateFormPromptEn.value.trim() || undefined,
        image: '',
        description: templateFormDescription.value.trim() || '我的自定义模板。',
        category: templateFormCategory.value.trim() || '我的模板',
        mode: templateFormMode.value || 'both',
        tags: templateFormTags.value
            .split(/[,，]/)
            .map(tag => tag.trim())
            .filter(Boolean),
        source: 'custom'
    }

    customStyleTemplates.value = [
        ...customStyleTemplates.value.filter(item => item.id !== template.id),
        template
    ]
    LocalStorage.saveCustomStyleTemplates(customStyleTemplates.value)
    selectedStyle.value = template.id
    customPrompt.value = ''
    showTemplatePanel.value = true
    closeTemplateEditor()
}

const deleteCustomTemplate = (templateId: string) => {
    customStyleTemplates.value = customStyleTemplates.value.filter(template => template.id !== templateId)
    LocalStorage.saveCustomStyleTemplates(customStyleTemplates.value)
    if (selectedStyle.value === templateId) {
        selectedStyle.value = ''
    }
    closeTemplateEditor()
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

const handleImprovePrompt = async () => {
    if (!canImprovePrompt.value) return

    isPromptAssistantLoading.value = true
    promptAssistantError.value = null

    try {
        const request: PromptAssistantRequest = {
            prompt: textToImagePrompt.value.trim(),
            context: buildPromptAssistantContext(),
            apikey: promptAssistantApiKey.value.trim(),
            endpoint: resolveChatCompletionsEndpoint(promptAssistantEndpoint.value, DEFAULT_PROMPT_ASSISTANT_ENDPOINT),
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

const baseAspectRatioOptions = [
    { value: '1:1', label: '1:1 - 1024x1024' },
    { value: '2:3', label: '2:3 - 832x1248' },
    { value: '3:2', label: '3:2 - 1248x832' },
    { value: '3:4', label: '3:4 - 864x1184' },
    { value: '4:3', label: '4:3 - 1184x864' },
    { value: '4:5', label: '4:5 - 896x1152' },
    { value: '5:4', label: '5:4 - 1152x896' },
    { value: '9:16', label: '9:16 - 768x1344' },
    { value: '16:9', label: '16:9 - 1344x768' },
    { value: '21:9', label: '21:9 - 1536x672' }
]

const gemini3AspectRatioData: Record<string, Record<string, string>> = {
    '1K': {
        '1:1': '1024x1024',
        '2:3': '848x1264',
        '3:2': '1264x848',
        '3:4': '896x1200',
        '4:3': '1200x896',
        '4:5': '928x1152',
        '5:4': '1152x928',
        '9:16': '768x1376',
        '16:9': '1376x768',
        '21:9': '1584x672'
    },
    '2K': {
        '1:1': '2048x2048',
        '2:3': '1696x2528',
        '3:2': '2528x1696',
        '3:4': '1792x2400',
        '4:3': '2400x1792',
        '4:5': '1856x2304',
        '5:4': '2304x1856',
        '9:16': '1536x2752',
        '16:9': '2752x1536',
        '21:9': '3168x1344'
    },
    '4K': {
        '1:1': '4096x4096',
        '2:3': '3392x5056',
        '3:2': '5056x3392',
        '3:4': '3584x4800',
        '4:3': '4800x3584',
        '4:5': '3712x4608',
        '5:4': '4608x3712',
        '9:16': '3072x5504',
        '16:9': '5504x3072',
        '21:9': '6336x2688'
    }
}

const availableAspectRatios = computed(() => {
    if (selectedImageModelType.value !== 'gemini-3-pro-image') {
        return baseAspectRatioOptions
    }

    const sizeData = gemini3AspectRatioData[gemini3ImageSize.value]
    if (!sizeData) return baseAspectRatioOptions

    return Object.entries(sizeData).map(([ratio, resolution]) => ({
        value: ratio,
        label: `${ratio} - ${resolution}`
    }))
})

const showImageSizeConfig = computed(() => {
    return selectedImageModelType.value === 'nano-banana' ||
           selectedImageModelType.value === 'gemini-3-pro-image'
})

const supportsGoogleSearch = computed(() => {
    const modelId = selectedModel.value.toLowerCase().trim()
    return modelId.includes('gemini-3-pro-image')
})

const hydrateHistoryImages = async (items: GenerationHistoryItem[]) => {
    return Promise.all(items.map(async item => ({
        ...item,
        images: await resolveHistoryItemImages(item)
    })))
}

const loadGenerationHistory = async () => {
    historyLoading.value = true
    try {
        generationHistory.value = await hydrateHistoryImages(await getGenerationHistoryItems())
    } catch (historyError) {
        console.warn('无法读取生成历史:', historyError)
    } finally {
        historyLoading.value = false
    }
}

const addGenerationHistory = async (
    source: GenerationHistorySource,
    prompt: string,
    images: string[],
    recipe: GenerationRecipe,
    persistence?: Awaited<ReturnType<typeof persistGeneratedImages>>
) => {
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
        count: recipe.count,
        createdAt,
        images,
        imageIds: persistence?.imageIds,
        rawImageUrls: persistence?.rawImageUrls,
        imagePersistenceWarnings: persistence?.warnings,
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

const collectionOptions = computed(() =>
    Array.from(new Set([...assetCollections.value, ...historyCategories.value])).filter(Boolean)
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

const filteredHistoryAssets = computed(() =>
    filteredGenerationHistory.value.flatMap(item =>
        item.images.map((image, index) => ({
            id: `${item.id}-${index}`,
            item,
            image,
            index
        }))
    )
)

const selectedHistoryAssets = computed(() =>
    filteredHistoryAssets.value.filter(asset => selectedAssetIds.value.includes(asset.id))
)

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
    updateHistoryItem({ ...item, category: category || undefined })
}

const createCollection = () => {
    const category = newCollectionName.value.trim()
    if (!category) return

    if (!assetCollections.value.includes(category)) {
        assetCollections.value = [...assetCollections.value, category]
        LocalStorage.saveAssetCollections(assetCollections.value)
    }
    historyFilter.value = `category:${category}`
    newCollectionName.value = ''
    showCollectionDialog.value = false
}

const reuseHistoryPrompt = (item: GenerationHistoryItem) => {
    textToImagePrompt.value = item.recipe?.mainPrompt || item.prompt
    customPrompt.value = item.recipe?.customPrompt || ''
    selectedStyle.value = item.recipe?.selectedStyle || ''
    currentView.value = 'studio'
    workspaceMode.value = 'quick'
}

const applyGenerationRecipe = (recipe: GenerationRecipe | undefined, fallbackPrompt = '') => {
    textToImagePrompt.value = recipe?.mainPrompt || fallbackPrompt
    customPrompt.value = recipe?.customPrompt || ''
    selectedStyle.value = recipe?.selectedStyle || ''
    generationCount.value = recipe?.count || 1

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
    generationCount.value = item.count || item.recipe?.count || 1
    currentView.value = 'studio'
    workspaceMode.value = 'quick'
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
    generationCount.value = item.count || item.recipe?.count || 1
    currentView.value = 'studio'
    workspaceMode.value = 'quick'
}

const openHistoryPreview = (item: GenerationHistoryItem, image = item.images[0] || '') => {
    historyPreviewItem.value = item
    historyPreviewImage.value = image
}

const deleteHistoryItem = async (item: GenerationHistoryItem) => {
    generationHistory.value = generationHistory.value.filter(historyItem => historyItem.id !== item.id)
    if (historyPreviewItem.value?.id === item.id) {
        historyPreviewItem.value = null
        historyPreviewImage.value = ''
    }

    try {
        await deleteGenerationHistoryItem(item.id)
        await Promise.allSettled((item.imageIds || []).map(imageId => deleteStoredImage(imageId)))
    } catch (historyError) {
        console.warn('无法删除生成历史:', historyError)
    }
}

const deleteHistoryImageAt = async (item: GenerationHistoryItem, imageIndex: number) => {
    if (imageIndex < 0) return

    const nextImages = item.images.filter((_, index) => index !== imageIndex)
    const nextImageIds = item.imageIds?.filter((_, index) => index !== imageIndex)
    const nextRawImageUrls = item.rawImageUrls?.filter((_, index) => index !== imageIndex)
    const deletedImageId = imageIndex >= 0 ? item.imageIds?.[imageIndex] : undefined

    if (!nextImages.length) {
        await deleteHistoryItem(item)
        return
    }

    const nextItem = { ...item, images: nextImages, imageIds: nextImageIds, rawImageUrls: nextRawImageUrls }
    await updateHistoryItem(nextItem)
    if (deletedImageId) {
        await deleteStoredImage(deletedImageId)
    }

    if (historyPreviewItem.value?.id === item.id) {
        historyPreviewItem.value = nextItem
        historyPreviewImage.value = nextImages.includes(historyPreviewImage.value)
            ? historyPreviewImage.value
            : nextImages[0]
    }
}

const openOriginalImage = (image: string) => {
    if (!image || typeof window === 'undefined') return
    window.open(image, '_blank', 'noopener')
}

const toggleAssetSelectionMode = () => {
    assetSelectionMode.value = !assetSelectionMode.value
    selectedAssetIds.value = []
}

const toggleAssetSelection = (assetId: string) => {
    selectedAssetIds.value = selectedAssetIds.value.includes(assetId)
        ? selectedAssetIds.value.filter(id => id !== assetId)
        : [...selectedAssetIds.value, assetId]
}

const confirmBulkDeleteAssets = async () => {
    if (bulkDeleteConfirmText.value.trim() !== '删除') return

    const assetsByItem = new Map<string, { item: GenerationHistoryItem; indexes: number[] }>()
    for (const asset of selectedHistoryAssets.value) {
        const existing = assetsByItem.get(asset.item.id)
        if (existing) {
            existing.indexes.push(asset.index)
        } else {
            assetsByItem.set(asset.item.id, { item: asset.item, indexes: [asset.index] })
        }
    }

    for (const { item, indexes } of assetsByItem.values()) {
        let currentItem = generationHistory.value.find(historyItem => historyItem.id === item.id) || item
        for (const index of [...indexes].sort((a, b) => b - a)) {
            await deleteHistoryImageAt(currentItem, index)
            const nextItem = generationHistory.value.find(historyItem => historyItem.id === currentItem.id)
            if (!nextItem) break
            currentItem = nextItem
        }
    }

    selectedAssetIds.value = []
    assetSelectionMode.value = false
    showBulkDeleteDialog.value = false
    bulkDeleteConfirmText.value = ''
}

const pushHistoryImages = (item: GenerationHistoryItem) => {
    for (const image of [...item.images].reverse()) {
        pushImageToUpload(image)
    }
}

const handleTextToImageGenerate = async () => {
    if (!canGenerateTextImage.value) return

    const prompt = composeTextPrompt()
    const recipe = buildGenerationRecipe(prompt)
    const task = createGenerationTask('text', prompt, recipe)
    generationTasks.value = [task, ...generationTasks.value]
    latestResultSource.value = 'text'
    textToImageError.value = null
    isTextToImageLoading.value = true

    try {
        const request = buildGenerateRequest(prompt, [], generationCount.value)
        const response = await generateImage(request)
        const persisted = await persistGeneratedImages(response.imageUrls)
        textToImageResult.value = persisted.images
        if (persisted.warnings.length) {
            textToImageError.value = `生成成功，但有 ${persisted.warnings.length} 张图片未能保存为本地副本，远端链接可能会过期。`
        }
        latestResultSource.value = 'text'
        latestGenerationRecipe.value = recipe
        updateGenerationTask(task.id, { status: 'done', images: persisted.images })
        syncImagesToCanvas(persisted.images, 'result', '文生图结果', recipe.mainPrompt || prompt)
        await addGenerationHistory('text', prompt, persisted.images, recipe, persisted)
    } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败'
        textToImageError.value = message
        updateGenerationTask(task.id, { status: 'error', error: message })
    } finally {
        syncGenerationLoadingState()
    }
}

const handlePushDisplayResult = (image: string) => {
    pushImageToUpload(image)
}

const handleReuseCurrentRecipe = () => {
    applyGenerationRecipe(latestGenerationRecipe.value || undefined, textToImagePrompt.value)
    currentView.value = 'studio'
    workspaceMode.value = 'quick'
}

const restoreTaskResult = (task: GenerationTask) => {
    if (!task.images.length) return
    latestResultSource.value = task.source
    latestGenerationRecipe.value = task.recipe

    if (task.source === 'text') {
        textToImageResult.value = task.images
        textToImagePrompt.value = task.recipe.mainPrompt || task.prompt
        textToImageError.value = null
    } else {
        result.value = task.images
        textToImagePrompt.value = task.recipe.mainPrompt || task.prompt
        customPrompt.value = task.recipe.customPrompt || ''
        selectedStyle.value = task.recipe.selectedStyle || ''
        error.value = null
    }
    workspaceMode.value = 'quick'
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

    const prompt = composeImagePrompt()
    const recipe = buildGenerationRecipe(prompt)
    const task = createGenerationTask('image', prompt, recipe)
    generationTasks.value = [task, ...generationTasks.value]
    latestResultSource.value = 'image'
    error.value = null
    isLoading.value = true

    try {
        const request = buildGenerateRequest(prompt, [...selectedImages.value], generationCount.value)
        const response = await generateImage(request)
        const persisted = await persistGeneratedImages(response.imageUrls)
        result.value = persisted.images
        if (persisted.warnings.length) {
            error.value = `生成成功，但有 ${persisted.warnings.length} 张图片未能保存为本地副本，远端链接可能会过期。`
        }
        latestResultSource.value = 'image'
        latestGenerationRecipe.value = recipe
        updateGenerationTask(task.id, { status: 'done', images: persisted.images })
        syncImagesToCanvas(persisted.images, 'result', '参考图结果', recipe.mainPrompt || prompt)
        await addGenerationHistory('image', prompt, persisted.images, recipe, persisted)
    } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败'
        error.value = message
        updateGenerationTask(task.id, { status: 'error', error: message })
    } finally {
        syncGenerationLoadingState()
    }
}

</script>
