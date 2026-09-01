import type { StyleTemplate } from '../types'

export const gameAssetTemplates: StyleTemplate[] = [
    {
        id: 'game-character-bust-portrait',
        title: '人物设定图-胸像',
        category: '人物设定图',
        mode: 'text',
        tags: ['游戏素材', '人物设定', '胸像', '武侠', '古风插画'],
        prompt: 'Refined Chinese romantic wuxia game portrait illustration. Polished matte digital opaque-gouache with restrained oil-paint rendering, broad controlled brush shapes, simplified clean color planes, a softly modeled face, subtle visible brush texture, selective colored contours, grouped hair locks, and a clean production-friendly silhouette. Fine detail is concentrated around the eyes and expression; hair and clothing remain simplified and readable. Clear soft daylight with warm light on the face. Muted blue-gray and quiet lavender abstract painterly background with broad visible brushstrokes and restrained cool-warm variation. Vertical front-facing portrait with the head and shoulders fully visible and balanced breathing room around the hair. One person only. No concrete scenery, text, logo, watermark, photorealism, glossy skin, plastic 3D rendering, or dense micro-detail.',
        usageGuide: '[人物可见语义：年龄、性别、面部、发型、衣装与配件] + [上述固定段]',
        image: '',
        description: '中国浪漫武侠角色胸像基底，适合在发型、服装、气质与表情方向上继续微调或发散。',
        taxonomy: {
            output: 'character',
            styles: ['illustration', 'character', 'classical'],
            scenes: ['creative', 'history'],
            tasks: []
        }
    }
]
