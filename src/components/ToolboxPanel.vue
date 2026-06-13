<template>
    <main class="wb-shell py-4 pb-10">
        <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p class="wb-label text-brand-accent">Tool Lab</p>
                <h2 class="mt-1 text-2xl font-semibold text-brand-ink dark:text-brand-surface">创作工具箱</h2>
                <p class="mt-2 max-w-3xl text-sm leading-6 text-brand-muted dark:text-night-muted">
                    把图片反推、模特资产、换装和遮罩集中到这里。自定义模特、换装和遮罩可以直接在工具箱内生成，也可以送回创作台继续精修。
                </p>
            </div>
            <div class="flex flex-wrap gap-2">
                <button type="button" class="wb-secondary" @click="$emit('back-to-studio')">返回创作台</button>
                <button type="button" class="wb-primary" :disabled="!draftPrompt.trim()" @click="sendDraftToStudio">送回创作台</button>
            </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
            <aside class="space-y-2">
                <button
                    v-for="tool in tools"
                    :key="tool.id"
                    type="button"
                    @click="activeTool = tool.id"
                    :class="[
                        'w-full rounded-lg border p-3 text-left transition active:scale-[0.99]',
                        activeTool === tool.id
                            ? 'border-brand-accent bg-brand-accent/10'
                            : 'border-brand-line bg-white hover:border-brand-muted hover:bg-brand-surface dark:border-night-muted/35 dark:bg-night-panel dark:hover:border-night-muted'
                    ]"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-sm font-semibold text-brand-ink dark:text-brand-surface">{{ tool.title }}</p>
                            <p class="mt-1 text-xs leading-5 text-brand-muted dark:text-night-muted">{{ tool.description }}</p>
                        </div>
                        <span
                            :class="[
                                'shrink-0 rounded-md px-1.5 py-1 text-[11px] font-semibold',
                                tool.ready ? 'bg-brand-accent text-brand-surface' : 'bg-brand-line text-brand-muted dark:bg-night-muted/20 dark:text-night-muted'
                            ]"
                        >
                            {{ tool.ready ? '可用' : '规划中' }}
                        </span>
                    </div>
                </button>
            </aside>

            <section class="min-w-0 rounded-lg border border-brand-line bg-white p-4 shadow-sm shadow-black/5 dark:border-night-muted/35 dark:bg-night-panel">
                <div v-if="activeTool === 'image-to-prompt'" class="space-y-4">
                    <div class="flex flex-col gap-2 border-b border-brand-line pb-4 dark:border-night-muted/35 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p class="wb-label text-brand-accent">Image to prompt</p>
                            <h3 class="mt-1 text-lg font-semibold text-brand-ink dark:text-brand-surface">图片反推生图提示词</h3>
                            <p class="mt-1 text-sm leading-6 text-brand-muted dark:text-night-muted">
                                上传图片后，用提示词助手模型分析画面，整理成可直接用于生图的提示词、画面要素和负面约束。
                            </p>
                        </div>
                        <span :class="['rounded-md border px-2.5 py-1 text-xs font-semibold', assistantReady ? 'border-brand-accent/25 bg-brand-accent/10 text-brand-accent' : 'border-brand-line bg-brand-surface text-brand-muted']">
                            {{ assistantReady ? '助手已配置' : '需要视觉助手模型' }}
                        </span>
                    </div>

                    <div class="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
                        <div class="space-y-3">
                            <label class="block">
                                <span class="mb-1 block wb-label">上传分析图片</span>
                                <input class="wb-input w-full py-2 text-sm" type="file" accept="image/*" multiple @change="handleReverseImageUpload" />
                            </label>

                            <ImageGrid :images="uploadedImages" title="反推图片" @preview="previewImage = $event" @remove="removeUploadedImage" />

                            <label class="block">
                                <span class="mb-1 block wb-label">反推输出</span>
                                <select v-model="reversePromptMode" class="wb-input w-full">
                                    <option value="structured">结构化提示词</option>
                                    <option value="direct">直接可用长提示词</option>
                                    <option value="tags">短词组 / 标签</option>
                                    <option value="template">可复用模板</option>
                                </select>
                            </label>

                            <label class="block">
                                <span class="mb-1 block wb-label">补充要求</span>
                                <textarea
                                    v-model="imagePromptInstruction"
                                    class="wb-input min-h-[108px] w-full resize-y py-2 text-sm leading-6"
                                    placeholder="例如：偏真实手机镜头；重点反推服装、动作、构图；生成适合 nano banana 的中文提示词。"
                                />
                            </label>

                            <button
                                type="button"
                                :disabled="!canAnalyzeImage"
                                :class="primaryActionClass(canAnalyzeImage)"
                                @click="analyzeImages"
                            >
                                {{ analyzing ? '正在反推...' : '反推提示词' }}
                            </button>
                            <p v-if="error" class="rounded-md border border-brand-accent/30 bg-brand-accent/10 px-2 py-1 text-xs leading-5 text-brand-accent">{{ error }}</p>
                        </div>

                        <div class="flex min-h-[420px] flex-col">
                            <div class="mb-2 flex items-center justify-between gap-2">
                                <span class="wb-label">反推结果</span>
                                <div class="flex gap-2">
                                    <button type="button" class="wb-secondary min-h-8 px-2 text-xs" :disabled="!reversePrompt.trim()" @click="copyReversePrompt">复制</button>
                                    <button type="button" class="wb-secondary min-h-8 px-2 text-xs" :disabled="!reversePrompt.trim()" @click="appendReversePrompt">加入提示词</button>
                                </div>
                            </div>
                            <textarea
                                v-model="reversePrompt"
                                class="wb-input min-h-[360px] flex-1 resize-y py-3 text-sm leading-6"
                                placeholder="反推结果会显示在这里。你可以直接修改，再加入右侧提示词或送回创作台。"
                            />
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTool === 'model-asset'" class="space-y-4">
                    <ToolHeader
                        eyebrow="Model asset"
                        title="自定义模特资产"
                        description="把同一个人物的参考图整理成稳定角色资产，生成三视图或多角度提示词，并带着角色语义回到创作台。"
                    />

                    <div class="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
                        <div class="space-y-3">
                            <div v-if="modelAssets.length" class="rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-surface">
                                <div class="mb-2 flex items-center justify-between gap-2">
                                    <p class="wb-label">已保存模特</p>
                                    <button type="button" class="wb-secondary min-h-8 px-2 text-xs" @click="loadModelAssets">刷新</button>
                                </div>
                                <div class="grid gap-2 sm:grid-cols-2">
                                    <button
                                        v-for="asset in modelAssets"
                                        :key="asset.id"
                                        type="button"
                                        class="group rounded-lg border border-brand-line bg-white p-2 text-left transition hover:border-brand-accent/60 dark:border-night-muted/35 dark:bg-night-panel"
                                        @click="loadModelAsset(asset)"
                                    >
                                        <div class="flex gap-2">
                                            <img :src="asset.images[0]" :alt="asset.name" class="h-12 w-12 shrink-0 rounded-md object-cover" />
                                            <div class="min-w-0">
                                                <p class="truncate text-sm font-semibold text-brand-ink dark:text-brand-surface">
                                                    {{ asset.name }}
                                                    <span v-if="selectedModelAssetId === asset.id" class="text-brand-accent"> · 当前</span>
                                                </p>
                                                <p class="text-[11px] leading-5 text-brand-muted dark:text-night-muted">{{ asset.images.length }} 张参考 · {{ formatAssetDate(asset.updatedAt) }}</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <label class="block">
                                <span class="mb-1 block wb-label">模特名称 / 角色分组</span>
                                <input v-model="modelAssetName" class="wb-input w-full" placeholder="例如：角色1 / 品牌女模特 / 主理人" />
                            </label>

                            <label class="block">
                                <span class="mb-1 block wb-label">上传身份参考图</span>
                                <input class="wb-input w-full py-2 text-sm" type="file" accept="image/*" multiple @change="handleModelAssetUpload" />
                            </label>
                            <ImageGrid :images="modelAssetImages" title="模特参考" @preview="previewImage = $event" @remove="removeModelAssetImage" />

                            <div class="grid gap-3 sm:grid-cols-2">
                                <label class="block">
                                    <span class="mb-1 block wb-label">输出目标</span>
                                    <select v-model="modelAssetMode" class="wb-input w-full">
                                        <option value="face-angle-pack">面部角度组</option>
                                        <option value="turnaround">身体三视图</option>
                                        <option value="portrait-pack">表情头像组</option>
                                        <option value="pose-pack">姿态设定组</option>
                                    </select>
                                </label>
                                <label class="block">
                                    <span class="mb-1 block wb-label">构图范围</span>
                                    <select v-model="modelAssetFraming" class="wb-input w-full">
                                        <option value="auto">跟随输出目标</option>
                                        <option value="bust">胸像 / 头像</option>
                                        <option value="half-body">半身</option>
                                        <option value="full-body">全身</option>
                                    </select>
                                </label>
                            </div>

                            <div class="rounded-lg border border-brand-line bg-brand-surface p-3 text-sm leading-6 text-brand-muted dark:border-night-muted/35 dark:bg-night-surface dark:text-night-muted">
                                <p class="font-semibold text-brand-ink dark:text-brand-surface">{{ activeModelAssetMode.title }}</p>
                                <p class="mt-1">{{ activeModelAssetMode.description }}</p>
                                <p class="mt-2 text-xs">{{ activeModelAssetMode.avoid }}</p>
                            </div>

                            <div class="grid gap-3 sm:grid-cols-2">
                                <label class="block">
                                    <span class="mb-1 block wb-label">画面风格</span>
                                    <select v-model="modelAssetStyle" class="wb-input w-full">
                                        <option value="realistic">真实棚拍</option>
                                        <option value="phone">手机实拍</option>
                                        <option value="catalog">电商模特图</option>
                                    </select>
                                </label>
                                <label class="block">
                                    <span class="mb-1 block wb-label">后续用途</span>
                                    <select v-model="modelAssetUsage" class="wb-input w-full">
                                        <option value="general">通用角色资产</option>
                                        <option value="outfit">一键换装 / 服装试穿</option>
                                        <option value="portrait">自拍 / 近景人像</option>
                                        <option value="commercial">电商 / 商业主图</option>
                                        <option value="couple">合影 / 多人图</option>
                                        <option value="story">连续剧情 / 多场景</option>
                                    </select>
                                </label>
                            </div>

                            <div class="grid gap-3 sm:grid-cols-2">
                                <label class="block">
                                    <span class="mb-1 block wb-label">面部保真强度</span>
                                    <select v-model="modelAssetFidelity" class="wb-input w-full">
                                        <option value="balanced">平衡：允许自然变化</option>
                                        <option value="high">高：优先保持同一张脸</option>
                                        <option value="strict">严格：强身份锚定</option>
                                    </select>
                                </label>
                                <div class="rounded-lg border border-brand-line bg-brand-surface p-3 text-xs leading-5 text-brand-muted dark:border-night-muted/35 dark:bg-night-surface dark:text-night-muted">
                                    <p class="font-semibold text-brand-ink dark:text-brand-surface">{{ activeModelAssetUsage.title }}</p>
                                    <p class="mt-1">{{ activeModelAssetUsage.description }}</p>
                                </div>
                            </div>

                            <label class="block">
                                <span class="mb-1 block wb-label">补充约束 / 禁用变化项</span>
                                <textarea
                                    v-model="modelAssetNotes"
                                    class="wb-input min-h-[108px] w-full resize-y py-2 text-sm leading-6"
                                    placeholder="例如：不要改发型和年龄感；保留淡妆、肤色和温和气质；换装时只换衣服，不改脸和身材比例。"
                                />
                            </label>
                        </div>

                        <div class="space-y-3">
                            <div class="rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-surface">
                                <p class="wb-label">工作方式</p>
                                <p class="mt-2 text-sm leading-6 text-brand-muted dark:text-night-muted">
                                    建议先生成“面部角度组”锁定身份，再按需要生成身体三视图或姿态组。工具箱会把参考图标记成“人物/角色”，并生成适合主生图模型的模特资产提示词。
                                </p>
                            </div>
                            <textarea
                                v-model="modelAssetPrompt"
                                class="wb-input min-h-[250px] w-full resize-y py-3 text-sm leading-6"
                                placeholder="点击下方按钮生成模特资产提示词，也可以手动编辑。"
                            />
                            <div class="grid gap-2 sm:grid-cols-2">
                                <button type="button" class="wb-secondary" @click="buildModelAssetPrompt">生成提示词</button>
                                <button type="button" class="wb-primary" :disabled="!canGenerateModelAsset" @click="generateModelAsset">直接生成</button>
                                <button type="button" class="wb-primary" :disabled="!canApplyModelAsset" @click="applyModelAssetToStudio">{{ selectedModelAssetId ? '调用模特到创作台' : '带参考图送回' }}</button>
                                <button type="button" class="wb-secondary" :disabled="!canSaveModelAsset" @click="saveModelAsset">保存模特</button>
                                <button type="button" class="wb-secondary text-brand-accent" :disabled="!selectedModelAssetId" @click="deleteSelectedModelAsset">删除当前保存</button>
                            </div>
                            <p v-if="assetStatus" class="rounded-md border border-brand-line bg-brand-surface px-2 py-1 text-xs text-brand-muted dark:border-night-muted/35 dark:bg-night-surface dark:text-night-muted">{{ assetStatus }}</p>
                        </div>
                    </div>
                </div>

                <div v-else-if="activeTool === 'outfit-swap'" class="space-y-4">
                    <ToolHeader
                        eyebrow="Outfit swap"
                        title="一键换装准备"
                        description="把人物参考、服装参考和保留项整理成稳定换装请求。现阶段走现有生图模型，不增加额外成本。"
                    />

                    <div class="grid gap-4 lg:grid-cols-2">
                        <div class="space-y-3">
                            <label class="block">
                                <span class="mb-1 block wb-label">人物参考图</span>
                                <input class="wb-input w-full py-2 text-sm" type="file" accept="image/*" multiple @change="handleOutfitCharacterUpload" />
                            </label>
                            <ImageGrid :images="outfitCharacterImages" title="人物参考" @preview="previewImage = $event" @remove="removeOutfitCharacterImage" />

                            <label class="block">
                                <span class="mb-1 block wb-label">服装参考图</span>
                                <input class="wb-input w-full py-2 text-sm" type="file" accept="image/*" multiple @change="handleOutfitUpload" />
                            </label>
                            <ImageGrid :images="outfitImages" title="服装参考" @preview="previewImage = $event" @remove="removeOutfitImage" />

                            <label class="block">
                                <span class="mb-1 block wb-label">服装文字描述</span>
                                <textarea
                                    v-model="outfitDescription"
                                    class="wb-input min-h-[92px] w-full resize-y py-2 text-sm leading-6"
                                    placeholder="没有服装参考图时可写：白色棒球服、黑色短裙、银色高跟鞋、通勤西装等。"
                                />
                            </label>

                            <label class="block">
                                <span class="mb-1 block wb-label">服装采用策略</span>
                                <select v-model="outfitClothingStrategy" class="wb-input w-full">
                                    <option value="auto">自动：参考图优先，文字补充</option>
                                    <option value="reference-first">严格跟随服装参考图</option>
                                    <option value="description-first">严格跟随文字描述</option>
                                    <option value="merge">融合参考图和文字描述</option>
                                </select>
                            </label>
                        </div>

                        <div class="space-y-3">
                            <div>
                                <p class="mb-2 wb-label">保留项</p>
                                <div class="grid gap-2 sm:grid-cols-2">
                                    <label v-for="option in outfitPreserveOptions" :key="option.value" class="flex items-start gap-2 rounded-lg border border-brand-line bg-brand-surface p-2 text-sm dark:border-night-muted/35 dark:bg-night-surface">
                                        <input v-model="outfitPreserve" type="checkbox" :value="option.value" class="mt-1 accent-brand-accent" />
                                        <span>
                                            <span class="block font-semibold text-brand-ink dark:text-brand-surface">{{ option.label }}</span>
                                            <span class="text-xs leading-5 text-brand-muted dark:text-night-muted">{{ option.description }}</span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div class="grid gap-3 sm:grid-cols-2">
                                <label class="block">
                                    <span class="mb-1 block wb-label">背景处理</span>
                                    <select v-model="outfitBackgroundMode" class="wb-input w-full">
                                        <option value="keep">尽量保留原背景</option>
                                        <option value="studio">替换为干净棚拍背景</option>
                                        <option value="street">替换为街拍环境</option>
                                    </select>
                                </label>
                                <label class="block">
                                    <span class="mb-1 block wb-label">输出气质</span>
                                    <select v-model="outfitOutputStyle" class="wb-input w-full">
                                        <option value="realistic">真实自然</option>
                                        <option value="campaign">商业大片</option>
                                        <option value="lookbook">服装 Lookbook</option>
                                    </select>
                                </label>
                            </div>

                            <textarea
                                v-model="outfitPrompt"
                                class="wb-input min-h-[220px] w-full resize-y py-3 text-sm leading-6"
                                placeholder="点击下方按钮生成换装提示词，也可以手动编辑。"
                            />
                            <div class="grid gap-2 sm:grid-cols-2">
                                <button type="button" class="wb-secondary" @click="buildOutfitPrompt">生成提示词</button>
                                <button type="button" class="wb-primary" :disabled="!canGenerateOutfitSwap" @click="generateOutfitSwap">直接生成</button>
                                <button type="button" class="wb-primary" :disabled="!canApplyOutfitSwap" @click="applyOutfitToStudio">{{ outfitApplyLabel }}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="space-y-4">
                    <ToolHeader
                        eyebrow="Mask edit"
                        title="遮罩编辑"
                        description="在本地画布涂抹需要修改的区域，导出黑白遮罩后可直接生成局部编辑，也可作为参考约束送回创作台。"
                    />

                    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div class="space-y-3">
                            <label class="block">
                                <span class="mb-1 block wb-label">上传底图</span>
                                <input class="wb-input w-full py-2 text-sm" type="file" accept="image/*" @change="handleMaskBaseUpload" />
                            </label>

                            <div class="relative overflow-hidden rounded-lg border border-brand-line bg-brand-surface dark:border-night-muted/35 dark:bg-night-surface">
                                <div v-if="maskBaseImage" class="flex max-h-[560px] justify-center">
                                    <div class="relative inline-block max-w-full">
                                        <img :src="maskBaseImage" alt="遮罩底图" class="max-h-[560px] w-auto max-w-full select-none object-contain" draggable="false" @load="syncMaskCanvas" />
                                        <canvas
                                            ref="maskCanvas"
                                            class="absolute inset-0 h-full w-full touch-none opacity-60"
                                            @pointerdown="startMaskDraw"
                                            @pointermove="moveMaskDraw"
                                            @pointerup="stopMaskDraw"
                                            @pointerleave="stopMaskDraw"
                                        />
                                    </div>
                                </div>
                                <div v-else class="flex min-h-[360px] items-center justify-center p-8 text-center text-sm text-brand-muted dark:text-night-muted">
                                    上传一张底图后，可以直接在图片上涂抹白色遮罩。
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <div class="rounded-lg border border-brand-line bg-brand-surface p-3 dark:border-night-muted/35 dark:bg-night-surface">
                                <p class="wb-label">画笔</p>
                                <label class="mt-3 block text-xs font-semibold text-brand-muted dark:text-night-muted">
                                    大小 {{ maskBrushSize }}px
                                    <input v-model.number="maskBrushSize" type="range" min="8" max="120" class="mt-2 w-full accent-brand-accent" />
                                </label>
                                <div class="mt-3 grid grid-cols-2 gap-2">
                                    <button type="button" :class="maskModeClass(!maskEraser)" @click="maskEraser = false">涂抹</button>
                                    <button type="button" :class="maskModeClass(maskEraser)" @click="maskEraser = true">擦除</button>
                                </div>
                            </div>

                            <label class="block">
                                <span class="mb-1 block wb-label">编辑意图</span>
                                <select v-model="maskEditIntent" class="wb-input w-full">
                                    <option value="outfit">局部换装 / 替换服饰</option>
                                    <option value="background">局部换背景 / 环境</option>
                                    <option value="remove">移除物体 / 瑕疵</option>
                                    <option value="detail">修正细节 / 补画</option>
                                    <option value="freeform">自定义</option>
                                </select>
                            </label>

                            <label class="block">
                                <span class="mb-1 block wb-label">局部修改要求</span>
                                <textarea
                                    v-model="maskInstruction"
                                    class="wb-input min-h-[128px] w-full resize-y py-2 text-sm leading-6"
                                    placeholder="例如：只替换衣服，保留脸、发型、姿态和背景；遮罩外区域不要变化。"
                                />
                            </label>

                            <div class="grid grid-cols-2 gap-2">
                                <button type="button" class="wb-secondary" :disabled="!maskBaseImage" @click="clearMaskCanvas">清空遮罩</button>
                                <button type="button" class="wb-secondary" :disabled="!maskBaseImage" @click="exportMaskImage">导出遮罩</button>
                            </div>
                            <button type="button" class="wb-primary w-full" :disabled="!canApplyMask" @click="generateMaskEdit">直接生成局部编辑</button>
                            <button type="button" class="wb-primary w-full" :disabled="!canApplyMask" @click="applyMaskToStudio">{{ maskApplyLabel }}</button>

                            <div v-if="maskImage" class="rounded-lg border border-brand-line bg-white p-2 dark:border-night-muted/35 dark:bg-night-panel">
                                <p class="mb-2 wb-label">遮罩预览</p>
                                <img :src="maskImage" alt="遮罩预览" class="aspect-square w-full rounded-md bg-black object-contain" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <aside class="rounded-lg border border-brand-line bg-white p-4 shadow-sm shadow-black/5 dark:border-night-muted/35 dark:bg-night-panel">
                <div class="mb-3">
                    <p class="wb-label text-brand-accent">Prompt preview</p>
                    <h3 class="mt-1 text-base font-semibold text-brand-ink dark:text-brand-surface">可编辑提示词</h3>
                    <p class="mt-1 text-xs leading-5 text-brand-muted dark:text-night-muted">这里是工具生成前会发送给模型的提示词。你可以直接改，也可以在工具箱内生成。</p>
                    <p v-if="draftSource" class="mt-2 rounded-md border border-brand-line bg-brand-surface px-2 py-1 text-xs text-brand-muted dark:border-night-muted/35 dark:bg-night-surface dark:text-night-muted">
                        最近加入：{{ draftSource }}
                    </p>
                </div>
                <textarea
                    v-model="draftPrompt"
                    class="wb-input min-h-[360px] w-full resize-y py-3 text-sm leading-6"
                    placeholder="工具生成的提示词会出现在这里。你可以修改后直接生成，或送回创作台继续调整。"
                />
                <div class="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" class="wb-secondary" :disabled="!draftPrompt.trim()" @click="copyDraft">复制提示词</button>
                    <button type="button" class="wb-secondary" :disabled="!draftPrompt.trim()" @click="clearDraft">清空</button>
                    <button type="button" class="wb-secondary" :disabled="!draftPrompt.trim()" @click="$emit('save-template', draftPrompt)">存为模板</button>
                    <button type="button" class="wb-primary" :disabled="!canGenerateDraftPrompt" @click="generateDraftPrompt">直接生成</button>
                    <button type="button" class="wb-primary" :disabled="!draftPrompt.trim()" @click="sendDraftToStudio">送回创作台</button>
                </div>
                <p v-if="copyStatus" class="mt-3 rounded-md border border-brand-accent/25 bg-brand-accent/10 px-2 py-1 text-xs text-brand-accent">{{ copyStatus }}</p>
            </aside>
        </div>

        <section class="mt-4 rounded-lg border border-brand-line bg-white p-4 shadow-sm shadow-black/5 dark:border-night-muted/35 dark:bg-night-panel">
            <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p class="wb-label text-brand-accent">Toolbox output</p>
                    <h3 class="mt-1 text-base font-semibold text-brand-ink dark:text-brand-surface">工具箱生成结果</h3>
                    <p class="mt-1 text-xs leading-5 text-brand-muted dark:text-night-muted">直接生成的任务会显示在这里，并同步进入现有历史记录。</p>
                </div>
            </div>
            <ResultDisplay
                :results="generationResults"
                :tasks="toolboxGenerationTasks"
                :error="generationError || ''"
                :loading="toolboxGenerationRunning"
                :can-push="false"
                :can-reuse="false"
                empty-title="等待工具箱生成"
                empty-description="在自定义模特、换装或遮罩里点击直接生成，任务会留在这里。"
                queue-title="工具箱任务队列"
                queue-description="工具箱任务可以连续提交，完成后仍可恢复预览、结果作参考或加入画布。"
                @download="downloadToolboxImage"
                @restore-task="restoreToolboxTask"
                @reuse-task="reuseToolboxTask"
                @push-task="pushToolboxTask"
                @canvas-task="canvasToolboxTask"
            />
        </section>

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
    </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, nextTick, onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { GenerationTask, PromptAssistantRequest, ToolboxGeneratePayload, ToolboxReference } from '../types'
import ResultDisplay from './ResultDisplay.vue'
import {
    deleteToolboxModelAsset,
    getToolboxModelAssets,
    putToolboxModelAsset,
    type ToolboxModelAsset
} from '../utils/toolboxAssetsDb'

type ToolId = 'image-to-prompt' | 'model-asset' | 'outfit-swap' | 'mask-edit'
type ModelAssetMode = 'face-angle-pack' | 'turnaround' | 'portrait-pack' | 'pose-pack'
type ModelAssetFraming = 'auto' | 'bust' | 'half-body' | 'full-body'
type ModelAssetStyle = 'realistic' | 'phone' | 'catalog'
type ModelAssetUsage = 'general' | 'outfit' | 'portrait' | 'commercial' | 'couple' | 'story'
type ModelAssetFidelity = 'balanced' | 'high' | 'strict'
type ReversePromptMode = 'direct' | 'structured' | 'tags' | 'template'
type OutfitClothingStrategy = 'auto' | 'reference-first' | 'description-first' | 'merge'
type MaskEditIntent = 'outfit' | 'background' | 'remove' | 'detail' | 'freeform'
type OutfitPreserveKey = 'identity' | 'hair' | 'pose' | 'body' | 'background' | 'lighting'

const ImageGrid = defineComponent({
    props: {
        images: { type: Array as PropType<string[]>, required: true },
        title: { type: String, required: true }
    },
    emits: ['remove', 'preview'],
    setup(props, { emit }) {
        return () => props.images.length
            ? h('div', { class: 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2' }, props.images.map((image, index) =>
                h('div', { class: 'group relative overflow-hidden rounded-lg border border-brand-line bg-brand-surface dark:border-night-muted/35 dark:bg-night-surface', key: `${image}-${index}` }, [
                    h('img', { src: image, alt: `${props.title} ${index + 1}`, class: 'aspect-square w-full object-cover' }),
                    h('button', {
                        type: 'button',
                        class: 'absolute bottom-1.5 left-1.5 rounded-md bg-brand-ink/80 px-2 py-1 text-[11px] font-semibold text-brand-surface opacity-0 transition hover:bg-brand-accent group-hover:opacity-100',
                        onClick: () => emit('preview', image)
                    }, '预览'),
                    h('button', {
                        type: 'button',
                        class: 'absolute right-1.5 top-1.5 rounded-md bg-brand-ink/80 px-2 py-1 text-[11px] font-semibold text-brand-surface opacity-0 transition hover:bg-brand-accent group-hover:opacity-100',
                        onClick: () => emit('remove', index)
                    }, '移除')
                ])
            ))
            : null
    }
})

const ToolHeader = defineComponent({
    props: {
        eyebrow: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true }
    },
    setup(props) {
        return () => h('div', { class: 'border-b border-brand-line pb-4 dark:border-night-muted/35' }, [
            h('p', { class: 'wb-label text-brand-accent' }, props.eyebrow),
            h('h3', { class: 'mt-1 text-lg font-semibold text-brand-ink dark:text-brand-surface' }, props.title),
            h('p', { class: 'mt-1 max-w-3xl text-sm leading-6 text-brand-muted dark:text-night-muted' }, props.description)
        ])
    }
})

const props = defineProps<{
    assistantReady: boolean
    assistantLoading: boolean
    currentPrompt: string
    generationTasks: GenerationTask[]
    generationResults: string[]
    generationError?: string | null
}>()

const emit = defineEmits<{
    analyze: [request: Pick<PromptAssistantRequest, 'prompt' | 'context' | 'images' | 'task'>]
    'send-to-studio': [prompt: string]
    'save-template': [prompt: string]
    'apply-references': [payload: { prompt: string; references: ToolboxReference[] }]
    generate: [payload: ToolboxGeneratePayload]
    download: [image: string]
    'restore-task': [task: GenerationTask]
    'reuse-task': [task: GenerationTask]
    'push-task': [task: GenerationTask]
    'canvas-task': [task: GenerationTask]
    'back-to-studio': []
}>()

const tools: Array<{ id: ToolId; title: string; description: string; ready: boolean }> = [
    { id: 'image-to-prompt', title: '图片反推提示词', description: '从参考图提炼生图提示词。', ready: true },
    { id: 'model-asset', title: '自定义模特', description: '整理人物资产和多视角参考。', ready: true },
    { id: 'outfit-swap', title: '一键换装', description: '人物图 + 服装图生成换装请求。', ready: true },
    { id: 'mask-edit', title: '遮罩编辑', description: '本地涂抹遮罩并导出参考。', ready: true }
]

const activeTool = ref<ToolId>('image-to-prompt')
const activeToolTitle = computed(() => tools.find(tool => tool.id === activeTool.value)?.title || '工具箱')
const uploadedImages = ref<string[]>([])
const imagePromptInstruction = ref('')
const reversePromptMode = ref<ReversePromptMode>('structured')
const reversePrompt = ref('')
const draftPrompt = ref(props.currentPrompt || '')
const draftSource = ref('')
const analyzing = ref(false)
const error = ref('')
const copyStatus = ref('')
const previewImage = ref('')

const modelAssetName = ref('角色1')
const modelAssetImages = ref<string[]>([])
const modelAssetMode = ref<ModelAssetMode>('face-angle-pack')
const modelAssetFraming = ref<ModelAssetFraming>('auto')
const modelAssetStyle = ref<ModelAssetStyle>('realistic')
const modelAssetUsage = ref<ModelAssetUsage>('general')
const modelAssetFidelity = ref<ModelAssetFidelity>('high')
const modelAssetNotes = ref('')
const modelAssetPrompt = ref('')
const modelAssets = ref<ToolboxModelAsset[]>([])
const selectedModelAssetId = ref('')
const assetStatus = ref('')

const outfitCharacterImages = ref<string[]>([])
const outfitImages = ref<string[]>([])
const outfitDescription = ref('')
const outfitPreserve = ref<OutfitPreserveKey[]>(['identity', 'hair', 'pose'])
const outfitClothingStrategy = ref<OutfitClothingStrategy>('auto')
const outfitBackgroundMode = ref<'keep' | 'studio' | 'street'>('keep')
const outfitOutputStyle = ref<'realistic' | 'campaign' | 'lookbook'>('realistic')
const outfitPrompt = ref('')

const maskBaseImage = ref('')
const maskImage = ref('')
const maskInstruction = ref('')
const maskEditIntent = ref<MaskEditIntent>('outfit')
const maskBrushSize = ref(42)
const maskEraser = ref(false)
const maskCanvas = ref<HTMLCanvasElement | null>(null)
const drawingMask = ref(false)

const outfitPreserveOptions: Array<{ value: OutfitPreserveKey; label: string; description: string }> = [
    { value: 'identity', label: '人物身份', description: '脸型、五官、年龄感不换人' },
    { value: 'hair', label: '发型发色', description: '尽量保留头发特征' },
    { value: 'pose', label: '姿态动作', description: '不改变原图动作关系' },
    { value: 'body', label: '身材比例', description: '保持自然体型和比例' },
    { value: 'background', label: '背景环境', description: '保留原场景空间' },
    { value: 'lighting', label: '光线质感', description: '保持原图曝光和阴影' }
]

const reversePromptModePrompts: Record<ReversePromptMode, string> = {
    structured: '输出结构化结果：核心提示词、画面要素、负面约束、可复用短词组。',
    direct: '输出一段可以直接复制到生图框的完整长提示词，不要额外解释。',
    tags: '输出短词组和标签，按主体、场景、镜头、光线、风格、负面约束分组。',
    template: '输出可复用模板，保留可替换变量，例如【主体】、【场景】、【服装】、【镜头】。'
}

const outfitClothingStrategyPrompts: Record<OutfitClothingStrategy, string> = {
    auto: '服装采用策略：服装参考图优先，文字描述作为补充修正。',
    'reference-first': '服装采用策略：严格跟随服装参考图的版型、材质、颜色、纹理和配饰；文字只作为轻微补充。',
    'description-first': '服装采用策略：严格跟随文字描述；服装参考图只用于辅助材质和造型灵感。',
    merge: '服装采用策略：融合服装参考图与文字描述，保留参考图主要版型，同时按文字调整颜色、细节或搭配。'
}

const maskIntentPrompts: Record<MaskEditIntent, string> = {
    outfit: '编辑意图：局部换装或替换服饰。只修改遮罩内衣服/配饰相关区域，保持脸、发型、身体比例、姿态和遮罩外背景稳定。',
    background: '编辑意图：局部替换背景或环境。只修改遮罩内环境区域，不改变人物身份、姿态、服装和遮罩外构图。',
    remove: '编辑意图：移除物体、瑕疵或多余元素。遮罩区域应自然补全，保持周围纹理、光线和透视一致。',
    detail: '编辑意图：修正细节或补画。只改善遮罩区域的结构、边缘、材质或清晰度，避免改变整体画面。',
    freeform: '编辑意图：按用户补充要求处理遮罩区域。'
}

const modelAssetModePresets: Record<ModelAssetMode, { title: string; description: string; avoid: string; prompt: string; defaultFraming: ModelAssetFraming }> = {
    'face-angle-pack': {
        title: '面部角度组：最重要的身份锚点',
        description: '生成同一人物的正面、45 度、3/4 视角和侧脸胸像/头像，优先锁定脸型、五官间距、鼻梁、唇形、眼型、发际线和气质。',
        avoid: '不强调全身造型；重点是不同角度仍然像同一个人，避免侧脸和 45 度变成另一张脸。',
        prompt: 'Create a facial identity angle sheet of the same person with four bust / close-up portrait views: front-facing, 45-degree angle, three-quarter view, and side profile. Preserve the exact same facial identity across all angles, including face shape, jawline, eye spacing, eyelid shape, nose bridge, lips, skin tone, hairline, hairstyle, and calm expression. Use consistent lighting, neutral background, and clean comparison layout.',
        defaultFraming: 'bust'
    },
    turnaround: {
        title: '身体三视图：默认不是胸像',
        description: '生成同一人物的正面、侧面、背面身体三视图，优先用于沉淀身材比例、发型轮廓和基础造型。默认建议全身或半身。',
        avoid: '面部仍要一致，但这组不如“面部角度组”适合锁脸；重点是身体比例和造型结构。',
        prompt: 'Create a clean character identity turnaround sheet with front view, side view, and back view of the same person. Keep body proportion, face identity, hairstyle, skin tone, and styling consistent across all views. Use a simple neutral background and clear separation between views.',
        defaultFraming: 'full-body'
    },
    'portrait-pack': {
        title: '表情头像组：主要是胸像 / 头像',
        description: '生成同一人物的多个表情头像或胸像，用来稳定脸部身份、发型、表情气质和近景细节。',
        avoid: '不生成全身三视图；重点是脸部一致和表情变化。',
        prompt: 'Create a portrait expression sheet of the same person, including neutral, soft smile, focused, slightly surprised, and calm expressions. Use bust or close-up portrait framing, consistent face identity, hairstyle, skin tone, and lighting.',
        defaultFraming: 'bust'
    },
    'pose-pack': {
        title: '姿态设定组：默认半身到全身',
        description: '生成同一人物的多姿态设定，包括站姿、坐姿、行走、回头等，适合后续做穿搭、场景图或合影。',
        avoid: '不强调三视图标准排布；重点是姿态多样但身份不漂移。',
        prompt: 'Create a pose reference sheet of the same person with multiple natural poses, such as standing, seated, walking, and looking back. Keep identity, body proportion, hairstyle, and styling consistent across all poses.',
        defaultFraming: 'full-body'
    }
}

const modelAssetFramingPrompts: Record<ModelAssetFraming, string> = {
    auto: '',
    bust: 'Use bust / close-up portrait framing. The crop should focus on head, shoulders, facial identity, hairstyle, and expression.',
    'half-body': 'Use half-body framing from head to waist or upper thigh. Keep face identity visible while showing clothing and posture.',
    'full-body': 'Use full-body framing. Show complete body proportion, stance, clothing silhouette, shoes, and posture clearly.'
}

const modelAssetUsagePresets: Record<ModelAssetUsage, { title: string; description: string; prompt: string }> = {
    general: {
        title: '通用角色资产',
        description: '适合后续做多种场景调用，约束身份稳定，不强行绑定某个用途。',
        prompt: 'Use this as a reusable character identity asset for future image generation. Keep the identity stable while allowing scene, outfit, pose, and background to change when requested.'
    },
    outfit: {
        title: '换装 / 服装试穿',
        description: '更强调脸不变、身材比例不变，服装可以被替换。',
        prompt: 'Optimize this asset for outfit swapping and clothing try-on. Preserve face identity, hairstyle, body proportion, skin tone, and posture compatibility; allow clothing, fabric, color, and styling to change according to future outfit references.'
    },
    portrait: {
        title: '自拍 / 近景人像',
        description: '更强调五官、脸型、发型、肤色和自然表情。',
        prompt: 'Optimize this asset for selfies and close-up portraits. Prioritize facial likeness, eye shape, eyelids, nose bridge, lips, face shape, hairline, hairstyle, skin texture, and natural expression.'
    },
    commercial: {
        title: '电商 / 商业主图',
        description: '更强调干净构图、材质可读和可作为产品展示人物。',
        prompt: 'Optimize this asset for e-commerce and commercial product visuals. Keep the model identity stable while ensuring clean composition, readable silhouette, natural product holding or wearing behavior, and professional lighting.'
    },
    couple: {
        title: '合影 / 多人图',
        description: '更强调不要和其他角色混脸、换脸或复制身份。',
        prompt: 'Optimize this asset for group photos and couple shots. Keep this character visually distinct from other people; do not merge identities, swap faces, duplicate this person into another role, or average facial features between characters.'
    },
    story: {
        title: '连续剧情 / 多场景',
        description: '更强调跨场景、跨动作时保持同一人。',
        prompt: 'Optimize this asset for continuous story scenes across multiple locations, outfits, poses, and lighting conditions. Preserve the same identity over time while allowing natural contextual variation.'
    }
}

const modelAssetFidelityPrompts: Record<ModelAssetFidelity, string> = {
    balanced: 'Identity fidelity: balanced. Keep the same person, but allow natural variation in lighting, expression, camera angle, and styling.',
    high: 'Identity fidelity: high. The generated person must look like the same individual across outputs, with strong preservation of face shape, eye spacing, eyelids, nose, lips, jawline, skin tone, and hairstyle.',
    strict: 'Identity fidelity: strict. Treat the uploaded reference as the strongest identity anchor. Do not make the person older, younger, wider-faced, sharper-faced, more westernized, more idol-like, or a generic similar person.'
}

const canAnalyzeImage = computed(() => props.assistantReady && uploadedImages.value.length > 0 && !analyzing.value && !props.assistantLoading)
const canApplyModelAsset = computed(() => modelAssetImages.value.length > 0 && modelAssetPrompt.value.trim().length > 0)
const canGenerateModelAsset = computed(() => modelAssetImages.value.length > 0)
const canSaveModelAsset = computed(() => modelAssetImages.value.length > 0 && modelAssetName.value.trim().length > 0)
const canPrepareOutfitSwap = computed(() => outfitCharacterImages.value.length > 0 && (outfitImages.value.length > 0 || outfitDescription.value.trim().length > 0))
const canGenerateOutfitSwap = computed(() => canPrepareOutfitSwap.value)
const canApplyOutfitSwap = computed(() => canPrepareOutfitSwap.value && outfitPrompt.value.trim().length > 0)
const canApplyMask = computed(() => Boolean(maskBaseImage.value && maskImage.value && maskInstruction.value.trim()))
const toolboxGenerationTasks = computed(() => props.generationTasks.filter(task => task.origin === 'toolbox'))
const toolboxGenerationRunning = computed(() => toolboxGenerationTasks.value.some(task => task.status === 'running'))
const activeToolReferences = computed<ToolboxReference[]>(() => {
    if (activeTool.value === 'model-asset') return buildModelAssetReferences()
    if (activeTool.value === 'outfit-swap') return buildOutfitReferences()
    if (activeTool.value === 'mask-edit') return canApplyMask.value ? buildMaskReferences() : []
    return []
})
const canGenerateDraftPrompt = computed(() => draftPrompt.value.trim().length > 0 && activeToolReferences.value.length > 0)
const outfitApplyLabel = computed(() => {
    if (!outfitCharacterImages.value.length) return '先上传人物图'
    if (!outfitImages.value.length && !outfitDescription.value.trim()) return '先添加服装'
    if (!outfitPrompt.value.trim()) return '先生成提示词'
    return '带参考图送回'
})
const activeModelAssetMode = computed(() => modelAssetModePresets[modelAssetMode.value])
const activeModelAssetFraming = computed(() => modelAssetFraming.value === 'auto' ? activeModelAssetMode.value.defaultFraming : modelAssetFraming.value)
const activeModelAssetUsage = computed(() => modelAssetUsagePresets[modelAssetUsage.value])
const maskApplyLabel = computed(() => {
    if (!maskBaseImage.value) return '先上传底图'
    if (!maskImage.value) return '先导出遮罩'
    if (!maskInstruction.value.trim()) return '先填写修改要求'
    return '底图 + 遮罩送回'
})

onMounted(() => {
    loadModelAssets()
})

watch(
    () => props.currentPrompt,
    value => {
        if (!draftPrompt.value.trim() && value) {
            draftPrompt.value = value
        }
    }
)

watch(
    () => props.assistantLoading,
    loading => {
        if (!loading && analyzing.value) {
            analyzing.value = false
        }
    }
)

const primaryActionClass = (enabled: boolean) => [
    'inline-flex min-h-10 w-full items-center justify-center rounded-lg px-3 text-sm font-semibold transition active:scale-[0.99]',
    enabled ? 'bg-brand-accent text-brand-surface hover:bg-brand-accent/90' : 'cursor-not-allowed bg-brand-line text-brand-muted dark:bg-night-panel dark:text-night-muted'
]

const maskModeClass = (selected: boolean) => [
    'inline-flex min-h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition',
    selected
        ? 'border-brand-accent bg-brand-accent/10 text-brand-accent'
        : 'border-brand-line bg-white text-brand-ink hover:bg-brand-surface dark:border-night-muted/35 dark:bg-night-panel dark:text-brand-surface'
]

const handleReverseImageUpload = async (event: Event) => {
    uploadedImages.value = [...uploadedImages.value, ...await readImagesFromEvent(event)].slice(0, 6)
}

const handleModelAssetUpload = async (event: Event) => {
    modelAssetImages.value = [...modelAssetImages.value, ...await readImagesFromEvent(event)].slice(0, 8)
}

const handleOutfitCharacterUpload = async (event: Event) => {
    outfitCharacterImages.value = [...outfitCharacterImages.value, ...await readImagesFromEvent(event)].slice(0, 6)
}

const handleOutfitUpload = async (event: Event) => {
    outfitImages.value = [...outfitImages.value, ...await readImagesFromEvent(event)].slice(0, 6)
}

const handleMaskBaseUpload = async (event: Event) => {
    const images = await readImagesFromEvent(event)
    maskBaseImage.value = images[0] || ''
    maskImage.value = ''
    await nextTick()
    clearMaskCanvas()
}

const removeUploadedImage = (index: number) => {
    uploadedImages.value = removeAt(uploadedImages.value, index)
}

const removeModelAssetImage = (index: number) => {
    modelAssetImages.value = removeAt(modelAssetImages.value, index)
}

const removeOutfitCharacterImage = (index: number) => {
    outfitCharacterImages.value = removeAt(outfitCharacterImages.value, index)
}

const removeOutfitImage = (index: number) => {
    outfitImages.value = removeAt(outfitImages.value, index)
}

const analyzeImages = () => {
    if (!canAnalyzeImage.value) return
    analyzing.value = true
    error.value = ''
    emit('analyze', {
        prompt: imagePromptInstruction.value.trim(),
        context: [`图片数量：${uploadedImages.value.length}`, reversePromptModePrompts[reversePromptMode.value]].join('\n'),
        images: uploadedImages.value,
        task: 'image-to-prompt'
    })
}

const setAnalysisResult = (prompt: string) => {
    reversePrompt.value = prompt
    analyzing.value = false
}

const setAnalysisError = (message: string) => {
    error.value = message
    analyzing.value = false
}

const buildModelAssetPrompt = () => {
    const name = modelAssetName.value.trim() || '角色1'
    const styleText: Record<ModelAssetStyle, string> = {
        realistic: '真实棚拍光线，高清自然皮肤质感，商业摄影构图。',
        phone: '真实手机镜头质感，自然曝光，轻微生活化随机感。',
        catalog: '电商模特图风格，主体清晰，服装和身材比例可读。'
    }
    const framingText = modelAssetFramingPrompts[activeModelAssetFraming.value]
    const usageText = activeModelAssetUsage.value.prompt
    const fidelityText = modelAssetFidelityPrompts[modelAssetFidelity.value]

    modelAssetPrompt.value = [
        `自定义模特资产：${name}`,
        `Use the uploaded character reference images as the strongest identity anchor for ${name}. Preserve the same adult identity, facial structure, hairstyle, skin tone, body proportion, and calm natural expression. Do not turn the person into a different face or a generic model.`,
        fidelityText,
        activeModelAssetMode.value.prompt,
        framingText,
        usageText,
        styleText[modelAssetStyle.value],
        modelAssetNotes.value.trim() ? `补充身份约束：${modelAssetNotes.value.trim()}` : '',
        '输出要求：画面整洁，同一人物身份稳定。避免脸部漂移、年龄变化、五官重塑、身材夸张、随机文字、水印、多余人物，以及把三视图误做成多个不同人物。'
    ].filter(Boolean).join('\n\n')

    appendToDraft(modelAssetPrompt.value, '自定义模特')
}

const loadModelAssets = async () => {
    modelAssets.value = await getToolboxModelAssets()
}

const loadModelAsset = (asset: ToolboxModelAsset) => {
    selectedModelAssetId.value = asset.id
    modelAssetName.value = asset.name
    modelAssetImages.value = [...asset.images]
    modelAssetMode.value = normalizeModelAssetMode(asset.mode)
    modelAssetFraming.value = normalizeModelAssetFraming(asset.framing)
    modelAssetUsage.value = normalizeModelAssetUsage(asset.usage)
    modelAssetFidelity.value = normalizeModelAssetFidelity(asset.fidelity)
    modelAssetStyle.value = normalizeModelAssetStyle(asset.style)
    modelAssetNotes.value = asset.notes
    modelAssetPrompt.value = asset.prompt
    assetStatus.value = `已载入：${asset.name}`
}

const saveModelAsset = async () => {
    if (!canSaveModelAsset.value) return
    if (!modelAssetPrompt.value.trim()) {
        buildModelAssetPrompt()
    }

    const now = Date.now()
    const existing = modelAssets.value.find(asset => asset.id === selectedModelAssetId.value)
    const asset: ToolboxModelAsset = {
        id: existing?.id || `model-asset-${now}-${Math.random().toString(36).slice(2, 8)}`,
        name: modelAssetName.value.trim(),
        images: [...modelAssetImages.value],
        prompt: modelAssetPrompt.value.trim(),
        notes: modelAssetNotes.value.trim(),
        mode: modelAssetMode.value,
        framing: modelAssetFraming.value,
        usage: modelAssetUsage.value,
        fidelity: modelAssetFidelity.value,
        style: modelAssetStyle.value,
        favorite: existing?.favorite || false,
        createdAt: existing?.createdAt || now,
        updatedAt: now
    }

    await putToolboxModelAsset(asset)
    selectedModelAssetId.value = asset.id
    assetStatus.value = `已保存模特：${asset.name}`
    await loadModelAssets()
}

const deleteSelectedModelAsset = async () => {
    if (!selectedModelAssetId.value) return
    const deletingName = modelAssetName.value.trim() || '当前模特'
    await deleteToolboxModelAsset(selectedModelAssetId.value)
    selectedModelAssetId.value = ''
    assetStatus.value = `已删除保存项：${deletingName}`
    await loadModelAssets()
}

const applyModelAssetToStudio = () => {
    if (!canApplyModelAsset.value) return
    emit('apply-references', {
        prompt: modelAssetPrompt.value.trim(),
        references: buildModelAssetReferences()
    })
}

const generateModelAsset = () => {
    if (!canGenerateModelAsset.value) return
    if (!modelAssetPrompt.value.trim()) {
        buildModelAssetPrompt()
    }

    emit('generate', {
        title: '自定义模特',
        prompt: modelAssetPrompt.value.trim(),
        references: buildModelAssetReferences()
    })
}

const buildModelAssetReferences = (): ToolboxReference[] => modelAssetImages.value.map((image, index) => ({
    image,
    role: 'character' as const,
    label: modelAssetName.value.trim() || `角色${index + 1}`,
    note: '自定义模特身份参考，用于保持同一人物。'
}))

const normalizeModelAssetMode = (value: string): ModelAssetMode => {
    if (value === 'face-angle-pack') return value
    if (value === 'portrait-pack' || value === 'pose-pack' || value === 'turnaround') return value
    return 'face-angle-pack'
}

const normalizeModelAssetFraming = (value: string): ModelAssetFraming => {
    if (value === 'bust' || value === 'half-body' || value === 'full-body' || value === 'auto') return value
    return 'auto'
}

const normalizeModelAssetUsage = (value: string): ModelAssetUsage => {
    if (value === 'outfit' || value === 'portrait' || value === 'commercial' || value === 'couple' || value === 'story' || value === 'general') return value
    return 'general'
}

const normalizeModelAssetFidelity = (value: string): ModelAssetFidelity => {
    if (value === 'balanced' || value === 'strict' || value === 'high') return value
    return 'high'
}

const normalizeModelAssetStyle = (value: string): ModelAssetStyle => {
    if (value === 'phone' || value === 'catalog' || value === 'realistic') return value
    return 'realistic'
}

const formatAssetDate = (value: number) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '刚刚'
    return `${date.getMonth() + 1}/${date.getDate()}`
}

const buildOutfitPrompt = () => {
    const preserveText = outfitPreserve.value.length
        ? `保留项：${outfitPreserve.value.map(item => outfitPreserveOptions.find(option => option.value === item)?.label).filter(Boolean).join('、')}。`
        : '只保留人物身份，其他根据服装参考自然调整。'
    const backgroundText: Record<typeof outfitBackgroundMode.value, string> = {
        keep: '尽量保留原背景和空间关系。',
        studio: '替换为干净棚拍背景，突出服装和人物。',
        street: '替换为自然街拍环境，真实生活化。'
    }
    const styleText: Record<typeof outfitOutputStyle.value, string> = {
        realistic: '真实自然照片质感。',
        campaign: '商业广告大片质感，构图干净有冲击力。',
        lookbook: '服装 lookbook 风格，重点展示衣服版型、材质和搭配。'
    }

    outfitPrompt.value = [
        '一键换装任务：使用人物参考图保持同一人物身份，使用服装参考图或服装描述替换服装。',
        outfitClothingStrategyPrompts[outfitClothingStrategy.value],
        outfitImages.value.length ? 'Reference outfit images are for clothing, fabric, silhouette, color, styling, and accessories only; do not copy unrelated background or model identity from outfit references.' : '',
        outfitDescription.value.trim() ? `服装描述：${outfitDescription.value.trim()}` : '',
        preserveText,
        backgroundText[outfitBackgroundMode.value],
        styleText[outfitOutputStyle.value],
        '要求：脸部身份优先保持，服装自然贴合身体和姿态，材质清晰，边缘合理，避免换脸、身体变形、手部严重错误、随机文字和水印。'
    ].filter(Boolean).join('\n\n')

    appendToDraft(outfitPrompt.value, '一键换装')
}

const applyOutfitToStudio = () => {
    if (!canApplyOutfitSwap.value) return
    const references = buildOutfitReferences()

    emit('apply-references', {
        prompt: outfitPrompt.value.trim(),
        references
    })
}

const generateOutfitSwap = () => {
    if (!canGenerateOutfitSwap.value) return
    if (!outfitPrompt.value.trim()) {
        buildOutfitPrompt()
    }

    emit('generate', {
        title: '一键换装',
        prompt: outfitPrompt.value.trim(),
        references: buildOutfitReferences()
    })
}

const buildOutfitReferences = (): ToolboxReference[] => [
    ...outfitCharacterImages.value.map((image, index) => ({
        image,
        role: 'character' as const,
        label: `换装人物${index + 1}`,
        note: '人物身份参考，保持同一人。'
    })),
    ...outfitImages.value.map((image, index) => ({
        image,
        role: 'outfit' as const,
        label: `服装参考${index + 1}`,
        note: '只参考服装、材质、颜色和造型。'
    }))
]

const syncMaskCanvas = async (event?: Event) => {
    await nextTick()
    const canvas = maskCanvas.value
    const image = event?.target as HTMLImageElement | undefined
    if (!canvas || !image) return
    canvas.width = image.naturalWidth || image.clientWidth || 1024
    canvas.height = image.naturalHeight || image.clientHeight || 1024
    clearMaskCanvas()
}

const startMaskDraw = (event: PointerEvent) => {
    if (!maskCanvas.value) return
    drawingMask.value = true
    maskCanvas.value.setPointerCapture?.(event.pointerId)
    drawMaskPoint(event)
}

const moveMaskDraw = (event: PointerEvent) => {
    if (!drawingMask.value) return
    drawMaskPoint(event)
}

const stopMaskDraw = (event: PointerEvent) => {
    drawingMask.value = false
    maskCanvas.value?.releasePointerCapture?.(event.pointerId)
}

const drawMaskPoint = (event: PointerEvent) => {
    const canvas = maskCanvas.value
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height
    const radius = (maskBrushSize.value / rect.width) * canvas.width

    context.save()
    context.globalCompositeOperation = maskEraser.value ? 'destination-out' : 'source-over'
    context.fillStyle = '#ffffff'
    context.beginPath()
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
    context.restore()
}

const clearMaskCanvas = () => {
    const canvas = maskCanvas.value
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    maskImage.value = ''
}

const exportMaskImage = () => {
    const canvas = maskCanvas.value
    if (!canvas) return
    const output = document.createElement('canvas')
    output.width = canvas.width
    output.height = canvas.height
    const context = output.getContext('2d')
    if (!context) return
    context.fillStyle = '#000000'
    context.fillRect(0, 0, output.width, output.height)
    context.drawImage(canvas, 0, 0)
    maskImage.value = output.toDataURL('image/png')
}

const applyMaskToStudio = () => {
    if (!canApplyMask.value) return
    const prompt = buildMaskPrompt()
    appendToDraft(prompt, '遮罩编辑')
    emit('apply-references', {
        prompt,
        references: buildMaskReferences()
    })
}

const generateMaskEdit = () => {
    if (!canApplyMask.value) return
    const prompt = buildMaskPrompt()
    emit('generate', {
        title: '遮罩编辑',
        prompt,
        references: buildMaskReferences()
    })
}

const buildMaskPrompt = () => [
    '局部编辑参考：参考图1是原始底图，参考图2是黑白遮罩。白色区域代表需要修改的范围，黑色区域尽量保持不变。',
    maskIntentPrompts[maskEditIntent.value],
    maskInstruction.value.trim(),
    '如果当前模型不支持原生 mask，请把遮罩图作为视觉约束：只修改白色区域对应的位置，保持遮罩外的主体、构图、光线和背景稳定。'
].filter(Boolean).join('\n\n')

const buildMaskReferences = (): ToolboxReference[] => [
    {
        image: maskBaseImage.value,
        role: 'other',
        label: '局部编辑底图',
        note: '原始底图，遮罩外区域尽量保持。'
    },
    {
        image: maskImage.value,
        role: 'other',
        label: '局部编辑遮罩',
        note: '白色区域为需要修改的范围，黑色区域保持。'
    }
]

const downloadToolboxImage = (image: string) => {
    emit('download', image)
}

const generateDraftPrompt = () => {
    const prompt = draftPrompt.value.trim()
    if (!prompt || !activeToolReferences.value.length) return
    emit('generate', {
        title: `${activeToolTitle.value}提示词`,
        prompt,
        references: activeToolReferences.value
    })
}

const restoreToolboxTask = (task: GenerationTask) => {
    emit('restore-task', task)
}

const reuseToolboxTask = (task: GenerationTask) => {
    emit('reuse-task', task)
}

const pushToolboxTask = (task: GenerationTask) => {
    emit('push-task', task)
}

const canvasToolboxTask = (task: GenerationTask) => {
    emit('canvas-task', task)
}

const appendReversePrompt = () => {
    appendToDraft(reversePrompt.value, '图片反推')
}

const appendToDraft = (value: string, source = '') => {
    const nextPrompt = value.trim()
    if (!nextPrompt) return
    const current = draftPrompt.value.trim()
    if (!current) {
        draftPrompt.value = nextPrompt
        if (source) {
            draftSource.value = source
        }
        return
    }
    if (current.includes(nextPrompt)) return
    draftPrompt.value = `${current}\n\n${nextPrompt}`
    if (source) {
        draftSource.value = source
    }
}

const sendDraftToStudio = () => {
    const prompt = draftPrompt.value.trim()
    if (!prompt) return
    emit('send-to-studio', prompt)
}

const clearDraft = () => {
    draftPrompt.value = ''
    draftSource.value = ''
}

const copyDraft = async () => {
    await copyText(draftPrompt.value)
}

const copyReversePrompt = async () => {
    await copyText(reversePrompt.value)
}

const copyText = async (value: string) => {
    if (!value.trim()) return
    try {
        await navigator.clipboard.writeText(value)
        copyStatus.value = '已复制'
        window.setTimeout(() => {
            copyStatus.value = ''
        }, 1600)
    } catch {
        copyStatus.value = '复制失败，请手动选择文本'
    }
}

const readImagesFromEvent = async (event: Event): Promise<string[]> => {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || []).filter(file => file.type.startsWith('image/'))
    const dataUrls = await Promise.all(files.map(file => readFileAsDataUrl(file)))
    input.value = ''
    return dataUrls
}

const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(reader.error || new Error('图片读取失败'))
        reader.readAsDataURL(file)
    })

const removeAt = <T,>(items: T[], index: number) => items.filter((_, itemIndex) => itemIndex !== index)

defineExpose({
    setAnalysisResult,
    setAnalysisError
})
</script>
