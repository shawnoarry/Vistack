import { getImageThumbnail, getStoredImage, putImageThumbnail, type ImageThumbnail } from './historyDb'

export async function createImageThumbnail(id: string, source: string): Promise<ImageThumbnail> {
    const image = new Image()
    image.src = source
    await image.decode()
    const width = image.naturalWidth
    const height = image.naturalHeight
    if (!width || !height) throw new Error('Invalid image dimensions')
    const scale = Math.min(1, 640 / Math.max(width, height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas unavailable')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/webp', 0.8)
    canvas.width = canvas.height = 0
    image.src = ''
    return { id, dataUrl, width, height }
}

export async function resolveImageThumbnail(imageId: string): Promise<ImageThumbnail | undefined> {
    const id = `v1:${imageId}`
    const cached = await getImageThumbnail(id).catch(() => undefined)
    if (cached) return cached
    const original = await getStoredImage(imageId)
    if (!original?.dataUrl) return undefined
    try {
        const thumbnail = await createImageThumbnail(id, original.dataUrl)
        // Cache quota failures must not hide a saved original.
        await putImageThumbnail(thumbnail).catch(() => undefined)
        return thumbnail
    } catch {
        return { id, dataUrl: original.dataUrl, width: 0, height: 0 }
    }
}
