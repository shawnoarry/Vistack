<template>
    <div :class="['min-h-screen transition-colors', themeMode === 'dark' ? 'dark bg-[#242424] text-brand-surface' : 'bg-brand-surface text-brand-ink']">
        <header :class="[
            'sticky top-0 z-40 border-b shadow-sm backdrop-blur transition-colors',
            themeMode === 'dark' ? 'border-night-muted/35 bg-[#232326]/95 shadow-black/25' : 'border-brand-line bg-white/95 shadow-black/10'
        ]">
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
                    <button
                        type="button"
                        class="wb-icon-button h-11 w-11"
                        :aria-label="themeMode === 'dark' ? '切换浅色模式' : '切换深色模式'"
                        :title="themeMode === 'dark' ? '切换浅色模式' : '切换深色模式'"
                        @click="toggleThemeMode"
                    >
                        <svg v-if="themeMode === 'dark'" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v2.5M12 18.5V21M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M3 12h2.5M18.5 12H21M4.5 19.5l1.8-1.8M17.7 6.3l1.8-1.8" />
                            <circle cx="12" cy="12" r="4" stroke-width="1.8" />
                        </svg>
                        <svg v-else class="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.2 14.6A7.8 7.8 0 019.4 3.8 8.5 8.5 0 1019.9 14c.3.1.4.4.3.6z" />
                        </svg>
                    </button>
                    <div class="grid grid-cols-3 rounded-lg border border-brand-line bg-white p-1 text-sm font-semibold dark:border-night-muted/40 dark:bg-night-panel">
                        <button
                            type="button"
                            @click="currentView = 'studio'"
                            :class="[
                                'rounded-md px-3 py-2 transition',
                                currentView === 'studio'
                                    ? (themeMode === 'dark' ? 'bg-night-accent text-white' : 'bg-brand-ink text-brand-surface')
                                    : (themeMode === 'dark' ? 'text-night-muted hover:text-brand-surface' : 'text-brand-muted hover:text-brand-ink')
                            ]"
                        >
                            创作台
                        </button>
                        <button
                            type="button"
                            @click="currentView = 'assets'"
                            :class="[
                                'rounded-md px-3 py-2 transition',
                                currentView === 'assets'
                                    ? (themeMode === 'dark' ? 'bg-night-accent text-white' : 'bg-brand-ink text-brand-surface')
                                    : (themeMode === 'dark' ? 'text-night-muted hover:text-brand-surface' : 'text-brand-muted hover:text-brand-ink')
                            ]"
                        >
                            资产库
                        </button>
                        <button
                            type="button"
                            @click="currentView = 'toolbox'"
                            :class="[
                                'rounded-md px-3 py-2 transition',
                                currentView === 'toolbox'
                                    ? (themeMode === 'dark' ? 'bg-night-accent text-white' : 'bg-brand-ink text-brand-surface')
                                    : (themeMode === 'dark' ? 'text-night-muted hover:text-brand-surface' : 'text-brand-muted hover:text-brand-ink')
                            ]"
                        >
                            工具箱
                        </button>
                    </div>
                    <div class="max-w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink shadow-sm sm:max-w-[440px] dark:border-night-muted/40 dark:bg-night-panel dark:text-brand-surface">
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

        <section v-if="showApiSettings" class="border-b border-brand-line bg-white dark:border-night-muted/35 dark:bg-[#232326]">
            <div class="wb-shell py-4">
                <ApiKeyInput
                    v-model="apiKey"
                    v-model:endpoint="apiEndpoint"
                    v-model:model="selectedModel"
                    v-model:use-proxy="apiUseProxy"
                    v-model:proxy-token="apiProxyToken"
                    v-model:prompt-assistant-api-key="promptAssistantApiKey"
                    v-model:prompt-assistant-endpoint="promptAssistantEndpoint"
                    v-model:prompt-assistant-model="promptAssistantModel"
                    v-model:prompt-assistant-use-proxy="promptAssistantUseProxy"
                    v-model:prompt-assistant-proxy-token="promptAssistantProxyToken"
                    :api-presets="apiConnectionPresets"
                    :selected-preset-id="selectedApiConnectionPresetId"
                    :models="modelOptions"
                    :model-loading="isFetchingModels"
                    :model-error="modelsError"
                    @save-preset="handleSaveApiPreset"
                    @update-preset="handleUpdateApiPreset"
                    @delete-preset="handleDeleteApiPreset"
                    @select-preset="handleSelectApiPreset"
                    @fetch-models="handleFetchModels"
                    @model-picked="handleModelPicked"
                />
            </div>
        </section>

        <main v-if="currentView === 'studio'" class="wb-shell grid items-start gap-4 py-4 lg:pb-[300px] xl:grid-cols-[minmax(320px,0.72fr)_minmax(520px,1.7fr)_minmax(300px,0.62fr)] 2xl:grid-cols-[minmax(340px,0.66fr)_minmax(720px,1.9fr)_minmax(320px,0.58fr)]">
            <aside class="space-y-4">
                <section class="wb-panel">
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
                        :can-reuse="Boolean(displayResults.length || selectedFailedTask)"
                        :selected-index="selectedGenerationImageIndex"
                        :selected-task-id="selectedFailedTaskId"
                        :result-title="selectedResultTitle"
                        :result-prompt="selectedResultPrompt"
                        :result-revised-prompt="selectedResultRevisedPrompt"
                        :result-meta="selectedResultMeta"
                        :result-created-at="selectedResultCreatedAt"
                        @restore-task="restoreTaskResult"
                        @download="handleDownloadResult"
                        @push="handlePushDisplayResult"
                        @reuse="handleReuseCurrentRecipe"
                        @select-image="selectDisplayImage"
                        @select-task="selectFailedTask"
                        @dismiss-task="dismissGenerationTask"
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
                        <div>
                            <dt class="wb-label" data-testid="generation-diagnostic-title">{{ selectedDiagnosticTitle }}</dt>
                            <dd class="mt-1 space-y-1 text-xs leading-5 text-brand-muted">
                                <p>路由：{{ selectedDiagnosticProviderLabel }}<span v-if="!selectedDiagnosticRecord"> · {{ apiUseProxy ? '代理' : '直连' }}</span></p>
                                <p>参考图：{{ selectedDiagnosticReferenceSummary }}</p>
                                <p>请求：{{ selectedDiagnosticRequestSummary }}</p>
                                <p class="break-all">端点：{{ selectedDiagnosticEndpoint }}</p>
                                <button type="button" class="wb-secondary mt-2 min-h-10 px-3 text-xs" @click="copySelectedGenerationDiagnostic">
                                    {{ diagnosticCopyStatus || '复制诊断信息' }}
                                </button>
                            </dd>
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
                    <div class="max-h-[240px] overflow-y-auto rounded-lg border border-brand-line bg-white p-3 text-xs leading-5 text-brand-muted dark:border-night-muted/35 dark:bg-[#232326] dark:text-night-muted">
                        <pre class="whitespace-pre-wrap font-sans">{{ promptPreview || '填写主提示词后会显示预览。' }}</pre>
                    </div>
                </section>

                <section class="wb-panel" data-testid="generation-history">
                    <div class="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <h2 class="text-sm font-semibold text-brand-ink">生成历史</h2>
                            <p class="mt-1 text-xs text-brand-muted">选择记录只切换查看内容；复用时才回填创作台。</p>
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

                    <div v-if="recentGenerationHistory.length" class="space-y-2">
                        <button
                            v-for="item in recentGenerationHistory"
                            :key="item.id"
                            type="button"
                            :aria-current="selectedGenerationHistoryId === item.id ? 'true' : undefined"
                            :class="[
                                'grid min-h-20 w-full grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
                                selectedGenerationHistoryId === item.id
                                    ? 'border-brand-accent bg-brand-accent/5 ring-2 ring-brand-accent/10'
                                    : 'border-brand-line bg-white hover:border-brand-accent/35 dark:border-night-muted/35 dark:bg-night-panel'
                            ]"
                            @click="selectHistoryItem(item)"
                        >
                            <span class="relative h-16 w-16 overflow-hidden rounded-md border border-brand-line bg-brand-surface dark:border-night-muted/35">
                                <img v-if="item.images[0]" :src="item.images[0]" :alt="`${item.source === 'image' ? '图生图' : '文生图'}历史缩略图`" class="h-full w-full object-cover" loading="lazy" />
                                <span v-if="item.images.length > 1" class="absolute bottom-0 right-0 bg-brand-ink/80 px-1.5 py-0.5 text-[10px] text-brand-surface">{{ item.images.length }}</span>
                            </span>
                            <span class="min-w-0 py-0.5">
                                <span class="flex items-center justify-between gap-2">
                                    <span class="truncate text-xs font-semibold text-brand-ink">{{ item.source === 'image' ? '图生图' : '文生图' }}</span>
                                    <span class="shrink-0 text-[11px] text-brand-muted">{{ formatHistoryListTime(item.createdAt) }}</span>
                                </span>
                                <span class="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-brand-muted">{{ item.recipe?.mainPrompt || item.prompt }}</span>
                                <span class="mt-1 flex flex-wrap gap-1.5 text-[11px] text-brand-muted">
                                    <span>{{ item.model }}</span>
                                    <span>· {{ item.aspectRatio }}</span>
                                    <span v-if="item.favorite">· 已收藏</span>
                                    <span v-if="item.category">· {{ item.category }}</span>
                                </span>
                            </span>
                        </button>

                        <p class="pt-1 text-[11px] text-brand-muted">共 {{ generationHistory.length }} 组 · 收藏 {{ favoriteHistory.length }} 组</p>
                    </div>

                    <p v-else-if="historyLoading" class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm text-brand-muted">正在读取本地历史...</p>
                    <p v-else class="rounded-lg border border-dashed border-brand-line bg-white p-4 text-sm text-brand-muted">成功生成后，历史会保存在这里。</p>
                </section>
            </aside>
        </main>

        <section
            v-if="currentView === 'studio'"
            :class="[
                'border-t shadow-[0_-18px_45px_rgba(25,25,25,0.10)] backdrop-blur lg:fixed lg:inset-x-0 lg:bottom-0 lg:z-30',
                themeMode === 'dark' ? 'border-night-muted/35 bg-[#232326]/95 shadow-black/30' : 'border-brand-line bg-white/95'
            ]"
        >
            <div class="wb-shell relative py-2">
                <div v-if="showPromptTools" class="absolute bottom-[calc(100%+10px)] left-1/2 z-40 w-[min(1040px,calc(100vw-32px))] -translate-x-1/2 rounded-lg border border-brand-line bg-white p-3 shadow-2xl shadow-black/20 dark:border-night-muted/35 dark:bg-night-surface dark:text-brand-surface">
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

                <Teleport to="body" :disabled="isDesktopLayout">
                    <div
                        v-if="showPortraitAssistPanel"
                        ref="portraitAssistOverlayRef"
                        class="fixed inset-0 z-50 flex items-end bg-brand-ink/55 lg:absolute lg:inset-auto lg:bottom-[calc(100%+10px)] lg:right-4 lg:z-40 lg:block lg:w-[440px] lg:bg-transparent 2xl:right-6"
                        @click.self="closePortraitAssistPanel()"
                    >
                        <section
                            id="portrait-assist-panel"
                            ref="portraitAssistPanelRef"
                            role="dialog"
                            aria-labelledby="portrait-assist-title"
                            class="max-h-[85vh] w-full overflow-y-auto rounded-t-lg border border-brand-line bg-white p-4 shadow-2xl shadow-black/25 dark:border-night-muted/35 dark:bg-night-surface dark:text-brand-surface lg:max-h-[calc(100vh-280px)] lg:rounded-lg"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <h2 id="portrait-assist-title" class="text-sm font-semibold text-brand-ink">合影助手</h2>
                                    <p class="mt-1 text-xs leading-5 text-brand-muted">为多人物参考图补充角色关系、合影动作和身份区分约束。</p>
                                </div>
                                <button
                                    ref="portraitAssistCloseButtonRef"
                                    type="button"
                                    class="wb-icon-button"
                                    title="关闭合影助手"
                                    aria-label="关闭合影助手"
                                    @click="closePortraitAssistPanel()"
                                >
                                    <X :size="16" :stroke-width="1.8" aria-hidden="true" />
                                </button>
                            </div>

                            <div :class="[
                                'mt-4 rounded-lg border px-3 py-2 text-xs leading-5',
                                portraitAssistAvailable
                                    ? 'border-brand-line bg-brand-surface text-brand-muted'
                                    : 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent'
                            ]">
                                {{ portraitAssistAvailable ? portraitAssistStatus : '添加至少 2 张人物参考图后可启用。' }}
                            </div>

                            <div class="mt-4 space-y-3">
                                <label :class="[
                                    'flex min-h-10 items-center gap-2 rounded-lg border border-brand-line bg-brand-surface px-3 text-sm font-semibold',
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

                                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
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

                                <label class="block">
                                    <span class="wb-label mb-1 block">补充要求</span>
                                    <textarea
                                        v-model="portraitExtraPrompt"
                                        :disabled="!portraitAssistAvailable"
                                        class="wb-input min-h-[76px] w-full resize-none py-2 disabled:cursor-not-allowed disabled:opacity-60"
                                        placeholder="例如：看向镜头、保持角色服装、自然互动。"
                                    />
                                </label>

                                <div v-if="portraitAssistEnabled && portraitAssistAvailable" class="rounded-lg border border-brand-line bg-brand-surface p-3 text-xs leading-5 text-brand-muted">
                                    <span class="wb-label mb-1 block">将拼入提示词</span>
                                    {{ portraitAssistPrompt }}
                                </div>
                            </div>
                        </section>
                    </div>
                </Teleport>

                <div class="rounded-lg border border-brand-line bg-white p-2 shadow-sm shadow-black/10 dark:border-night-muted/35 dark:bg-night-surface">
                    <div class="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                        <div class="min-w-0">
                            <span class="wb-label">Prompt box</span>
                            <p class="mt-0.5 text-xs text-brand-muted dark:text-night-muted">提示词会和参考图用途说明一起提交。</p>
                        </div>
                        <div class="flex flex-wrap items-center gap-1.5">
                            <button
                                type="button"
                                :disabled="!canUndoPromptPhrase"
                                class="wb-icon-button"
                                title="撤销上一次通过词组追加的内容"
                                aria-label="撤销词组"
                                @click="undoLastPromptPhrase"
                            >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-1" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                :disabled="!textToImagePrompt.trim()"
                                class="wb-icon-button"
                                title="清空提示词框"
                                aria-label="清空提示词框"
                                @click="clearPromptText"
                            >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 7h12M10 7V5h4v2M8 7l1 13h6l1-13" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                class="wb-icon-button"
                                :title="showPromptTools ? '收起词组' : '打开词组'"
                                :aria-label="showPromptTools ? '收起词组' : '打开词组'"
                                @click="togglePromptTools"
                            >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h10M4 18h7" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                :class="['wb-icon-button', activeSupplementLabel ? 'border-brand-accent text-brand-accent dark:border-night-muted dark:text-brand-surface' : '']"
                                :title="activeSupplementLabel ? `模板：${activeSupplementLabel}` : '打开模板'"
                                aria-label="打开模板"
                                @click="showTemplatePanel = true"
                            >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 4h14v16l-7-3-7 3V4z" />
                                </svg>
                            </button>
                            <button
                                ref="portraitAssistButtonRef"
                                type="button"
                                :aria-expanded="showPortraitAssistPanel"
                                :aria-pressed="portraitAssistEnabled && portraitAssistAvailable"
                                aria-controls="portrait-assist-panel"
                                aria-label="合影助手"
                                :title="portraitAssistButtonTitle"
                                :class="[
                                    'wb-icon-button',
                                    !portraitAssistAvailable ? 'text-brand-muted dark:text-night-muted' : '',
                                    showPortraitAssistPanel ? 'bg-brand-surface dark:bg-night-accent/25' : '',
                                    portraitAssistEnabled && portraitAssistAvailable
                                        ? 'border-brand-accent text-brand-accent dark:border-night-muted dark:text-brand-surface'
                                        : ''
                                ]"
                                @click="togglePortraitAssistPanel"
                            >
                                <UsersRound :size="16" :stroke-width="1.8" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                :disabled="!textToImagePrompt.trim() && !supplementPrompt"
                                class="wb-icon-button"
                                title="保存为模板"
                                aria-label="保存为模板"
                                @click="openTemplateEditorFromCurrentPrompt"
                            >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M5 5h12l2 2v12H5V5zM8 5v5h7V5M8 19v-6h8v6" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                :disabled="!canImprovePrompt"
                                :class="[
                                    'wb-icon-button',
                                    canImprovePrompt
                                        ? 'border-brand-accent bg-brand-accent text-brand-surface hover:bg-brand-accent/90 dark:border-night-accent dark:bg-night-accent'
                                        : 'cursor-not-allowed'
                                ]"
                                :title="isPromptAssistantLoading ? 'AI 优化中' : 'AI 优化提示词'"
                                aria-label="AI 优化提示词"
                                @click="handleImprovePrompt"
                            >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3l1.4 4.2L18 9l-4.6 1.8L12 15l-1.4-4.2L6 9l4.6-1.8L12 3zM6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14zM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14z" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                :disabled="!canTranslatePrompt"
                                :class="['wb-icon-button', canTranslatePrompt ? 'border-brand-accent/35 text-brand-accent dark:border-night-muted dark:text-brand-surface' : 'cursor-not-allowed']"
                                :title="isPromptAssistantLoading ? '翻译中' : '翻译成中文'"
                                aria-label="翻译成中文"
                                @click="handleTranslatePrompt"
                            >
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 5h8M8 3v2m2 0c-.5 2.5-2.1 4.5-4.7 6M6 8c1 1.6 2.2 2.7 3.8 3.4M13 19l4-9 4 9M14.5 16h5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="grid items-stretch gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <textarea
                            v-model="textToImagePrompt"
                            data-testid="prompt-input"
                            @input="handlePromptManualInput"
                            placeholder="描述你想生成或改动的画面。参考图会作为素材参与生成，可以写：让角色1穿着服装参考，在背景参考中拍摄产品级主视觉。"
                            class="wb-input h-full min-h-[132px] w-full resize-y py-3 text-sm leading-6"
                            rows="5"
                        />

                        <div class="flex min-w-0 flex-col gap-2 lg:w-[430px] xl:w-[520px]">
                            <div class="grid grid-cols-2 gap-1.5 text-center text-[11px] sm:grid-cols-[76px_76px_76px_minmax(0,1fr)]">
                                <div class="rounded-md bg-brand-surface px-2 py-1.5 dark:bg-night-panel">
                                    <div class="text-brand-muted dark:text-night-muted">参考</div>
                                    <div class="font-semibold text-brand-ink dark:text-brand-surface">{{ selectedModelMaxInputImages ? `${selectedImages.length}/${selectedModelMaxInputImages}` : selectedImages.length }}</div>
                                </div>
                                <div class="rounded-md bg-brand-surface px-2 py-1.5 dark:bg-night-panel">
                                    <div class="text-brand-muted dark:text-night-muted">{{ sizeControlLabel }}</div>
                                    <div class="font-semibold text-brand-ink dark:text-brand-surface">{{ showAspectRatioSelector ? selectedAspectRatio : '自动' }}</div>
                                </div>
                                <div class="rounded-md bg-brand-surface px-2 py-1.5 dark:bg-night-panel">
                                    <div class="text-brand-muted dark:text-night-muted">分辨率</div>
                                    <div class="font-semibold text-brand-ink dark:text-brand-surface">{{ showImageSizeConfig ? gemini3ImageSize : '自动' }}</div>
                                </div>
                                <div
                                    :class="[
                                        'flex items-center justify-center rounded-md border px-2 py-1.5 text-xs font-semibold',
                                        selectedImages.length
                                            ? 'border-brand-ink/15 bg-brand-ink text-brand-surface dark:border-night-muted/45 dark:bg-night-panel'
                                            : 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent'
                                    ]"
                                >
                                    {{ selectedImages.length ? `参考图生成 · ${selectedImages.length} 张` : '无参考图 · 只发提示词' }}
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                                <label class="min-w-0 rounded-lg border border-brand-line bg-white px-2 py-1 dark:border-night-muted/35 dark:bg-[#232326]">
                                    <span class="block text-[10px] font-semibold text-brand-muted dark:text-night-muted">张数</span>
                                    <select v-model.number="generationCount" class="mt-0.5 w-full bg-transparent text-xs font-semibold text-brand-ink outline-none dark:text-brand-surface">
                                        <option v-for="count in generationCountOptions" :key="count" :value="count">{{ count }} 张</option>
                                    </select>
                                </label>
                                <label class="min-w-0 rounded-lg border border-brand-line bg-white px-2 py-1 dark:border-night-muted/35 dark:bg-[#232326]">
                                    <span class="block text-[10px] font-semibold text-brand-muted dark:text-night-muted">生成策略</span>
                                    <select v-model="generationBatchMode" class="mt-0.5 w-full bg-transparent text-xs font-semibold text-brand-ink outline-none dark:text-brand-surface">
                                        <option v-for="option in generationBatchModeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                                    </select>
                                </label>
                                <label v-if="showAspectRatioSelector" class="min-w-0 rounded-lg border border-brand-line bg-white px-2 py-1 dark:border-night-muted/35 dark:bg-[#232326]">
                                    <span class="block text-[10px] font-semibold text-brand-muted dark:text-night-muted">{{ sizeControlLabel }}</span>
                                    <select v-model="selectedAspectRatio" class="mt-0.5 w-full bg-transparent text-xs font-semibold text-brand-ink outline-none dark:text-brand-surface">
                                        <option v-for="ratio in availableAspectRatios" :key="ratio.value" :value="ratio.value">{{ ratio.label }}</option>
                                    </select>
                                </label>
                                <label v-else class="min-w-0 rounded-lg border border-brand-line bg-brand-surface px-2 py-1 dark:border-night-muted/35 dark:bg-night-panel">
                                    <span class="block text-[10px] font-semibold text-brand-muted dark:text-night-muted">{{ sizeControlLabel }}</span>
                                    <div class="mt-0.5 truncate text-xs font-semibold text-brand-muted dark:text-night-muted">自动</div>
                                </label>
                                <label v-if="showImageSizeConfig" class="min-w-0 rounded-lg border border-brand-line bg-white px-2 py-1 dark:border-night-muted/35 dark:bg-[#232326]">
                                    <span class="block text-[10px] font-semibold text-brand-muted dark:text-night-muted">分辨率</span>
                                    <select v-model="gemini3ImageSize" class="mt-0.5 w-full bg-transparent text-xs font-semibold text-brand-ink outline-none dark:text-brand-surface">
                                        <option v-for="option in imageSizeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                                    </select>
                                </label>
                                <label v-else class="min-w-0 rounded-lg border border-brand-line bg-brand-surface px-2 py-1 dark:border-night-muted/35 dark:bg-night-panel">
                                    <span class="block text-[10px] font-semibold text-brand-muted dark:text-night-muted">分辨率</span>
                                    <div class="mt-0.5 truncate text-xs font-semibold text-brand-muted dark:text-night-muted">自动</div>
                                </label>
                                <label v-if="showDoraverseImageProxyControls" class="min-w-0 rounded-lg border border-brand-line bg-white px-2 py-1 dark:border-night-muted/35 dark:bg-[#232326]">
                                    <span class="block text-[10px] font-semibold text-brand-muted dark:text-night-muted">质量</span>
                                    <select v-model="imageQuality" class="mt-0.5 w-full bg-transparent text-xs font-semibold text-brand-ink outline-none dark:text-brand-surface">
                                        <option v-for="option in imageQualityOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                                    </select>
                                </label>
                                <label v-if="showDoraverseImageProxyControls" class="flex min-h-[50px] items-center gap-2 rounded-lg border border-brand-line bg-white px-2 py-1 text-xs font-semibold text-brand-muted dark:border-night-muted/35 dark:bg-[#232326] dark:text-night-muted">
                                    <input v-model="imageAutoPrompt" type="checkbox" class="h-3.5 w-3.5 rounded border-brand-line text-brand-accent focus:ring-brand-accent" />
                                    自动优化
                                </label>
                                <label v-if="showDoraverseImageProxyControls" class="flex min-h-[50px] items-center gap-2 rounded-lg border border-brand-line bg-white px-2 py-1 text-xs font-semibold text-brand-muted dark:border-night-muted/35 dark:bg-[#232326] dark:text-night-muted">
                                    <input v-model="imageTranslate" type="checkbox" class="h-3.5 w-3.5 rounded border-brand-line text-brand-accent focus:ring-brand-accent" />
                                    翻译
                                </label>
                                <button
                                    type="button"
                                    @click="handleGenerationAction"
                                    :disabled="!canRunGeneration"
                                    :title="generationActionTitle"
                                    :class="[
                                        'col-span-2 inline-flex min-h-[50px] items-center justify-center rounded-lg px-3 text-xs font-semibold transition sm:col-span-1',
                                        canRunGeneration
                                            ? generationMode === 'image'
                                                ? 'border border-brand-ink bg-brand-ink text-brand-surface hover:bg-brand-ink/90 dark:border-night-muted dark:bg-night-panel'
                                                : 'bg-brand-accent text-brand-surface hover:bg-brand-accent/90 dark:bg-night-accent'
                                            : 'cursor-not-allowed bg-brand-line text-brand-muted dark:bg-night-panel dark:text-night-muted'
                                    ]"
                                >
                                    {{ generationActionLabel }}
                                </button>
                                <p
                                    v-if="shouldShowGenerationBlockingReason"
                                    class="col-span-full rounded-md border border-brand-accent/25 bg-brand-accent/10 px-2 py-1 text-xs leading-5 text-brand-accent"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {{ generationBlockingReason }}
                                </p>
                            </div>

                            <label v-if="supportsGoogleSearch" class="col-span-full flex min-h-8 items-center gap-2 rounded-md bg-brand-surface px-2 py-1.5 text-xs font-semibold text-brand-muted dark:bg-night-panel dark:text-night-muted">
                                <input v-model="gemini3EnableGoogleSearch" type="checkbox" class="h-3.5 w-3.5 rounded border-brand-line text-brand-accent focus:ring-brand-accent" />
                                Google Search
                            </label>
                        </div>
                    </div>

                    <p v-if="promptAssistantError" class="mt-2 rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-xs text-brand-accent">
                        {{ promptAssistantError }}
                    </p>
                    <p v-else-if="!promptAssistantReady && showPromptTools" class="mt-2 text-xs text-brand-muted">
                        配置提示词助手 URL / Key / Model 后，可用低费率文本模型先整理中文提示词。
                    </p>
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

        <ToolboxPanel
            v-if="currentView === 'toolbox'"
            ref="toolboxPanelRef"
            :assistant-ready="promptAssistantReady"
            :assistant-loading="isToolboxAssistantLoading"
            :current-prompt="textToImagePrompt"
            :generation-tasks="generationTasks"
            :generation-results="toolboxGenerationResults"
            :generation-error="toolboxGenerationError"
            @analyze="handleToolboxImageToPrompt"
            @send-to-studio="sendToolboxPromptToStudio"
            @save-template="openTemplateEditorFromToolboxPrompt"
            @apply-references="applyToolboxReferencesToStudio"
            @generate="handleToolboxGenerate"
            @download="handleDownloadResult"
            @select-task="selectFailedTaskFromToolbox"
            @dismiss-task="dismissGenerationTask"
            @restore-task="restoreTaskResult"
            @reuse-task="reuseTaskPrompt"
            @push-task="pushTaskImages"
            @push-task-as-role="pushTaskImagesAsRole"
            @canvas-task="addTaskToCanvas"
            @back-to-studio="currentView = 'studio'"
        />

        <AssetLibraryView
            v-if="currentView === 'assets'"
            :assets="filteredHistoryAssets"
            :all-history-count="allHistoryAssets.length"
            :favorite-count="favoriteHistoryAssetCount"
            :collections="collectionOptions"
            :loading="historyLoading"
            :filter="historyFilter"
            :search="assetSearch"
            :sort="assetSort"
            :selection-mode="assetSelectionMode"
            :selected-ids="selectedAssetIds"
            :downloading="isBatchDownloadingAssets"
            :download-status="assetDownloadStatus"
            @back="currentView = 'studio'"
            @update:filter="historyFilter = $event"
            @update:search="assetSearch = $event"
            @update:sort="assetSort = $event"
            @toggle-selection-mode="toggleAssetSelectionMode"
            @toggle-selection="toggleAssetSelection"
            @new-collection="showCollectionDialog = true"
            @open="openHistoryPreview($event.item, $event.image)"
            @download="downloadHistoryAsset"
            @reference="pushImageToUpload($event.image)"
            @reuse="reuseHistoryRecipe"
            @canvas="addHistoryItemToCanvas($event.item, $event.image)"
            @favorite="toggleHistoryFavorite"
            @category="setHistoryCategory"
            @delete-image="requestDeleteHistoryImage"
            @download-selected="downloadSelectedAssets"
            @delete-selected="showBulkDeleteDialog = true"
        />

        <div class="wb-shell pb-10">
            <Footer />
        </div>

        <AssetDetailWorkspace
            v-if="historyPreviewItem"
            :item="historyPreviewItem"
            :image="historyPreviewImage"
            :original-mode="historyPreviewOriginalMode"
            :collections="collectionOptions"
            :theme-mode="themeMode"
            :diagnostic-status="diagnosticCopyStatus"
            :prompt-copy-status="historyPromptCopyStatus"
            @close="closeHistoryPreview"
            @select-image="historyPreviewImage = $event; historyPreviewOriginalMode = false"
            @download="downloadHistoryPreview"
            @reference="pushImageToUpload(historyPreviewImage)"
            @reuse="reuseHistoryRecipe(historyPreviewItem)"
            @toggle-original="historyPreviewOriginalMode = !historyPreviewOriginalMode"
            @favorite="toggleHistoryFavorite(historyPreviewItem)"
            @copy-prompt="copyHistoryPrompt(historyPreviewItem)"
            @category="setHistoryCategory(historyPreviewItem, $event)"
            @copy-diagnostic="copyHistoryDiagnostic(historyPreviewItem, historyPreviewImage)"
            @canvas="addHistoryItemToCanvas(historyPreviewItem, historyPreviewImage)"
            @delete-image="requestDeleteHistoryImage({ id: `${historyPreviewItem.id}-${historyPreviewItem.images.indexOf(historyPreviewImage)}`, item: historyPreviewItem, image: historyPreviewImage, index: historyPreviewItem.images.indexOf(historyPreviewImage) })"
            @delete-group="requestDeleteHistoryGroup(historyPreviewItem)"
        />

        <div v-if="showCollectionDialog" class="fixed inset-0 z-[90] flex items-center justify-center bg-brand-ink/70 p-4" @click.self="showCollectionDialog = false">
            <form class="w-full max-w-sm rounded-lg border border-brand-line bg-white p-4 shadow-2xl" @submit.prevent="createCollection">
                <div class="mb-4">
                    <p class="wb-label text-brand-accent">Collection</p>
                    <h2 class="mt-1 text-base font-semibold text-brand-ink">新建收藏夹</h2>
                    <p class="mt-1 text-xs leading-5 text-brand-muted">命名后会出现在资产库筛选中；当前同一批生成的图片会一起归类。</p>
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

        <div v-if="pendingHistoryDelete" class="fixed inset-0 z-[94] flex items-center justify-center bg-brand-ink/75 p-4" @click.self="pendingHistoryDelete = null">
            <section class="w-full max-w-md rounded-lg border border-brand-line bg-white p-4 shadow-2xl dark:bg-night-surface">
                <p class="wb-label text-brand-accent">Danger zone</p>
                <h2 class="mt-1 text-base font-semibold text-brand-ink">{{ pendingHistoryDelete.imageIndex === undefined ? '删除整组记录？' : '删除当前图片？' }}</h2>
                <p class="mt-2 text-sm leading-6 text-brand-muted">
                    {{ pendingHistoryDelete.imageIndex === undefined
                        ? `将删除这次生成的全部 ${pendingHistoryDelete.item.images.length} 张图片和对应记录。`
                        : '只删除当前图片；同批次的其他图片会保留。' }}
                </p>
                <p class="mt-2 text-xs leading-5 text-brand-accent">删除后无法从 Vistack 恢复。</p>
                <div class="mt-4 flex justify-end gap-2">
                    <button type="button" class="wb-secondary" @click="pendingHistoryDelete = null">取消</button>
                    <button type="button" class="wb-primary" @click="confirmPendingHistoryDelete">确认删除</button>
                </div>
            </section>
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
import { ref, computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { UsersRound, X } from '@lucide/vue'
import ApiKeyInput from './components/ApiKeyInput.vue'
import ImageUpload from './components/ImageUpload.vue'
import StylePromptSelector from './components/StylePromptSelector.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import CanvasWorkbench from './components/CanvasWorkbench.vue'
import Footer from './components/Footer.vue'
import PromptPhraseBuilder from './components/PromptPhraseBuilder.vue'
import ToolboxPanel from './components/ToolboxPanel.vue'
import AssetLibraryView from './components/AssetLibraryView.vue'
import AssetDetailWorkspace from './components/AssetDetailWorkspace.vue'
import { fetchModels, generateImage, improvePrompt, pollGeneratedTask } from './services/api'
import { styleTemplates } from './data/templates'
import { promptPoolGroups } from './data/promptPool'
import { promptPhraseGroups, type PromptPhrase, type PromptPhraseGroup } from './data/promptPhrases'
import { LocalStorage, type StoredPromptPhrase, type StoredPromptPhraseGroup, type StoredPromptPhraseOverride } from './utils/storage'
import { getEndpointPath, isDoraverseImageProxyEndpoint, isGrsaiEndpoint, isLjqclubImageEndpoint, isOpenAiImageModelId, resolveChatCompletionsEndpoint, resolveImageGenerationEndpoint } from './utils/apiEndpoint'
import {
    aspectRatioToDoraverseGptImageSize,
    aspectRatioToGrsaiGptImageSize,
    aspectRatioToGeminiSize,
    aspectRatioToOpenAiImageSize,
    baseAspectRatioResolutionMap,
    buildAspectRatioOptions,
    doraverseGptImageAspectRatioResolutionMap,
    geminiAspectRatioResolutionData,
    grsaiGptImageAspectRatioResolutionData,
    normalizeImageResolution,
    openAiAspectRatioResolutionData
} from './utils/imageSizing'
import { getCanvasWorkbenchItems, saveCanvasWorkbenchItems } from './utils/canvasStorage'
import { buildDiagnosticReport, formatDiagnosticTimestamp, sanitizeDiagnosticUrl, summarizeDiagnosticError } from './utils/diagnostics'
import { buildAssetDownloadFilename, buildHistoryAssets, type AssetSortOrder, type HistoryAsset } from './utils/assetLibrary'
import { buildGenerationActionLabel, resolveGenerationMode } from './utils/generationAction'
import { buildPortraitAssistPrompt, portraitAssistIconTitle, resolvePortraitAssistUiState } from './utils/portraitAssist'
import { buildGenerationActualParams, clampHistoryImageIndex, selectInitialHistoryId } from './utils/generationRecords'
import {
    deleteGenerationHistoryItem,
    deletePendingGenerationTaskItem,
    deleteStoredImage,
    getGenerationHistoryItems,
    getPendingGenerationTaskItems,
    persistGeneratedImages,
    putPendingGenerationTaskItem,
    putGenerationHistoryItem,
    resolveHistoryItemImages,
    type GenerationHistoryItem,
    type PendingGenerationTaskItem,
    type GenerationHistorySource
} from './utils/historyDb'
import type { ApiConnectionPreset, ApiModel, CanvasWorkbenchItem, CanvasWorkbenchItemSource, GenerateRequest, GenerateResponse, GenerationBatchMode, GenerationRecipe, GenerationTask, GenerationTaskHandle, ModelOption, PromptAssistantRequest, ReferenceImageMeta, ReferenceImageRole, StyleTemplate, ToolboxGeneratePayload, ToolboxReference, ToolboxRolePushPayload, WorkspaceMode } from './types'
import { DEFAULT_API_ENDPOINT, DEFAULT_MODEL_ID, DEFAULT_PROMPT_ASSISTANT_ENDPOINT, DEFAULT_PROMPT_ASSISTANT_MODEL_ID } from './config/api'

type ThemeMode = 'light' | 'dark'

const apiKey = ref('')
const apiEndpoint = ref('')
const apiUseProxy = ref(false)
const apiProxyToken = ref('')
const apiConnectionPresets = ref<ApiConnectionPreset[]>([])
const selectedApiConnectionPresetId = ref('')
const isApplyingApiConnectionPreset = ref(false)
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
const selectedGenerationHistoryId = ref('')
const selectedGenerationImageIndex = ref(0)
const selectedFailedTaskId = ref('')
const toolboxGenerationResults = ref<string[]>([])
const toolboxGenerationError = ref<string | null>(null)
const pendingTaskHandles = new Map<string, GenerationTaskHandle[]>()
const pendingResumeIds = new Set<string>()
const currentView = ref<'studio' | 'assets' | 'toolbox'>('studio')
const toolboxPanelRef = ref<InstanceType<typeof ToolboxPanel> | null>(null)
const themeMode = ref<ThemeMode>('light')
const workspaceMode = ref<WorkspaceMode>('quick')
const canvasItems = ref<CanvasWorkbenchItem[]>([])
const showPromptTools = ref(false)
const showPortraitAssistPanel = ref(false)
const isDesktopLayout = ref(false)
const portraitAssistButtonRef = ref<HTMLButtonElement | null>(null)
const portraitAssistCloseButtonRef = ref<HTMLButtonElement | null>(null)
const portraitAssistPanelRef = ref<HTMLElement | null>(null)
const portraitAssistOverlayRef = ref<HTMLElement | null>(null)
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
const diagnosticCopyStatus = ref('')
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
const promptAssistantUseProxy = ref(false)
const promptAssistantProxyToken = ref('')
const isPromptAssistantLoading = ref(false)
const isToolboxAssistantLoading = ref(false)
const promptAssistantError = ref<string | null>(null)
const selectedAspectRatio = ref('1:1')
const generationCount = ref(1)
const generationBatchMode = ref<GenerationBatchMode>('fill')
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
const imageQuality = ref('auto')
const imageAutoPrompt = ref(false)
const imageTranslate = ref(false)

const generationHistory = ref<GenerationHistoryItem[]>([])
const historyLoading = ref(false)
const historyFilter = ref('all')
const assetSearch = ref('')
const assetSort = ref<AssetSortOrder>('newest')
const assetCollections = ref<string[]>([])
const newCollectionName = ref('')
const showCollectionDialog = ref(false)
const historyPreviewItem = ref<GenerationHistoryItem | null>(null)
const historyPreviewImage = ref('')
const historyPreviewOriginalMode = ref(false)
const historyPromptCopyStatus = ref('')
const assetSelectionMode = ref(false)
const selectedAssetIds = ref<string[]>([])
const isBatchDownloadingAssets = ref(false)
const assetDownloadStatus = ref('')
const showBulkDeleteDialog = ref(false)
const bulkDeleteConfirmText = ref('')
const pendingHistoryDelete = ref<{ item: GenerationHistoryItem; imageIndex?: number } | null>(null)

const effectiveApiEndpoint = computed(() => apiEndpoint.value.trim() || DEFAULT_API_ENDPOINT)
const effectiveSelectedModel = computed(() => selectedModel.value.trim() || DEFAULT_MODEL_ID)
const effectivePromptAssistantEndpoint = computed(() => promptAssistantEndpoint.value.trim() || DEFAULT_PROMPT_ASSISTANT_ENDPOINT)
const effectivePromptAssistantModel = computed(() => promptAssistantModel.value.trim() || DEFAULT_PROMPT_ASSISTANT_MODEL_ID)
const modelCacheKey = (endpoint = effectiveApiEndpoint.value, apikey = apiKey.value, useProxy = apiUseProxy.value) =>
    [
        endpoint.trim() || DEFAULT_API_ENDPOINT,
        apikey.trim().slice(-12),
        useProxy ? 'proxy' : 'direct'
    ].join('|')

const toggleThemeMode = () => {
    themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
    LocalStorage.saveThemeMode(themeMode.value)
}

const updateDesktopLayout = () => {
    isDesktopLayout.value = window.matchMedia('(min-width: 1024px)').matches
}

const closePortraitAssistPanel = (restoreFocus = true) => {
    if (!showPortraitAssistPanel.value) return
    showPortraitAssistPanel.value = false
    if (restoreFocus) {
        nextTick(() => portraitAssistButtonRef.value?.focus())
    }
}

const togglePortraitAssistPanel = () => {
    if (showPortraitAssistPanel.value) {
        closePortraitAssistPanel()
        return
    }

    showPromptTools.value = false
    showPortraitAssistPanel.value = true
    nextTick(() => portraitAssistCloseButtonRef.value?.focus())
}

const togglePromptTools = () => {
    closePortraitAssistPanel(false)
    showPromptTools.value = !showPromptTools.value
}

const handlePortraitAssistPointerDown = (event: PointerEvent) => {
    if (!showPortraitAssistPanel.value) return
    const target = event.target
    if (!(target instanceof Node)) return
    if (target === portraitAssistOverlayRef.value) return
    if (portraitAssistPanelRef.value?.contains(target) || portraitAssistButtonRef.value?.contains(target)) return
    closePortraitAssistPanel(false)
}

const handlePortraitAssistKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && showPortraitAssistPanel.value) {
        event.preventDefault()
        closePortraitAssistPanel()
    }
}

// 组件挂载时从本地存储读取API密钥
onMounted(() => {
    updateDesktopLayout()
    window.addEventListener('resize', updateDesktopLayout)
    document.addEventListener('pointerdown', handlePortraitAssistPointerDown)
    document.addEventListener('keydown', handlePortraitAssistKeydown)
    loadGenerationHistory()

    const savedApiKey = LocalStorage.getApiKey()
    const savedEndpoint = LocalStorage.getApiEndpoint()
    const savedApiUseProxy = LocalStorage.getApiUseProxy()
    const savedApiProxyToken = LocalStorage.getApiProxyToken()
    const savedModelId = LocalStorage.getModelId()
    const savedPromptAssistantApiKey = LocalStorage.getPromptAssistantApiKey()
    const savedPromptAssistantEndpoint = LocalStorage.getPromptAssistantEndpoint()
    const savedPromptAssistantModel = LocalStorage.getPromptAssistantModelId()
    const savedPromptAssistantUseProxy = LocalStorage.getPromptAssistantUseProxy()
    const savedPromptAssistantProxyToken = LocalStorage.getPromptAssistantProxyToken()
    assetCollections.value = LocalStorage.getAssetCollections()
    apiConnectionPresets.value = LocalStorage.getApiConnectionPresets()
    customPromptPhraseGroups.value = LocalStorage.getCustomPromptPhraseGroups()
    promptPhraseOverrides.value = LocalStorage.getPromptPhraseOverrides()
    customStyleTemplates.value = LocalStorage.getCustomStyleTemplates()
    canvasItems.value = getCanvasWorkbenchItems()
    themeMode.value = LocalStorage.getThemeMode()
    generationBatchMode.value = LocalStorage.getGenerationBatchMode()

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
    apiUseProxy.value = savedApiUseProxy
    apiProxyToken.value = savedApiProxyToken
    selectedApiConnectionPresetId.value = findMatchingApiPresetId(apiConnectionPresets.value, {
        apiKey: savedApiKey,
        endpoint: endpointToUse,
        model: modelIdToUse,
        useProxy: savedApiUseProxy,
        proxyToken: savedApiProxyToken
    })
    promptAssistantApiKey.value = savedPromptAssistantApiKey
    promptAssistantEndpoint.value = savedPromptAssistantEndpoint.trim() || DEFAULT_PROMPT_ASSISTANT_ENDPOINT
    promptAssistantModel.value = savedPromptAssistantModel.trim() || DEFAULT_PROMPT_ASSISTANT_MODEL_ID
    promptAssistantUseProxy.value = savedPromptAssistantUseProxy
    promptAssistantProxyToken.value = savedPromptAssistantProxyToken

    ensureSelectedOptionPresent()

    // Mark initialization complete so later watcher updates are treated as user edits.
    hasSyncedInitialEndpoint = true
    restorePendingGenerationTasks()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDesktopLayout)
    document.removeEventListener('pointerdown', handlePortraitAssistPointerDown)
    document.removeEventListener('keydown', handlePortraitAssistKeydown)
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
        syncSelectedApiPreset()
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
        if (!hasSyncedInitialEndpoint || isApplyingApiConnectionPreset.value) {
            return
        }

        // 只有在初始化完成后，用户主动修改端点时才重置模型
        if (trimmed !== previousTrimmed) {
            modelOptions.value = []
            modelsError.value = null
            if (previousTrimmed) {
                selectedModel.value = DEFAULT_MODEL_ID
                LocalStorage.clearModelCache(modelCacheKey(previousTrimmed))
            }
            showApiSettings.value = true
        }
        syncSelectedApiPreset()
    },
    { immediate: false }
)

watch(generationBatchMode, mode => {
    LocalStorage.saveGenerationBatchMode(mode)
})

watch(
    apiUseProxy,
    (newUseProxy: boolean) => {
        LocalStorage.saveApiUseProxy(newUseProxy)
        syncSelectedApiPreset()
    },
    { immediate: false }
)

watch(
    apiProxyToken,
    (newToken: string) => {
        LocalStorage.saveApiProxyToken(newToken)
        syncSelectedApiPreset()
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
            LocalStorage.clearModelCache(modelCacheKey())
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
        syncSelectedApiPreset()
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
    promptAssistantUseProxy,
    (newUseProxy: boolean) => {
        LocalStorage.savePromptAssistantUseProxy(newUseProxy)
    },
    { immediate: false }
)

watch(
    promptAssistantProxyToken,
    (newToken: string) => {
        LocalStorage.savePromptAssistantProxyToken(newToken)
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
    if (!apiKey.value.trim() || !effectiveApiEndpoint.value.trim()) return

    isFetchingModels.value = true
    modelsError.value = null

    try {
        const rawModels = await fetchModels(apiKey.value, effectiveApiEndpoint.value, apiUseProxy.value, apiProxyToken.value)
        const options = mapModelsToOptions(rawModels)

        if (!options.length) {
            throw new Error('未找到可用模型')
        }

        modelOptions.value = options
        LocalStorage.saveModelCache(modelCacheKey(), options)

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

const buildApiPresetName = (endpoint: string, model: string) => {
    try {
        const host = new URL(endpoint).host
        return model.trim() ? `${host} / ${model.trim()}` : host
    } catch {
        return model.trim() ? `${endpoint.trim()} / ${model.trim()}` : endpoint.trim() || '未命名配置'
    }
}

const normalizeApiPresetEndpoint = (endpoint: string) => endpoint.trim().replace(/\/+$/, '').toLowerCase()

const findMatchingApiPresetId = (
    presets: ApiConnectionPreset[],
    config: { apiKey: string; endpoint: string; model: string; useProxy: boolean; proxyToken?: string }
) => {
    const endpoint = normalizeApiPresetEndpoint(config.endpoint)
    const model = config.model.trim()
    const apiKeyValue = config.apiKey.trim()
    const proxyTokenValue = config.useProxy ? (config.proxyToken || '').trim() : ''

    return presets.find(preset =>
        normalizeApiPresetEndpoint(preset.endpoint) === endpoint &&
        preset.model.trim() === model &&
        preset.apiKey.trim() === apiKeyValue &&
        preset.useProxy === config.useProxy &&
        (!config.useProxy || (preset.proxyToken || '').trim() === proxyTokenValue)
    )?.id || ''
}

const syncSelectedApiPreset = () => {
    if (isApplyingApiConnectionPreset.value) return
    selectedApiConnectionPresetId.value = findMatchingApiPresetId(apiConnectionPresets.value, {
        apiKey: apiKey.value,
        endpoint: effectiveApiEndpoint.value,
        model: selectedModel.value,
        useProxy: apiUseProxy.value,
        proxyToken: apiProxyToken.value
    })
}

const persistApiConnectionPresets = (presets: ApiConnectionPreset[]) => {
    apiConnectionPresets.value = presets
    LocalStorage.saveApiConnectionPresets(presets)
}

const createApiPresetFromCurrentConfig = (name?: string): ApiConnectionPreset => {
    const now = Date.now()
    const endpoint = effectiveApiEndpoint.value
    const model = effectiveSelectedModel.value

    return {
        id: `api-preset-${now}-${Math.random().toString(36).slice(2, 8)}`,
        name: name?.trim() || buildApiPresetName(endpoint, model),
        apiKey: apiKey.value.trim(),
        endpoint,
        model,
        useProxy: apiUseProxy.value,
        proxyToken: apiUseProxy.value ? apiProxyToken.value.trim() : '',
        createdAt: now,
        updatedAt: now
    }
}

const handleSaveApiPreset = (name?: string) => {
    const preset = createApiPresetFromCurrentConfig(name)
    persistApiConnectionPresets([preset, ...apiConnectionPresets.value])
    selectedApiConnectionPresetId.value = preset.id
}

const handleUpdateApiPreset = (presetId: string) => {
    const existing = apiConnectionPresets.value.find(preset => preset.id === presetId)
    if (!existing) {
        handleSaveApiPreset()
        return
    }

    const endpoint = effectiveApiEndpoint.value
    const model = effectiveSelectedModel.value
    const nextPreset: ApiConnectionPreset = {
        ...existing,
        name: existing.name.trim() || buildApiPresetName(endpoint, model),
        apiKey: apiKey.value.trim(),
        endpoint,
        model,
        useProxy: apiUseProxy.value,
        proxyToken: apiUseProxy.value ? apiProxyToken.value.trim() : '',
        updatedAt: Date.now()
    }

    persistApiConnectionPresets(apiConnectionPresets.value.map(preset => preset.id === presetId ? nextPreset : preset))
    selectedApiConnectionPresetId.value = nextPreset.id
}

const handleDeleteApiPreset = (presetId: string) => {
    persistApiConnectionPresets(apiConnectionPresets.value.filter(preset => preset.id !== presetId))
    if (selectedApiConnectionPresetId.value === presetId) {
        selectedApiConnectionPresetId.value = ''
    }
}

const handleSelectApiPreset = (presetId: string) => {
    if (!presetId) {
        selectedApiConnectionPresetId.value = ''
        return
    }

    const preset = apiConnectionPresets.value.find(item => item.id === presetId)
    if (!preset) return

    isApplyingApiConnectionPreset.value = true
    selectedApiConnectionPresetId.value = preset.id
    apiKey.value = preset.apiKey
    apiEndpoint.value = preset.endpoint
    apiUseProxy.value = preset.useProxy
    apiProxyToken.value = preset.proxyToken || ''
    restoreModelOptionsFromCache(preset.endpoint)
    selectedModel.value = preset.model || DEFAULT_MODEL_ID
    ensureSelectedOptionPresent()
    showApiSettings.value = false
    queueMicrotask(() => {
        isApplyingApiConnectionPreset.value = false
        syncSelectedApiPreset()
    })
}

const mapModelsToOptions = (models: ApiModel[]): ModelOption[] => {
    const uniqueIds = new Set<string>()
    const options: ModelOption[] = []

    models.forEach(model => {
        if (!model?.id || uniqueIds.has(model.id)) return
        uniqueIds.add(model.id)

        const modelRecord = model as Record<string, unknown>
        const supportsImages = detectImageSupport(model)
        const label = buildModelLabel(model)
        const description = (typeof model.description === 'string' && model.description.trim()) ||
            (typeof modelRecord.about === 'string' && String(modelRecord.about).trim()) ||
            ''
        const inferred = inferModelOptionMetadata(model.id, effectiveApiEndpoint.value)
        const shouldUseInferredSizeMetadata = shouldPreferInferredSizeMetadata(model.id, effectiveApiEndpoint.value)
        const explicitSizeFormat = readStringFromFields(modelRecord, ['sizeFormat', 'size_format'])
        const explicitDefaultSize = readStringFromFields(modelRecord, ['defaultSize', 'default_size'])
        const explicitDefaultResolution = normalizeImageResolution(readStringFromFields(modelRecord, ['defaultResolution', 'default_resolution']))
        const explicitSupportedSizes = readStringArrayFromFields(modelRecord, ['supportedSizes', 'supported_sizes', 'aspectRatios', 'aspect_ratios'])
        const explicitSupportedResolutions = normalizeResolutionValues(readStringArrayFromFields(modelRecord, ['supportedResolutions', 'supported_resolutions', 'resolutions', 'imageSizes', 'image_sizes']))
        const explicitHasResolution = readBooleanFromFields(modelRecord, ['hasResolution', 'has_resolution'])

        options.push({
            id: model.id,
            label,
            description,
            supportsImages,
            sizeFormat: shouldUseInferredSizeMetadata
                ? inferred.sizeFormat
                : explicitSizeFormat || inferred.sizeFormat,
            maxGenerations: readPositiveIntegerFromFields(modelRecord, ['maxGenerations', 'max_generations', 'maxN', 'max_n']) || inferred.maxGenerations,
            maxInputImages: readPositiveIntegerFromFields(modelRecord, ['maxInputImages', 'max_input_images', 'maxImages', 'max_images']) || inferred.maxInputImages,
            defaultSize: shouldUseInferredSizeMetadata
                ? inferred.defaultSize
                : explicitDefaultSize || inferred.defaultSize,
            defaultResolution: shouldUseInferredSizeMetadata
                ? normalizeImageResolution(inferred.defaultResolution || '')
                : explicitDefaultResolution || normalizeImageResolution(inferred.defaultResolution || ''),
            supportedSizes: shouldUseInferredSizeMetadata
                ? inferred.supportedSizes
                : explicitSupportedSizes || inferred.supportedSizes,
            supportedResolutions: shouldUseInferredSizeMetadata
                ? normalizeResolutionValues(inferred.supportedResolutions)
                : explicitSupportedResolutions || normalizeResolutionValues(inferred.supportedResolutions),
            hasResolution: shouldUseInferredSizeMetadata && typeof inferred.hasResolution === 'boolean'
                ? inferred.hasResolution
                : typeof explicitHasResolution === 'boolean'
                  ? explicitHasResolution
                  : inferred.hasResolution
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
    const displayName = readString((model as Record<string, unknown>).displayName)
    if (displayName) {
        return `${model.id} - ${displayName}`
    }

    if (model.name && typeof model.name === 'string' && model.name.trim()) {
        return `${model.id} - ${model.name.trim()}`
    }
    return model.id
}

const readString = (value: unknown): string => typeof value === 'string' ? value.trim() : ''

const readStringArray = (value: unknown): string[] | undefined => {
    if (!Array.isArray(value)) return undefined
    const values = value
        .map(item => readString(item))
        .filter(Boolean)
    return values.length ? values : undefined
}

const readStringFromFields = (record: Record<string, unknown>, fields: string[]): string => {
    for (const field of fields) {
        const value = readString(record[field])
        if (value) return value
    }
    return ''
}

const readStringArrayFromFields = (record: Record<string, unknown>, fields: string[]): string[] | undefined => {
    for (const field of fields) {
        const values = readStringArray(record[field])
        if (values?.length) return values
    }
    return undefined
}

const readBooleanFromFields = (record: Record<string, unknown>, fields: string[]): boolean | undefined => {
    for (const field of fields) {
        const value = record[field]
        if (typeof value === 'boolean') return value
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase()
            if (normalized === 'true') return true
            if (normalized === 'false') return false
        }
    }
    return undefined
}

const normalizeResolutionValues = (values?: string[]): string[] | undefined => {
    if (!values?.length) return undefined
    const normalized = [...new Set(values.map(value => normalizeImageResolution(value)).filter(Boolean))]
    return normalized.length ? normalized : undefined
}

const readPositiveInteger = (value: unknown): number | undefined => {
    const normalized = typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim()
          ? Number(value)
          : NaN

    if (!Number.isFinite(normalized) || normalized < 1) return undefined
    return Math.floor(normalized)
}

const readPositiveIntegerFromFields = (record: Record<string, unknown>, fields: string[]): number | undefined => {
    for (const field of fields) {
        const value = readPositiveInteger(record[field])
        if (value) return value
    }
    return undefined
}

const ratioSizeOptions = ['21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16']

const isGptImage2ModelId = (modelId: string): boolean =>
    /(^|[/:\s_-])gpt[\s_-]*image[\s_-]*2\b/i.test(modelId.trim())

const isKnownDynamicResolutionImageModelId = (modelId: string): boolean => {
    const normalized = modelId.toLowerCase()
    return /gpt[\s_-]*image|gptimage/.test(normalized) ||
        normalized.includes('nano-banana-2') ||
        normalized.includes('nano-banana-pro') ||
        normalized.includes('gemini-3-pro-image') ||
        normalized.includes('gemini-3-pro') ||
        normalized.includes('gemini-3.1-pro')
}

const isLjqclubCodexImageModel = (modelId: string, endpoint: string): boolean =>
    isLjqclubImageEndpoint(endpoint) && /gpt[\s_-]*image|gptimage/.test(modelId.toLowerCase())

const shouldPreferInferredSizeMetadata = (modelId: string, endpoint: string): boolean =>
    isKnownDynamicResolutionImageModelId(modelId) ||
    (isDoraverseImageProxyEndpoint(endpoint) && isGptImage2ModelId(modelId))

const inferModelOptionMetadata = (modelId: string, endpoint = effectiveApiEndpoint.value): Partial<ModelOption> => {
    const normalized = modelId.toLowerCase()

    if (/gpt[\s_-]*image|gptimage/.test(normalized)) {
        if (isLjqclubCodexImageModel(modelId, endpoint)) {
            return {
                sizeFormat: 'ratio',
                maxGenerations: 4,
                maxInputImages: 4,
                defaultSize: '4:5',
                hasResolution: false,
                supportedSizes: ratioSizeOptions
            }
        }

        if (isDoraverseImageProxyEndpoint(endpoint) && isGptImage2ModelId(modelId)) {
            return {
                sizeFormat: 'absolute',
                maxGenerations: 4,
                maxInputImages: 4,
                defaultSize: '1024x1024',
                defaultResolution: '720p',
                supportedSizes: ['1024x1024', '1536x1024', '1024x1536'],
                supportedResolutions: ['720p'],
                hasResolution: false
            }
        }

        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 4,
            defaultSize: '1:1',
            defaultResolution: '1K',
            supportedResolutions: ['1K', '2K', '4K'],
            hasResolution: true
        }
    }

    if (normalized.includes('nano-banana-2')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 4,
            defaultSize: '21:9',
            defaultResolution: normalized.includes('4k') ? '4K' : '1K',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: ['1K', '2K', '4K'],
            hasResolution: true
        }
    }

    if (normalized.includes('nano-banana-pro')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 2,
            defaultSize: '21:9',
            defaultResolution: normalized.includes('4k') ? '4K' : '1K',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: normalized.includes('4k') ? ['1K', '2K', '4K'] : ['1K', '2K'],
            hasResolution: true
        }
    }

    if (normalized.includes('gemini-3-pro-image') || normalized.includes('gemini-3-pro') || normalized.includes('gemini-3.1-pro')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 4,
            defaultSize: '1:1',
            defaultResolution: '1K',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: ['1K', '2K', '4K'],
            hasResolution: true
        }
    }

    if (normalized.includes('nano-banana') || normalized.includes('gemini-2.5-flash-image')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 2,
            defaultSize: '21:9',
            defaultResolution: '720p',
            supportedSizes: ratioSizeOptions,
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    if (normalized.includes('grok-imagine')) {
        return {
            sizeFormat: 'ratio',
            maxGenerations: 4,
            maxInputImages: 1,
            defaultSize: '2:1',
            defaultResolution: '720p',
            supportedSizes: ['2:1', '20:9', '19.5:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:19.5', '9:20', '1:2'],
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    if (normalized.includes('seedream')) {
        return {
            sizeFormat: 'named',
            maxGenerations: 6,
            maxInputImages: 6,
            defaultSize: 'square_hd',
            defaultResolution: '720p',
            supportedSizes: ['auto', 'square', 'square_hd', '3:4', '4:3', '9:16', '16:9', 'auto_2K', 'auto_4K'],
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    if (normalized.includes('flux')) {
        return {
            sizeFormat: 'named',
            maxGenerations: 1,
            maxInputImages: 1,
            defaultSize: 'square_hd',
            defaultResolution: '720p',
            supportedSizes: ['square_hd', 'square', 'portrait_4:3', 'portrait_16:9', 'landscape_4:3', 'landscape_16:9'],
            supportedResolutions: ['720p'],
            hasResolution: false
        }
    }

    return {}
}

const formatResolutionOptionLabel = (value: string): string => {
    const normalized = normalizeImageResolution(value)
    if (!normalized) return value
    return normalized
}

const formatModelSizeOptionLabel = (value: string): string => value.trim() || value

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
    const trimmedEndpoint = endpoint.trim() || DEFAULT_API_ENDPOINT

    const cached = LocalStorage.getModelCache(modelCacheKey(trimmedEndpoint))
    if (!cached.length) return

    modelOptions.value = normalizeCachedModelOptions(cached, trimmedEndpoint)
    ensureSelectedOptionPresent()
}

const normalizeCachedModelOptions = (options: ModelOption[], endpoint: string): ModelOption[] =>
    options.map(option => {
        const inferred = inferModelOptionMetadata(option.id, endpoint)
        const next = { ...option }

        if (shouldRefreshInferredSizeMetadata(option, endpoint) || isLikelyLegacyGptImageMetadata(option, endpoint)) {
            next.sizeFormat = inferred.sizeFormat
            next.defaultSize = inferred.defaultSize
            next.defaultResolution = normalizeImageResolution(inferred.defaultResolution || '')
            next.supportedSizes = inferred.supportedSizes
            next.supportedResolutions = normalizeResolutionValues(inferred.supportedResolutions)
            next.hasResolution = inferred.hasResolution
        }

        next.defaultResolution = normalizeImageResolution(next.defaultResolution || '')
        next.supportedResolutions = normalizeResolutionValues(next.supportedResolutions)
        next.maxGenerations = next.maxGenerations || inferred.maxGenerations
        next.maxInputImages = next.maxInputImages || inferred.maxInputImages
        return next
    })

const shouldRefreshInferredSizeMetadata = (option: ModelOption, endpoint: string): boolean =>
    shouldPreferInferredSizeMetadata(option.id, endpoint)

const isLikelyLegacyGptImageMetadata = (option: ModelOption, endpoint: string): boolean => {
    if (!/gpt[\s_-]*image|gptimage/i.test(option.id)) return false
    if (isDoraverseImageProxyEndpoint(endpoint) && isGptImage2ModelId(option.id)) return false

    const sizes = option.supportedSizes || []
    return option.sizeFormat === 'absolute' &&
        sizes.length === 3 &&
        sizes.includes('1024x1024') &&
        sizes.includes('1536x1024') &&
        sizes.includes('1024x1536') &&
        option.hasResolution === false
}

const ensureSelectedOptionPresent = () => {
    const currentId = selectedModel.value.trim()
    if (!currentId) return

    const exists = modelOptions.value.some(option => option.id === currentId)
    if (!exists) {
        const inferred = inferModelOptionMetadata(currentId, effectiveApiEndpoint.value)
        modelOptions.value = [
            ...modelOptions.value,
            {
                id: currentId,
                label: buildFallbackLabel(currentId),
                description: '',
                supportsImages: true,
                ...inferred
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

const buildGenerationRecipe = (compiledPrompt: string, mainPrompt = textToImagePrompt.value.trim(), references = selectedImages.value, metadata = referenceImageMetadata.value, labels = referenceImageLabels.value): GenerationRecipe => ({
    mainPrompt,
    compiledPrompt,
    supplementPrompt: supplementPrompt.value,
    selectedStyle: selectedStyle.value,
    customPrompt: customPrompt.value,
    referenceImages: [...references],
    referenceImageLabels: references.map((_, index) => labels[index] || `角色${index + 1}`),
    referenceImageMetadata: references.map((_, index) => normalizeReferenceRecipeMeta(metadata[index], index)),
    count: generationCount.value,
    batchMode: generationBatchMode.value
})

const buildGenerateRequest = (prompt: string, images: string[], count = generationCount.value): GenerateRequest => {
    const request: GenerateRequest = {
        prompt,
        images,
        apikey: apiKey.value,
        endpoint: effectiveApiEndpoint.value,
        model: effectiveSelectedModel.value,
        count,
        batchMode: generationBatchMode.value,
        useProxy: apiUseProxy.value,
        proxyToken: apiUseProxy.value ? apiProxyToken.value.trim() : ''
    }

    if (showAspectRatioSelector.value) {
        request.aspectRatio = selectedAspectRatio.value
    }

    if (showImageSizeConfig.value) {
        request.imageSize = normalizeImageResolution(gemini3ImageSize.value)
    }

    if (supportsGoogleSearch.value) {
        request.enableGoogleSearch = gemini3EnableGoogleSearch.value
    }

    if (showDoraverseImageProxyControls.value) {
        request.quality = imageQuality.value
        request.autoPrompt = imageAutoPrompt.value
        request.translate = imageTranslate.value
    }

    return request
}

const createGenerationTask = (source: GenerationTask['source'], prompt: string, recipe: GenerationRecipe): GenerationTask => {
    const createdAt = Date.now()
    const taskNumber = generationTasks.value.length + 1
    return {
        id: `${source}-${createdAt}-${Math.random().toString(36).slice(2, 8)}`,
        source,
        origin: 'studio',
        title: `${source === 'image' ? '参考图生成' : '无参考图生成'} #${taskNumber}`,
        prompt,
        status: 'running',
        createdAt,
        model: effectiveSelectedModel.value,
        endpoint: effectiveApiEndpoint.value,
        resolvedEndpoint: resolvedGenerationEndpoint.value,
        requestProvider: requestProviderType.value,
        aspectRatio: selectedAspectRatio.value,
        imageSize: normalizeImageResolution(gemini3ImageSize.value),
        count: recipe.count,
        batchMode: recipe.batchMode,
        images: [],
        recipe,
        useProxy: apiUseProxy.value,
        proxyToken: apiUseProxy.value ? apiProxyToken.value.trim() : ''
    }
}

const updateGenerationTask = (taskId: string, patch: Partial<GenerationTask>) => {
    generationTasks.value = generationTasks.value.map(task => task.id === taskId ? { ...task, ...patch } : task)
}

const syncGenerationLoadingState = () => {
    isLoading.value = activeGenerationTasks.value.some(task => task.source === 'image' && task.origin !== 'toolbox')
    isTextToImageLoading.value = activeGenerationTasks.value.some(task => task.source === 'text' && task.origin !== 'toolbox')
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
    const source = selectedHistoryItem.value?.source || latestResultSource.value
    const title = source === 'text' ? '文生图结果' : '参考图结果'
    const prompt = selectedHistoryItem.value?.prompt || latestGenerationRecipe.value?.mainPrompt || textToImagePrompt.value
    addImagesToCanvas(displayResults.value, 'result', title, prompt)
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
    generationBatchMode.value = task.batchMode || task.recipe.batchMode || 'fill'
    selectedAspectRatio.value = task.aspectRatio
    workspaceMode.value = 'quick'
    currentView.value = 'studio'
}

const pushTaskImages = (task: GenerationTask) => {
    pushImagesToUpload(task.images)
    workspaceMode.value = 'quick'
    currentView.value = 'studio'
}

const pushTaskImagesAsRole = (payload: ToolboxRolePushPayload) => {
    const images = payload.task.images.filter(Boolean)
    if (!images.length) return
    applyToolboxReferencesToStudio({
        prompt: payload.task.recipe.mainPrompt || payload.task.prompt,
        references: images.map((image, index) => ({
            image,
            role: payload.role,
            label: `${roleLabel(payload.role)}${index + 1}`,
            note: payload.role === 'outfit'
                ? '由工具箱换装结果回流，作为服装、材质和造型参考。'
                : '由工具箱结果回流，作为人物身份或主体参考。'
        }))
    })
}

const addTaskToCanvas = (task: GenerationTask) => {
    const title = task.source === 'text' ? '文生图任务' : '参考图任务'
    addImagesToCanvas(task.images, 'result', title, task.recipe.mainPrompt || task.prompt)
}

const activeGenerationTasks = computed(() => generationTasks.value.filter(task => task.status === 'running'))
const displayLoading = computed(() => activeGenerationTasks.value.length > 0)
const selectedHistoryItem = computed(() =>
    generationHistory.value.find(item => item.id === selectedGenerationHistoryId.value) || null
)
const selectedFailedTask = computed(() =>
    generationTasks.value.find(task => task.id === selectedFailedTaskId.value && task.status === 'error') || null
)

const displayResults = computed(() => {
    if (selectedFailedTask.value) return []
    if (selectedHistoryItem.value) return selectedHistoryItem.value.images
    if (latestResultSource.value === 'image') return result.value
    if (latestResultSource.value === 'text') return textToImageResult.value
    return result.value.length > 0 ? result.value : textToImageResult.value
})

const displayError = computed(() => {
    if (selectedFailedTask.value) return selectedFailedTask.value.error || selectedFailedTask.value.redactedErrorSummary || '生成失败'
    if (selectedHistoryItem.value) {
        const warningCount = selectedHistoryItem.value.imagePersistenceWarnings?.length || 0
        return warningCount
            ? `这次生成有 ${warningCount} 张图片未能保存为本地副本，远端链接可能会过期。`
            : null
    }
    const latestErroredTask = generationTasks.value.find(task => task.status === 'error')
    if (latestErroredTask?.error && !displayResults.value.length) return latestErroredTask.error
    if (latestResultSource.value === 'image') return error.value
    if (latestResultSource.value === 'text') return textToImageError.value
    return error.value || textToImageError.value
})

const canPushDisplayResult = computed(() => Boolean(displayResults.value.length > 0))
const selectedCurrentImage = computed(() =>
    displayResults.value[clampHistoryImageIndex(displayResults.value, selectedGenerationImageIndex.value)] || ''
)
const selectedResultTitle = computed(() => {
    if (selectedFailedTask.value) return selectedFailedTask.value.title
    if (selectedHistoryItem.value) return selectedHistoryItem.value.source === 'image' ? '图生图结果' : '文生图结果'
    if (latestResultSource.value === 'image') return '图生图结果'
    if (latestResultSource.value === 'text') return '文生图结果'
    return ''
})
const selectedResultPrompt = computed(() =>
    selectedFailedTask.value?.prompt || selectedHistoryItem.value?.prompt || latestGenerationRecipe.value?.compiledPrompt || ''
)
const selectedResultRevisedPrompt = computed(() => {
    const item = selectedHistoryItem.value
    if (item) {
        return item.imageDetails?.[selectedGenerationImageIndex.value]?.revisedPrompt || item.revisedPrompt || ''
    }
    return selectedFailedTask.value?.imageDetails?.[selectedGenerationImageIndex.value]?.revisedPrompt || selectedFailedTask.value?.revisedPrompt || ''
})
const selectedResultCreatedAt = computed(() => selectedFailedTask.value?.createdAt || selectedHistoryItem.value?.createdAt || 0)
const selectedResultMeta = computed(() => {
    const record = selectedFailedTask.value || selectedHistoryItem.value
    if (!record) return []

    return [
        record.model || '模型未记录',
        record.aspectRatio || '比例未记录',
        record.imageSize || '尺寸未记录',
        `${record.count || record.images.length || 1} 张`,
        record.durationMs !== undefined ? `${(record.durationMs / 1000).toFixed(1)} 秒` : '耗时未记录'
    ]
})

const canGenerateTextImage = computed(
    () =>
        apiKey.value.trim() &&
        effectiveApiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        textToImagePrompt.value.trim() &&
        selectedImages.value.length === 0
)

const isReferenceCountWithinModelLimit = computed(() =>
    selectedModelMaxInputImages.value <= 0 ||
    selectedImages.value.length <= selectedModelMaxInputImages.value
)

const canGenerate = computed(
    () =>
        apiKey.value.trim() &&
        effectiveApiEndpoint.value.trim() &&
        selectedModel.value.trim() &&
        selectedImages.value.length > 0 &&
        isReferenceCountWithinModelLimit.value &&
        (textToImagePrompt.value.trim() || selectedStyle.value || customPrompt.value.trim())
)

const generationMode = computed(() => resolveGenerationMode(selectedImages.value.length))

const canRunGeneration = computed(() =>
    generationMode.value === 'image' ? Boolean(canGenerate.value) : Boolean(canGenerateTextImage.value)
)

const hasRunningGenerationTask = computed(() =>
    generationMode.value === 'image' ? isLoading.value : isTextToImageLoading.value
)

const generationActionLabel = computed(() =>
    buildGenerationActionLabel(generationMode.value, hasRunningGenerationTask.value)
)

const generationBlockingReason = computed(() => {
    if (!apiKey.value.trim()) return '请先配置 API Key。'
    if (!effectiveApiEndpoint.value.trim()) return '请先配置生图 API 端点。'
    if (!selectedModel.value.trim()) return '请先选择模型。'
    if (selectedImages.value.length > 0 && !isReferenceCountWithinModelLimit.value) {
        return `当前模型最多支持 ${selectedModelMaxInputImages.value} 张参考图，请移除多余图片。`
    }
    if (selectedImages.value.length > 0 && !(textToImagePrompt.value.trim() || selectedStyle.value || customPrompt.value.trim())) {
        return '请先输入提示词或选择模板。'
    }
    if (selectedImages.value.length === 0 && !textToImagePrompt.value.trim()) return '请先输入提示词。'
    return ''
})

const shouldShowGenerationBlockingReason = computed(() =>
    Boolean(generationBlockingReason.value) &&
    (
        selectedImages.value.length > 0 ||
        textToImagePrompt.value.trim().length > 0 ||
        selectedStyle.value.trim().length > 0 ||
        customPrompt.value.trim().length > 0
    )
)

const generationActionTitle = computed(() =>
    generationBlockingReason.value || (
        generationMode.value === 'image'
            ? '使用当前参考图和提示词进行图生图'
            : '不使用参考图，按当前提示词进行文生图'
    )
)

const promptAssistantReady = computed(
    () =>
        Boolean(promptAssistantApiKey.value.trim()) &&
        Boolean(effectivePromptAssistantEndpoint.value.trim()) &&
        Boolean(effectivePromptAssistantModel.value.trim())
)

const canImprovePrompt = computed(
    () =>
        promptAssistantReady.value &&
        textToImagePrompt.value.trim() &&
        !isPromptAssistantLoading.value
)

const canTranslatePrompt = computed(
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
const portraitAssistUiState = computed(() =>
    resolvePortraitAssistUiState(portraitAssistAvailable.value, portraitAssistEnabled.value)
)
const portraitAssistButtonTitle = computed(() => portraitAssistIconTitle(portraitAssistUiState.value))

const portraitAssistPrompt = computed(() => {
    const characterRefs = selectedImages.value
        .map((_, index) => ({ index, meta: normalizeReferenceMeta(referenceImageMetadata.value[index], index) }))
        .filter(item => item.meta.role === 'character')
    const promptReferences = (characterRefs.length
        ? characterRefs
        : selectedImages.value.map((_, index) => ({ index, meta: normalizeReferenceMeta(referenceImageMetadata.value[index], index) })))
        .map(item => ({ index: item.index, label: item.meta.label }))

    return buildPortraitAssistPrompt({
        enabled: portraitAssistEnabled.value,
        available: portraitAssistAvailable.value,
        references: promptReferences,
        pose: portraitPose.value,
        relation: portraitRelation.value,
        extraPrompt: portraitExtraPrompt.value
    })
})

watch(portraitAssistAvailable, available => {
    if (!available) portraitAssistEnabled.value = false
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
const generationCountOptions = computed(() =>
    Array.from({ length: selectedModelMaxGenerations.value }, (_, index) => index + 1)
)
const generationBatchModeOptions: Array<{ label: string; value: GenerationBatchMode }> = [
    { label: '补齐多张', value: 'fill' },
    { label: '单次请求', value: 'single' }
]
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
const availableStyleTemplates = computed(() => allStyleTemplates.value)
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
    Boolean(effectivePromptAssistantEndpoint.value.trim()) &&
    Boolean(effectivePromptAssistantModel.value.trim())
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
            endpoint: resolveChatCompletionsEndpoint(effectivePromptAssistantEndpoint.value, DEFAULT_PROMPT_ASSISTANT_ENDPOINT),
            model: effectivePromptAssistantModel.value,
            task: 'translate-template',
            targetLanguage,
            useProxy: promptAssistantUseProxy.value,
            proxyToken: promptAssistantUseProxy.value ? promptAssistantProxyToken.value.trim() : ''
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
            endpoint: resolveChatCompletionsEndpoint(effectivePromptAssistantEndpoint.value, DEFAULT_PROMPT_ASSISTANT_ENDPOINT),
            model: effectivePromptAssistantModel.value,
            useProxy: promptAssistantUseProxy.value,
            proxyToken: promptAssistantUseProxy.value ? promptAssistantProxyToken.value.trim() : ''
        }
        const response = await improvePrompt(request)
        textToImagePrompt.value = response.prompt
    } catch (assistantError) {
        promptAssistantError.value = assistantError instanceof Error ? assistantError.message : '提示词助手调用失败'
    } finally {
        isPromptAssistantLoading.value = false
    }
}

const handleTranslatePrompt = async () => {
    if (!canTranslatePrompt.value) return

    isPromptAssistantLoading.value = true
    promptAssistantError.value = null

    try {
        promptPhraseUndoStack.value = [...promptPhraseUndoStack.value, textToImagePrompt.value]
        const request: PromptAssistantRequest = {
            prompt: textToImagePrompt.value.trim(),
            context: buildPromptAssistantContext(),
            apikey: promptAssistantApiKey.value.trim(),
            endpoint: resolveChatCompletionsEndpoint(effectivePromptAssistantEndpoint.value, DEFAULT_PROMPT_ASSISTANT_ENDPOINT),
            model: effectivePromptAssistantModel.value,
            task: 'translate-prompt',
            targetLanguage: 'zh',
            useProxy: promptAssistantUseProxy.value,
            proxyToken: promptAssistantUseProxy.value ? promptAssistantProxyToken.value.trim() : ''
        }
        const response = await improvePrompt(request)
        textToImagePrompt.value = response.prompt
    } catch (assistantError) {
        promptAssistantError.value = assistantError instanceof Error ? assistantError.message : '提示词翻译失败'
    } finally {
        isPromptAssistantLoading.value = false
    }
}

const handleToolboxImageToPrompt = async (toolRequest: Pick<PromptAssistantRequest, 'prompt' | 'context' | 'images' | 'task'>) => {
    if (!promptAssistantReady.value) {
        toolboxPanelRef.value?.setAnalysisError('请先配置提示词助手 API，并确认模型支持读取图片。')
        return
    }

    isToolboxAssistantLoading.value = true

    try {
        const response = await improvePrompt({
            prompt: toolRequest.prompt || '',
            context: toolRequest.context || '',
            images: toolRequest.images || [],
            task: 'image-to-prompt',
            apikey: promptAssistantApiKey.value.trim(),
            endpoint: resolveChatCompletionsEndpoint(effectivePromptAssistantEndpoint.value, DEFAULT_PROMPT_ASSISTANT_ENDPOINT),
            model: effectivePromptAssistantModel.value,
            useProxy: promptAssistantUseProxy.value,
            proxyToken: promptAssistantUseProxy.value ? promptAssistantProxyToken.value.trim() : ''
        })
        toolboxPanelRef.value?.setAnalysisResult(response.prompt)
    } catch (assistantError) {
        toolboxPanelRef.value?.setAnalysisError(assistantError instanceof Error ? assistantError.message : '图片反推失败')
    } finally {
        isToolboxAssistantLoading.value = false
    }
}

const sendToolboxPromptToStudio = (prompt: string) => {
    const nextPrompt = prompt.trim()
    if (!nextPrompt) return
    promptPhraseUndoStack.value = [...promptPhraseUndoStack.value, textToImagePrompt.value]
    setTextToImagePromptFromHistory(nextPrompt)
    currentView.value = 'studio'
}

const openTemplateEditorFromToolboxPrompt = (prompt: string) => {
    const nextPrompt = prompt.trim()
    if (!nextPrompt) return

    closeTemplateEditor()
    templateFormTitle.value = nextPrompt.slice(0, 16) || '工具箱模板'
    templateFormCategory.value = '工具箱'
    templateFormTags.value = '工具箱, 反推'
    templateFormDescription.value = '从工具箱提示词保存。'
    templateFormPrompt.value = nextPrompt
    templateFormPromptEn.value = ''
    templateFormSourceLanguage.value = detectTemplateSourceLanguage(nextPrompt)
    templateAssistantError.value = null
    templateFormMode.value = 'both'
    showTemplateEditor.value = true
}

const applyToolboxReferencesToStudio = (payload: { prompt: string; references: ToolboxReference[] }) => {
    const references = payload.references.filter(reference => reference.image)
    const nextPrompt = payload.prompt.trim()

    if (nextPrompt) {
        promptPhraseUndoStack.value = [...promptPhraseUndoStack.value, textToImagePrompt.value]
        setTextToImagePromptFromHistory(nextPrompt)
    }

    if (references.length) {
        const currentMetaByImage = new Map(selectedImages.value.map((image, index) => [image, normalizeReferenceMeta(referenceImageMetadata.value[index], index)]))
        const currentLabelByImage = new Map(selectedImages.value.map((image, index) => [image, referenceImageLabels.value[index] || currentMetaByImage.get(image)?.label || `角色${index + 1}`]))
        const incomingMetaByImage = new Map(references.map(reference => [
            reference.image,
            {
                role: reference.role,
                label: reference.label,
                note: reference.note || ''
            } satisfies ReferenceImageMeta
        ]))
        const nextImages = [...references.map(reference => reference.image), ...selectedImages.value]
            .filter((image, index, list) => list.indexOf(image) === index)

        selectedImages.value = nextImages
        referenceImageLabels.value = nextImages.map((image, index) => incomingMetaByImage.get(image)?.label || currentLabelByImage.get(image) || `角色${index + 1}`)
        referenceImageMetadata.value = nextImages.map((image, index) => incomingMetaByImage.get(image) || currentMetaByImage.get(image) || normalizeReferenceRecipeMeta(undefined, index))
    }

    currentView.value = 'studio'
    workspaceMode.value = 'quick'
}

const handleToolboxGenerate = async (payload: ToolboxGeneratePayload) => {
    const prompt = payload.prompt.trim()
    const references = payload.references.filter(reference => reference.image)

    if (!prompt || !references.length) {
        toolboxPanelRef.value?.setAnalysisError('工具箱生成需要提示词和至少一张参考图。')
        return
    }

    if (!apiKey.value.trim() || !apiEndpoint.value.trim() || !selectedModel.value.trim()) {
        toolboxPanelRef.value?.setAnalysisError('请先在顶部配置生图 API、端点和模型。')
        return
    }

    const referenceImages = references.map(reference => reference.image)
    const referenceMetadata = references.map(reference => ({
        role: reference.role,
        label: reference.label,
        note: reference.note || ''
    } satisfies ReferenceImageMeta))
    const referenceLabels = references.map((reference, index) => reference.label || `工具箱参考${index + 1}`)
    const recipe = buildGenerationRecipe(prompt, prompt, referenceImages, referenceMetadata, referenceLabels)
    const task = {
        ...createGenerationTask('image', prompt, recipe),
        origin: 'toolbox' as const,
        toolboxTool: payload.tool || 'prompt',
        toolboxReferences: references,
        toolboxAssetId: payload.assetId,
        toolboxAssetName: payload.assetName,
        title: `${payload.title || '工具箱生成'} #${generationTasks.value.length + 1}`
    }

    generationTasks.value = [task, ...generationTasks.value]
    toolboxGenerationError.value = null
    syncGenerationLoadingState()

    try {
        const request = buildGenerateRequest(prompt, referenceImages, generationCount.value)
        attachGenerationRequestSnapshot(task, request)
        await savePendingGenerationTask(task, request)
        const response = await generateImage(request, 1, {
            onTaskCreated: handle => trackGenerationTaskHandle(task, request, handle)
        })
        await completeGenerationTask(task, response)
        toolboxPanelRef.value?.setToolboxNotice('success', '工具箱生成完成，结果已进入历史记录。')
    } catch (toolboxError) {
        const message = toolboxError instanceof Error ? toolboxError.message : '工具箱生成失败'
        await failGenerationTask(task, message)
        toolboxGenerationResults.value = []
        toolboxGenerationError.value = message
        toolboxPanelRef.value?.setToolboxNotice('error', message)
    } finally {
        syncGenerationLoadingState()
    }
}

const getReferencePayloadField = (provider: string, referenceCount: number) => {
    if (!referenceCount) return '无'
    if (provider === 'openai-chat') return 'messages[].content[].image_url'
    if (provider === 'openai-image') return 'image'
    if (provider === 'openai-image-edit') return showDoraverseImageProxyControls.value && referenceCount === 1 ? 'multipart image' : 'multipart image[]'
    if (provider === 'grsai') return 'images'
    if (provider === 'grsai-draw') return 'images + urls'
    return '未发送'
}

const generationRequestLimit = computed(() =>
    generationBatchMode.value === 'fill' ? generationCount.value : 1
)

const requestImageCountParam = computed(() =>
    requestProviderType.value === 'openai-image-edit' && !showDoraverseImageProxyControls.value
        ? 'not sent'
        : String(generationCount.value)
)

const generationRequestSummary = computed(() => {
    if (requestProviderType.value === 'openai-image-edit') {
        if (showDoraverseImageProxyControls.value) {
            return generationBatchMode.value === 'single'
                ? `图片编辑模式：单次请求，n=${generationCount.value}`
                : `图片编辑模式：补齐多张，最多 ${generationRequestLimit.value} 次请求，首请求 n=${generationCount.value}`
        }

        if (generationBatchMode.value === 'single') {
            return '图片编辑兼容模式：单次请求，不发送 n'
        }

        return `图片编辑兼容模式：不发送 n，最多 ${generationRequestLimit.value} 次单张请求补齐`
    }

    if (generationBatchMode.value === 'single') {
        return `单次请求，n=${generationCount.value}`
    }

    return `补齐多张，最多 ${generationRequestLimit.value} 次请求，首请求 n=${generationCount.value}`
})

const buildRequestDiagnosticText = () => {
    const diagnostic = requestDiagnostic.value
    const references = selectedImages.value.map((_, index) => {
        const meta = normalizeReferenceMeta(referenceImageMetadata.value[index], index)
        return `${index + 1}. ${roleLabel(meta.role)} / ${meta.label}${meta.note ? ` / ${meta.note}` : ''}`
    })

    return buildDiagnosticReport({
        title: 'Vistack 请求诊断',
        visibleError: displayError.value,
        userAgent: navigator.userAgent,
        details: [
            `view: ${currentView.value}/${workspaceMode.value}`,
            `online: ${navigator.onLine ? 'yes' : 'no'}`,
            `configuredEndpoint: ${sanitizeDiagnosticUrl(effectiveApiEndpoint.value)}`,
            `endpoint: ${sanitizeDiagnosticUrl(diagnostic.endpoint)}`,
            `provider: ${diagnostic.provider}`,
            `proxy: ${apiUseProxy.value ? 'on' : 'off'}`,
            diagnostic.proxyStream ? `proxyStream: ${diagnostic.proxyStream}` : '',
            `model: ${effectiveSelectedModel.value}`,
            `referenceCount: ${selectedImages.value.length}`,
            `referencePayloadField: ${diagnostic.payloadField}`,
            `batchMode: ${generationBatchMode.value}`,
            `generationRequests: ${generationRequestLimit.value}`,
            `n: ${requestImageCountParam.value}`,
            `aspectRatio: ${diagnostic.sentAspectRatio || 'not sent'}`,
            `imageSize: ${diagnostic.sentImageSize || 'not sent'}`,
            showDoraverseImageProxyControls.value ? `quality: ${imageQuality.value}` : '',
            showDoraverseImageProxyControls.value ? `autoPrompt: ${imageAutoPrompt.value}` : '',
            showDoraverseImageProxyControls.value ? `translate: ${imageTranslate.value}` : '',
            diagnostic.outputSize ? `outputSize: ${diagnostic.outputSize}` : '',
            diagnostic.warning ? `warning: ${diagnostic.warning}` : '',
            references.length ? `references:\n${references.join('\n')}` : 'references: none',
            `promptPreview:\n${promptPreview.value || ''}`
        ]
    })
}

const copyRequestDiagnostic = async () => {
    const text = buildRequestDiagnosticText()
    try {
        await navigator.clipboard.writeText(text)
        diagnosticCopyStatus.value = '已复制'
    } catch {
        diagnosticCopyStatus.value = '复制失败'
    }

    window.setTimeout(() => {
        diagnosticCopyStatus.value = ''
    }, 1800)
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

const resolvedGenerationEndpoint = computed(() =>
    resolveImageGenerationEndpoint(
        effectiveApiEndpoint.value,
        effectiveSelectedModel.value,
        selectedImages.value.length > 0
    )
)

const requestProviderType = computed(() => {
    const path = getEndpointPath(resolvedGenerationEndpoint.value)
    if (path.endsWith('/images/generations')) return 'openai-image'
    if (path.endsWith('/images/edits')) return 'openai-image-edit'
    if (path.endsWith('/v1/api/generate') || path.endsWith('/api/generate')) return 'grsai'
    if (path.includes('/draw/') && !path.endsWith('/draw/result')) return 'grsai-draw'
    return 'openai-chat'
})

const requestRouteWarning = computed(() => {
    const rawPath = getEndpointPath(effectiveApiEndpoint.value)
    const isExplicitChatEndpoint = rawPath.endsWith('/chat/completions') || rawPath.endsWith('/completions') || rawPath.endsWith('/responses')
    if (isExplicitChatEndpoint && isCurrentGptImageModel.value) {
        return '当前填的是完整 Chat endpoint；Vistack 会保持原样，不会自动切到 Images API。'
    }

    if (isExplicitChatEndpoint && selectedImages.value.length > 0 && requestProviderType.value === 'openai-chat') {
        return '当前完整 Chat endpoint 将通过 messages[].content[].image_url 发送参考图，不会使用 Images Edit multipart。'
    }

    if (isCurrentLjqclubImageEndpoint.value && isCurrentGptImageModel.value) {
        return 'ljqclub.com channel sends ratio only; upstream uses auto resolution and does not support custom pixels / 2K / 4K.'
    }

    return ''
})

const requestDiagnostic = computed(() => {
    const provider = requestProviderType.value
    const referenceCount = selectedImages.value.length
    const field = getReferencePayloadField(provider, referenceCount)
    const aspectRatio = showAspectRatioSelector.value ? selectedAspectRatio.value : ''
    const imageSize = showImageSizeConfig.value ? gemini3ImageSize.value : ''
    const outputSize = getDiagnosticOutputSize(provider, selectedImageModelType.value, aspectRatio, imageSize)
    const referenceLimitWarning = referenceCount > 0 &&
        selectedModelMaxInputImages.value > 0 &&
        referenceCount > selectedModelMaxInputImages.value
        ? `参考图超过当前模型上限 ${selectedModelMaxInputImages.value} 张`
        : ''
    const referenceRouteWarning = referenceCount && field === '未发送'
        ? '当前路由不会发送参考图。'
        : ''
    const providerLabelMap: Record<string, string> = {
        'openai-chat': 'Chat multimodal',
        'openai-image': 'Images API',
        'openai-image-edit': 'Images Edit',
        grsai: 'Grsai generate',
        'grsai-draw': 'Grsai draw'
    }

    return {
        endpoint: resolvedGenerationEndpoint.value,
        provider,
        providerLabel: providerLabelMap[provider] || provider,
        proxyStream: apiUseProxy.value && provider === 'openai-image-edit' ? 'ndjson' : '',
        sentAspectRatio: shouldSendPixelSizeAsGrsaiAspectRatio(provider, selectedImageModelType.value) ? outputSize : aspectRatio,
        sentImageSize: shouldSendPixelSizeAsGrsaiAspectRatio(provider, selectedImageModelType.value) ? '' : imageSize,
        outputSize,
        referenceSummary: referenceCount
            ? `${referenceCount} 张，将进入 ${field}`
            : '0 张，当前是文生图',
        requestSummary: generationRequestSummary.value,
        payloadField: field,
        warning: requestRouteWarning.value || referenceLimitWarning || referenceRouteWarning
    }
})

const selectedDiagnosticRecord = computed(() => selectedFailedTask.value || selectedHistoryItem.value)
const selectedDiagnosticTitle = computed(() => selectedDiagnosticRecord.value ? '所选生成诊断' : '下一次请求检查')
const selectedDiagnosticProviderLabel = computed(() => {
    const record = selectedDiagnosticRecord.value
    if (!record) return requestDiagnostic.value.providerLabel
    return record.requestProvider || record.actualParams?.provider || '未记录'
})
const selectedDiagnosticReferenceSummary = computed(() => {
    const record = selectedDiagnosticRecord.value
    if (!record) return requestDiagnostic.value.referenceSummary
    const count = record.actualParams?.referenceCount ?? record.recipe?.referenceImages?.length
    return count === undefined ? '未记录' : `${count} 张`
})
const selectedDiagnosticRequestSummary = computed(() => {
    const record = selectedDiagnosticRecord.value
    if (!record) return requestDiagnostic.value.requestSummary
    const requestCount = record.actualParams?.requestCount
    const countParam = record.actualParams?.n
    if (requestCount === undefined && countParam === undefined) return '旧记录未保存实际请求参数'
    return `${requestCount ?? 1} 次请求 · n=${countParam ?? '未记录'}`
})
const selectedDiagnosticEndpoint = computed(() => {
    const record = selectedDiagnosticRecord.value
    if (!record) return requestDiagnostic.value.endpoint
    return record.actualParams?.resolvedEndpoint || sanitizeDiagnosticUrl(record.resolvedEndpoint || record.endpoint)
})

const getDiagnosticOutputSize = (provider: string, modelType: string, aspectRatio: string, imageSize: string) => {
    if (!aspectRatio) return ''
    if ((provider === 'openai-image' || provider === 'openai-image-edit') && isCurrentLjqclubImageEndpoint.value) {
        return 'auto'
    }
    if (provider === 'openai-image' || provider === 'openai-image-edit' || modelType === 'gpt-image') {
        if (provider === 'grsai' || provider === 'grsai-draw') {
            return aspectRatioToGrsaiGptImageSize(aspectRatio, imageSize || '1K')
        }
        if (shouldUseDoraverseGptImageSize.value) {
            return aspectRatioToDoraverseGptImageSize(aspectRatio)
        }
        return aspectRatioToOpenAiImageSize(aspectRatio, imageSize || '1K')
    }
    if (modelType === 'gemini-3-pro-image' || modelType === 'nano-banana') {
        return aspectRatioToGeminiSize(aspectRatio, imageSize || '1K')
    }
    return ''
}

const shouldSendPixelSizeAsGrsaiAspectRatio = (provider: string, modelType: string) => {
    return (provider === 'grsai' || provider === 'grsai-draw') && modelType === 'gpt-image'
}

const selectedModelOption = computed(() => {
    const currentId = selectedModel.value.trim()
    return modelOptions.value.find(option => option.id === currentId)
})

const selectedModelMaxGenerations = computed(() =>
    Math.min(Math.max(selectedModelOption.value?.maxGenerations || 4, 1), 12)
)

const selectedModelMaxInputImages = computed(() =>
    Math.max(selectedModelOption.value?.maxInputImages || 0, 0)
)

const selectedModelSupportedSizes = computed(() =>
    [...new Set((selectedModelOption.value?.supportedSizes || []).map(size => size.trim()).filter(Boolean))]
)

const selectedModelSupportedResolutions = computed(() =>
    normalizeResolutionValues(selectedModelOption.value?.supportedResolutions) || []
)

const selectedModelSizeFormat = computed(() =>
    (selectedModelOption.value?.sizeFormat || '').toLowerCase()
)

const selectedModelHasSizeMetadata = computed(() =>
    selectedModelSupportedSizes.value.length > 0
)

const selectedModelHasResolutionMetadata = computed(() =>
    typeof selectedModelOption.value?.hasResolution === 'boolean'
        ? selectedModelOption.value.hasResolution
        : selectedModelSupportedResolutions.value.length > 0
)

const showDoraverseImageProxyControls = computed(() =>
    isDoraverseImageProxyEndpoint(effectiveApiEndpoint.value)
)

const sizeControlLabel = computed(() =>
    selectedModelSizeFormat.value === 'absolute' || selectedModelSizeFormat.value === 'named'
        ? '尺寸'
        : '比例'
)

const imageSizeOptions = computed(() => {
    const resolutions = selectedModelSupportedResolutions.value
    if (resolutions.length > 0) {
        return resolutions.map(value => ({
            value,
            label: formatResolutionOptionLabel(value)
        }))
    }

    return [
        { value: '1K', label: '1K 标准' },
        { value: '2K', label: '2K 高清' },
        { value: '4K', label: '4K 超清' }
    ]
})

const imageQualityOptions = [
    { value: 'auto', label: 'auto' },
    { value: 'low', label: 'low' },
    { value: 'medium', label: 'medium' },
    { value: 'high', label: 'high' }
]

const selectedModelProfileText = computed(() => [
    selectedModel.value,
    selectedModelOption.value?.label,
    selectedModelOption.value?.description
].filter(Boolean).join(' ').toLowerCase())

const isCurrentGrsaiEndpoint = computed(() => isGrsaiEndpoint(effectiveApiEndpoint.value))
const isCurrentLjqclubImageEndpoint = computed(() => isLjqclubImageEndpoint(effectiveApiEndpoint.value))
const isCurrentGptImageModel = computed(() => isOpenAiImageModelId(selectedModelProfileText.value))
const isCurrentDoraverseMetapiEndpoint = computed(() =>
    isDoraverseImageProxyEndpoint(effectiveApiEndpoint.value)
)

// Show ratio controls for image models that accept aspect ratio or mapped sizes.
const showAspectRatioSelector = computed(() => {
    if (selectedModelHasSizeMetadata.value) return true

    const modelText = selectedModelProfileText.value
    if (!modelText) return false

    const segments = selectedModel.value.toLowerCase().trim().split('/')
    const normalizedId = segments[segments.length - 1]
    return normalizedId === 'gemini-2.5-flash-image' ||
           normalizedId === 'gemini-2.5-flash-image-preview' ||
           modelText.includes('gemini-3-pro-image') ||
           modelText.includes('gemini-3-pro') ||
           modelText.includes('gemini-3.1-pro') ||
           modelText.includes('nano-banana') ||
           isCurrentGptImageModel.value ||
           isCurrentGrsaiEndpoint.value
})


const selectedImageModelType = computed(() => {
    const modelText = selectedModelProfileText.value
    if (modelText.includes('nano-banana')) return 'nano-banana'
    if (isCurrentGptImageModel.value) return 'gpt-image'
    if (modelText.includes('gemini-3-pro-image') || modelText.includes('gemini-3-pro') || modelText.includes('gemini-3.1-pro')) return 'gemini-3-pro-image'
    return 'default'
})

const shouldUseDoraverseGptImageSize = computed(() =>
    isCurrentDoraverseMetapiEndpoint.value &&
    selectedImageModelType.value === 'gpt-image' &&
    /^gpt-image-2\b/i.test(effectiveSelectedModel.value.trim())
)

const supportsImageSizeConfig = computed(() => {
    const modelText = selectedModelProfileText.value
    if (!modelText) return false
    if (isCurrentLjqclubImageEndpoint.value && isCurrentGptImageModel.value) return false
    if (isCurrentGptImageModel.value) return true
    if (selectedImageModelType.value === 'nano-banana' || selectedImageModelType.value === 'gemini-3-pro-image') return true
    if (/\b[24]k\b/i.test(modelText)) return true
    return isCurrentGrsaiEndpoint.value
})

const baseAspectRatioOptions = [
    ...buildAspectRatioOptions(baseAspectRatioResolutionMap)
]

const isAspectRatioSize = (size: string): boolean =>
    /^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(size.trim())

const buildResolutionAwareAspectRatioOptions = (sizes: string[], sizeData: Record<string, string>) =>
    sizes.map(size => ({
        value: size,
        label: sizeData[size] ? `${size} - ${sizeData[size]}` : formatModelSizeOptionLabel(size)
    }))

const getCurrentAspectRatioResolutionData = (): Record<string, string> | null => {
    const imageSize = normalizeImageResolution(gemini3ImageSize.value)

    if (isCurrentLjqclubImageEndpoint.value && selectedImageModelType.value === 'gpt-image') {
        return null
    }

    if (selectedImageModelType.value === 'gemini-3-pro-image' || selectedImageModelType.value === 'nano-banana') {
        return geminiAspectRatioResolutionData[imageSize] || null
    }

    if (selectedImageModelType.value === 'gpt-image') {
        if (requestProviderType.value === 'grsai' || requestProviderType.value === 'grsai-draw') {
            return grsaiGptImageAspectRatioResolutionData[imageSize] || null
        }

        if (shouldUseDoraverseGptImageSize.value) {
            return doraverseGptImageAspectRatioResolutionMap
        }

        return openAiAspectRatioResolutionData[imageSize] || null
    }

    if (selectedModelSizeFormat.value === 'ratio' && selectedModelHasResolutionMetadata.value) {
        return geminiAspectRatioResolutionData[imageSize] || baseAspectRatioResolutionMap
    }

    return null
}

const availableAspectRatios = computed(() => {
    const sizeData = getCurrentAspectRatioResolutionData()

    if (selectedModelSupportedSizes.value.length > 0) {
        if (
            sizeData &&
            selectedModelSupportedResolutions.value.length > 0 &&
            selectedModelSupportedSizes.value.every(isAspectRatioSize)
        ) {
            return buildResolutionAwareAspectRatioOptions(selectedModelSupportedSizes.value, sizeData)
        }

        return selectedModelSupportedSizes.value.map(size => ({
            value: size,
            label: formatModelSizeOptionLabel(size)
        }))
    }

    return sizeData ? buildAspectRatioOptions(sizeData) : baseAspectRatioOptions
})

const showImageSizeConfig = computed(() => {
    if (selectedModelOption.value && (
        selectedModelSupportedSizes.value.length > 0 ||
        selectedModelSupportedResolutions.value.length > 0 ||
        typeof selectedModelOption.value.hasResolution === 'boolean'
    )) {
        return selectedModelHasResolutionMetadata.value
    }

    return supportsImageSizeConfig.value
})

const applySelectedModelParameterDefaults = (preferDefaults = false) => {
    const sizes = availableAspectRatios.value.map(option => option.value)
    const defaultSize = selectedModelOption.value?.defaultSize || ''
    if (preferDefaults && sizes.length && defaultSize && sizes.includes(defaultSize)) {
        selectedAspectRatio.value = defaultSize
    } else if (sizes.length && !sizes.includes(selectedAspectRatio.value)) {
        selectedAspectRatio.value = defaultSize && sizes.includes(defaultSize) ? defaultSize : sizes[0]
    }

    const resolutions = imageSizeOptions.value.map(option => option.value)
    const defaultResolution = normalizeImageResolution(selectedModelOption.value?.defaultResolution || '')
    const currentResolution = normalizeImageResolution(gemini3ImageSize.value)
    if (preferDefaults && resolutions.length && defaultResolution && resolutions.includes(defaultResolution)) {
        gemini3ImageSize.value = defaultResolution
    } else if (resolutions.length && currentResolution && resolutions.includes(currentResolution)) {
        gemini3ImageSize.value = currentResolution
    } else if (resolutions.length && !resolutions.includes(currentResolution)) {
        gemini3ImageSize.value = defaultResolution && resolutions.includes(defaultResolution) ? defaultResolution : resolutions[0]
    }

    if (generationCount.value > selectedModelMaxGenerations.value) {
        generationCount.value = selectedModelMaxGenerations.value
    }
}

watch(
    () => selectedModelOption.value?.id,
    () => {
        applySelectedModelParameterDefaults(true)
    },
    { immediate: false }
)

watch(
    [availableAspectRatios, imageSizeOptions, selectedModelMaxGenerations],
    () => {
        applySelectedModelParameterDefaults()
    },
    { immediate: false }
)

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
        if (!selectedGenerationHistoryId.value) {
            selectedGenerationHistoryId.value = selectInitialHistoryId(generationHistory.value)
            selectedGenerationImageIndex.value = 0
        }
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
    persistence?: Awaited<ReturnType<typeof persistGeneratedImages>>,
    task?: GenerationTask
) => {
    if (!images.length) return

    const createdAt = Date.now()
    const item: GenerationHistoryItem = {
        id: task ? `history-${task.id}` : `${source}-${createdAt}`,
        source,
        prompt,
        model: task?.model || effectiveSelectedModel.value,
        endpoint: task?.endpoint || effectiveApiEndpoint.value,
        resolvedEndpoint: task?.resolvedEndpoint,
        requestProvider: task?.requestProvider,
        aspectRatio: task?.aspectRatio || selectedAspectRatio.value,
        imageSize: task?.imageSize || gemini3ImageSize.value,
        count: task?.count || recipe.count,
        batchMode: task?.batchMode || recipe.batchMode,
        useProxy: task?.useProxy,
        createdAt,
        images,
        imageIds: persistence?.imageIds,
        rawImageUrls: persistence?.rawImageUrls,
        imagePersistenceWarnings: persistence?.warnings,
        recipe,
        actualParams: task?.actualParams,
        imageDetails: task?.imageDetails,
        revisedPrompt: task?.revisedPrompt,
        durationMs: task?.durationMs,
        redactedErrorSummary: task?.redactedErrorSummary
    }

    generationHistory.value = [item, ...generationHistory.value.filter(existing => existing.id !== item.id)]
    selectedGenerationHistoryId.value = item.id
    selectedGenerationImageIndex.value = 0
    selectedFailedTaskId.value = ''

    try {
        await putGenerationHistoryItem(item)
    } catch (historyError) {
        console.warn('无法保存生成历史:', historyError)
    }
}

const stripApiKeyFromRequest = (request: GenerateRequest): Omit<GenerateRequest, 'apikey' | 'proxyToken'> => {
    const { apikey, proxyToken, ...requestWithoutKey } = request
    void apikey
    void proxyToken
    return requestWithoutKey
}

const uniqueTaskHandles = (handles: GenerationTaskHandle[]) => {
    const seen = new Set<string>()
    return handles.filter(handle => {
        const key = `${handle.provider}:${handle.resultEndpoint}:${handle.taskId}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

const attachGenerationRequestSnapshot = (task: GenerationTask, request: GenerateRequest) => {
    const provider = task.requestProvider || requestDiagnostic.value.provider
    const isCompatibilityEdit = provider === 'openai-image-edit' &&
        !isDoraverseImageProxyEndpoint(task.resolvedEndpoint || task.endpoint)
    const actualParams = buildGenerationActualParams(request, {
        provider,
        resolvedEndpoint: task.resolvedEndpoint || requestDiagnostic.value.endpoint,
        requestCount: request.batchMode === 'fill' ? request.count || 1 : 1,
        n: isCompatibilityEdit ? 'not sent' : request.count || 1,
        outputSize: requestDiagnostic.value.outputSize,
        referencePayloadField: getReferencePayloadField(provider, request.images.length)
    })

    task.actualParams = actualParams
    updateGenerationTask(task.id, { actualParams })
}

const savePendingGenerationTask = async (task: GenerationTask, request: GenerateRequest, handles = pendingTaskHandles.get(task.id) || []) => {
    const nextHandles = uniqueTaskHandles(handles)
    pendingTaskHandles.set(task.id, nextHandles)

    const currentTask = generationTasks.value.find(item => item.id === task.id) || task
    const item: PendingGenerationTaskItem = {
        id: task.id,
        task: {
            ...currentTask,
            status: 'running',
            error: undefined
        },
        request: stripApiKeyFromRequest(request),
        handles: nextHandles,
        createdAt: task.createdAt,
        updatedAt: Date.now()
    }

    try {
        await putPendingGenerationTaskItem(item)
    } catch (pendingError) {
        console.warn('无法保存待恢复生成任务:', pendingError)
    }
}

const removePendingGenerationTask = async (taskId: string) => {
    pendingTaskHandles.delete(taskId)
    try {
        await deletePendingGenerationTaskItem(taskId)
    } catch (pendingError) {
        console.warn('无法清理待恢复生成任务:', pendingError)
    }
}

const trackGenerationTaskHandle = async (task: GenerationTask, request: GenerateRequest, handle: GenerationTaskHandle) => {
    const nextHandles = uniqueTaskHandles([...(pendingTaskHandles.get(task.id) || []), handle])
    pendingTaskHandles.set(task.id, nextHandles)
    await savePendingGenerationTask(task, request, nextHandles)
}

const completeGenerationTask = async (task: GenerationTask, response: GenerateResponse) => {
    const persisted = await persistGeneratedImages(response.imageUrls, task.useProxy, task.proxyToken)
    const durationMs = Math.max(Date.now() - task.createdAt, 0)
    const warningMessage = persisted.warnings.length
        ? `生成成功，但有 ${persisted.warnings.length} 张图片未能保存为本地副本，远端链接可能会过期。`
        : null

    if (task.origin === 'toolbox') {
        toolboxGenerationResults.value = persisted.images
        toolboxGenerationError.value = warningMessage
    } else if (task.source === 'text') {
        textToImageResult.value = persisted.images
        textToImageError.value = warningMessage
        syncImagesToCanvas(persisted.images, 'result', '文生图结果', task.recipe.mainPrompt || task.prompt)
    } else {
        result.value = persisted.images
        error.value = warningMessage
        syncImagesToCanvas(persisted.images, 'result', '参考图结果', task.recipe.mainPrompt || task.prompt)
    }

    if (task.origin !== 'toolbox') {
        latestResultSource.value = task.source
        latestGenerationRecipe.value = task.recipe
    }
    task.imageDetails = response.imageDetails
    task.revisedPrompt = response.revisedPrompt
    task.durationMs = durationMs
    updateGenerationTask(task.id, {
        status: 'done',
        images: persisted.images,
        error: undefined,
        imageDetails: response.imageDetails,
        revisedPrompt: response.revisedPrompt,
        durationMs
    })
    await addGenerationHistory(task.source, task.prompt, persisted.images, task.recipe, persisted, task)
    await removePendingGenerationTask(task.id)
}

const failGenerationTask = async (task: GenerationTask, message: string) => {
    const durationMs = Math.max(Date.now() - task.createdAt, 0)
    const redactedErrorSummary = summarizeDiagnosticError(message)
    if (task.origin === 'toolbox') {
        toolboxGenerationError.value = message
    } else if (task.source === 'text') {
        textToImageError.value = message
    } else {
        error.value = message
    }

    task.durationMs = durationMs
    task.redactedErrorSummary = redactedErrorSummary
    updateGenerationTask(task.id, { status: 'error', error: message, durationMs, redactedErrorSummary })
    if (task.origin !== 'toolbox') {
        selectedFailedTaskId.value = task.id
        selectedGenerationHistoryId.value = ''
        selectedGenerationImageIndex.value = 0
    }
    await removePendingGenerationTask(task.id)
}

const restorePendingGenerationTasks = async () => {
    const pendingItems = await getPendingGenerationTaskItems()
    if (!pendingItems.length) return

    const existingIds = new Set(generationTasks.value.map(task => task.id))
    const restoredTasks = pendingItems
        .filter(item => !existingIds.has(item.task.id))
        .map(item => ({
            ...item.task,
            status: 'running' as const,
            error: undefined
        }))

    if (restoredTasks.length) {
        generationTasks.value = [...restoredTasks, ...generationTasks.value]
    }

    for (const item of pendingItems) {
        pendingTaskHandles.set(item.id, uniqueTaskHandles(item.handles || []))
        void resumePendingGenerationTask(item)
    }

    syncGenerationLoadingState()
}

const resumePendingGenerationTask = async (item: PendingGenerationTaskItem) => {
    if (pendingResumeIds.has(item.id)) return
    pendingResumeIds.add(item.id)

    const task = {
        ...item.task,
        status: 'running' as const,
        error: undefined
    }

    const handles = uniqueTaskHandles(item.handles || [])
    if (!handles.length) {
        await failGenerationTask(task, '刷新发生在平台任务 ID 返回前，Vistack 无法自动找回这次任务。可以在中转后台查看结果。')
        pendingResumeIds.delete(item.id)
        syncGenerationLoadingState()
        return
    }

    const savedApiKey = apiKey.value.trim() || LocalStorage.getApiKey().trim()
    if (!savedApiKey) {
        updateGenerationTask(task.id, { status: 'error', error: '需要先填写 API Key，才能恢复查询刷新前的生成任务。' })
        pendingResumeIds.delete(item.id)
        syncGenerationLoadingState()
        return
    }

    try {
        const settled = await Promise.allSettled(handles.map(handle => pollGeneratedTask(handle, savedApiKey)))
        const imageUrls = settled.flatMap(result => result.status === 'fulfilled' ? result.value.imageUrls : [])

        if (imageUrls.length > 0) {
            const responses = settled
                .filter((result): result is PromiseFulfilledResult<GenerateResponse> => result.status === 'fulfilled')
                .map(result => result.value)
            const imageDetails = responses.flatMap(response => response.imageDetails || [])
            await completeGenerationTask(task, {
                imageUrls: imageUrls.slice(0, task.count || imageUrls.length),
                imageDetails: imageDetails.length ? imageDetails : undefined,
                revisedPrompt: responses.find(response => response.revisedPrompt)?.revisedPrompt
            })
            return
        }

        const firstError = settled.find((result): result is PromiseRejectedResult => result.status === 'rejected')?.reason
        const message = firstError instanceof Error ? firstError.message : '刷新前的生成任务没有返回图片。'
        await failGenerationTask(task, message)
    } catch (resumeError) {
        const message = resumeError instanceof Error ? resumeError.message : '刷新前的生成任务恢复失败。'
        await failGenerationTask(task, message)
    } finally {
        pendingResumeIds.delete(item.id)
        syncGenerationLoadingState()
    }
}

const historyCategories = computed(() =>
    Array.from(new Set(generationHistory.value.map(item => item.category).filter(Boolean) as string[]))
)

const collectionOptions = computed(() =>
    Array.from(new Set([...assetCollections.value, ...historyCategories.value])).filter(Boolean)
)

const favoriteHistory = computed(() => generationHistory.value.filter(item => item.favorite))
const recentGenerationHistory = computed(() =>
    generationHistory.value.filter(item => item.images.some(Boolean)).slice(0, 6)
)
const formatHistoryListTime = (timestamp: number) => new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}).format(new Date(timestamp))

const allHistoryAssets = computed(() => buildHistoryAssets(generationHistory.value, {
    filter: 'all',
    search: '',
    sort: 'newest'
}))
const favoriteHistoryAssetCount = computed(() => allHistoryAssets.value.filter(asset => asset.item.favorite).length)

const filteredHistoryAssets = computed(() => buildHistoryAssets(generationHistory.value, {
    filter: historyFilter.value,
    search: assetSearch.value,
    sort: assetSort.value
}))

const selectedHistoryAssets = computed(() =>
    allHistoryAssets.value.filter(asset => selectedAssetIds.value.includes(asset.id))
)

const updateHistoryItem = async (nextItem: GenerationHistoryItem) => {
    generationHistory.value = generationHistory.value.map(item => (item.id === nextItem.id ? nextItem : item))
    if (selectedGenerationHistoryId.value === nextItem.id) {
        selectedGenerationImageIndex.value = clampHistoryImageIndex(nextItem.images, selectedGenerationImageIndex.value)
    }
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

const applyGenerationRecipe = (recipe: GenerationRecipe | undefined, fallbackPrompt = '') => {
    textToImagePrompt.value = recipe?.mainPrompt || fallbackPrompt
    customPrompt.value = recipe?.customPrompt || ''
    selectedStyle.value = recipe?.selectedStyle || ''
    generationCount.value = recipe?.count || 1
    generationBatchMode.value = recipe?.batchMode || 'fill'

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
    generationBatchMode.value = item.batchMode || item.recipe?.batchMode || 'fill'
    currentView.value = 'studio'
    workspaceMode.value = 'quick'
}

const selectHistoryItem = (item: GenerationHistoryItem, imageIndex = 0) => {
    selectedGenerationHistoryId.value = item.id
    selectedGenerationImageIndex.value = clampHistoryImageIndex(item.images, imageIndex)
    selectedFailedTaskId.value = ''
}

const selectFailedTask = (task: GenerationTask) => {
    if (task.status !== 'error') return
    selectedFailedTaskId.value = task.id
    selectedGenerationHistoryId.value = ''
    selectedGenerationImageIndex.value = 0
}

const selectFailedTaskFromToolbox = (task: GenerationTask) => {
    selectFailedTask(task)
    currentView.value = 'studio'
    workspaceMode.value = 'quick'
}

const dismissGenerationTask = (task: GenerationTask) => {
    generationTasks.value = generationTasks.value.filter(item => item.id !== task.id)
    if (selectedFailedTaskId.value === task.id) {
        selectedFailedTaskId.value = ''
        selectedGenerationHistoryId.value = selectInitialHistoryId(generationHistory.value)
        selectedGenerationImageIndex.value = 0
    }
    syncGenerationLoadingState()
}

const selectDisplayImage = (imageIndex: number) => {
    selectedGenerationImageIndex.value = clampHistoryImageIndex(displayResults.value, imageIndex)
}

const openHistoryPreview = (item: GenerationHistoryItem, image = item.images[0] || '') => {
    historyPreviewItem.value = item
    historyPreviewImage.value = image
    historyPreviewOriginalMode.value = false
    historyPromptCopyStatus.value = ''
}

const closeHistoryPreview = () => {
    historyPreviewItem.value = null
    historyPreviewImage.value = ''
    historyPreviewOriginalMode.value = false
    historyPromptCopyStatus.value = ''
}

const copyHistoryPrompt = async (item: GenerationHistoryItem) => {
    try {
        await navigator.clipboard.writeText(item.prompt)
        historyPromptCopyStatus.value = '已复制'
    } catch {
        historyPromptCopyStatus.value = '复制失败'
    }

    window.setTimeout(() => {
        historyPromptCopyStatus.value = ''
    }, 1800)
}

const copyHistoryDiagnostic = async (item: GenerationHistoryItem, image: string) => {
    const imageIndex = Math.max(item.images.indexOf(image), 0)
    const imageDetail = item.imageDetails?.[imageIndex]
    const references = item.recipe?.referenceImages?.map((_, index) => {
        const meta = normalizeReferenceRecipeMeta(item.recipe?.referenceImageMetadata?.[index], index)
        return `${index + 1}. ${roleLabel(meta.role)} / ${meta.label}${meta.note ? ` / ${meta.note}` : ''}`
    }) || []

    const text = buildDiagnosticReport({
        title: 'Vistack 历史生成信息',
        userAgent: navigator.userAgent,
        details: [
            `historyId: ${item.id}`,
            `historyCreatedAt: ${formatDiagnosticTimestamp(item.createdAt)}`,
            `selectedImageIndex: ${imageIndex + 1}`,
            `source: ${item.source}`,
            `configuredEndpoint: ${sanitizeDiagnosticUrl(item.endpoint)}`,
            `resolvedEndpoint: ${sanitizeDiagnosticUrl(item.resolvedEndpoint || item.endpoint)}`,
            `provider: ${item.requestProvider || 'unknown'}`,
            `model: ${item.model}`,
            `proxy: ${item.useProxy ? 'on' : 'off'}`,
            `aspectRatio: ${item.aspectRatio}`,
            `imageSize: ${item.imageSize}`,
            `count: ${item.count || item.images.length}`,
            `batchMode: ${item.batchMode || item.recipe?.batchMode || 'fill'}`,
            `referenceCount: ${item.recipe?.referenceImages?.length || 0}`,
            item.durationMs !== undefined ? `durationMs: ${item.durationMs}` : 'durationMs: not recorded',
            ...Object.entries(item.actualParams || {}).map(([key, value]) => `actual.${key}: ${String(value)}`),
            references.length ? `references:\n${references.join('\n')}` : 'references: none',
            item.imagePersistenceWarnings?.length ? `saveWarnings:\n${item.imagePersistenceWarnings.join('\n')}` : '',
            item.redactedErrorSummary ? `redactedErrorSummary: ${item.redactedErrorSummary}` : '',
            imageDetail?.revisedPrompt ? `imageRevisedPrompt:\n${imageDetail.revisedPrompt}` : '',
            item.revisedPrompt ? `revisedPrompt:\n${item.revisedPrompt}` : '',
            `prompt:\n${item.prompt}`
        ]
    })

    try {
        await navigator.clipboard.writeText(text)
        diagnosticCopyStatus.value = '已复制'
    } catch {
        diagnosticCopyStatus.value = '复制失败'
    }

    window.setTimeout(() => {
        diagnosticCopyStatus.value = ''
    }, 1800)
}

const copyTaskDiagnostic = async (task: GenerationTask) => {
    const text = buildDiagnosticReport({
        title: 'Vistack 失败任务诊断',
        capturedAt: formatDiagnosticTimestamp(task.createdAt),
        visibleError: task.redactedErrorSummary || task.error,
        userAgent: navigator.userAgent,
        details: [
            `taskId: ${task.id}`,
            `source: ${task.source}`,
            `configuredEndpoint: ${sanitizeDiagnosticUrl(task.endpoint)}`,
            `resolvedEndpoint: ${sanitizeDiagnosticUrl(task.resolvedEndpoint || task.endpoint)}`,
            `provider: ${task.requestProvider || task.actualParams?.provider || 'unknown'}`,
            `model: ${task.model}`,
            `aspectRatio: ${task.aspectRatio}`,
            `imageSize: ${task.imageSize}`,
            `count: ${task.count}`,
            `batchMode: ${task.batchMode || task.recipe.batchMode || 'fill'}`,
            task.durationMs !== undefined ? `durationMs: ${task.durationMs}` : 'durationMs: not recorded',
            ...Object.entries(task.actualParams || {}).map(([key, value]) => `actual.${key}: ${String(value)}`),
            `prompt:\n${task.prompt}`
        ]
    })

    try {
        await navigator.clipboard.writeText(text)
        diagnosticCopyStatus.value = '已复制'
    } catch {
        diagnosticCopyStatus.value = '复制失败'
    }

    window.setTimeout(() => {
        diagnosticCopyStatus.value = ''
    }, 1800)
}

const copySelectedGenerationDiagnostic = () => {
    if (selectedFailedTask.value) return copyTaskDiagnostic(selectedFailedTask.value)
    if (selectedHistoryItem.value) return copyHistoryDiagnostic(selectedHistoryItem.value, selectedCurrentImage.value)
    return copyRequestDiagnostic()
}

const deleteHistoryItem = async (item: GenerationHistoryItem) => {
    generationHistory.value = generationHistory.value.filter(historyItem => historyItem.id !== item.id)
    if (selectedGenerationHistoryId.value === item.id) {
        selectedGenerationHistoryId.value = selectInitialHistoryId(generationHistory.value)
        selectedGenerationImageIndex.value = 0
        if (!selectedGenerationHistoryId.value) {
            result.value = []
            textToImageResult.value = []
            latestResultSource.value = null
            latestGenerationRecipe.value = null
        }
    }
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

const toggleAssetSelectionMode = () => {
    assetSelectionMode.value = !assetSelectionMode.value
    selectedAssetIds.value = []
    assetDownloadStatus.value = ''
}

const toggleAssetSelection = (assetId: string) => {
    selectedAssetIds.value = selectedAssetIds.value.includes(assetId)
        ? selectedAssetIds.value.filter(id => id !== assetId)
        : [...selectedAssetIds.value, assetId]
}

const requestDeleteHistoryImage = (asset: HistoryAsset) => {
    pendingHistoryDelete.value = { item: asset.item, imageIndex: asset.index }
}

const requestDeleteHistoryGroup = (item: GenerationHistoryItem) => {
    pendingHistoryDelete.value = { item }
}

const confirmPendingHistoryDelete = async () => {
    const pending = pendingHistoryDelete.value
    if (!pending) return

    pendingHistoryDelete.value = null
    if (pending.imageIndex === undefined) {
        await deleteHistoryItem(pending.item)
        return
    }

    await deleteHistoryImageAt(pending.item, pending.imageIndex)
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
        attachGenerationRequestSnapshot(task, request)
        await savePendingGenerationTask(task, request)
        const response = await generateImage(request, 1, {
            onTaskCreated: handle => trackGenerationTaskHandle(task, request, handle)
        })
        await completeGenerationTask(task, response)
    } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败'
        await failGenerationTask(task, message)
    } finally {
        syncGenerationLoadingState()
    }
}

const handlePushDisplayResult = (image: string) => {
    pushImageToUpload(image)
}

const handleReuseCurrentRecipe = () => {
    if (selectedHistoryItem.value) {
        reuseHistoryRecipe(selectedHistoryItem.value)
        return
    }
    if (selectedFailedTask.value) {
        reuseTaskPrompt(selectedFailedTask.value)
        return
    }
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

const imageExtension = (image: string, blob?: Blob) => {
    const dataMatch = image.match(/^data:image\/([a-zA-Z0-9+.-]+);/)
    if (dataMatch?.[1]) return dataMatch[1]
    const blobMatch = blob?.type.match(/^image\/([a-zA-Z0-9+.-]+)$/)
    return blobMatch?.[1] || 'png'
}

const downloadImageFile = async (
    image: string,
    timestamp: number,
    sequence: number,
    total: number,
    openFallback: boolean
) => {
    if (!image || typeof window === 'undefined') return false

    let downloadUrl = image
    let revokeUrl: string | null = null

    try {
        let downloadedBlob: Blob | undefined
        if (!image.startsWith('data:')) {
            const response = await fetchImageForDownload(image)
            if (!response.ok) throw new Error(`图片下载失败：HTTP ${response.status}`)
            downloadedBlob = await response.blob()
            downloadUrl = URL.createObjectURL(downloadedBlob)
            revokeUrl = downloadUrl
        }

        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = buildAssetDownloadFilename(timestamp, sequence, total, imageExtension(image, downloadedBlob))
        link.rel = 'noopener'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return true
    } catch {
        if (openFallback) window.open(image, '_blank', 'noopener')
        return false
    } finally {
        if (revokeUrl) URL.revokeObjectURL(revokeUrl)
    }
}

const handleDownloadResult = async (image: string) => {
    const item = selectedHistoryItem.value
    const imageIndex = item ? Math.max(item.images.indexOf(image), 0) : 0
    await downloadImageFile(image, item?.createdAt || Date.now(), imageIndex + 1, item?.images.length || 1, true)
}

const downloadHistoryAsset = async (asset: HistoryAsset) => {
    await downloadImageFile(asset.image, asset.item.createdAt, asset.index + 1, asset.item.images.length, true)
}

const downloadHistoryPreview = async () => {
    const item = historyPreviewItem.value
    if (!item) return
    const imageIndex = Math.max(item.images.indexOf(historyPreviewImage.value), 0)
    await downloadImageFile(historyPreviewImage.value, item.createdAt, imageIndex + 1, item.images.length, true)
}

const downloadSelectedAssets = async () => {
    if (isBatchDownloadingAssets.value || !selectedHistoryAssets.value.length) return

    const assets = [...selectedHistoryAssets.value]
    const timestamp = Date.now()
    let initiated = 0
    isBatchDownloadingAssets.value = true
    assetDownloadStatus.value = assets.length > 1 ? '浏览器可能会询问是否允许多个文件下载。' : ''

    try {
        for (let index = 0; index < assets.length; index += 1) {
            assetDownloadStatus.value = `正在发起 ${index + 1}/${assets.length}`
            const succeeded = await downloadImageFile(assets[index].image, timestamp, index + 1, assets.length, false)
            if (succeeded) initiated += 1
        }

        const failed = assets.length - initiated
        assetDownloadStatus.value = failed
            ? `已发起 ${initiated} 个，${failed} 个失败`
            : `已发起 ${initiated} 个下载`
    } finally {
        isBatchDownloadingAssets.value = false
    }
}

const fetchImageForDownload = (image: string) => {
    if (!apiUseProxy.value) {
        return fetch(image)
    }

    const token = LocalStorage.getApiProxyToken().trim()
    const proxyUrl = token ? `/api/proxy?token=${encodeURIComponent(token)}` : '/api/proxy'
    return fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            target: image,
            method: 'GET',
            headers: {
                Accept: 'image/*,*/*'
            }
        })
    })
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
        attachGenerationRequestSnapshot(task, request)
        await savePendingGenerationTask(task, request)
        const response = await generateImage(request, 1, {
            onTaskCreated: handle => trackGenerationTaskHandle(task, request, handle)
        })
        await completeGenerationTask(task, response)
    } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败'
        await failGenerationTask(task, message)
    } finally {
        syncGenerationLoadingState()
    }
}

const handleGenerationAction = () =>
    generationMode.value === 'image' ? handleGenerate() : handleTextToImageGenerate()

</script>
