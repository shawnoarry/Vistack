import type { CanvasWorkbenchItem } from '../types'

const CANVAS_WORKBENCH_ITEMS = 'vistack-canvas-workbench-items'

export function saveCanvasWorkbenchItems(items: CanvasWorkbenchItem[]): void {
    try {
        localStorage.setItem(CANVAS_WORKBENCH_ITEMS, JSON.stringify(items))
    } catch (error) {
        console.warn('无法保存画布工作台内容:', error)
    }
}

export function getCanvasWorkbenchItems(): CanvasWorkbenchItem[] {
    try {
        const raw = localStorage.getItem(CANVAS_WORKBENCH_ITEMS)
        if (!raw) return []

        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []

        return parsed
            .map(normalizeCanvasItem)
            .filter((item): item is CanvasWorkbenchItem => Boolean(item))
    } catch (error) {
        console.warn('无法读取画布工作台内容:', error)
        return []
    }
}

function normalizeCanvasItem(value: unknown): CanvasWorkbenchItem | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    const item = value as Partial<CanvasWorkbenchItem>

    if (!item.id || !item.image) return null

    return {
        id: String(item.id),
        image: String(item.image),
        title: typeof item.title === 'string' && item.title.trim() ? item.title : '画布图片',
        source: item.source === 'result' || item.source === 'history' || item.source === 'reference' || item.source === 'manual'
            ? item.source
            : 'manual',
        x: normalizeNumber(item.x, 40),
        y: normalizeNumber(item.y, 40),
        width: normalizeNumber(item.width, 240),
        height: normalizeNumber(item.height, 240),
        createdAt: normalizeNumber(item.createdAt, Date.now()),
        prompt: typeof item.prompt === 'string' ? item.prompt : undefined
    }
}

function normalizeNumber(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}
