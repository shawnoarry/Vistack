import type {
    StyleTemplate,
    TemplateOutputType,
    TemplateScene,
    TemplateTask,
    TemplateTaxonomy,
    TemplateVisualStyle
} from '../types'

interface FacetOption<T extends string> {
    value: T
    label: string
    aliases: readonly string[]
}

export const TEMPLATE_OUTPUT_OPTIONS: readonly FacetOption<TemplateOutputType>[] = [
    { value: 'photography', label: '摄影写实', aliases: ['摄影', '写实', '照片', '人像', 'photo', 'photography', 'realistic'] },
    { value: 'poster', label: '海报排版', aliases: ['海报', '封面', '排版', 'poster', 'cover', 'typography'] },
    { value: 'product', label: '商品电商', aliases: ['商品', '产品', '电商', '包装', 'product', 'commerce', 'packaging'] },
    { value: 'ui', label: 'UI 界面', aliases: ['ui', '界面', '应用', '仪表盘', 'dashboard', 'interface', 'app'] },
    { value: 'infographic', label: '信息图表', aliases: ['信息图', '图表', '图解', '知识图', 'infographic', 'diagram', 'chart'] },
    { value: 'brand', label: '品牌系统', aliases: ['品牌', '标志', '视觉身份', 'brand', 'logo', 'identity'] },
    { value: 'architecture', label: '建筑空间', aliases: ['建筑', '室内', '空间', 'architecture', 'interior', 'space'] },
    { value: 'illustration', label: '插画艺术', aliases: ['插画', '绘画', '水彩', '水墨', 'illustration', 'painting', 'art'] },
    { value: 'character', label: '人物角色', aliases: ['人物', '角色', '设定表', '手办', 'character', 'avatar', 'toy'] },
    { value: 'scene', label: '场景叙事', aliases: ['场景', '叙事', '分镜', '电影画面', 'scene', 'storyboard', 'cinematic'] },
    { value: 'history', label: '历史古风', aliases: ['历史', '古风', '朝代', '古典', 'history', 'dynasty', 'classical'] },
    { value: 'document', label: '文档出版', aliases: ['文档', '出版', '白皮书', '手册', 'document', 'publishing', 'manual'] },
    { value: 'other', label: '其他', aliases: ['其他', '实验', '特殊', 'other', 'experimental'] }
]

export const TEMPLATE_STYLE_OPTIONS: readonly FacetOption<TemplateVisualStyle>[] = [
    { value: 'realistic', label: '写实', aliases: ['写实', '真实', 'realistic'] },
    { value: 'photography', label: '摄影', aliases: ['摄影', '照片', '镜头', 'photography', 'photo', 'lens'] },
    { value: 'poster', label: '海报', aliases: ['海报', '封面', '排版', 'poster', 'cover', 'typography'] },
    { value: 'product', label: '商品', aliases: ['商品', '产品', '包装', 'product', 'packaging'] },
    { value: 'ui', label: 'UI', aliases: ['ui', '界面', 'dashboard', 'interface'] },
    { value: 'infographic', label: '信息图', aliases: ['信息图', '图表', '图解', 'infographic', 'diagram', 'chart'] },
    { value: 'brand', label: '品牌', aliases: ['品牌', '标志', 'brand', 'logo', 'identity'] },
    { value: 'architecture', label: '建筑', aliases: ['建筑', '室内', '空间', 'architecture', 'interior'] },
    { value: 'illustration', label: '插画', aliases: ['插画', '绘画', '水彩', '水墨', 'illustration', 'painting'] },
    { value: 'character', label: '角色', aliases: ['人物', '角色', 'character', 'avatar'] },
    { value: 'classical', label: '古典', aliases: ['古典', '古风', '历史', 'classical', 'history'] },
    { value: '3d', label: '3D', aliases: ['3d', '三维', '渲染', 'render', '玩具'] }
]

export const TEMPLATE_SCENE_OPTIONS: readonly FacetOption<TemplateScene>[] = [
    { value: 'commerce', label: '商业', aliases: ['商业', '广告', '品牌', '商品', 'commerce', 'campaign', 'ad'] },
    { value: 'education', label: '教育', aliases: ['教育', '科普', '学习', 'education', 'science', 'learning'] },
    { value: 'social', label: '社媒', aliases: ['社媒', '社交', '自拍', 'social', 'wechat'] },
    { value: 'fashion', label: '时尚', aliases: ['时尚', '穿搭', '美妆', 'fashion', 'beauty', 'clothing'] },
    { value: 'food', label: '食品饮品', aliases: ['食品', '饮品', '咖啡', '茶饮', 'food', 'drink', 'coffee', 'tea'] },
    { value: 'travel', label: '旅行城市', aliases: ['旅行', '城市', '街头', '地图', 'travel', 'city', 'street', 'map'] },
    { value: 'story', label: '叙事', aliases: ['故事', '叙事', '电影', '场景', 'story', 'cinematic', 'scene'] },
    { value: 'history', label: '历史', aliases: ['历史', '朝代', '古风', 'history', 'dynasty', 'ancient'] },
    { value: 'tech', label: '科技', aliases: ['科技', '技术', '数据', 'ai', 'tech', 'data'] },
    { value: 'creative', label: '创意', aliases: ['创意', '实验', '艺术', 'creative', 'experimental', 'art'] }
]

export const TEMPLATE_TASK_OPTIONS: readonly FacetOption<TemplateTask>[] = [
    { value: 'reference-image', label: '参考图', aliases: ['参考图', '图生图', 'reference image'] },
    { value: 'identity', label: '身份保持', aliases: ['身份保持', '人物保持', '同一个人', 'identity'] },
    { value: 'outfit', label: '换装', aliases: ['换装', '服装替换', 'outfit', 'clothing replacement'] },
    { value: 'background', label: '换背景', aliases: ['换背景', '背景替换', 'background replacement'] },
    { value: 'multi-reference', label: '多参考图', aliases: ['多参考图', '双参考图', 'multi-reference'] },
    { value: 'local-edit', label: '局部修正', aliases: ['局部修正', '视觉遮罩', '局部编辑', 'local edit', 'mask'] },
    { value: 'exact-text', label: '准确文字', aliases: ['准确文字', '中文排版', '文字替换', 'exact text', 'typography'] },
    { value: 'layout', label: '版式设计', aliases: ['版式', '排版', '信息层级', 'layout', 'composition'] }
]

export interface TemplateFacetFilters {
    output: TemplateOutputType | ''
    style: TemplateVisualStyle | ''
    scene: TemplateScene | ''
    task: TemplateTask | ''
}

const normalize = (value: string) => value.toLocaleLowerCase().replace(/[\s/_-]+/g, '')

const includesAlias = (text: string, aliases: readonly string[]) =>
    aliases.some(alias => text.includes(normalize(alias)))

const uniqueMatches = <T extends string>(text: string, options: readonly FacetOption<T>[]) =>
    options.filter(option => includesAlias(text, [option.label, option.value, ...option.aliases])).map(option => option.value)

const inferOutput = (text: string, category: string): TemplateOutputType => {
    if (['真实摄影', '人像时尚', '手机人像', '生活方式', '时尚编辑', 'K-pop 物料', 'K-pop 生态'].includes(category)) return 'photography'
    if (category === '海报排版') return 'poster'
    if (category === 'UI 与图形') return 'ui'
    if (category === '插画艺术') return 'illustration'
    if (category === '角色商品化') return 'character'
    if (['叙事场景', '电影画面', '游戏视觉'].includes(category)) return 'scene'

    const priority: readonly TemplateOutputType[] = [
        'infographic', 'document', 'brand', 'ui', 'history', 'character', 'product', 'poster',
        'architecture', 'illustration', 'scene', 'photography'
    ]
    const matches = new Set(uniqueMatches(text, TEMPLATE_OUTPUT_OPTIONS))
    const directMatch = priority.find(value => matches.has(value))
    if (directMatch) return directMatch

    if (category === '商业视觉') return 'product'
    if (category === '建筑与技术') return 'architecture'
    if (category === '美妆生活') return 'photography'
    return 'other'
}

export const inferTemplateTaxonomy = (template: StyleTemplate): TemplateTaxonomy => {
    const category = template.category || ''
    const text = normalize([
        template.title,
        template.description,
        category,
        ...(template.tags || [])
    ].join(' '))
    const output = inferOutput(text, category)
    const styles = uniqueMatches(text, TEMPLATE_STYLE_OPTIONS)
    const scenes = uniqueMatches(text, TEMPLATE_SCENE_OPTIONS)
    const tasks = uniqueMatches(text, TEMPLATE_TASK_OPTIONS)

    if (!styles.length) {
        const outputStyle = TEMPLATE_STYLE_OPTIONS.find(option => option.value === output)?.value
        if (outputStyle) styles.push(outputStyle)
    }

    return { output, styles, scenes, tasks }
}

export const getTemplateTaxonomy = (template: StyleTemplate): TemplateTaxonomy =>
    template.taxonomy || inferTemplateTaxonomy(template)

export const sanitizeTemplateTaxonomy = (value: unknown): TemplateTaxonomy | undefined => {
    if (!value || typeof value !== 'object') return undefined

    const candidate = value as Partial<Record<keyof TemplateTaxonomy, unknown>>
    const output = TEMPLATE_OUTPUT_OPTIONS.find(option => option.value === candidate.output)?.value
    if (!output) return undefined

    const validValues = <T extends string>(input: unknown, options: readonly FacetOption<T>[]) => {
        if (!Array.isArray(input)) return []
        const allowed = new Set(options.map(option => option.value))
        return input.filter((item): item is T => typeof item === 'string' && allowed.has(item as T))
    }

    return {
        output,
        styles: validValues(candidate.styles, TEMPLATE_STYLE_OPTIONS),
        scenes: validValues(candidate.scenes, TEMPLATE_SCENE_OPTIONS),
        tasks: validValues(candidate.tasks, TEMPLATE_TASK_OPTIONS)
    }
}

export const withTemplateTaxonomy = (template: StyleTemplate): StyleTemplate => ({
    ...template,
    taxonomy: getTemplateTaxonomy(template)
})

const optionLabel = <T extends string>(options: readonly FacetOption<T>[], value: T) =>
    options.find(option => option.value === value)?.label || value

export const templateFacetLabels = (template: StyleTemplate) => {
    const taxonomy = getTemplateTaxonomy(template)
    return [
        optionLabel(TEMPLATE_OUTPUT_OPTIONS, taxonomy.output),
        taxonomy.styles[0] ? optionLabel(TEMPLATE_STYLE_OPTIONS, taxonomy.styles[0]) : '',
        taxonomy.scenes[0] ? optionLabel(TEMPLATE_SCENE_OPTIONS, taxonomy.scenes[0]) : ''
    ].filter(Boolean)
}

const matchesFilters = (taxonomy: TemplateTaxonomy, filters: TemplateFacetFilters) =>
    (!filters.output || taxonomy.output === filters.output)
    && (!filters.style || taxonomy.styles.includes(filters.style))
    && (!filters.scene || taxonomy.scenes.includes(filters.scene))
    && (!filters.task || taxonomy.tasks.includes(filters.task))

const queryScore = (template: StyleTemplate, query: string) => {
    if (!query) return 0

    const taxonomy = getTemplateTaxonomy(template)
    const normalizedQuery = normalize(query)
    const outputOption = TEMPLATE_OUTPUT_OPTIONS.find(option => option.value === taxonomy.output)
    const styleOptions = TEMPLATE_STYLE_OPTIONS.filter(option => taxonomy.styles.includes(option.value))
    const sceneOptions = TEMPLATE_SCENE_OPTIONS.filter(option => taxonomy.scenes.includes(option.value))
    const taskOptions = TEMPLATE_TASK_OPTIONS.filter(option => taxonomy.tasks.includes(option.value))
    const facetText = (options: readonly FacetOption<string>[]) => normalize(
        options.flatMap(option => [option.value, option.label, ...option.aliases]).join(' ')
    )
    const fields = {
        output: outputOption ? facetText([outputOption]) : '',
        styles: facetText(styleOptions),
        scenes: facetText(sceneOptions),
        tasks: facetText(taskOptions),
        title: normalize(template.title),
        tags: normalize((template.tags || []).join(' ')),
        description: normalize(template.description),
        prompt: normalize([template.prompt, template.promptEn || ''].join(' '))
    }

    let score = 0
    if (fields.output.includes(normalizedQuery)) score += 48
    if (fields.styles.includes(normalizedQuery)) score += 36
    if (fields.tasks.includes(normalizedQuery)) score += 30
    if (fields.scenes.includes(normalizedQuery)) score += 24
    if (fields.title.includes(normalizedQuery)) score += 20
    if (fields.tags.includes(normalizedQuery)) score += 14
    if (fields.description.includes(normalizedQuery)) score += 8
    if (fields.prompt.includes(normalizedQuery)) score += 2
    return score
}

export const filterAndRankTemplates = (
    templates: StyleTemplate[],
    query: string,
    filters: TemplateFacetFilters
) => templates
    .map((template, index) => ({ template, index, taxonomy: getTemplateTaxonomy(template), score: queryScore(template, query) }))
    .filter(item => matchesFilters(item.taxonomy, filters) && (!query.trim() || item.score > 0))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(item => item.template)
