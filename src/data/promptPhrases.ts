export interface PromptPhrase {
    label: string
    value: string
}

export interface PromptPhraseGroup {
    id: string
    title: string
    description: string
    phrases: PromptPhrase[]
}

export const promptPhraseGroups: PromptPhraseGroup[] = [
    {
        id: 'shot',
        title: '景别',
        description: '控制主体在画面中的距离和信息密度。',
        phrases: [
            { label: '特写', value: 'close-up shot' },
            { label: '大特写', value: 'extreme close-up' },
            { label: '半身', value: 'medium shot' },
            { label: '全身', value: 'full-body shot' },
            { label: '远景', value: 'wide shot' },
            { label: '建立镜头', value: 'establishing shot' },
            { label: '过肩', value: 'over-the-shoulder shot' },
            { label: '低角度', value: 'low-angle shot' },
            { label: '俯拍', value: 'high-angle shot' },
            { label: '鸟瞰', value: 'bird’s-eye view' }
        ]
    },
    {
        id: 'camera',
        title: '镜头 / 摄像机',
        description: '模拟镜头语言、焦段和摄影设备质感。',
        phrases: [
            { label: '35mm', value: '35mm lens' },
            { label: '50mm', value: '50mm lens' },
            { label: '85mm 人像', value: '85mm portrait lens' },
            { label: '广角', value: 'wide-angle lens' },
            { label: '长焦压缩', value: 'telephoto compression' },
            { label: '浅景深', value: 'shallow depth of field' },
            { label: '深焦', value: 'deep focus' },
            { label: '微距', value: 'macro photography' },
            { label: '电影机', value: 'cinema camera look' },
            { label: '胶片颗粒', value: 'subtle film grain' }
        ]
    },
    {
        id: 'composition',
        title: '构图',
        description: '约束画面结构和主体位置。',
        phrases: [
            { label: '中心构图', value: 'centered composition' },
            { label: '三分法', value: 'rule of thirds composition' },
            { label: '对称', value: 'symmetrical composition' },
            { label: '留白', value: 'generous negative space' },
            { label: '强剪影', value: 'strong readable silhouette' },
            { label: '前景遮挡', value: 'foreground framing' },
            { label: '层次纵深', value: 'layered depth' },
            { label: '干净背景', value: 'clean uncluttered background' },
            { label: '产品居中', value: 'hero product centered' },
            { label: '杂志版式', value: 'editorial magazine composition' }
        ]
    },
    {
        id: 'lighting',
        title: '光线',
        description: '决定氛围、材质表现和高级感。',
        phrases: [
            { label: '柔和自然光', value: 'soft natural daylight' },
            { label: '棚拍布光', value: 'controlled studio lighting' },
            { label: '轮廓光', value: 'subtle rim light' },
            { label: '逆光', value: 'backlit scene' },
            { label: '黄金时刻', value: 'golden hour lighting' },
            { label: '阴天漫射', value: 'overcast diffused light' },
            { label: '霓虹反射', value: 'neon reflections' },
            { label: '低调光', value: 'low-key lighting' },
            { label: '高调光', value: 'high-key lighting' },
            { label: '真实阴影', value: 'realistic contact shadows' }
        ]
    },
    {
        id: 'style',
        title: '风格',
        description: '快速指定整体视觉类型。',
        phrases: [
            { label: '写实摄影', value: 'realistic photography' },
            { label: '电影感', value: 'cinematic still frame' },
            { label: '高级商业', value: 'premium commercial campaign' },
            { label: '产品摄影', value: 'high-end product photography' },
            { label: '社媒封面', value: 'polished social media cover' },
            { label: '杂志大片', value: 'editorial magazine style' },
            { label: '等距插画', value: 'isometric illustration' },
            { label: '概念艺术', value: 'concept art' },
            { label: '极简', value: 'minimal refined style' },
            { label: '复古胶片', value: 'tasteful vintage film look' }
        ]
    },
    {
        id: 'color',
        title: '色彩',
        description: '控制色调倾向和品牌统一性。',
        phrases: [
            { label: '黑白灰红', value: 'black, off-white, soft gray, and deep red palette' },
            { label: '低饱和', value: 'low-saturation color palette' },
            { label: '冷暖对比', value: 'subtle warm-cool contrast' },
            { label: '单一强调色', value: 'one clear accent color' },
            { label: '自然肤色', value: 'natural skin tones' },
            { label: '干净白底', value: 'clean off-white background' },
            { label: '深色背景', value: 'deep black background' },
            { label: '柔和渐变光', value: 'soft tonal lighting transition' },
            { label: '品牌红点缀', value: 'deep red accent details' },
            { label: '准确材质色', value: 'accurate material colors' }
        ]
    },
    {
        id: 'mood',
        title: '情绪',
        description: '给画面添加叙事和观看感受。',
        phrases: [
            { label: '冷静专业', value: 'calm professional mood' },
            { label: '高级克制', value: 'restrained premium mood' },
            { label: '孤独感', value: 'quiet solitude' },
            { label: '未来感', value: 'subtle futuristic mood' },
            { label: '温柔日常', value: 'gentle everyday atmosphere' },
            { label: '戏剧张力', value: 'controlled dramatic tension' },
            { label: '清爽明亮', value: 'clean and bright mood' },
            { label: '神秘', value: 'mysterious atmosphere' },
            { label: '自信', value: 'confident aspirational mood' },
            { label: '沉浸式', value: 'immersive atmosphere' }
        ]
    },
    {
        id: 'quality',
        title: '质量约束',
        description: '补充常见的质量、细节和一致性要求。',
        phrases: [
            { label: '主体一致', value: 'preserve subject identity and key details' },
            { label: '准确比例', value: 'accurate proportions and scale' },
            { label: '材质真实', value: 'realistic material response' },
            { label: '边缘清晰', value: 'clean sharp edges' },
            { label: '无杂乱文字', value: 'no unreadable text or random typography' },
            { label: '避免变形', value: 'avoid distorted anatomy or warped objects' },
            { label: '高清细节', value: 'high-resolution fine details' },
            { label: '自然手部', value: 'natural hands and fingers' },
            { label: '干净输出', value: 'clean polished final output' },
            { label: '可商用质感', value: 'commercially polished finish' }
        ]
    }
]
