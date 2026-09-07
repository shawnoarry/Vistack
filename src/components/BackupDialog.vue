<template>
    <Teleport to="body">
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3" :class="themeMode === 'dark' ? 'dark' : ''" @click.self="close">
            <section ref="dialog" role="dialog" aria-modal="true" aria-labelledby="backup-title" tabindex="-1" class="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-brand-line bg-white text-brand-ink shadow-2xl dark:border-night-muted/40 dark:bg-night-surface" data-testid="backup-dialog" @keydown="handleKeydown">
                <header class="flex items-center justify-between gap-3 border-b border-brand-line p-4">
                    <h2 id="backup-title" class="text-base font-semibold">备份与恢复</h2>
                    <button type="button" class="wb-icon-button h-9 w-9" aria-label="关闭备份与恢复" title="关闭" :disabled="Boolean(operation)" @click="close"><X :size="18" /></button>
                </header>
                <div class="flex-1 overflow-y-auto p-4 sm:p-5">
                    <div class="mb-5 grid grid-cols-2 rounded-md border border-brand-line p-1" role="tablist" aria-label="备份操作">
                        <button v-for="tab in tabs" :key="tab.value" type="button" role="tab" :aria-selected="mode === tab.value" :disabled="Boolean(operation)" :class="['min-h-10 rounded px-3 text-sm font-semibold', mode === tab.value ? 'bg-brand-ink text-white' : 'text-brand-muted']" @click="mode = tab.value; error = ''">{{ tab.label }}</button>
                    </div>
                    <div v-if="mode === 'export'">
                        <p class="text-sm leading-6 text-brand-muted">包含生成历史、原图、历史参考图、已保存的接口预设和收藏夹。</p>
                        <p class="mt-2 text-xs leading-5 text-brand-muted">ZIP 文件下载到电脑，单份上限 512 MB。不包含画布布局、工具箱独立资产、自定义模板词组和未完成任务。</p>
                        <label class="mt-5 flex items-start gap-2 text-sm">
                            <input v-model="includeCredentials" type="checkbox" class="mt-1 h-4 w-4" :disabled="Boolean(operation)" />
                            <span>包含 API 密钥和代理密码<span class="mt-1 block text-xs text-brand-muted">默认不包含。勾选后，备份文件含明文密钥，请妥善保管。</span></span>
                        </label>
                        <button type="button" class="wb-primary mt-5 min-h-11 px-4" :disabled="Boolean(operation)" @click="exportArchive"><Download :size="16" class="mr-2" />{{ operation === 'export' ? '正在备份...' : '下载 ZIP 备份' }}</button>
                        <button v-if="operation === 'export'" type="button" class="wb-secondary ml-2 min-h-11 px-4" @click="controller?.abort()">取消</button>
                        <div v-if="exported" class="mt-5 border-t border-brand-line pt-4" data-testid="backup-export-result">
                            <p class="text-sm font-semibold">{{ exported.manifest.missingImages.length ? '备份不完整：部分图片未能保存' : '备份文件已生成' }}</p>
                            <p class="mt-2 text-sm text-brand-muted">{{ exported.manifest.records.length }} 组记录 · {{ exported.manifest.files.length }} 个图片文件 · {{ formatBytes(exported.blob.size) }}</p>
                            <button type="button" class="wb-secondary mt-3 min-h-10 px-3 text-sm" @click="downloadArchive"><Download :size="15" class="mr-1.5" />{{ exported.manifest.missingImages.length ? '下载不完整备份' : '再次下载' }}</button>
                            <details v-if="exported.manifest.missingImages.length" class="mt-3 text-sm text-brand-accent" open>
                                <summary>缺失 {{ exported.manifest.missingImages.length }} 张图片</summary>
                                <ul class="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs leading-5">
                                    <li v-for="(missing, index) in exported.manifest.missingImages" :key="index" class="break-all">{{ missing.recordId }} · {{ missing.kind === 'generated' ? '生成图' : '参考图' }} {{ missing.index + 1 }}：{{ missing.reason }}</li>
                                </ul>
                            </details>
                        </div>
                    </div>
                    <div v-else>
                        <input ref="fileInput" type="file" accept=".zip,application/zip" class="sr-only" aria-label="选择 ZIP 备份" :disabled="Boolean(operation)" @change="selectArchive" />
                        <button type="button" class="wb-secondary min-h-11 px-4" :disabled="Boolean(operation)" @click="fileInput?.click()"><Upload :size="16" class="mr-2" />选择 ZIP 备份</button>
                        <p v-if="filename" class="mt-2 break-all text-xs text-brand-muted">{{ filename }}</p>
                        <p class="mt-3 text-xs leading-5 text-brand-muted">最多 512 MB。已有记录和预设会保留，重复项跳过。</p>
                        <div v-if="parsed" class="mt-5 border-t border-brand-line pt-4" data-testid="backup-import-preview">
                            <h3 class="text-sm font-semibold">备份内容</h3>
                            <dl class="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
                                <dt class="text-brand-muted">备份时间</dt><dd>{{ new Date(parsed.manifest.createdAt).toLocaleString() }}</dd>
                                <dt class="text-brand-muted">生成记录</dt><dd>{{ parsed.manifest.records.length }} 组</dd>
                                <dt class="text-brand-muted">图片文件</dt><dd>{{ parsed.manifest.files.length }} 个</dd>
                                <dt class="text-brand-muted">接口预设</dt><dd>{{ parsed.manifest.apiPresets.length + parsed.manifest.assistantPresets.length }} 个</dd>
                                <dt class="text-brand-muted">缺失图片</dt><dd>{{ parsed.manifest.missingImages.length }} 张</dd>
                            </dl>
                            <p v-if="parsed.manifest.missingImages.length" class="mt-3 text-xs leading-5 text-brand-accent">此备份不完整，缺失的图片无法恢复。</p>
                            <label v-if="parsed.manifest.includesCredentials" class="mt-4 flex items-center gap-2 text-sm"><input v-model="restoreCredentials" type="checkbox" class="h-4 w-4" :disabled="Boolean(operation)" />恢复备份中的 API 密钥和代理密码</label>
                            <p v-if="restoreBlocked" class="mt-3 text-xs leading-5 text-brand-accent">{{ restoreBlocked }}</p>
                            <button type="button" class="wb-primary mt-4 min-h-11 px-4" :disabled="Boolean(operation) || Boolean(restoreBlocked)" @click="importArchive"><Upload :size="16" class="mr-2" />{{ operation === 'restore' ? '正在恢复...' : '合并恢复' }}</button>
                        </div>
                        <div v-if="restored" class="mt-5 border-t border-brand-line pt-4 text-sm" role="status" data-testid="backup-restore-result">
                            <p class="font-semibold">{{ restored.settingsError ? '部分恢复完成' : '恢复完成' }}</p>
                            <p class="mt-2 text-brand-muted">新增 {{ restored.imported }} 组记录，跳过 {{ restored.skipped }} 组；新增 {{ restored.importedPresets }} 个接口预设，跳过 {{ restored.skippedPresets }} 个。</p>
                            <p v-if="restored.settingsError" class="mt-2 text-brand-accent">{{ restored.settingsError }}</p>
                        </div>
                    </div>
                    <p v-if="operation" class="mt-4 flex items-center gap-2 text-sm text-brand-muted" role="status"><LoaderCircle :size="16" class="shrink-0 animate-spin" />{{ progress }}</p>
                    <p v-if="error" class="mt-4 break-words text-sm text-brand-accent" role="alert">{{ error }}</p>
                </div>
            </section>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { Download, LoaderCircle, Upload, X } from '@lucide/vue'
import { createBackup, inspectBackup, restoreBackup, type ParsedBackup } from '../utils/backup'
import type { GenerationHistoryItem } from '../utils/historyDb'

const props = defineProps<{ history: GenerationHistoryItem[]; unsavedIds: string[]; restoreBlocked: string; themeMode: 'light' | 'dark' }>()
const emit = defineEmits<{ close: []; restored: [] }>()
const dialog = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const tabs = [{ value: 'export', label: '导出备份' }, { value: 'import', label: '从备份恢复' }] as const
const mode = ref<'export' | 'import'>('export')
const operation = ref<'' | 'export' | 'inspect' | 'restore'>('')
const progress = ref('')
const error = ref('')
const filename = ref('')
const includeCredentials = ref(false)
const restoreCredentials = ref(false)
const controller = shallowRef<AbortController>()
const exported = shallowRef<Awaited<ReturnType<typeof createBackup>>>()
const parsed = shallowRef<ParsedBackup>()
const restored = shallowRef<Awaited<ReturnType<typeof restoreBackup>>>()
const previousFocus = document.activeElement as HTMLElement | null
const urls = new Set<string>()

function close() { if (!operation.value) emit('close') }
function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() }
    if (event.key !== 'Tab') return
    const targets = [...(dialog.value?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), summary, [tabindex="0"]') || [])].filter(element => element.getClientRects().length && !element.classList.contains('sr-only'))
    const first = targets[0]; const last = targets.at(-1)
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.value)) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}
function formatBytes(bytes: number) { return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB` }
function reportError(value: unknown) { error.value = value instanceof Error ? value.message.slice(0, 400) : '操作失败，请重试。' }
function downloadArchive() {
    if (!exported.value) return
    const url = URL.createObjectURL(exported.value.blob)
    urls.add(url)
    const link = document.createElement('a')
    link.href = url
    link.download = exported.value.manifest.missingImages.length ? exported.value.filename.replace('.zip', '-incomplete.zip') : exported.value.filename
    document.body.appendChild(link); link.click(); link.remove()
    window.setTimeout(() => { URL.revokeObjectURL(url); urls.delete(url) }, 60000)
}
async function exportArchive() {
    if (operation.value) return
    operation.value = 'export'; error.value = ''; exported.value = undefined
    controller.value = new AbortController()
    try {
        exported.value = await createBackup({ includeCredentials: includeCredentials.value, history: props.history, unsavedIds: props.unsavedIds, signal: controller.value.signal, onProgress: message => { progress.value = message } })
        if (!exported.value.manifest.missingImages.length) downloadArchive()
    } catch (error) { reportError(error) }
    finally { operation.value = '' }
}
async function selectArchive(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file || operation.value) return
    operation.value = 'inspect'; error.value = ''; parsed.value = undefined; restored.value = undefined
    filename.value = file.name; restoreCredentials.value = false; progress.value = '正在校验备份文件...'
    try { parsed.value = await inspectBackup(file) }
    catch (error) { reportError(error) }
    finally { operation.value = '' }
}
async function importArchive() {
    if (!parsed.value || operation.value || props.restoreBlocked) return
    operation.value = 'restore'; error.value = ''; progress.value = '正在恢复图片和记录...'
    try {
        restored.value = await restoreBackup(parsed.value, { includeCredentials: restoreCredentials.value })
        emit('restored')
    } catch { error.value = '恢复失败，图片和记录未写入。请检查浏览器可用存储空间后重试。' }
    finally { operation.value = '' }
}
const beforeUnload = (event: BeforeUnloadEvent) => {
    if (!operation.value) return
    event.preventDefault(); event.returnValue = ''
}
onMounted(() => { nextTick(() => dialog.value?.focus()); window.addEventListener('beforeunload', beforeUnload) })
onBeforeUnmount(() => {
    controller.value?.abort()
    urls.forEach(url => URL.revokeObjectURL(url))
    window.removeEventListener('beforeunload', beforeUnload)
    previousFocus?.focus()
})
</script>
