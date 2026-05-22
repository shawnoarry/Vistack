import type { PromptPoolGroup } from '../types'

export const promptPoolGroups: PromptPoolGroup[] = [
    {
        id: 'ui-workbench',
        title: '产品工作台',
        description: '用于生成实际可用的 Web 产品界面、后台、AI 工具和复杂操作台。',
        items: [
            {
                id: 'ai-creation-workbench',
                title: 'AI 创作工作台',
                description: '左参中预右历史，适合生成工具类产品概念图。',
                tags: ['AI', '工作台', 'Web'],
                prompt: 'AI 创作工具工作台界面，左侧为输入参数和参考素材，中间为大面积预览画布，右侧为历史记录、任务状态和生成结果，底部有固定提示词输入区与清晰的主操作按钮。界面信息密度适中，模块边界清楚，适合真实产品使用，不要营销页布局。'
            },
            {
                id: 'saas-dashboard',
                title: 'SaaS 数据后台',
                description: '指标、图表、表格、筛选器完整呈现。',
                tags: ['SaaS', 'Dashboard', '表格'],
                prompt: 'SaaS 数据仪表盘界面，包含侧边导航、顶部筛选栏、关键指标卡、趋势图表、数据表格和状态标签。视觉克制专业，信息层级清楚，表格行高紧凑但可读，适合企业级日常运营。'
            },
            {
                id: 'canvas-editor',
                title: '画布编辑器',
                description: '适合把绘图、排版、素材管理做成工具界面。',
                tags: ['Canvas', 'Editor', '工具'],
                prompt: '专业画布编辑器界面，中间是可缩放画布和参考图素材，左侧为图层或素材库，右侧为属性面板，顶部提供常用工具按钮、比例选择、导出和撤销操作。界面像成熟设计工具，控件状态完整，布局稳定。'
            },
            {
                id: 'asset-library',
                title: '资产库管理',
                description: '图库、收藏、筛选和批量管理。',
                tags: ['Gallery', '资产库', '管理'],
                prompt: '视觉资产库管理界面，网格瀑布流展示图片缩略图，左侧有收藏夹和筛选条件，顶部有搜索、排序和批量选择，卡片上显示收藏、分类、下载和再次使用操作。整体干净高效，适合长期管理大量生成结果。'
            }
        ]
    },
    {
        id: 'mobile-product',
        title: '移动端产品',
        description: '用于生成 App 设计稿、移动端功能页和高保真原型截图。',
        items: [
            {
                id: 'mobile-app-home',
                title: 'App 首页',
                description: '竖屏、卡片层级、底部导航。',
                tags: ['App', '首页', '移动端'],
                prompt: '移动端 App 首页 UI 设计稿，竖屏界面，顶部有清晰标题和快捷操作，中部用卡片组织核心内容，底部导航清楚可点击。视觉像真实高保真产品截图，间距稳定，字体清晰，不要海报化。'
            },
            {
                id: 'mobile-creation-flow',
                title: '移动创作流',
                description: '移动端参数、预览和提交生成。',
                tags: ['移动端', 'AI', '流程'],
                prompt: '移动端 AI 创作流程界面，包含上传参考图、提示词输入、风格选择、比例选择和生成按钮。参考图预览清楚，主操作固定在底部，适合单手操作，控件尺寸符合移动端触控，界面不拥挤。'
            },
            {
                id: 'mobile-settings',
                title: '移动设置页',
                description: '分组设置、开关和账号配置。',
                tags: ['设置', '表单', '移动端'],
                prompt: '移动端设置页 UI，高保真 App 截图，分组列表、开关、选择器、账号信息、API 配置和危险操作区清楚区分。整体简洁可靠，文字可读，状态明确。'
            },
            {
                id: 'mobile-commerce',
                title: '电商详情页',
                description: '产品图、规格、价格和购买路径。',
                tags: ['电商', '商品', '移动端'],
                prompt: '移动端电商产品详情页 UI，顶部展示大产品图，中部包含价格、规格选择、评价、配送信息和推荐模块，底部固定购买按钮。界面真实可用，商品信息层级清楚，不要生成随机不可读文字。'
            }
        ]
    },
    {
        id: 'visual-systems',
        title: '视觉风格',
        description: '从设计风格库归纳的 UI 视觉语言，可叠加到工作台或 App 场景。',
        items: [
            {
                id: 'editorial-minimal',
                title: '编辑极简',
                description: '留白、细线、精致排版。',
                tags: ['Minimal', 'Editorial'],
                prompt: '编辑极简 UI 风格，大量留白、细边框、精致网格、清晰字体层级和克制强调色。界面像高端内容产品或设计工具，不使用夸张渐变和装饰。'
            },
            {
                id: 'soft-product',
                title: '柔和产品感',
                description: '亲和、轻阴影、低饱和。',
                tags: ['Soft UI', '消费级'],
                prompt: '柔和友好的产品 UI 风格，低饱和配色、轻微阴影、8px 左右圆角、清楚卡片边界和温和的操作反馈。适合消费级应用和创作工具。'
            },
            {
                id: 'neo-brutal',
                title: '新野兽派',
                description: '高对比、硬边、强视觉记忆。',
                tags: ['Brutalism', '高对比'],
                prompt: '新野兽派 UI 风格，粗黑边框、硬边阴影、强对比色块、直白按钮和清晰模块边界。画面大胆但仍保持可用的信息结构，不要让文字重叠。'
            },
            {
                id: 'glass-system',
                title: '毛玻璃系统',
                description: '半透明、层叠、现代科技感。',
                tags: ['Glass', '桌面应用'],
                prompt: '毛玻璃 UI 系统风格，半透明面板、细微描边、柔和阴影、背景层次和桌面应用质感。控件清楚可读，透明度不要影响文字识别。'
            }
        ]
    },
    {
        id: 'photo-context',
        title: '自拍与生活场景',
        description: '常见自拍背景、日常空间和真实拍摄语境。',
        items: [
            {
                id: 'bedroom-selfie',
                title: '卧室自拍',
                description: '卧室、镜子、自然生活感。',
                tags: ['自拍', '卧室'],
                prompt: '自然卧室自拍背景，床边、衣架、落地镜、柔和窗光和少量生活物件，画面像真实手机拍摄，主体清楚，背景不杂乱。'
            },
            {
                id: 'cafe-window',
                title: '咖啡店窗边',
                description: '窗光、咖啡杯、街景。',
                tags: ['咖啡店', '日常'],
                prompt: '咖啡店窗边随拍背景，桌面有咖啡杯、甜点或手机，窗外有柔和街景，室内设计简洁，光线自然，适合生活方式自拍。'
            },
            {
                id: 'elevator-mirror',
                title: '电梯镜自拍',
                description: '电梯、镜面、OOTD。',
                tags: ['镜自拍', 'OOTD'],
                prompt: '电梯镜自拍背景，金属或深色镜面、电梯灯光、手机遮脸或自然拿手机，全身穿搭清楚，真实社交平台 OOTD 质感。'
            },
            {
                id: 'street-night',
                title: '夜间街边',
                description: '霓虹、街灯、轻微抓拍。',
                tags: ['夜景', '街拍'],
                prompt: '夜间街边自拍或抓拍背景，街灯、店铺招牌、车辆光斑和轻微颗粒感，主体脸部清楚，画面真实自然，不要变成电影海报。'
            }
        ]
    }
]
