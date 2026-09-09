import type { Worker } from 'tesseract.js'

export interface OcrProgress { percent: number; stage: string }
export async function recognizeImage(file: File, progress: (value: OcrProgress) => void) {
    if (file.size > 15 * 1024 * 1024) throw new Error('图片超过 15 MB，请先缩小图片。')
    const image = await createImageBitmap(file).catch(() => { throw new Error('图片无法读取，请选择 PNG、JPG 或 WebP 图片。') })
    if (image.width * image.height > 24_000_000) { image.close(); throw new Error('图片尺寸过大，请裁剪文字区域后重试。') }
    const scale = Math.min(2, 2600 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * scale)
    canvas.height = Math.round(image.height * scale)
    const context = canvas.getContext('2d')
    if (!context) { image.close(); throw new Error('无法处理图片，请重试。') }
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    image.close()
    const { createWorker, OEM, PSM } = await import('tesseract.js')
    let worker: Worker | undefined
    try {
        progress({ percent: 0, stage: '正在加载本地识字引擎' })
        worker = await createWorker(['chi_sim', 'eng'], OEM.LSTM_ONLY, {
            workerPath: `${location.origin}/ocr/worker.min.js`,
            corePath: `${location.origin}/ocr/core`,
            langPath: `${location.origin}/ocr`,
            workerBlobURL: false,
            cacheMethod: 'none',
            logger: info => {
                if (info.status === 'recognizing text') progress({ percent: Math.round(info.progress * 100), stage: '正在识别文字' })
            }
        })
        await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO, preserve_interword_spaces: '1' })
        const { data } = await worker.recognize(canvas)
        // Remove only engine-inserted spaces between adjacent Chinese characters.
        const text = data.text.replace(/(?<=[\p{Script=Han}]) +(?=[\p{Script=Han}])/gu, '').trim()
        if (!text) throw new Error('没有识别到文字，请换用更清晰的图片或裁剪文字区域。')
        return text
    } finally {
        if (worker) await worker.terminate()
        canvas.width = 0; canvas.height = 0
    }
}
