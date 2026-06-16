type PixelSize = {
    width: number
    height: number
}

const OPENAI_IMAGE_MIN_PIXELS = 655_360
const OPENAI_IMAGE_MAX_PIXELS = 8_294_400
const OPENAI_IMAGE_MAX_EDGE = 3840
const OPENAI_IMAGE_MAX_SIDE_RATIO = 3
const OPENAI_IMAGE_SIZE_UNIT = 16

export function aspectRatioToOpenAiImageSize(aspectRatio: string, imageSize = '1K'): string {
    if (imageSize.toLowerCase() === 'auto') {
        return 'auto'
    }

    const explicitSize = parsePixelSize(aspectRatio)
    if (explicitSize) {
        return formatPixelSize(constrainOpenAiImageSize(explicitSize))
    }

    const ratio = clampAspectRatio(parseAspectRatio(aspectRatio) || { width: 1, height: 1 })
    const targetPixels = imageSize.toUpperCase() === '4K'
        ? OPENAI_IMAGE_MAX_PIXELS
        : imageSize.toUpperCase() === '2K'
          ? 2048 * 2048
          : 1024 * 1024
    const scale = Math.sqrt(targetPixels / (ratio.width * ratio.height))

    return formatPixelSize(constrainOpenAiImageSize({
        width: ratio.width * scale,
        height: ratio.height * scale
    }))
}

export function aspectRatioToGeminiSize(aspectRatio: string, imageSize = '1K'): string {
    if (/^\d+x\d+$/i.test(aspectRatio)) {
        return aspectRatio
    }

    const sizeMap: Record<string, string> = {
        '1:1': '1024x1024',
        '2:3': '832x1248',
        '3:2': '1248x832',
        '3:4': '864x1184',
        '4:3': '1184x864',
        '4:5': '896x1152',
        '5:4': '1152x896',
        '9:16': '768x1344',
        '16:9': '1344x768',
        '21:9': '1536x672'
    }

    const baseSize = sizeMap[aspectRatio] || '1024x1024'
    return scaleSize(baseSize, imageSize)
}

export function buildAspectRatioOptions(map: Record<string, string>) {
    return Object.entries(map).map(([ratio, resolution]) => ({
        value: ratio,
        label: `${ratio} - ${resolution}`
    }))
}

export const baseAspectRatioResolutionMap: Record<string, string> = {
    '1:1': '1024x1024',
    '2:3': '832x1248',
    '3:2': '1248x832',
    '3:4': '864x1184',
    '4:3': '1184x864',
    '4:5': '896x1152',
    '5:4': '1152x896',
    '9:16': '768x1344',
    '16:9': '1344x768',
    '21:9': '1536x672'
}

export const openAiAspectRatioResolutionData: Record<string, Record<string, string>> = {
    '1K': mapAspectRatiosToOpenAiSizes(baseAspectRatioResolutionMap, '1K'),
    '2K': mapAspectRatiosToOpenAiSizes(baseAspectRatioResolutionMap, '2K'),
    '4K': mapAspectRatiosToOpenAiSizes(baseAspectRatioResolutionMap, '4K')
}

export const geminiAspectRatioResolutionData: Record<string, Record<string, string>> = {
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

function mapAspectRatiosToOpenAiSizes(map: Record<string, string>, imageSize: string): Record<string, string> {
    return Object.fromEntries(
        Object.keys(map).map(ratio => [ratio, aspectRatioToOpenAiImageSize(ratio, imageSize)])
    )
}

function parsePixelSize(size: string): PixelSize | null {
    const match = size.match(/^(\d+)x(\d+)$/i)
    if (!match) return null

    return {
        width: Number(match[1]),
        height: Number(match[2])
    }
}

function parseAspectRatio(aspectRatio: string): PixelSize | null {
    const match = aspectRatio.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/)
    if (!match) return null

    const width = Number(match[1])
    const height = Number(match[2])
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null

    return { width, height }
}

function clampAspectRatio(size: PixelSize): PixelSize {
    if (size.width >= size.height && size.width / size.height > OPENAI_IMAGE_MAX_SIDE_RATIO) {
        return { width: size.width, height: size.width / OPENAI_IMAGE_MAX_SIDE_RATIO }
    }

    if (size.height > size.width && size.height / size.width > OPENAI_IMAGE_MAX_SIDE_RATIO) {
        return { width: size.height / OPENAI_IMAGE_MAX_SIDE_RATIO, height: size.height }
    }

    return size
}

function constrainOpenAiImageSize(size: PixelSize): PixelSize {
    let constrained = clampAspectRatio(size)
    constrained = scaleToMaxEdge(constrained, OPENAI_IMAGE_MAX_EDGE)
    constrained = scaleToPixelRange(constrained, OPENAI_IMAGE_MIN_PIXELS, OPENAI_IMAGE_MAX_PIXELS)
    constrained = roundPixelSize(constrained)
    return enforceOpenAiImageConstraints(constrained)
}

function scaleToMaxEdge(size: PixelSize, maxEdge: number): PixelSize {
    const longest = Math.max(size.width, size.height)
    if (longest <= maxEdge) return size
    const scale = maxEdge / longest
    return { width: size.width * scale, height: size.height * scale }
}

function scaleToPixelRange(size: PixelSize, minPixels: number, maxPixels: number): PixelSize {
    const pixels = size.width * size.height
    if (pixels > maxPixels) {
        const scale = Math.sqrt(maxPixels / pixels)
        return roundPixelSize({ width: size.width * scale, height: size.height * scale }, Math.floor)
    }

    if (pixels < minPixels) {
        const scale = Math.sqrt(minPixels / pixels)
        return roundPixelSize({ width: size.width * scale, height: size.height * scale }, Math.ceil)
    }

    return size
}

function enforceOpenAiImageConstraints(size: PixelSize): PixelSize {
    let constrained = size

    for (let index = 0; index < 8; index += 1) {
        constrained = ensureMaxSideRatio(constrained)
        const pixels = constrained.width * constrained.height
        const longest = Math.max(constrained.width, constrained.height)

        if (longest > OPENAI_IMAGE_MAX_EDGE || pixels > OPENAI_IMAGE_MAX_PIXELS) {
            const scale = Math.min(
                OPENAI_IMAGE_MAX_EDGE / longest,
                Math.sqrt(OPENAI_IMAGE_MAX_PIXELS / pixels)
            )
            constrained = roundPixelSize({
                width: constrained.width * scale,
                height: constrained.height * scale
            }, Math.floor)
            continue
        }

        if (pixels < OPENAI_IMAGE_MIN_PIXELS) {
            const scale = Math.sqrt(OPENAI_IMAGE_MIN_PIXELS / pixels)
            constrained = roundPixelSize({
                width: constrained.width * scale,
                height: constrained.height * scale
            }, Math.ceil)
            continue
        }

        return constrained
    }

    return constrained
}

function ensureMaxSideRatio(size: PixelSize): PixelSize {
    if (size.width >= size.height && size.width / size.height > OPENAI_IMAGE_MAX_SIDE_RATIO) {
        return {
            width: size.width,
            height: roundToUnit(size.width / OPENAI_IMAGE_MAX_SIDE_RATIO, Math.ceil)
        }
    }

    if (size.height > size.width && size.height / size.width > OPENAI_IMAGE_MAX_SIDE_RATIO) {
        return {
            width: roundToUnit(size.height / OPENAI_IMAGE_MAX_SIDE_RATIO, Math.ceil),
            height: size.height
        }
    }

    return size
}

function roundPixelSize(size: PixelSize, rounder: (value: number) => number = Math.round): PixelSize {
    return {
        width: roundToUnit(size.width, rounder),
        height: roundToUnit(size.height, rounder)
    }
}

function roundToUnit(value: number, rounder: (value: number) => number): number {
    return Math.max(OPENAI_IMAGE_SIZE_UNIT, rounder(value / OPENAI_IMAGE_SIZE_UNIT) * OPENAI_IMAGE_SIZE_UNIT)
}

function formatPixelSize(size: PixelSize): string {
    return `${size.width}x${size.height}`
}

function scaleSize(size: string, imageSize = '1K'): string {
    const match = size.match(/^(\d+)x(\d+)$/i)
    if (!match) return size

    const multiplier = imageSize.toUpperCase() === '4K'
        ? 4
        : imageSize.toUpperCase() === '2K'
          ? 2
          : 1

    if (multiplier === 1) return size

    const width = Number(match[1])
    const height = Number(match[2])
    return `${width * multiplier}x${height * multiplier}`
}
