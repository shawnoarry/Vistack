export interface TemplateCategoryGroup {
    id: string
    label: string
    categories: readonly string[]
}

export const TEMPLATE_CATEGORY_GROUPS = [
    {
        id: 'game-assets',
        label: '游戏素材',
        categories: ['人物设定图']
    },
    {
        id: 'portrait',
        label: '人像摄影',
        categories: ['真实摄影', '人像时尚', '手机人像', '生活方式', '时尚编辑', '美妆生活']
    },
    {
        id: 'kpop',
        label: 'K-pop',
        categories: ['K-pop 物料', 'K-pop 生态']
    },
    {
        id: 'commercial',
        label: '商业设计',
        categories: ['商业视觉', '海报排版', '品牌系统']
    },
    {
        id: 'cinematic',
        label: '影视艺术',
        categories: ['叙事场景', '电影画面', '插画艺术']
    },
    {
        id: 'ui-technical',
        label: 'UI / 技术',
        categories: ['UI 与图形', '建筑与技术', '信息图与知识', '文档出版', '产品研发']
    },
    {
        id: 'precise-edit',
        label: '精准改图',
        categories: ['精准改图配方']
    },
    {
        id: 'character',
        label: '角色创作',
        categories: ['角色商品化', '角色创作']
    },
    {
        id: 'gaming',
        label: '游戏视觉',
        categories: ['游戏视觉']
    }
] as const satisfies readonly TemplateCategoryGroup[]

export const findTemplateCategoryGroup = (category: string) =>
    TEMPLATE_CATEGORY_GROUPS.find(group => group.categories.includes(category as never))
