import type { StyleTemplate } from '../types'

export const AWESOME_GPT_IMAGE2_SOURCE = {
    repository: 'https://github.com/freestylefly/awesome-gpt-image-2',
    skillVersion: '1.0.4',
    license: 'MIT'
} as const

export const awesomeGptImage2TemplateSources = {
    'awesome-infographic-engine': { templateId: 'infographic-engine', exampleCases: [334, 1, 8] },
    'awesome-scientific-scale-diagram': { templateId: 'scientific-scale-diagram', exampleCases: [341] },
    'awesome-brand-identity-package': { templateId: 'brand-identity-package', exampleCases: [354] },
    'awesome-character-design-sheet': { templateId: 'character-design-sheet', exampleCases: [347] },
    'awesome-document-publishing': { templateId: 'document-publishing', exampleCases: [360] },
    'awesome-concept-product-breakdown': { templateId: 'concept-product-breakdown', exampleCases: [370, 361] }
} as const

export const AWESOME_GPT_IMAGE2_TEMPLATE_IDS = Object.keys(awesomeGptImage2TemplateSources)

export const awesomeGptImage2Templates: StyleTemplate[] = [
    {
        id: 'awesome-infographic-engine',
        title: '模块化信息图引擎',
        category: '信息图与知识',
        mode: 'text',
        tags: ['信息图', '知识卡片', '流程图', '短标签'],
        description: '把复杂主题整理成 3 至 5 个可读模块、清晰信息流和短标签。',
        prompt: `生成目标：为【主题】设计一张【画幅比例】的专业信息图，用于【教育 / 科技 / 商业传播场景】。读者应在缩略图尺寸下先理解核心结论，再按明确顺序阅读细节。

信息结构：把内容严格整理为【3 至 5】个模块，依次为【模块一】、【模块二】、【模块三】、【可选模块四】和【可选模块五】。使用箭头、编号、分组色块或连接线表达【时间顺序 / 因果关系 / 对比关系 / 系统关系】，不要把无关信息放在同一层级。

版式与风格：采用【干净编辑式 / 科学图解 / 品牌化】视觉语言，以【主色】、【辅助色】和中性色建立分组。标题明确，核心数据突出，图标和示意图风格统一，模块之间保留稳定留白。

准确文字：主标题必须准确显示“【标题】”。各模块只使用【2 至 8 个字】的短标签；需要显示的数据、单位和专有名词为【准确内容】。不得改写、增删、翻译或生成随机小字。

避免：避免长段正文、超过五个主模块、装饰性假图表、无意义图标、箭头关系不清、数据单位错误、文字过小、乱码、伪造 logo、水印和拥挤边缘。`,
        promptEn: `Goal: Design a professional 【aspect ratio】 infographic about 【topic】 for 【education / technology / commercial communication】. The core conclusion must read at thumbnail size, followed by a clear detail-reading path.

Information structure: Organize the content into exactly 【3 to 5】 modules: 【module one】, 【module two】, 【module three】, 【optional module four】, and 【optional module five】. Use arrows, numbering, color groups, or connectors to show 【sequence / causality / comparison / system relationships】. Do not place unrelated information at the same hierarchy level.

Layout and style: Use a 【clean editorial / scientific diagram / branded】 visual language with 【primary color】, 【supporting color】, and neutrals. Keep a clear title, prominent key data, consistent icons and diagrams, and disciplined spacing between modules.

Exact text: Display the title exactly as “【title】”. Use short 【2 to 8 word】 module labels. Required data, units, and proper nouns are: 【exact content】. Do not rewrite, add, remove, translate, or invent small text.

Avoid: long paragraphs, more than five primary modules, decorative fake charts, meaningless icons, unclear arrows, incorrect units, tiny text, gibberish, invented logos, watermarks, and crowded edges.`,
        image: '',
        taxonomy: {
            output: 'infographic',
            styles: ['infographic'],
            scenes: ['education', 'tech'],
            tasks: ['exact-text', 'layout']
        }
    },
    {
        id: 'awesome-scientific-scale-diagram',
        title: '科学尺度缩放图',
        category: '信息图与知识',
        mode: 'text',
        tags: ['科学图解', '尺度对比', '科普', '单位标注'],
        description: '用连续尺度窗口展示从微观到宏观的结构差异与数量级变化。',
        prompt: `生成目标：制作一张关于【科学主题】的【横版 / 竖版】尺度缩放科普图，从【最小尺度】连续过渡到【最大尺度】，让不同数量级的结构差异清楚可见。

构图：使用【6 至 8】个按阅读方向排列的尺度窗口。每个窗口必须呈现不同层级的真实细节，并通过克制的连接线或局部放大框建立连续关系。起点为【对象】，终点为【对象】，中间尺度依次为【列表】。

标注：每个窗口只显示准确名称、尺度数值、单位和倍率。必须准确显示【标题】以及【单位 / 数值清单】。标签短而清楚，单位格式统一，连接线不能遮挡主体。

视觉方向：采用【科学出版物 / 博物馆图鉴 / 高级科普海报】风格，使用【配色】区分尺度层级。细节写实可信，背景安静，图形语言统一。

避免：避免所有窗口长得相同、通用放大镜图标堆叠、错误数量级、错误单位、没有尺度差异的重复画面、长段正文、随机公式、乱码、伪造机构 logo 和水印。`,
        promptEn: `Goal: Create a 【landscape / portrait】 scientific scale diagram about 【topic】, moving continuously from 【smallest scale】 to 【largest scale】 so structural differences across orders of magnitude are visible.

Composition: Use 【6 to 8】 scale windows arranged in a clear reading direction. Every window must show genuinely different detail and connect through restrained callout lines or detail frames. Begin with 【object】, end with 【object】, and use these intermediate scales: 【list】.

Labels: Each window shows only its exact name, scale value, unit, and magnification. Display 【title】 and 【unit / value list】 exactly. Keep labels short, format units consistently, and prevent connectors from covering the subject.

Visual direction: Use a 【scientific publication / museum atlas / premium science poster】 style with 【palette】 separating scale levels. Keep details credible, the background quiet, and the graphic language consistent.

Avoid: visually identical windows, generic magnifying-glass layouts, incorrect orders of magnitude, wrong units, repeated images without scale change, long paragraphs, random formulas, gibberish, invented institutional logos, and watermarks.`,
        image: '',
        taxonomy: {
            output: 'infographic',
            styles: ['infographic', 'realistic'],
            scenes: ['education', 'tech'],
            tasks: ['exact-text', 'layout']
        }
    },
    {
        id: 'awesome-brand-identity-package',
        title: '品牌身份系统板',
        category: '品牌系统',
        mode: 'text',
        tags: ['品牌视觉', 'Logo 系统', 'VI', '应用样机'],
        description: '在一张统一视觉板中展示品牌定位、标志、配色、字体和核心触点。',
        prompt: `生成目标：为名为“【品牌名称】”的【行业 / 产品】品牌制作一张完整品牌身份系统板。品牌定位是【定位】，核心气质为【三个关键词】，目标受众为【受众】。

视觉系统：设计一个清晰可识别的主标志，并展示【主标志、简化标记、单色版本】。建立由【主色】、【辅助色】和【中性色】组成的克制配色系统；标题字体呈现【特征】，正文字体呈现【特征】。所有部分必须像同一套品牌系统，而不是不同提案的拼贴。

版式：使用稳定网格分为【品牌定位、标志系统、配色、字体、图形语言、应用触点】六个区域。触点只选择【包装 / 名片 / 社媒头像 / 网站页眉 / 门店物料】中的【2 至 3】项，保持尺度和排列清楚。

准确文字：品牌名必须准确显示为“【品牌名称】”，标语为“【标语】”。除指定文字和必要的色值、字体标签外，不生成其他文案。

避免：避免大量无关 logo 变体、互相冲突的配色、多个 campaign 风格混杂、廉价样机、随机品牌名、错字、过密说明、伪造注册标记和水印。`,
        promptEn: `Goal: Create a complete identity-system board for a 【industry / product】 brand named “【brand name】”. Positioning: 【positioning】. Core qualities: 【three keywords】. Audience: 【audience】.

Visual system: Design one recognizable primary logo and show its 【primary, simplified, and monochrome versions】. Build a restrained palette from 【primary color】, 【supporting color】, and 【neutrals】. The display type should feel 【quality】 and body type should feel 【quality】. Every element must belong to one identity system rather than a collage of separate proposals.

Layout: Use a stable grid with six areas: positioning, logo system, palette, typography, graphic language, and applications. Select only 【2 to 3】 touchpoints from 【packaging / business card / social avatar / website header / retail material】 and keep their scale and arrangement readable.

Exact text: Display the brand name exactly as “【brand name】” and the tagline exactly as “【tagline】”. Do not generate other copy beyond required color values and type labels.

Avoid: unrelated logo variants, conflicting palettes, mixed campaign styles, cheap mockups, random brand names, spelling errors, dense explanations, invented registration marks, and watermarks.`,
        image: '',
        taxonomy: {
            output: 'brand',
            styles: ['brand'],
            scenes: ['commerce', 'creative'],
            tasks: ['exact-text', 'layout']
        }
    },
    {
        id: 'awesome-character-design-sheet',
        title: '角色设定与动作表',
        category: '角色创作',
        mode: 'both',
        tags: ['角色设定', '动作网格', '身份一致', '服装细节'],
        description: '在统一设定板中保持脸、比例和服装一致，并展示多视角与动作。',
        prompt: `生成目标：为【作品 / 世界观】设计角色“【角色名】”的完整设定表。角色是【身份、年龄段与核心性格】，必须在所有视角和动作中保持同一身份、身体比例、脸部结构、发型和服装细节。

身份锚点：脸型为【描述】，五官特征为【描述】，发型为【描述】，自然体型为【描述】。如提供参考图，只提取明确指定的身份、服装或材质信息，不复制背景和无关人物。

设定表布局：包含【正面、四分之三侧面、侧面、背面】四个基础视图，以及【3 至 4】个动作或表情格。单独展示【服装关键部件】、【标志性道具】和【材质 / 配色】的小型细节框。使用干净统一的工作室背景和稳定比例尺。

美术方向：采用【2D 动画设定 / 写实概念设计 / 3D 角色预设】风格，线条、渲染深度和配色在所有格子中一致。

准确文字：只显示角色名“【角色名】”以及【正面 / 侧面 / 背面 / 材质】等短标签。

避免：避免不同格子换脸、发型长度漂移、服装零件消失、体型变化、左右细节混乱、动作重复、格子拥挤、随机文字、额外角色和水印。`,
        promptEn: `Goal: Create a complete design sheet for the character “【character name】” from 【project / world】. The character is 【role, age range, and core personality】. Preserve the same identity, body proportions, facial structure, hairstyle, and costume details across every view and pose.

Identity anchors: Face shape: 【description】. Facial features: 【description】. Hairstyle: 【description】. Natural body type: 【description】. If references are supplied, use only their assigned identity, clothing, or material information; do not copy backgrounds or unrelated people.

Sheet layout: Include four base views: 【front, three-quarter, profile, back】, plus 【3 to 4】 action or expression panels. Add small detail frames for 【key costume components】, 【signature prop】, and 【materials / palette】. Use a clean studio background and consistent scale.

Art direction: Use a 【2D animation model sheet / realistic concept design / 3D character preset】 style with consistent linework, rendering depth, and color across every panel.

Exact text: Show only “【character name】” and short labels such as 【front / profile / back / materials】.

Avoid: identity drift, changing hair length, missing costume components, body-shape changes, left-right inconsistencies, repeated poses, crowded panels, random text, extra characters, and watermarks.`,
        image: '',
        taxonomy: {
            output: 'character',
            styles: ['character', 'illustration'],
            scenes: ['story', 'creative'],
            tasks: ['reference-image', 'identity', 'layout']
        }
    },
    {
        id: 'awesome-document-publishing',
        title: '文档出版页面系统',
        category: '文档出版',
        mode: 'text',
        tags: ['白皮书', '手册', '百科图鉴', '出版版式'],
        description: '生成具有分栏、图表、图注和稳定阅读节奏的专业出版页面。',
        prompt: `生成目标：为【白皮书 / 手册 / 百科图鉴 / 年度报告】制作一张【页面尺寸与比例】的专业出版页面，主题是【主题】，读者为【受众】。

页面结构：使用【两栏 / 三栏 / 主栏加侧栏】网格。页面包含【章节标题】、【简短导语】、【2 至 3 个内容模块】、【一张主图或图表】、【图注】和【页码 / 章节标记】。标题、正文、图表和说明必须严格对齐同一网格。

视觉系统：采用【编辑出版 / 技术文档 / 博物图鉴】风格，使用【配色】和【字体气质】。建立明确的标题、二级标题、正文、数据和图注层级；图表符号、线宽和标签格式统一。

准确文字：页面必须显示标题“【标题】”、章节“【章节名】”和标签【准确文字清单】。正文只使用【提供的短段落 / 可读占位行】，不要生成密集伪文字。

避免：避免微小密集文字、脱离网格的图表、错位图注、过多装饰卡片、网页仪表盘外观、随机目录、乱码、错误页码、伪造出版机构 logo 和水印。`,
        promptEn: `Goal: Create a professional 【page size and ratio】 publication page for a 【white paper / manual / encyclopedia / annual report】 about 【topic】, intended for 【audience】.

Page structure: Use a 【two-column / three-column / main-plus-sidebar】 grid. Include 【chapter title】, 【short introduction】, 【2 to 3 content modules】, 【one primary figure or chart】, 【caption】, and 【page number / section marker】. Align titles, body content, figures, and captions to one grid.

Visual system: Use an 【editorial publication / technical document / natural-history plate】 style with 【palette】 and 【typographic character】. Establish clear levels for title, heading, body, data, and captions. Keep chart symbols, line weights, and label formatting consistent.

Exact text: Display “【title】”, “【section name】”, and these labels exactly: 【exact copy list】. Use only 【provided short paragraphs / readable placeholder lines】 for body content; do not create dense fake text.

Avoid: tiny dense text, off-grid charts, detached captions, excessive decorative cards, dashboard styling, random contents lists, gibberish, incorrect page numbers, invented publisher logos, and watermarks.`,
        image: '',
        taxonomy: {
            output: 'document',
            styles: ['infographic'],
            scenes: ['education', 'tech'],
            tasks: ['exact-text', 'layout']
        }
    },
    {
        id: 'awesome-concept-product-breakdown',
        title: '概念产品研发拆解',
        category: '产品研发',
        mode: 'both',
        tags: ['产品拆解', '爆炸图', '研发视觉', '技术标注'],
        description: '把概念产品拆成可读组件、材质和功能关系，形成研发展示板。',
        prompt: `生成目标：为概念产品“【产品名称】”制作一张【画幅比例】研发拆解展示板。产品用于【用途】，核心创新是【创新点】，外观语言为【造型关键词】。

产品与组件：中心展示完整产品，并沿【水平 / 放射 / 垂直】方向拆解为【5 至 8】个真实组件：【组件清单】。每个组件必须具有合理结构、装配顺序、尺度关系和连接位置，不能只是悬浮装饰。

材质与功能：清楚区分【外壳材料】、【结构材料】、【透明 / 柔性 / 电子组件】。使用短引线标注组件名和一个核心功能；用少量剖面或局部放大框说明【关键机制】。

版式与风格：采用【工业设计研发板 / 高级专利图解 / 科技产品发布图】视觉风格，背景为【背景】，主色为【配色】。完整产品是第一视觉层级，组件关系是第二层级，文字说明保持克制。

准确文字：标题必须显示“【产品名称】”，组件标签使用【准确组件名清单】。不生成未经指定的规格、认证、品牌或性能数字。

避免：避免错误装配关系、无功能零件、透视冲突、比例漂移、过多引线、密集小字、伪造参数、随机 logo、廉价科幻发光、乱码和水印。`,
        promptEn: `Goal: Create a 【aspect ratio】 R&D breakdown board for the concept product “【product name】”. Its purpose is 【use case】, its core innovation is 【innovation】, and its form language is 【design keywords】.

Product and components: Show the complete product centrally, then separate it in a 【horizontal / radial / vertical】 direction into 【5 to 8】 real components: 【component list】. Every component must have plausible structure, assembly order, scale, and connection points rather than floating decor.

Materials and function: Clearly distinguish 【shell material】, 【structural material】, and 【transparent / flexible / electronic components】. Use short callouts for each component name and one core function. Add only a few sections or detail windows to explain 【key mechanism】.

Layout and style: Use an 【industrial-design R&D board / premium patent diagram / technology launch graphic】 style with 【background】 and 【palette】. The complete product is the first visual level, component relationships are second, and text remains restrained.

Exact text: Display “【product name】” and these component labels exactly: 【component-name list】. Do not invent specifications, certifications, brands, or performance figures.

Avoid: incorrect assembly, functionless parts, conflicting perspective, scale drift, excessive callouts, dense small text, invented parameters, random logos, cheap sci-fi glow, gibberish, and watermarks.`,
        image: '',
        taxonomy: {
            output: 'infographic',
            styles: ['product', 'infographic'],
            scenes: ['tech', 'creative'],
            tasks: ['reference-image', 'exact-text', 'layout']
        }
    }
]
