<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import brandMark from './assets/mark.svg'
import { exportMarkdown, exportWord } from './export'
import { recognizeImage } from './ocr'
import { parseIntake } from './intake'
import { BookOpen, Search, Plus, Download, Upload, Copy, Pencil, Trash2, X, Check, Star, FolderOpen, Settings, RotateCcw, CalendarCheck, ChevronRight, ScanText } from '@lucide/vue'
import { addUsage, changeStatus, emptyLibrary, formatCredit, librarySchema, mergeLibrary, mergeQuotes, newQuote, normalizedText, normalizeCreditPrefix, quoteSchema, quoteStatus, removeCategory, searchQuotes, statusLabels, undoUsage, type Category, type Library, type LiteratureType, type Quote, type QuoteStatus } from './model'

const library = ref(emptyLibrary())
const literatureLabels = computed<Record<string, string>>(() => Object.fromEntries([
    ['unclassified', '未归类'], ...library.value.categories.map(c => [c.id, c.name])
]))
const categoryDraft = ref<Category[]>([])
const categoryName = ref('')
const categoryNameInput = ref<HTMLInputElement>()
const pendingCategory = ref('')
const incomingLibrary = ref<Library | null>(null)
const palettes = [{ id: 'bamboo', name: '宣纸' }, { id: 'sea', name: '海盐' }, { id: 'rose', name: '胭脂' }]
const palette = ref('bamboo')
try {
    const saved = localStorage.getItem('shiju-palette')
    if (palettes.some(p => p.id === saved)) palette.value = saved!
} catch { /* Storage may be disabled by the browser. */ }
watch(palette, value => {
    document.documentElement.dataset.palette = value
    try { localStorage.setItem('shiju-palette', value) } catch { /* The current session still uses the selected palette. */ }
}, { immediate: true })
const ready = ref(false)
const busy = ref(false)
const loadError = ref('')
const path = ref('')
const query = ref('')
const status = ref('unused')
const literature = ref<LiteratureType | ''>('')
const favoritesOnly = ref(false)
const expand = ref(true)
const sort = ref('newest')
const selectedId = ref('')
const notice = ref('')
const error = ref('')
const modal = ref('')
const dialog = ref<HTMLDialogElement>()
const draft = ref<Quote>(newQuote())
const importText = ref('')
const importSource = ref('')
const importLiterature = ref<LiteratureType>('unclassified')
const importStatus = ref<QuoteStatus>('unused')
const incoming = ref<Quote[] | null>(null)
const fileName = ref('')
const importMode = ref('paragraph')
const autoCredit = ref(true)
const draftAutoCredit = ref(true)
const knownAuthors = computed(() => [...new Set(library.value.quotes.map(q => q.author).filter(Boolean))])
const useDate = ref(localDate())
const usePurpose = ref('日历海报')
const pendingUsage = ref('')
const nextStatus = ref<QuoteStatus>('unused')
const statusReason = ref('')
const batchIds = ref<string[]>([])
const batchLiterature = ref<LiteratureType>('unclassified')
const visibleLimit = ref(80)
const checkedIds = ref<string[]>([])
const checkedSet = computed(() => new Set(checkedIds.value))
const checkedQuotes = computed(() => library.value.quotes.filter(q => checkedSet.value.has(q.id)))
const exportIds = ref<string[]>([])
const exportFormat = ref<'md' | 'docx' | 'txt'>('md')
const exportStatus = ref(false)
const exporting = ref(false)
const ocrFile = ref<File>()
const ocrPreview = ref('')
const ocrResult = ref('')
const recognizing = ref(false)
const ocrProgress = ref(0)
const ocrStage = ref('')
const statusCounts = computed(() => Object.fromEntries(Object.keys(statusLabels).map(s => [s, library.value.quotes.filter(q => quoteStatus(q) === s).length])))
const unused = computed(() => statusCounts.value.unused || 0)
const needsReview = (q: Quote) => !q.reviewed && (q.reviewFlags.length > 0 || quoteStatus(q) === 'uncertain')
const reviewCount = computed(() => library.value.quotes.filter(needsReview).length)
const viewTitle = computed(() => favoritesOnly.value ? '收藏' : status.value === 'all' ? '全部文字' : status.value === 'review' ? '待核对原文' : statusLabels[status.value as QuoteStatus])
const filtered = computed(() => {
    const pool = library.value.quotes.filter(q =>
        (status.value === 'all' || (status.value === 'review' ? needsReview(q) : quoteStatus(q) === status.value)) &&
        (!literature.value || q.literatureType === literature.value) &&
        (!favoritesOnly.value || q.favorite))
    const found = searchQuotes(pool, query.value, expand.value)
    if (!query.value.trim() || sort.value !== 'relevance') {
        found.sort((a, b) => sort.value === 'shortest' ? a.text.length - b.text.length :
            sort.value === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt))
    }
    return found
})
const visibleQuotes = computed(() => filtered.value.slice(0, visibleLimit.value))
const allFilteredChecked = computed(() => filtered.value.length > 0 && filtered.value.every(q => checkedSet.value.has(q.id)))
const someFilteredChecked = computed(() => filtered.value.some(q => checkedSet.value.has(q.id)) && !allFilteredChecked.value)
watch([query, status, literature, favoritesOnly, sort], () => { visibleLimit.value = 80 })
const selected = computed(() => filtered.value.find(q => q.id === selectedId.value) || filtered.value[0])
const importPreview = computed(() => incoming.value || importText.value.trim()
    .split(importMode.value === 'line' ? /\r?\n/ : /\r?\n\s*\r?\n/).map(s => s.trim()).filter(Boolean)
    .map(text => {
        const parsed = autoCredit.value ? parseIntake(text, knownAuthors.value) : null
        return { ...newQuote(text), ...(parsed?.recognized ? { text: parsed.text, author: parsed.author, creditPrefix: parsed.creditPrefix,
            source: parsed.source, originalInput: parsed.originalInput } : {}), source: parsed?.source || importSource.value.trim(),
            literatureType: importLiterature.value, status: importStatus.value }
    }))
const mergePreview = computed(() => incomingLibrary.value ? mergeLibrary(library.value, incomingLibrary.value) :
    { ...mergeQuotes(library.value.quotes, importPreview.value), categories: library.value.categories })

function localDate() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function flash(text: string) { notice.value = text }
async function load() {
    loadError.value = ''
    try {
        const response = await fetch('/api/text-library')
        const body = await response.json()
        if (!response.ok) throw new Error(body.error)
        library.value = librarySchema.parse(body.data)
        path.value = body.path
        ready.value = true
    } catch (e) { loadError.value = e instanceof Error ? e.message : '读取失败'; ready.value = false }
}
async function persist(quotes: Quote[], categories = library.value.categories) {
    if (!ready.value || busy.value) return false
    busy.value = true
    error.value = ''
    try {
        const response = await fetch('/api/text-library', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(librarySchema.parse({ ...library.value, quotes, categories }))
        })
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || '保存失败')
        library.value = librarySchema.parse(body.data)
        return true
    } catch (e) {
        error.value = e instanceof Error ? e.message : '保存失败，请重试'
        return false
    } finally { busy.value = false }
}
async function openModal(name: string) {
    error.value = ''
    modal.value = name
    await nextTick()
    dialog.value?.showModal()
}
function closeModal() {
    if (busy.value || exporting.value || recognizing.value) return
    if (modal.value === 'ocr') clearOcrPreview()
    dialog.value?.close()
    modal.value = ''
    error.value = ''
}
function clearOcrPreview() {
    if (ocrPreview.value) URL.revokeObjectURL(ocrPreview.value)
    ocrPreview.value = ''
}
function openOcr() {
    clearOcrPreview(); ocrFile.value = undefined; ocrResult.value = ''; ocrStage.value = ''; ocrProgress.value = 0
    openModal('ocr')
}
function chooseImage(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    clearOcrPreview(); ocrFile.value = undefined; ocrResult.value = ''; error.value = ''
    if (file.size > 15 * 1024 * 1024) { error.value = '图片超过 15 MB，请先缩小图片。'; input.value = ''; return }
    ocrFile.value = file
    ocrPreview.value = URL.createObjectURL(file)
    ocrStage.value = ''
    input.value = ''
}
async function runOcr() {
    if (!ocrFile.value) return
    recognizing.value = true; error.value = ''; ocrProgress.value = 0; ocrResult.value = ''
    try {
        ocrResult.value = await recognizeImage(ocrFile.value, value => {
            ocrProgress.value = value.percent; ocrStage.value = value.stage
        })
        ocrStage.value = '识别完成，请核对正文与署名'
    } catch (e) { error.value = e instanceof Error ? e.message : '识别失败，请换用更清晰的图片重试。' }
    finally { recognizing.value = false }
}
function acceptOcr() {
    const text = ocrResult.value.trim()
    if (!text || text.length > 20000) { error.value = '请将待收录文字控制在 1 到 20,000 字以内。'; return }
    const quote = { ...newQuote(text), notes: `图片识字：${ocrFile.value?.name || ''}` }
    closeModal()
    edit(quote)
}
function toggleChecked(id: string) {
    checkedIds.value = checkedSet.value.has(id) ? checkedIds.value.filter(value => value !== id) : [...checkedIds.value, id]
}
function toggleFiltered() {
    const ids = new Set(filtered.value.map(q => q.id))
    checkedIds.value = allFilteredChecked.value ? checkedIds.value.filter(id => !ids.has(id)) : [...new Set([...checkedIds.value, ...ids])]
}
function openExport(quotes: Quote[]) {
    exportIds.value = quotes.map(q => q.id)
    exportStatus.value = false
    openModal('export')
}
async function saveExport() {
    const ids = new Set(exportIds.value)
    const quotes = library.value.quotes.filter(q => ids.has(q.id))
    if (!quotes.length) return
    exporting.value = true
    error.value = ''
    try {
        const blob = exportFormat.value === 'docx' ? await exportWord(quotes, exportStatus.value) :
            new Blob([exportFormat.value === 'md' ? exportMarkdown(quotes, exportStatus.value) :
                quotes.map(q => [q.text, formatCredit(q, false), ...(exportStatus.value ? [`状态：${statusLabels[quoteStatus(q)]}`] : [])].filter(Boolean).join('\n')).join('\n\n')],
            { type: exportFormat.value === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8' })
        saveBlob(blob, `拾句-${quotes.length}条-${localDate()}.${exportFormat.value}`)
        exporting.value = false
        closeModal(); flash(`已导出 ${quotes.length} 条文案`)
    } catch (e) { error.value = e instanceof Error ? e.message : '导出失败，请重试' }
    finally { exporting.value = false }
}
function saveBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = name; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function edit(quote?: Quote) {
    draft.value = quote ? structuredClone(quoteSchema.parse(quote)) : newQuote()
    draft.value.status = quoteStatus(draft.value)
    draftAutoCredit.value = true
    extractDraftCredit()
    openModal('edit')
}
function extractDraftCredit() {
    if (!draftAutoCredit.value) return
    if (draft.value.author.trim() || draft.value.source.trim() || draft.value.creditPrefix.trim()) return
    const parsed = parseIntake(draft.value.text, knownAuthors.value)
    if (parsed.recognized) {
        draft.value = { ...draft.value, text: parsed.text, author: parsed.author, creditPrefix: parsed.creditPrefix,
            source: parsed.source, originalInput: draft.value.originalInput || parsed.originalInput }
    }
}
function restoreIntake() {
    draft.value = { ...draft.value, text: draft.value.originalInput, originalInput: '', author: '', creditPrefix: '', source: '' }
    draftAutoCredit.value = false
}
function pasteDraft(event: ClipboardEvent) {
    const text = event.clipboardData?.getData('text/plain')
    if (!text) return
    const input = event.target as HTMLTextAreaElement
    event.preventDefault()
    draft.value.text = draft.value.text.slice(0, input.selectionStart) + text + draft.value.text.slice(input.selectionEnd)
    extractDraftCredit()
}
async function saveQuote() {
    extractDraftCredit()
    let q = { ...draft.value, text: draft.value.text.trim(), creditPrefix: normalizeCreditPrefix(draft.value.creditPrefix), updatedAt: new Date().toISOString() }
    const previous = library.value.quotes.find(item => item.id === q.id)
    if (previous && quoteStatus(previous) !== quoteStatus(q)) {
        q = { ...q, statusHistory: changeStatus(previous, quoteStatus(q), q.statusReason || '手动编辑状态', q.reviewed).statusHistory }
    }
    if (!q.text) { error.value = '请填写正文'; return }
    if (library.value.quotes.some(item => item.id !== q.id && normalizedText(item.text) === normalizedText(q.text))) {
        error.value = '这段文字已经收录，请搜索原文查看现有记录。'; return
    }
    const quotes = library.value.quotes.some(item => item.id === q.id)
        ? library.value.quotes.map(item => item.id === q.id ? q : item) : [...library.value.quotes, q]
    if (await persist(quotes)) { selectedId.value = q.id; closeModal(); flash('文字已保存') }
}
async function toggleFavorite(q: Quote) {
    if (await persist(library.value.quotes.map(item => item.id === q.id ? { ...item, favorite: !item.favorite } : item))) {
        flash(q.favorite ? '已取消收藏' : '已加入收藏')
    }
}
async function copy(q: Quote) {
    try { await navigator.clipboard.writeText(q.text); flash('已复制文案，使用状态未改变') }
    catch { error.value = '复制失败，请选中正文手动复制。' }
}
async function copyCredit(q: Quote) {
    try { await navigator.clipboard.writeText(formatCredit(q, false)); flash('已复制作者及出处') }
    catch { error.value = '复制失败，请手动选中署名复制。' }
}
function openUsage() { useDate.value = localDate(); usePurpose.value = '日历海报'; openModal('use') }
function openStatus() {
    if (!selected.value) return
    nextStatus.value = quoteStatus(selected.value)
    statusReason.value = ''
    openModal('status')
}
async function saveStatus() {
    if (!selected.value) return
    const id = selected.value.id
    if (await persist(library.value.quotes.map(q => q.id === id ? changeStatus(q, nextStatus.value, statusReason.value.trim() || '手动确认状态') : q))) {
        closeModal(); flash(`已改为${statusLabels[nextStatus.value]}`)
    }
}
function openBatch() {
    batchIds.value = filtered.value.map(q => q.id)
    batchLiterature.value = literature.value || 'unclassified'
    openModal('batch')
}
async function openCategories(add = false) {
    categoryDraft.value = library.value.categories.map(c => ({ ...c }))
    categoryName.value = ''; pendingCategory.value = ''
    await openModal('categories')
    if (add) categoryNameInput.value?.focus()
}
function addCategory() {
    const name = categoryName.value.trim()
    if (!name || name === '未归类' || categoryDraft.value.some(c => c.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
        error.value = '请填写不重复的分类名称，“未归类”为保留名称。'; return
    }
    if (categoryDraft.value.length >= 200) { error.value = '最多可创建 200 个分类。'; return }
    categoryDraft.value.push({ id: crypto.randomUUID(), name })
    categoryName.value = ''; error.value = ''
}
async function saveCategories() {
    const removed = library.value.categories.filter(c => !categoryDraft.value.some(d => d.id === c.id))
    const next = removed.reduce((value, c) => removeCategory(value, c.id), library.value)
    if (categoryDraft.value.some(c => c.name.trim() === '未归类')) { error.value = '“未归类”为保留名称。'; return }
    if (await persist(next.quotes, categoryDraft.value)) {
        if (literature.value && !literatureLabels.value[literature.value]) literature.value = ''
        closeModal(); flash('分类已保存')
    }
}
async function saveBatch() {
    const ids = new Set(batchIds.value)
    if (await persist(library.value.quotes.map(q => ids.has(q.id) ? { ...q, literatureType: batchLiterature.value, updatedAt: new Date().toISOString() } : q))) {
        closeModal(); flash(`已将 ${ids.size} 条归为${literatureLabels.value[batchLiterature.value]}`)
    }
}
async function saveUsage() {
    if (!selected.value || !useDate.value || !usePurpose.value.trim()) { error.value = '请填写使用日期和用途'; return }
    const id = selected.value.id
    const usage = { id: crypto.randomUUID(), date: useDate.value, purpose: usePurpose.value.trim() }
    if (await persist(library.value.quotes.map(q => q.id === id ? addUsage(q, usage) : q))) {
        closeModal(); flash('已记录使用')
    }
}
async function removeUsage() {
    if (!selected.value) return
    const id = selected.value.id
    if (await persist(library.value.quotes.map(q => q.id === id ? undoUsage(q, pendingUsage.value) : q))) {
        closeModal(); flash('已撤销这次使用记录')
    }
}
async function removeQuote() {
    if (!selected.value) return
    if (await persist(library.value.quotes.filter(q => q.id !== selected.value!.id))) { closeModal(); flash('文字已删除') }
}
function openImport() {
    importText.value = ''; incoming.value = null; incomingLibrary.value = null; fileName.value = ''; importLiterature.value = 'unclassified'; importStatus.value = 'unused'
    openModal('import')
}
async function readImport(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    error.value = ''
    try {
        if (file.size > 25 * 1024 * 1024) throw new Error('文件超过 25 MB，请分批导入')
        const text = await file.text()
        if (file.name.toLowerCase().endsWith('.json')) {
            incomingLibrary.value = librarySchema.parse(JSON.parse(text))
            incoming.value = incomingLibrary.value.quotes
            importText.value = ''
        } else { incoming.value = null; incomingLibrary.value = null; importText.value = text.replace(/^\uFEFF/, '') }
        fileName.value = file.name
    } catch { error.value = '导入失败。请选择 UTF-8 TXT 或本工具导出的 JSON 备份。'; incoming.value = null; incomingLibrary.value = null; fileName.value = ''; importText.value = '' }
    input.value = ''
}
async function commitImport() {
    const result = mergePreview.value
    if (!result.added && result.categories.length === library.value.categories.length) { error.value = '没有可新增的文字或分类'; return }
    const addedCategories = result.categories.length - library.value.categories.length
    if (await persist(result.quotes, result.categories)) { closeModal(); flash(`已收录 ${result.added} 条，新增 ${addedCategories} 个分类，跳过 ${result.skipped} 条重复文字`) }
}
function download(kind: 'json' | 'txt') {
    const contents = kind === 'json' ? JSON.stringify(library.value, null, 2) :
        filtered.value.map(q => [q.text, formatCredit(q)].filter(Boolean).join('\n')).join('\n\n')
    const url = URL.createObjectURL(new Blob([contents], { type: kind === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url; a.download = `拾句-${kind === 'json' ? '完整备份' : '筛选结果'}-${localDate()}.${kind}`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    flash(kind === 'json' ? '完整备份已导出' : `已导出 ${filtered.value.length} 条文字`)
}
function resetFilters() { query.value = ''; literature.value = ''; status.value = 'all'; favoritesOnly.value = false }
onMounted(load)
onUnmounted(clearOcrPreview)
</script>

<template>
    <div class="app-shell">
        <aside class="sidebar">
            <div class="brand"><img :src="brandMark" width="38" height="38" alt="" /><div><h1>拾句</h1><span>本地文字库</span></div></div>
            <button class="primary new-button" :disabled="!ready || busy" @click="edit()"><Plus :size="18" />收录文字</button>
            <nav aria-label="文字状态">
                <button v-for="(label, key) in statusLabels" :key="key" :class="{ active: status === key && !favoritesOnly }" @click="status = key; favoritesOnly = false"><span><i :class="['state-mark', key]"></i>{{ label }}</span><b>{{ statusCounts[key] }}</b></button>
                <button :class="{ active: status === 'all' && !favoritesOnly }" @click="status = 'all'; favoritesOnly = false"><span>全部文字</span><b>{{ library.quotes.length }}</b></button>
                <button :class="{ active: status === 'review' && !favoritesOnly }" @click="status = 'review'; favoritesOnly = false"><span>待核对原文</span><b>{{ reviewCount }}</b></button>
                <button :class="{ active: favoritesOnly }" @click="favoritesOnly = !favoritesOnly; status = 'all'"><span><Star :size="15" />收藏</span><b>{{ library.quotes.filter(q => q.favorite).length }}</b></button>
            </nav>
            <div class="section-label"><span>我的分类</span><div class="category-tools"><button class="icon-button" title="新增分类" aria-label="新增分类" :disabled="!ready || busy" @click="openCategories(true)"><Plus :size="17" /></button><button class="icon-button" title="管理分类" aria-label="管理分类" :disabled="!ready || busy" @click="openCategories()"><Settings :size="14" /></button></div></div>
            <nav class="category-nav" aria-label="分类">
                <button class="mobile-manage icon-button" title="新增分类" aria-label="新增分类" :disabled="!ready || busy" @click="openCategories(true)"><Plus :size="17" /></button>
                <button class="mobile-manage icon-button" title="管理分类" aria-label="管理分类" :disabled="!ready || busy" @click="openCategories()"><Settings :size="14" /></button>
                <button :class="{ active: !literature }" @click="literature = ''"><span>全部分类</span></button>
                <button v-for="(label, key) in literatureLabels" :key="key" :class="{ active: literature === key }" @click="literature = key"><span>{{ label }}</span><b>{{ library.quotes.filter(q => q.literatureType === key).length }}</b></button>
            </nav>
            <div class="palette-picker" aria-label="配色方案"><button v-for="p in palettes" :key="p.id" :class="['palette-swatch', p.id]" :aria-label="p.name + '配色'" :title="p.name" :aria-pressed="palette === p.id" @click="palette = p.id"><Check v-if="palette === p.id" :size="13" /></button><span>{{ palettes.find(p => p.id === palette)?.name }}</span></div>
            <button class="storage-button" @click="openModal('storage')"><Settings :size="16" />数据与备份<span class="local-dot"></span></button>
        </aside>

        <main>
            <header class="topbar">
                <div><span class="eyebrow">文字素材</span><h2>{{ viewTitle }}<span>{{ filtered.length }}</span></h2></div>
                <div class="actions">
                    <button :disabled="!ready || busy" title="图片识字" aria-label="图片识字" @click="openOcr"><ScanText :size="16" /><span>图片识字</span></button>
                    <button :disabled="!ready || busy || !filtered.length" title="批量归类" aria-label="批量归类" @click="openBatch"><FolderOpen :size="16" /><span>批量归类</span></button>
                    <button :disabled="!ready || busy" title="批量导入" aria-label="批量导入" @click="openImport"><Download :size="16" /><span>批量导入</span></button>
                    <button :disabled="!ready || !filtered.length" title="导出结果" aria-label="导出结果" @click="openExport(filtered)"><Upload :size="16" /><span>导出结果</span></button>
                </div>
            </header>
            <section class="search-section" aria-label="搜索筛选">
                <div class="search-box"><Search :size="20" /><input v-model="query" aria-label="搜索文字" placeholder="搜索关键词、作者或作品" @input="sort = 'relevance'" /><button v-if="query" class="icon-button" aria-label="清空搜索" title="清空搜索" @click="query = ''"><X :size="16" /></button></div>
                <div class="filter-row"><span class="breadcrumb"><FolderOpen :size="15" />{{ literature ? literatureLabels[literature] : '全部分类' }}<ChevronRight :size="13" />{{ filtered.length }} 条</span><label class="checkbox"><input v-model="expand" type="checkbox" />近义词匹配</label><select v-model="sort" aria-label="排序"><option value="relevance">相关度优先</option><option value="newest">最新入库</option><option value="oldest">最早入库</option><option value="shortest">短句优先</option></select></div>
            </section>
            <div v-if="ready && library.quotes.length" class="selection-toolbar">
                <label class="checkbox"><input type="checkbox" :checked="allFilteredChecked" :indeterminate="someFilteredChecked" @change="toggleFiltered" />全选当前结果</label>
                <span>已选 {{ checkedQuotes.length }} 条</span>
                <button v-if="checkedQuotes.length" class="icon-button" title="清空选择" aria-label="清空选择" @click="checkedIds = []"><X :size="15" /></button>
                <button :disabled="!checkedQuotes.length" @click="openExport(checkedQuotes)"><Upload :size="15" />导出所选</button>
            </div>
            <div v-if="loadError" class="error-banner" role="alert">{{ loadError }}<button @click="load">重新读取</button></div>
            <div v-if="error && !modal" class="error-banner" role="alert">{{ error }}<button class="icon-button" aria-label="关闭错误" @click="error = ''"><X :size="16" /></button></div>
            <div v-if="!ready && !loadError" class="empty-state">正在读取文字库…</div>
            <div v-else-if="ready && !filtered.length" class="empty-state">
                <BookOpen :size="42" :stroke-width="1.2" /><h3>{{ library.quotes.length ? '没有符合条件的文字' : '文字库还是空的' }}</h3>
                <button v-if="library.quotes.length" @click="resetFilters"><RotateCcw :size="16" />清除筛选</button>
                <button v-else class="primary" @click="edit()"><Plus :size="16" />收录第一条</button>
            </div>
            <div v-else-if="ready" class="workspace">
                <section class="quote-list" aria-label="文字列表">
                    <div v-for="q in visibleQuotes" :key="q.id" class="quote-entry">
                    <input class="row-select" type="checkbox" :aria-label="'选择文案：' + q.text.slice(0, 30)" :checked="checkedSet.has(q.id)" @change="toggleChecked(q.id)" />
                    <button class="quote-row" :class="{ selected: selected?.id === q.id }" @click="selectedId = q.id">
                        <div class="row-top"><span :class="['status-dot', quoteStatus(q)]">{{ statusLabels[quoteStatus(q)] }}</span><span v-if="needsReview(q)" class="review-badge">待核对</span><Star v-if="q.favorite" :size="14" class="starred" /><span class="row-length">{{ q.text.length }} 字</span></div>
                        <p>{{ q.text }}</p>
                        <div class="row-bottom"><span class="row-credit">{{ formatCredit(q, false) || '未署名' }}</span><span class="row-category">{{ literatureLabels[q.literatureType] }}</span></div>
                    </button>
                    </div>
                    <div v-if="filtered.length > visibleLimit" class="load-more"><button @click="visibleLimit += 80">继续显示 {{ Math.min(80, filtered.length - visibleLimit) }} 条</button><span>{{ visibleLimit }} / {{ filtered.length }}</span></div>
                </section>
                <section v-if="selected" class="detail" aria-label="文字详情">
                    <div class="detail-toolbar"><span>文字详情</span><div class="actions">
                        <button class="icon-button" :class="{ starred: selected.favorite }" :disabled="busy" :title="selected.favorite ? '取消收藏' : '收藏'" :aria-label="selected.favorite ? '取消收藏' : '收藏'" @click="toggleFavorite(selected)"><Star :size="18" :fill="selected.favorite ? 'currentColor' : 'none'" /></button>
                        <button class="icon-button" :disabled="busy" title="编辑文字" aria-label="编辑文字" @click="edit(selected)"><Pencil :size="18" /></button>
                        <button class="icon-button danger" :disabled="busy" title="删除文字" aria-label="删除文字" @click="openModal('delete')"><Trash2 :size="18" /></button>
                    </div></div>
                    <blockquote>{{ selected.text }}</blockquote>
                    <div class="attribution">{{ formatCredit(selected) || '未署名' }}</div>
                    <div class="state-control"><span :class="['status-dot', quoteStatus(selected)]">{{ statusLabels[quoteStatus(selected)] }}</span><button :disabled="busy" @click="openStatus"><Pencil :size="14" />更改状态</button></div>
                    <p v-if="selected.statusReason" class="state-reason">{{ selected.statusReason }}</p>
                    <div v-if="needsReview(selected)" class="review-notes"><strong>待核对</strong><p v-for="flag in selected.reviewFlags" :key="flag">{{ flag }}</p></div>
                    <dl><dt>作品出处</dt><dd>{{ selected.source || '未填写' }}</dd><dt>分类</dt><dd>{{ literatureLabels[selected.literatureType] }}</dd><dt>入库日期</dt><dd>{{ new Date(selected.createdAt).toLocaleDateString('zh-CN') }}</dd></dl>
                    <div v-if="selected.notes" class="notes"><h3>备注</h3><p>{{ selected.notes }}</p></div>
                    <details v-if="selected.originalInput" class="provenance"><summary>收录原文</summary><p class="original-text">{{ selected.originalInput }}</p></details>
                    <div class="detail-actions"><button @click="copy(selected)"><Copy :size="16" />复制文案</button><button :disabled="!formatCredit(selected)" @click="copyCredit(selected)"><Copy :size="16" />复制作者及出处</button><button class="primary" :disabled="busy" @click="openUsage"><CalendarCheck :size="16" />记录使用</button></div>
                    <section class="usage-history"><h3>使用记录 <span>{{ selected.usages.length }}</span></h3>
                        <p v-if="!selected.usages.length" class="muted">{{ quoteStatus(selected) === 'used' ? '已标记使用，具体使用日期未知' : '暂无带日期的使用记录' }}</p>
                        <div v-for="usage in [...selected.usages].reverse()" :key="usage.id" class="usage-row"><CalendarCheck :size="16" /><div><strong>{{ usage.purpose }}</strong><span>{{ usage.date }}</span></div><button class="icon-button" :disabled="busy" title="撤销这次使用" aria-label="撤销这次使用" @click="pendingUsage = usage.id; openModal('undo')"><RotateCcw :size="15" /></button></div>
                    </section>
                    <details v-if="selected.provenance.length" class="provenance">
                        <summary>旧文档原文 · {{ selected.provenance.length }} 处记录</summary>
                        <section v-for="(origin, index) in selected.provenance" :key="index">
                            <div class="origin-meta">原段落 {{ origin.from }}–{{ origin.to }} · {{ statusLabels[origin.detectedStatus] }}</div>
                            <div class="color-swatches"><span v-for="color in origin.colors" :key="color"><i :style="{ background: /^[0-9A-F]{6}$/i.test(color) ? '#' + color : '#222' }"></i>{{ color }}</span></div>
                            <p class="original-text">{{ origin.text }}</p>
                            <small>{{ origin.file }}</small>
                        </section>
                    </details>
                    <details v-if="selected.statusHistory.length" class="provenance">
                        <summary>状态变更 · {{ selected.statusHistory.length }}</summary>
                        <section v-for="(entry, index) in [...selected.statusHistory].reverse()" :key="index"><div>{{ statusLabels[entry.from] }} → {{ statusLabels[entry.to] }}</div><p>{{ entry.reason }}</p><small>{{ new Date(entry.at).toLocaleString('zh-CN') }}</small></section>
                    </details>
                </section>
            </div>
            <footer><span><i class="local-dot"></i>{{ busy ? '正在保存…' : ready ? '本地文件已连接' : '未连接' }}</span><span>共 {{ library.quotes.length }} 条 · {{ unused }} 条未使用</span></footer>
        </main>
        <div v-if="notice" class="toast" role="status"><Check :size="17" /><span>{{ notice }}</span><button class="icon-button" aria-label="关闭提示" @click="notice = ''"><X :size="16" /></button></div>

        <dialog ref="dialog" @cancel="busy || exporting || recognizing ? $event.preventDefault() : closeModal()">
            <div class="modal-header"><h2>{{ ({ edit: library.quotes.some(q => q.id === draft.id) ? '编辑文字' : '收录文字', import: '批量导入', use: '记录使用', delete: '删除这条文字？', undo: '撤销这次使用？', storage: '数据与备份', status: '更改状态', batch: '批量归类', export: '导出文案', ocr: '图片识字', categories: '管理分类' } as Record<string, string>)[modal] }}</h2><button class="icon-button" aria-label="关闭" :disabled="busy || exporting || recognizing" @click="closeModal"><X :size="20" /></button></div>
            <form v-if="modal === 'categories'" @submit.prevent="saveCategories">
                <div class="category-editor">
                    <div v-for="c in categoryDraft" :key="c.id" class="category-edit-row">
                        <input v-model="c.name" :aria-label="'分类名称：' + c.id" maxlength="40" required :disabled="busy" />
                        <span>{{ library.quotes.filter(q => q.literatureType === c.id).length }} 条</span>
                        <button type="button" class="icon-button danger" :aria-label="'删除分类：' + c.name" :title="'删除分类：' + c.name" :disabled="busy" @click="pendingCategory = c.id"><Trash2 :size="16" /></button>
                        <div v-if="pendingCategory === c.id" class="category-confirm"><p>删除“{{ c.name }}”？其中的文字将移至未归类，文案不会删除。</p><button type="button" @click="pendingCategory = ''">取消</button><button type="button" class="destructive" @click="categoryDraft = categoryDraft.filter(item => item.id !== c.id); pendingCategory = ''">确认移除分类</button></div>
                    </div>
                </div>
                <div class="category-add"><input ref="categoryNameInput" v-model="categoryName" aria-label="新分类名称" placeholder="新分类名称" maxlength="40" :disabled="busy" @keydown.enter.prevent="addCategory" /><button type="button" :disabled="busy || !categoryName.trim()" title="新增分类" aria-label="新增分类" @click="addCategory"><Plus :size="17" /></button></div>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button type="button" :disabled="busy" @click="closeModal">取消</button><button class="primary" type="submit" :disabled="busy">保存分类</button></div>
            </form>
            <form v-if="modal === 'edit'" @submit.prevent="saveQuote">
                <label>正文<textarea v-model="draft.text" required rows="7" maxlength="20000" autofocus @paste="pasteDraft" @blur="extractDraftCredit" /></label>
                <label class="review-checkbox"><input v-model="draftAutoCredit" type="checkbox" @change="extractDraftCredit" />识别作者与作品</label>
                <div class="form-grid"><label>国家 / 朝代<input v-model="draft.creditPrefix" maxlength="50" placeholder="日、宋、俄罗斯、苏联" /></label><label>作者<input v-model="draft.author" maxlength="500" /></label></div>
                <label>作品<input v-model="draft.source" maxlength="2000" /></label>
                <p v-if="formatCredit(draft)" class="credit-preview">{{ formatCredit(draft) }}</p>
                <details v-if="draft.originalInput" class="provenance"><summary>本次收录原文</summary><p class="original-text">{{ draft.originalInput }}</p><button type="button" @click="restoreIntake"><RotateCcw :size="14" />还原为正文</button></details>
                <div class="form-grid"><label>分类<select v-model="draft.literatureType" aria-label="分类"><option v-for="(label, key) in literatureLabels" :key="key" :value="key">{{ label }}</option></select></label><label>使用状态<select v-model="draft.status"><option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option></select></label></div>
                <label>状态说明<input v-model="draft.statusReason" maxlength="2000" /></label>
                <label v-if="draft.provenance.length" class="review-checkbox"><input v-model="draft.reviewed" type="checkbox" />已核对原文、署名及分条</label>
                <label>备注<textarea v-model="draft.notes" rows="2" maxlength="10000" /></label>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button type="button" :disabled="busy" @click="closeModal">取消</button><button class="primary" :disabled="busy" type="submit"><Check :size="16" />{{ busy ? '保存中…' : '保存文字' }}</button></div>
            </form>
            <div v-else-if="modal === 'import'">
                <label class="file-picker"><Download :size="18" />{{ fileName || '选择 TXT / JSON 文件' }}<input type="file" accept=".txt,.json" @change="readImport" /></label>
                <template v-if="!incoming">
                    <label>待收录文字<textarea v-model="importText" rows="7" /></label>
                    <label class="review-checkbox"><input v-model="autoCredit" type="checkbox" />识别作者与作品</label>
                    <div class="form-grid"><label>分条方式<select v-model="importMode"><option value="paragraph">空行分条</option><option value="line">每行一条</option></select></label><label>统一作品<input v-model="importSource" maxlength="2000" /></label></div>
                    <div class="form-grid"><label>分类<select v-model="importLiterature" aria-label="分类"><option v-for="(label, key) in literatureLabels" :key="key" :value="key">{{ label }}</option></select></label><label>使用状态<select v-model="importStatus"><option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option></select></label></div>
                </template>
                <div class="import-summary"><strong>{{ importPreview.length }}</strong> 条待导入 <span>{{ mergePreview.added }} 条新增 · {{ mergePreview.skipped }} 条重复跳过</span></div>
                <ol v-if="importPreview.length" class="import-preview"><li v-for="q in importPreview.slice(0, 5)" :key="q.id">{{ q.text }}<div v-if="formatCredit(q)" class="preview-credit">{{ formatCredit(q) }}</div></li></ol>
                <p v-if="incoming" class="muted">新增 {{ mergePreview.categories.length - library.categories.length }} 个分类。同名分类合并；重复正文保留库内原记录，不覆盖分类和使用历史。</p>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button :disabled="busy" @click="closeModal">取消</button><button class="primary" :disabled="busy || (!mergePreview.added && mergePreview.categories.length === library.categories.length)" @click="commitImport"><Check :size="16" />确认收录 {{ mergePreview.added }} 条</button></div>
            </div>
            <form v-else-if="modal === 'use'" @submit.prevent="saveUsage">
                <label>使用日期<input v-model="useDate" type="date" required /></label>
                <label>用途<input v-model="usePurpose" maxlength="500" required /></label>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button type="button" :disabled="busy" @click="closeModal">取消</button><button class="primary" :disabled="busy" type="submit">确认使用</button></div>
            </form>
            <form v-else-if="modal === 'status'" @submit.prevent="saveStatus">
                <label>使用状态<select v-model="nextStatus"><option v-for="(label, key) in statusLabels" :key="key" :value="key">{{ label }}</option></select></label>
                <label>说明<input v-model="statusReason" maxlength="2000" /></label>
                <p class="muted modal-note">保留原始颜色和历史记录。确认后，这条文案标为已核对。</p>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button type="button" :disabled="busy" @click="closeModal">取消</button><button class="primary" type="submit" :disabled="busy">确认状态</button></div>
            </form>
            <form v-else-if="modal === 'batch'" @submit.prevent="saveBatch">
                <p class="confirm-copy">当前筛选命中的 {{ batchIds.length }} 条文字将统一更改分类，使用状态保持不变。</p>
                <label>分类<select v-model="batchLiterature" aria-label="分类"><option v-for="(label, key) in literatureLabels" :key="key" :value="key">{{ label }}</option></select></label>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button type="button" :disabled="busy" @click="closeModal">取消</button><button class="primary" type="submit" :disabled="busy">确认归类 {{ batchIds.length }} 条</button></div>
            </form>
            <form v-else-if="modal === 'export'" @submit.prevent="saveExport">
                <p class="confirm-copy">导出 {{ exportIds.length }} 条文案</p>
                <label>文件格式<select v-model="exportFormat" :disabled="exporting"><option value="md">Markdown (.md)</option><option value="docx">Word (.docx)</option><option value="txt">纯文本 (.txt)</option></select></label>
                <label class="review-checkbox"><input v-model="exportStatus" type="checkbox" :disabled="exporting" />包含使用状态</label>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button type="button" :disabled="exporting" @click="closeModal">取消</button><button class="primary" type="submit" :disabled="exporting"><Download :size="16" />{{ exporting ? '正在生成…' : '下载文件' }}</button></div>
            </form>
            <div v-else-if="modal === 'ocr'">
                <label class="file-picker"><ScanText :size="20" />{{ ocrFile?.name || '选择图片' }}<input type="file" accept="image/png,image/jpeg,image/webp,image/bmp" :disabled="recognizing" @change="chooseImage" /></label>
                <img v-if="ocrPreview" class="ocr-preview" :src="ocrPreview" alt="待识别图片" />
                <div class="ocr-controls"><span class="muted">本地识别 · 简体中文 / English</span><button :disabled="!ocrFile || recognizing" @click="runOcr"><ScanText :size="16" />{{ recognizing ? '正在识别…' : '提取文字' }}</button></div>
                <div v-if="recognizing" class="ocr-progress" role="status"><progress :value="ocrProgress" max="100"></progress><span>{{ ocrStage }} {{ ocrProgress }}%</span></div>
                <label v-if="ocrResult">识别结果<textarea v-model="ocrResult" rows="8" /></label>
                <p v-if="ocrResult" class="muted modal-note">人名、生僻字和作品名需人工校对，识别结果尚未入库。</p>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button :disabled="recognizing" @click="closeModal">取消</button><button class="primary" :disabled="recognizing || !ocrResult.trim()" @click="acceptOcr">继续收录</button></div>
            </div>
            <div v-else-if="modal === 'delete' || modal === 'undo'">
                <p class="confirm-copy">{{ modal === 'delete' ? '正文、原文位置和全部使用记录将被删除。此操作无法在界面中撤销。' : '仅删除这次使用记录。撤销最后一条记录时，恢复记录使用前的状态；旧文档已有的已用标记会保留。' }}</p>
                <p v-if="error" class="form-error" role="alert">{{ error }}</p>
                <div class="modal-footer"><button :disabled="busy" @click="closeModal">取消</button><button :class="modal === 'delete' ? 'destructive' : 'primary'" :disabled="busy" @click="modal === 'delete' ? removeQuote() : removeUsage()">{{ modal === 'delete' ? '删除文字' : '撤销记录' }}</button></div>
            </div>
            <div v-else-if="modal === 'storage'" class="storage">
                <h3>数据文件</h3><code>{{ path || '尚未连接' }}</code>
                <p>每次保存前保留上一版 .bak 备份。浏览器缓存清理不会删除文字库。</p>
                <button :disabled="!ready" @click="download('json')"><Upload :size="16" />导出完整 JSON 备份</button>
                <h3>备份内容</h3><p>正文、作者、出处、分类、备注、收藏和使用记录。导入备份时合并新文字，重复正文保留库内记录。</p>
                <h3>搜索范围</h3><p>本地关键词近似匹配，可扩展内置主题近义词。不是 AI 语义搜索，不上传文字。</p>
            </div>
        </dialog>
    </div>
</template>
