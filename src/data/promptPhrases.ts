export interface PromptPhrase {
    id?: string
    label: string
    value: string
    source?: 'builtin' | 'custom'
    isCustomized?: boolean
}

export interface PromptPhraseGroup {
    id: string
    title: string
    description: string
    phrases: PromptPhrase[]
}

export const promptPhraseGroups: PromptPhraseGroup[] = [
    {
        id: 'universal-subject',
        title: '通用主体',
        description: '快速补充主体、动作和环境，不绑定任何特定题材。',
        phrases: [
            { label: '明确主体', value: '主体清晰明确，画面第一眼能识别主要对象' },
            { label: '自然动作', value: '自然可信的动作和姿态，避免僵硬摆拍' },
            { label: '环境交代', value: '环境信息清楚，主体与场景有真实关系' },
            { label: '细节丰富', value: '主体细节丰富，材质、边缘和纹理清楚' },
            { label: '干净画面', value: '画面干净，没有多余杂物和干扰元素' },
            { label: '真实尺度', value: '主体比例和空间尺度真实可信' },
            { label: '情绪明确', value: '画面情绪明确但不过度夸张' },
            { label: '叙事瞬间', value: '像故事中的一个瞬间，有自然的前后文' }
        ]
    },
    {
        id: 'camera-general',
        title: '通用镜头',
        description: '常用摄影镜头和视角，可用于商业、人像、产品和场景图。',
        phrases: [
            { label: '35mm 纪实', value: '35mm 纪实摄影视角，自然空间感' },
            { label: '50mm 标准', value: '50mm 标准镜头，接近人眼观察' },
            { label: '85mm 人像', value: '85mm 人像镜头，浅景深，主体突出' },
            { label: '广角环境', value: '广角镜头，保留更多环境信息' },
            { label: '长焦压缩', value: '长焦压缩感，背景柔和虚化' },
            { label: '俯拍', value: '轻微俯拍视角，画面结构清楚' },
            { label: '低角度', value: '低角度拍摄，主体更有力量感' },
            { label: '微距细节', value: '微距镜头，突出材质纹理和细节' }
        ]
    },
    {
        id: 'commercial',
        title: '商业视觉',
        description: '电商主图、品牌海报、杂志封面和广告大片常用表达。',
        phrases: [
            { label: '商业大片', value: '高级商业大片质感，布光精准，主体有品牌感' },
            { label: '品牌海报', value: '品牌宣传海报构图，主体突出，留出版式空间' },
            { label: '杂志封面', value: '杂志封面摄影，强视觉中心，适合标题排版' },
            { label: '电商主图', value: '干净电商主图，白底或浅色背景，产品边缘清楚' },
            { label: '广告场景', value: '广告级生活方式场景，产品自然融入使用环境' },
            { label: '高级棚拍', value: '高级棚拍布光，柔和阴影，材质反射真实' },
            { label: '留白版式', value: '保留干净留白，方便后期添加文字和 logo' },
            { label: '奢侈品质感', value: '克制奢侈品质感，精致材质，低调高级' }
        ]
    },
    {
        id: 'art-style',
        title: '通用风格',
        description: '不偏题材的视觉风格词，适合快速改变整体审美。',
        phrases: [
            { label: '写实摄影', value: '写实摄影风格，真实光线和真实材质' },
            { label: '电影剧照', value: '电影剧照感，光影有层次，色彩克制' },
            { label: '编辑大片', value: '时尚编辑大片风格，构图利落，姿态高级' },
            { label: '极简高级', value: '极简高级风格，干净背景，少量重点元素' },
            { label: '复古胶片', value: '复古胶片质感，柔和颗粒，低对比色彩' },
            { label: '未来科技', value: '未来科技感，冷静光线，精密材质' },
            { label: '梦幻柔焦', value: '梦幻柔焦氛围，柔和光晕但主体清楚' },
            { label: '概念艺术', value: '概念艺术风格，清晰设计语言和完整世界观' }
        ]
    },
    {
        id: 'phone-camera',
        title: '手机镜头',
        description: '让画面更像真实手机拍摄，而不是棚拍或广告大片。',
        phrases: [
            { label: '前置自拍', value: '手机前置摄像头自拍，轻微广角畸变，真实皮肤纹理' },
            { label: '镜自拍', value: '全身镜自拍，手机入镜，自然室内光' },
            { label: '随手抓拍', value: '像手机随手抓拍，构图略微不完美但主体清楚' },
            { label: '社媒日常', value: '真实社交平台日常照片质感，不要商业棚拍感' },
            { label: '夜间手机', value: '夜间手机拍摄，轻微噪点，环境光真实' },
            { label: '闪光灯自拍', value: '手机闪光灯自拍，近距离，高对比，真实抓拍感' },
            { label: 'Live 图感', value: '像 Live Photo 截帧，表情自然，轻微动态模糊' },
            { label: '低清预览', value: '站姐预览图质感，轻微压缩感和颗粒感' }
        ]
    },
    {
        id: 'selfie-background',
        title: '自拍背景',
        description: '常见自拍和生活照背景，用来快速指定真实场景与环境信息。',
        phrases: [
            { label: '卧室镜前', value: '真实卧室镜前自拍背景，衣柜、床品和柔和室内光自然入镜' },
            { label: '浴室镜前', value: '浴室镜前自拍，干净瓷砖、洗手台和柔和顶灯，手机自然入镜' },
            { label: '电梯镜面', value: '电梯镜面自拍背景，金属墙面反射、窄空间和真实顶灯' },
            { label: '车内副驾', value: '车内副驾驶自拍，车窗自然光、座椅和安全带细节清楚' },
            { label: '咖啡店窗边', value: '咖啡店窗边自拍背景，木桌、杯子、街景虚化和自然日光' },
            { label: '便利店货架', value: '便利店货架前随手自拍，商品陈列、冷白灯和生活化背景' },
            { label: '地铁站台', value: '地铁站台或车厢自拍背景，冷白灯、扶手和通勤人群轻微虚化' },
            { label: '酒店房间', value: '酒店房间镜前自拍，行李箱、床头灯和干净临时居住感' },
            { label: '校园走廊', value: '校园走廊或教室门口自拍背景，储物柜、白墙和自然人流' },
            { label: '夜晚街边', value: '夜晚街边自拍，路灯、店招和城市背景虚化，真实手机夜拍质感' }
        ]
    },
    {
        id: 'kpop-scene',
        title: 'K-pop 场景',
        description: '常见韩娱生态场景：自拍、舞台、机场、下班路、饭拍。',
        phrases: [
            { label: '后台自拍', value: 'K-pop idol 后台自拍，化妆间灯光，妆发精致但表情自然' },
            { label: '练习室', value: '练习室镜面背景，舞蹈训练后的自然状态' },
            { label: '直拍封面', value: 'K-pop 直拍封面瞬间，舞台灯光，主体清楚，不加文字' },
            { label: '打歌舞台', value: '音乐节目打歌舞台，LED 背景，舞台服装，高光瞬间' },
            { label: '机场出发', value: '韩娱机场路透，航站楼通道，长焦媒体抓拍' },
            { label: '下班路', value: '电视台下班路透，保姆车旁，闪光灯，人群虚化' },
            { label: '站姐图', value: '站姐长焦饭拍，浅景深，主体锐利，背景压缩' },
            { label: '媒体图', value: '韩娱媒体新闻图，真实抓拍，轻微闪光灯和运动感' }
        ]
    },
    {
        id: 'celebrity-material',
        title: '艺人物料',
        description: '适合 K-pop、艺人明星、回归宣传、专辑和官方社媒物料。',
        phrases: [
            { label: '棚拍概念照', value: 'K-pop 回归棚拍概念照，统一造型主题，专业布光，画面干净有记忆点' },
            { label: '概念 MV 照', value: '概念 MV 剧照感，强烈主题色彩，像音乐视频中的关键静帧' },
            { label: '预告照', value: '官方 comeback teaser 预告照，造型神秘，保留海报式留白但不生成文字' },
            { label: '专辑内页', value: '专辑 photobook 内页写真，编辑摄影构图，造型完整，氛围统一' },
            { label: '小卡正面', value: 'K-pop photocard 小卡正面构图，近距离半身或大头，表情有收藏感' },
            { label: '公式照', value: '艺人官方 profile photo，背景简洁，脸部和造型清晰，适合资料页头像' },
            { label: '舞台定妆', value: '打歌舞台定妆照，舞台服装、妆发、配饰完整呈现' },
            { label: '花絮物料', value: '官方 behind the scenes 花絮照，真实工作现场，状态自然但画面精致' }
        ]
    },
    {
        id: 'ootd',
        title: '穿搭 / OOTD',
        description: '偏韩式穿搭、私服、机场时尚和日常造型。',
        phrases: [
            { label: '韩系私服', value: '韩系私服穿搭，干净层次，低饱和配色' },
            { label: '机场穿搭', value: '机场时尚穿搭，墨镜、帽子、包袋和舒适鞋履' },
            { label: '舞台造型', value: '精致舞台造型，亮片、皮革或金属配饰，妆发完整' },
            { label: '练习室私服', value: '练习室休闲私服，宽松上衣，运动裤或帽衫' },
            { label: '韩式约会感', value: '韩式约会感穿搭，柔和颜色，轻盈外套和自然发型' },
            { label: '街头辣妹', value: '街头感女团穿搭，短上衣，工装裤，厚底鞋' },
            { label: '清冷高级', value: '清冷高级感穿搭，黑白灰为主，线条利落' },
            { label: '甜酷混搭', value: '甜酷混搭，柔软单品和硬朗配饰形成对比' }
        ]
    },
    {
        id: 'makeup',
        title: '妆容',
        description: '用于控制底妆、眼妆、唇妆和舞台妆造质感。',
        phrases: [
            { label: '清透底妆', value: '清透干净的底妆，保留真实皮肤纹理，妆面服帖不厚重' },
            { label: '玻璃肌', value: '韩式玻璃肌妆效，皮肤透亮有光泽但不要塑料感' },
            { label: '雾面底妆', value: '高级雾面底妆，肤色均匀，光线柔和，面部轮廓清楚' },
            { label: '猫眼眼线', value: '利落猫眼眼线，眼神更有抓取感，眼妆边缘干净' },
            { label: '卧蚕高光', value: '自然卧蚕和眼下高光，放大眼神但不要夸张' },
            { label: '亮片眼妆', value: '舞台亮片眼妆，细闪清楚，适合打歌和概念照' },
            { label: '豆沙唇', value: '低饱和豆沙色唇妆，温柔自然，适合日常和杂志人像' },
            { label: '咬唇妆', value: '韩式渐变咬唇妆，唇部颜色自然过渡' },
            { label: '冷感妆', value: '清冷冷感妆容，低饱和眼影，干净眉形，整体克制高级' },
            { label: '甜酷舞台妆', value: '甜酷舞台妆，眼妆精致，唇色鲜明，适合女团舞台造型' }
        ]
    },
    {
        id: 'hair-styling',
        title: '发型',
        description: '补充头发长度、刘海、卷度、湿发和染发细节。',
        phrases: [
            { label: '黑长直', value: '黑长直发型，发丝顺滑有光泽，线条干净' },
            { label: '蓬松卷发', value: '自然蓬松卷发，发量轻盈，卷度柔和不僵硬' },
            { label: '湿发造型', value: '湿发造型，发丝有水光和分束感，适合概念大片' },
            { label: '高马尾', value: '高马尾发型，头顶蓬松，轮廓利落有活力' },
            { label: '低丸子头', value: '低丸子头或低盘发，碎发自然，气质温柔' },
            { label: '公主切', value: '公主切发型，脸侧线条整齐，带一点二次元女团感' },
            { label: '空气刘海', value: '空气刘海，发丝轻薄自然，修饰额头和脸型' },
            { label: '八字刘海', value: '八字刘海，脸侧层次柔和，突出韩系氛围' },
            { label: '挑染发丝', value: '局部挑染或耳染，颜色干净，发丝边缘清楚' },
            { label: '舞台编发', value: '精致舞台编发，发饰、发夹或丝带点缀，造型完整' }
        ]
    },
    {
        id: 'beauty-body',
        title: '美颜美体',
        description: '肤质、比例、肩颈和曲线词组，可按需要组合。',
        phrases: [
            { label: '皮肤光洁', value: '皮肤光洁细腻' },
            { label: '白皙透亮', value: '白皙透亮肤色' },
            { label: '小头比例', value: '小头比例' },
            { label: '九头身', value: '九头身超模比例 (model-like proportions)' },
            { label: '小头小脸', value: '小头小脸，超模头身比 (small head, tiny face)' },
            { label: '天鹅颈', value: '纤长天鹅颈' },
            { label: '直角肩', value: '超模直角肩' },
            { label: '精致锁骨', value: '精致锁骨' },
            { label: '沙漏轮廓', value: '夸张沙漏型轮廓 (exaggerated hourglass)' },
            { label: '蜂腰', value: '极细蜂腰 (snatched waist)' },
            { label: '宽髋曲线', value: '宽阔饱满的髋部曲线 (wide flared hips)' },
            { label: '丰满上围', value: '健康丰满的上身曲线 (full upper-body curves)' },
            { label: '紧身张力', value: '紧身上衣呈现拉伸张力 (fitted fabric tension)' },
            { label: '纤细四肢', value: '四肢纤长纤细' },
            { label: '体态挺拔', value: '体态挺拔舒展' }
        ]
    },
    {
        id: 'shot',
        title: '景别',
        description: '控制主体距离和画面信息密度。',
        phrases: [
            { label: '大头自拍', value: '近距离大头自拍，脸部占画面主要区域' },
            { label: '半身自拍', value: '半身手机自拍，肩颈和上半身清楚' },
            { label: '全身 OOTD', value: '全身穿搭照，鞋子和整体比例完整可见' },
            { label: '腰部以上', value: '腰部以上构图，适合社交头像和日常照' },
            { label: '远处长焦', value: '远处长焦抓拍，背景压缩，主体自然行走' },
            { label: '舞台半身', value: '舞台半身特写，表情和动作都清楚' },
            { label: '人群中主体', value: '人群环境中的清晰主体，背景人物虚化' },
            { label: '低角度路透', value: '轻微低角度抓拍，腿部比例自然拉长' }
        ]
    },
    {
        id: 'lighting',
        title: '光线',
        description: '用中文描述光线，减少抽象英文摄影词。',
        phrases: [
            { label: '窗边自然光', value: '窗边柔和自然光，皮肤质感真实' },
            { label: '阴天漫射光', value: '阴天漫射光，没有强烈阴影' },
            { label: '便利店夜光', value: '夜晚便利店或街边店铺灯光，真实环境色' },
            { label: '舞台追光', value: '舞台追光照在主体脸部，背景灯光虚化' },
            { label: '闪光灯抓拍', value: '媒体闪光灯抓拍，高光明显但不过曝' },
            { label: '地铁冷光', value: '地铁站或机场冷白灯，干净真实' },
            { label: '黄昏街边', value: '黄昏街边自然光，肤色柔和' },
            { label: '车窗光', value: '车窗透进来的侧光，安静私密的氛围' }
        ]
    },
    {
        id: 'composition',
        title: '构图',
        description: '控制画面读感、主体位置和社媒裁切。',
        phrases: [
            { label: '竖版构图', value: '竖版手机构图，适合社交平台发布' },
            { label: '方图封面', value: '方形封面构图，主体居中，缩略图清楚' },
            { label: '轻微歪斜', value: '构图轻微歪斜，像真实随手拍' },
            { label: '主体居中', value: '主体居中，脸部和服装重点清晰' },
            { label: '留出环境', value: '保留周围环境信息，画面有生活感' },
            { label: '前景遮挡', value: '前景有轻微遮挡，增加抓拍真实感' },
            { label: '背景虚化', value: '背景自然虚化，主体锐利' },
            { label: '不加文字', value: '画面中不要添加文字、水印或随机标志' }
        ]
    },
    {
        id: 'mood',
        title: '氛围',
        description: '快速指定情绪，不需要堆太多风格词。',
        phrases: [
            { label: '松弛日常', value: '松弛自然的日常氛围' },
            { label: '清冷韩系', value: '清冷韩系氛围，克制、干净、不甜腻' },
            { label: '甜酷女团', value: '甜酷女团感，自信、有活力但不过度夸张' },
            { label: '刚下班', value: '刚结束行程的疲惫但好看的状态' },
            { label: '粉丝视角', value: '像粉丝在现场远处拍到的真实瞬间' },
            { label: '官方花絮', value: '像官方账号发布的后台花絮照片' },
            { label: '低调高级', value: '低调高级，不要网红滤镜过重' },
            { label: '青春明亮', value: '青春明亮，干净活泼，颜色自然' }
        ]
    },
    {
        id: 'quality',
        title: '质量约束',
        description: '减少 AI 图常见问题，尤其是人像和饭拍类图像。',
        phrases: [
            { label: '身份一致', value: '保持参考人物身份一致，不要换脸或混合成另一个人' },
            { label: '服装准确', value: '保留参考服装的颜色、版型和关键细节' },
            { label: '自然手部', value: '手部和手指自然，不要畸形' },
            { label: '真实皮肤', value: '真实皮肤纹理，不要过度磨皮' },
            { label: '不要塑料感', value: '避免塑料皮肤、蜡像感和过度锐化' },
            { label: '真实抓拍', value: '保持真实抓拍的不完美，不要像棚拍写真' },
            { label: '不乱加字', value: '不要生成随机文字、水印、logo 或字幕' },
            { label: '比例自然', value: '身体比例自然，脸、手、肩颈和腿部不要变形' }
        ]
    },
    {
        id: 'product-ui-design',
        title: '产品 UI 设计',
        description: '用于生成移动端 App、Web 产品界面、仪表盘和设计稿风格的提示词。',
        phrases: [
            { label: '移动端 App', value: '移动端 App UI 设计稿，竖屏界面，清晰导航、卡片信息层级和底部操作区，适合产品概念展示' },
            { label: 'Web 工作台', value: 'Web 产品工作台界面，侧边导航、顶部工具栏、主内容区和右侧属性面板，信息密度适中' },
            { label: 'SaaS 仪表盘', value: 'SaaS 数据仪表盘 UI，指标卡、图表、筛选器和表格布局清楚，企业级产品质感' },
            { label: '电商详情页', value: '电商产品详情页 UI，商品主图、价格信息、规格选择、购买按钮和推荐模块层级明确' },
            { label: 'AI 工具界面', value: 'AI 创作工具界面，左侧输入参数、中间预览画布、右侧历史记录和生成按钮，工作流清楚' },
            { label: '登录注册流', value: '登录注册流程 UI，输入框、验证码、第三方登录、错误提示和主按钮状态完整' },
            { label: '设置页', value: '设置页 UI，分组列表、开关、选择器、账号信息和危险操作区清楚区分' },
            { label: '空状态页面', value: '产品空状态 UI，简洁插图占位、明确提示文案和主操作按钮，视觉干净不营销化' },
            { label: '设计系统', value: '产品设计系统展示页，按钮、输入框、标签、弹窗、表格和颜色规范按模块排列' },
            { label: 'Figma 画板', value: 'Figma 风格 UI 设计画板，多张界面稿整齐排列，标注清晰，组件间距和栅格统一' },
            { label: '暗色后台', value: '暗色模式 Web 后台界面，深色表面层级、清晰边界、低饱和强调色和可读数据表格' },
            { label: '高保真原型', value: '高保真产品原型截图，真实可用的 UI 组件、稳定间距、清晰字体和完整交互状态' }
        ]
    }
]
