import type { StyleTemplate } from '../types'

export const styleTemplates: StyleTemplate[] = [
    {
        id: 'figurine',
        title: '桌面手办风格',
        category: '角色商品化',
        mode: 'image',
        tags: ['角色', '手办', '包装'],
        prompt: 'Create a 1/7 scale commercialized figurine of the character in the reference image, in a realistic product photography style. Place the figurine on a clean computer desk with a transparent round acrylic base, no text on the base. Show a monitor in the background displaying the ZBrush modeling process for this figurine. Add a premium toy packaging box beside the monitor, printed with flat 2D artwork based on the original reference. Preserve the character identity, costume details, colors, proportions, and recognizable accessories.',
        image: '/1.png',
        description: '把上传角色转成收藏级桌面手办，并生成包装与制作过程展示。'
    },
    {
        id: 'fastfood-solitude',
        title: '深夜食堂的孤寂',
        category: '叙事场景',
        mode: 'image',
        tags: ['电影感', '角色融入', '夜景'],
        prompt: 'Create a cinematic night scene inside a fast food restaurant. In the foreground, show a lonely table with burgers, fries, and a smartphone clearly displaying the uploaded character image. A hand reaches toward the food, suggesting solitude. In the blurred midground, a couple sits together in a quiet intimate moment; one person is a realistic cosplay interpretation of the uploaded character, preserving signature hairstyle, costume colors, props, armor, ears, wings, or other recognizable cues. Background: large glass windows, soft neon city lights, shallow depth of field. Mood: melancholic, bittersweet, cinematic.',
        image: '/2.png',
        description: '把参考角色自然融入一个有情绪张力的电影化夜间场景。'
    },
    {
        id: 'product-hero',
        title: '产品级主视觉',
        category: '商业视觉',
        mode: 'both',
        tags: ['产品', '电商', '海报'],
        prompt: 'Create a premium product hero image with a clean editorial composition. Use a precise studio lighting setup, crisp shadows, controlled reflections, and a restrained background. The main subject should be centered with enough negative space for optional headline placement. Keep textures realistic, edges sharp, colors balanced, and avoid clutter. The final image should feel like a high-end campaign visual for a modern consumer brand.',
        image: '',
        description: '适合商品、设备、包装或任意主体的高级商业主图。'
    },
    {
        id: 'character-poster',
        title: '角色宣传海报',
        category: '角色商品化',
        mode: 'both',
        tags: ['角色', '海报', '宣传'],
        prompt: 'Create a polished character promotional poster. Keep the character identity consistent and make the pose confident and readable. Use a clean graphic background, dramatic but controlled lighting, subtle atmospheric depth, and strong silhouette separation. Add visual hierarchy through composition only; do not add unreadable text. The result should look like official key art for a game, anime, or collectible launch.',
        image: '',
        description: '把角色做成官方 key art 风格的宣传图。'
    },
    {
        id: 'interior-lifestyle',
        title: '生活方式室内场景',
        category: '生活方式',
        mode: 'both',
        tags: ['室内', '生活方式', '自然光'],
        prompt: 'Create a refined lifestyle interior scene with natural daylight, tactile materials, and a calm editorial mood. Arrange the subject in a believable lived-in environment, with soft shadows, realistic scale, and a balanced composition. Use warm-neutral highlights only as lighting, not as a dominant color palette. Keep the image clean, premium, and suitable for a design magazine.',
        image: '',
        description: '适合家居、人物、产品放入自然室内环境。'
    },
    {
        id: 'fashion-lookbook',
        title: '时装 Lookbook',
        category: '人像时尚',
        mode: 'both',
        tags: ['人像', '服装', '大片'],
        prompt: 'Create a fashion lookbook image with a confident model pose, clean styling, and editorial lighting. Preserve important facial features or outfit cues from the reference if provided. Use a minimal set, refined fabric texture, accurate anatomy, and a tasteful magazine composition. Avoid exaggerated retouching and keep the final image commercially polished.',
        image: '',
        description: '适合人物、穿搭、角色服装再设计。'
    },
    {
        id: 'isometric-workspace',
        title: '等距工作台插画',
        category: '插画风格',
        mode: 'text',
        tags: ['插画', '工作台', '等距'],
        prompt: 'Create an isometric illustration of a modern creative workstation. Include a large canvas, reference image thumbnails, model controls, task history, and a clean generation panel. Use precise geometry, crisp edges, soft shadows, and a restrained palette with one red accent color. The composition should feel like a premium software product illustration, not a marketing hero graphic.',
        image: '',
        description: '适合直接文生图生成工作台、软件或工具类插画。'
    },
    {
        id: 'cinematic-environment',
        title: '电影级环境氛围',
        category: '叙事场景',
        mode: 'both',
        tags: ['电影感', '环境', '光影'],
        prompt: 'Create a cinematic environment shot with a clear focal subject, layered foreground and background depth, volumetric but restrained lighting, and realistic material response. Use a strong sense of place and story while keeping the composition uncluttered. Avoid over-saturated colors and make the image feel like a still frame from a high-budget film.',
        image: '',
        description: '适合把主体放入更完整的故事环境。'
    },
    {
        id: 'logo-to-object',
        title: 'Logo 实体化',
        category: '商业视觉',
        mode: 'image',
        tags: ['品牌', 'Logo', '实体化'],
        prompt: 'Transform the reference logo or flat graphic into a realistic physical object. Preserve the core shape, proportions, and brand recognition. Render it as a premium material object on a clean surface, with accurate bevels, soft reflections, and studio lighting. Avoid adding unrelated symbols or text. The final image should be suitable for a brand presentation.',
        image: '',
        description: '把上传的标志、图形或符号变成可展示的实体物件。'
    },
    {
        id: 'social-square',
        title: '社媒方图封面',
        category: '商业视觉',
        mode: 'both',
        tags: ['封面', '社媒', '方图'],
        prompt: 'Create a square social media cover image with a bold central subject, clean negative space, and strong readability at small sizes. Use a premium editorial composition, restrained background details, and one clear accent color. Do not include text unless explicitly requested. The image should work as a polished thumbnail or campaign cover.',
        image: '',
        description: '适合 1:1 社媒封面、活动图和缩略图。'
    }
]
