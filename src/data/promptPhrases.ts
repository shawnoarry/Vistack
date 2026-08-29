export interface PromptPhrase {
    id?: string
    label: string
    value: string
    conflictGroup?: string
    legacyLabels?: string[]
    source?: 'builtin' | 'custom'
    isCustomized?: boolean
}

export interface PromptPhraseGroup {
    id: string
    title: string
    description: string
    section?: string
    phrases: PromptPhrase[]
}

export const promptPhraseGroups: PromptPhraseGroup[] = [
    {
        id: 'universal-subject',
        title: '通用主体',
        description: '补足主体、动作与环境关系；适合用户只有一句简单描述时继续完善。',
        phrases: [
            { label: '主体聚焦', value: '把用户描述的主要对象设为唯一视觉中心，用位置、尺度和明暗对比建立清楚主次，避免次要元素抢夺注意力', legacyLabels: ['明确主体'] },
            { label: '自然动作', value: '让主体正在完成一个具体而自然的动作，重心、视线和手部姿态彼此呼应，避免正对镜头僵硬摆拍' },
            { label: '环境关系', value: '保留能说明地点与用途的环境线索，并让主体通过接触、遮挡或投影真实地处于场景中，而不是贴在背景上', legacyLabels: ['环境交代'] },
            { label: '材质细节', value: '呈现与主体有关的材质差异，例如织物纹理、金属反射、皮肤细节或物体边缘，不用无关装饰堆砌细节', legacyLabels: ['细节丰富'] },
            { label: '干净画面', value: '移除与主题无关的杂物、重复物体和抢眼背景，仅保留能说明场景或支持叙事的元素' },
            { label: '可信尺度', value: '保持主体、道具和空间之间的相对尺寸与透视关系可信，接触面、阴影方向和遮挡关系一致', legacyLabels: ['真实尺度'] },
            { label: '微表情叙事', value: '通过眼神方向、嘴角、呼吸状态和身体朝向表达克制情绪，不使用夸张表情或戏剧化手势', legacyLabels: ['情绪明确'] },
            { label: '叙事瞬间', value: '选择动作刚发生或即将发生的瞬间，让视线、道具和环境留下可见的前后文线索，画面像连续故事中的一帧' }
        ]
    },
    {
        id: 'camera-general',
        title: '通用镜头',
        description: '镜头焦段会相互替换，视角会相互替换，避免同一画面出现矛盾机位。',
        phrases: [
            { label: '35mm 纪实', value: '使用 35mm 纪实视角，在主体清楚的同时保留足够环境与自然透视，画面有临场感但边缘不夸张变形', conflictGroup: 'camera-lens' },
            { label: '50mm 标准', value: '使用 50mm 标准视角，透视接近人眼观察，主体与背景比例自然，避免明显广角拉伸或长焦压缩', conflictGroup: 'camera-lens' },
            { label: '85mm 人像', value: '使用 85mm 人像视角与中等浅景深，面部清晰、五官透视自然，背景仍保留可辨认的场景线索，不要虚化成纯色块', conflictGroup: 'camera-lens' },
            { label: '广角环境', value: '使用约 24mm 的广角环境视角，完整展示主体与周围空间，保持水平垂直线稳定，避免人物四肢和画面边缘被过度拉伸', conflictGroup: 'camera-lens' },
            { label: '长焦压缩', value: '使用远距离长焦视角压缩前后景，主体从环境中分离，背景层次柔和但关键地点仍可辨认', conflictGroup: 'camera-lens' },
            { label: '俯拍', value: '机位略高于主体并向下拍摄，清楚展示物体排布或人物与环境关系，透视保持自然', conflictGroup: 'camera-angle' },
            { label: '低角度', value: '机位略低于主体并向上拍摄，用稳定垂直线增强力量感，同时避免头身比例和腿部被夸张拉伸', conflictGroup: 'camera-angle' },
            { label: '微距细节', value: '使用微距近摄，只聚焦一个关键局部，呈现表面纹理、边缘与细微反光，背景简化且焦点准确', conflictGroup: 'camera-lens' }
        ]
    },
    {
        id: 'commercial',
        title: '商业视觉',
        description: '电商主图、品牌海报、杂志封面和广告大片常用表达。',
        phrases: [
            { label: '商业大片', value: '以主体作为唯一视觉中心，使用方向明确的主光和克制轮廓光，材质反射准确，背景道具服务产品或人物定位，呈现可直接用于品牌 Campaign 的完成稿', conflictGroup: 'commercial-format' },
            { label: '品牌海报', value: '使用单一主视觉与清楚层级，主体占据主要画面，在一侧或顶部预留完整标题区，装饰元素遵循同一品牌配色，不生成无关文字', conflictGroup: 'commercial-format' },
            { label: '杂志封面', value: '采用杂志封面式强视觉中心，人物或产品轮廓完整，在页眉与侧边保留排版空间，背景细节克制，不自动生成刊名或随机小字', conflictGroup: 'commercial-format' },
            { label: '电商主图', value: '产品完整可见并占据画面中心，使用白色或浅中性色无缝背景，边缘、材质与真实投影清楚，不添加道具、文字、促销标签或水印', conflictGroup: 'commercial-format' },
            { label: '广告场景', value: '把产品放进可信的实际使用场景，通过人物动作或周边道具展示用途，产品标识和外形仍清楚，避免无关陈设分散注意力', conflictGroup: 'commercial-format' },
            { label: '高级棚拍', value: '使用大面积柔光作为主光、轻微轮廓光分离背景，并保留接触阴影与材质反射；背景简洁，避免塑料质感和过度锐化', conflictGroup: 'commercial-format' },
            { label: '留白版式', value: '将主体安排在画面一侧，另一侧保留连续、干净且对比度稳定的负空间，方便后期添加标题与 logo，留白区不放复杂纹理' },
            { label: '克制奢华', value: '使用少量高品质材质、深浅中性色与一个低饱和强调色，通过精确边缘、细腻反射和充足留白表现品质，避免金色堆砌、厚重装饰和廉价高光', legacyLabels: ['奢侈品质感'] }
        ]
    },
    {
        id: 'art-style',
        title: '通用风格',
        description: '每次选择一种主要视觉语言；词组同时限定颜色、材质和容易跑偏的部分。',
        phrases: [
            { label: '写实摄影', value: '采用可信的写实摄影语言：光源方向统一，材质响应真实，保留少量皮肤、织物或环境的不完美，避免插画轮廓、塑料表面和过度 HDR', conflictGroup: 'visual-style' },
            { label: '电影剧照', value: '呈现电影叙事中的单帧，使用有动机的场景光、克制色彩与前中后景层次，让人物视线和环境线索暗示正在发生的事件，避免普通摆拍加黑边', conflictGroup: 'visual-style' },
            { label: '编辑大片', value: '采用时尚编辑摄影语言，用有意的姿态、利落轮廓和非对称版式建立视觉张力，造型与背景共享统一色彩逻辑，避免随意堆叠潮流元素', conflictGroup: 'visual-style' },
            { label: '极简留白', value: '使用单一视觉重点、两到三种克制颜色和大面积连续留白，通过比例、对齐与材质细节建立品质，避免空泛装饰、复杂背景和多余道具', conflictGroup: 'visual-style', legacyLabels: ['极简高级'] },
            { label: '复古胶片', value: '模拟自然胶片成像：柔和高光、略抬黑位、细颗粒与轻微色偏，肤色仍可信，避免重度漏光、脏旧划痕和一键滤镜感', conflictGroup: 'visual-style' },
            { label: '未来科技', value: '使用精密金属、半透明材料与受控冷暖光表现近未来技术，结构和交互用途清楚，避免随意霓虹、无意义线路与廉价赛博装饰', conflictGroup: 'visual-style' },
            { label: '梦幻柔焦', value: '在主体边缘和高光周围加入轻柔扩散与细腻光晕，同时保持眼睛、产品标识或关键轮廓清晰，色彩柔和，避免整幅失焦和过曝白雾', conflictGroup: 'visual-style' },
            { label: '概念艺术', value: '围绕一个明确设计命题统一形状语言、材质、尺度与环境规则，用关键道具和空间结构说明世界观，输出一张完成画面而不是混杂的灵感拼贴', conflictGroup: 'visual-style' }
        ]
    },
    {
        id: 'phone-camera',
        title: '手机镜头',
        description: '让画面更像真实手机拍摄，而不是棚拍或广告大片。',
        phrases: [
            { label: '前置自拍', value: '手机前置摄像头近距离自拍，视线看向屏幕，保留轻微广角透视、真实皮肤纹理和不完全对称的取景，避免棚拍布光', conflictGroup: 'capture-mode' },
            { label: '镜自拍', value: '全身镜自拍，手机与持机手自然入镜，镜面反射方向正确，人物、镜框和室内空间关系可信', conflictGroup: 'capture-mode' },
            { label: '随手抓拍', value: '像朋友用手机临时拍到的瞬间，构图略有偏移，动作和表情未完全准备好，但主体与关键动作仍清楚', conflictGroup: 'capture-mode' },
            { label: '社媒日常', value: '呈现未经商业修饰的社交平台日常照片，使用普通环境光、生活化背景与轻微成像瑕疵，避免棚拍姿势和广告级磨皮', conflictGroup: 'capture-mode' },
            { label: '夜间手机', value: '模拟夜间手机拍摄，保留暗部噪点、局部高光和混合色温，人物仍可辨认，避免把夜景提亮成白天或使用影棚轮廓光', conflictGroup: 'capture-mode' },
            { label: '闪光灯自拍', value: '近距离手机闪光灯自拍，正面硬光形成明确高光和快速衰减的背景，肤色仍自然，高光不过曝', conflictGroup: 'capture-mode' },
            { label: 'Live 图感', value: '像 Live Photo 中截取的一帧，表情与发丝处于动作中，只有运动部位出现轻微模糊，脸部识别和主体轮廓保持清楚', conflictGroup: 'capture-mode' },
            { label: '低清预览', value: '模拟远距离饭拍预览图，保留适度压缩、细颗粒和轻微锐化痕迹，五官与服装仍可辨认，不要整幅糊成低分辨率色块', conflictGroup: 'capture-mode' }
        ]
    },
    {
        id: 'selfie-background',
        title: '自拍背景',
        description: '常见自拍和生活照背景，用来快速指定真实场景与环境信息。',
        phrases: [
            { label: '卧室镜前', value: '真实卧室镜前自拍背景，衣柜、床品和柔和室内光自然入镜', conflictGroup: 'scene-setting' },
            { label: '浴室镜前', value: '浴室镜前自拍，干净瓷砖、洗手台和柔和顶灯，手机自然入镜', conflictGroup: 'scene-setting' },
            { label: '电梯镜面', value: '电梯镜面自拍背景，金属墙面反射、窄空间和真实顶灯', conflictGroup: 'scene-setting' },
            { label: '车内副驾', value: '车内副驾驶自拍，车窗自然光、座椅和安全带细节清楚', conflictGroup: 'scene-setting' },
            { label: '咖啡店窗边', value: '咖啡店窗边自拍背景，木桌、杯子、街景虚化和自然日光', conflictGroup: 'scene-setting' },
            { label: '便利店货架', value: '便利店货架前随手自拍，商品陈列、冷白灯和生活化背景', conflictGroup: 'scene-setting' },
            { label: '地铁站台', value: '地铁站台或车厢自拍背景，冷白灯、扶手和通勤人群轻微虚化', conflictGroup: 'scene-setting' },
            { label: '酒店房间', value: '酒店房间镜前自拍，行李箱、床头灯和干净临时居住感', conflictGroup: 'scene-setting' },
            { label: '校园走廊', value: '校园走廊或教室门口自拍背景，储物柜、白墙和自然人流', conflictGroup: 'scene-setting' },
            { label: '夜晚街边', value: '夜晚街边自拍，路灯、店招和城市背景虚化，真实手机夜拍质感', conflictGroup: 'scene-setting' }
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
        title: '人物质感与体态',
        description: '改善肤质、姿态和衣物表现，同时保持人物身份与人体结构可信。',
        phrases: [
            { label: '真实肤质', value: '保留毛孔、细小纹理与自然肤色过渡，弱化临时瑕疵但不改变五官，不使用塑料磨皮或大面积无纹理高光', legacyLabels: ['皮肤光洁'] },
            { label: '自然气色', value: '肤色与现场光源保持一致，通过轻微面部血色和柔和明暗呈现健康气色，不强行漂白皮肤', legacyLabels: ['白皙透亮'] },
            { label: '比例自然', value: '保持符合人物身份与姿势的自然头身比例，肩、腰、髋和四肢连接准确，不缩头、不拉长腿部', legacyLabels: ['小头比例', '九头身', '小头小脸'] },
            { label: '肩颈舒展', value: '肩部自然下沉，颈部与锁骨线条舒展，姿态挺拔但不刻意凹出直角肩或异常细长颈部', legacyLabels: ['天鹅颈', '直角肩', '精致锁骨'] },
            { label: '站姿稳定', value: '双脚与地面接触明确，身体重心落在支撑腿上，脊柱、骨盆和肩线共同形成自然站姿', legacyLabels: ['体态挺拔'] },
            { label: '坐姿自然', value: '坐姿符合座椅高度和受力关系，骨盆、腿部与手臂有可信支撑，避免悬空、扭曲或刻意收缩身体' },
            { label: '四肢完整', value: '手臂和腿部长度自然、关节方向正确，遮挡关系清楚，避免重复肢体、融合手指或异常弯折', legacyLabels: ['纤细四肢'] },
            { label: '衣物贴合', value: '衣物沿身体结构自然垂落或拉伸，在肩、肘、腰和膝部形成符合动作的褶皱，不用夸张曲线改变人体结构', legacyLabels: ['沙漏轮廓', '蜂腰', '宽髋曲线', '丰满上围', '紧身张力'] },
            { label: '发丝边缘', value: '保留发际线与细碎发丝，发束走向跟随头部和动作，避免头发形成塑料块或与背景粘连' },
            { label: '身份不变', value: '只优化光线、肤质和姿态，不改变人物脸型、五官间距、年龄特征、体型与可识别身份' }
        ]
    },
    {
        id: 'shot',
        title: '景别',
        description: '每次保留一个景别，让主体距离和画面信息量保持一致。',
        phrases: [
            { label: '大头自拍', value: '近距离头肩自拍，脸部占画面主要区域，额头、下巴和发型边缘完整保留，五官不因广角而夸张变形', conflictGroup: 'framing-distance' },
            { label: '半身自拍', value: '半身手机自拍，从头顶保留到腰部附近，肩颈、双手与上半身动作完整可见，避免在关节处裁切', conflictGroup: 'framing-distance' },
            { label: '全身 OOTD', value: '全身穿搭照，从头顶到鞋底完整入镜，服装层次与配饰清楚，脚部接触地面且人体比例自然', conflictGroup: 'framing-distance' },
            { label: '腰部以上', value: '腰部以上构图，头顶保留适量空间，脸部、手势和上衣细节清楚，背景仍能说明地点', conflictGroup: 'framing-distance' },
            { label: '远处长焦', value: '从较远距离拍摄人物全身或大半身，利用长焦压缩背景，保留自然行走动作和周围人群层次', conflictGroup: 'framing-distance' },
            { label: '舞台半身', value: '舞台半身特写，完整保留头部、肩部和主要手势，脸部表情清楚，灯光与 LED 背景不遮挡五官', conflictGroup: 'framing-distance' },
            { label: '人群中主体', value: '使用中远景展示人群环境，主体通过焦点、位置和光线被明确识别，背景人物保持自然比例且不过度复制', conflictGroup: 'framing-distance' },
            { label: '低角度路透', value: '轻微低机位的全身路透构图，保留脚部和环境地面，腿部仅由透视自然延伸，不进行夸张拉长', conflictGroup: 'framing-distance' }
        ]
    },
    {
        id: 'lighting',
        title: '光线',
        description: '每次选择一种主光环境，明确光源方向、色温和阴影表现。',
        phrases: [
            { label: '窗边自然光', value: '大面积窗光从主体一侧柔和照入，脸部或产品形成自然明暗过渡，阴影保留细节，皮肤与材质不过曝', conflictGroup: 'primary-light' },
            { label: '阴天漫射光', value: '使用阴天户外漫射光，整体反差较低、阴影边缘柔和，颜色保持真实，不额外添加影棚轮廓光', conflictGroup: 'primary-light' },
            { label: '便利店夜光', value: '以夜晚便利店或街边店铺的冷白灯为主光，混入少量招牌环境色，保留真实色温差与暗部噪点', conflictGroup: 'primary-light' },
            { label: '舞台追光', value: '舞台追光准确落在主体面部与上身，五官不过曝，背景 LED 与彩色灯形成层次但不污染肤色', conflictGroup: 'primary-light' },
            { label: '闪光灯抓拍', value: '使用正面媒体闪光灯形成明确高光、硬边投影和快速变暗的背景，高光不过曝，保留临场抓拍感', conflictGroup: 'primary-light' },
            { label: '地铁冷光', value: '以地铁站或机场顶部冷白灯为主光，保留眼窝和下颌的自然阴影，环境亮度均匀但不过度美化', conflictGroup: 'primary-light' },
            { label: '黄昏街边', value: '黄昏低角度自然光从侧后方照来，轮廓带暖色，天空与街景仍有层次，肤色不过度橙化', conflictGroup: 'primary-light' },
            { label: '车窗光', value: '车窗侧光在脸部形成柔和窄幅明暗过渡，车内保持较暗并保留座椅细节，营造安静私密感', conflictGroup: 'primary-light' }
        ]
    },
    {
        id: 'composition',
        title: '构图',
        description: '画幅会相互替换；主体位置、前景和景深仍可自由组合。',
        phrases: [
            { label: '竖版构图', value: '采用竖版画幅，主体在手机屏幕尺寸下仍清楚，上下保留合理呼吸空间，重要面部、手部和文字安全区不贴边', conflictGroup: 'output-frame' },
            { label: '方图封面', value: '采用 1:1 方形封面构图，缩略图尺寸下仍有单一清楚主体，关键轮廓与内容远离裁切边缘', conflictGroup: 'output-frame' },
            { label: '轻微歪斜', value: '构图轻微歪斜，像真实随手拍' },
            { label: '主体居中', value: '主体居中，脸部和服装重点清晰' },
            { label: '留出环境', value: '保留周围环境信息，画面有生活感' },
            { label: '前景遮挡', value: '前景有轻微遮挡，增加抓拍真实感' },
            { label: '背景虚化', value: '使用中等浅景深让背景逐渐柔化，主体眼睛、产品标识或关键边缘清晰，地点线索仍可辨认，不要把背景化成纯色色块' },
            { label: '不加文字', value: '画面中不要添加文字、水印或随机标志' }
        ]
    },
    {
        id: 'mood',
        title: '氛围',
        description: '通过可见的表情、动作、色彩和环境状态表达氛围，而不是只添加抽象形容词。',
        phrases: [
            { label: '松弛日常', value: '人物肩部放松、视线自然偏离镜头，动作像正在进行而非刻意摆拍；使用普通环境光和生活化背景，保留少量真实杂乱', conflictGroup: 'scene-mood' },
            { label: '清冷韩系', value: '使用低饱和冷灰与柔和蓝色调、简洁背景和利落造型，表情克制疏离；避免浓重青色滤镜、甜美元素和过度磨皮', conflictGroup: 'scene-mood' },
            { label: '甜酷女团', value: '用自信眼神、有力度的动作、亮色小面积点缀与金属或皮革配饰形成甜与酷的对比，避免幼态表情和元素堆满画面', conflictGroup: 'scene-mood' },
            { label: '刚下班', value: '呈现刚结束行程的状态：步伐略慢、肩部放松、发丝和衣物有轻微凌乱，表情疲惫但自然，不使用精修棚拍姿势', conflictGroup: 'scene-mood' },
            { label: '粉丝视角', value: '从人群外较远位置捕捉主体，保留前景遮挡、长焦压缩和轻微运动痕迹，让主体清楚但画面不像官方摆拍', conflictGroup: 'scene-mood' },
            { label: '官方花絮', value: '展示真实工作现场中的准备或间歇瞬间，背景保留灯架、工作人员或化妆台等线索，人物状态自然，同时构图与曝光达到官方发布质量', conflictGroup: 'scene-mood' },
            { label: '克制质感', value: '使用有限配色、真实材质和干净层级建立品质，只保留一个视觉重点，避免网红滤镜、金色堆砌、强磨皮和无关装饰', conflictGroup: 'scene-mood', legacyLabels: ['低调高级'] },
            { label: '青春明亮', value: '使用自然明亮肤色、清澈中高亮度配色和轻快动作，背景简洁有生活气息，避免荧光高饱和与幼态化处理', conflictGroup: 'scene-mood' }
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
        id: 'ui-visual-style',
        title: 'UI 视觉风格',
        description: '参考 StyleKit 的网页设计风格库整理，用于指定产品界面的视觉语言。',
        phrases: [
            { label: '玻璃拟态', value: '玻璃拟态 UI 风格，半透明磨砂玻璃面板、柔和边框、轻微阴影和现代层叠感' },
            { label: '新拟物', value: '新拟物 UI 风格，浅色同色系背景，柔和内外阴影，按钮和卡片有轻微凸起与凹陷' },
            { label: '新野兽派', value: '新野兽派 UI 风格，粗黑边框、硬边阴影、直角模块、高对比配色，视觉大胆有冲击力' },
            { label: '编辑杂志风', value: '编辑杂志风 UI，精致网格、衬线大标题、克制留白和高端内容排版感' },
            { label: 'Bento 网格', value: 'Bento Grid 界面布局，不同尺寸卡片组成清晰的信息层级，适合产品功能展示' },
            { label: '企业简洁', value: '企业级简洁 UI，清晰信息层级、克制色彩、可靠的表格和表单组件，适合 B2B 产品' },
            { label: '极简扁平', value: '极简扁平 UI，无多余装饰，依靠留白、文字层级和少量强调色建立界面秩序' },
            { label: '柔和界面', value: '柔和友好的 UI 风格，圆润控件、低饱和配色、轻阴影和亲和的消费级应用气质' },
            { label: '暗黑模式', value: '暗黑模式产品 UI，深色表面层级、微妙边框、高可读文字和克制高亮色' },
            { label: 'macOS 毛玻璃', value: 'macOS 毛玻璃界面风格，深灰半透明面板、系统级模糊、精致边界和桌面应用质感' },
            { label: 'Stripe 风格', value: 'Stripe 风格产品 UI，精致专业、可信的金融科技气质，渐变背景、清晰卡片和流畅层级' },
            { label: 'Notion 风格', value: 'Notion 风格 UI，文档工具感、极简白底、细边框、清晰文字层级和直接可用的功能布局' },
            { label: 'Apple 风格', value: 'Apple 风格界面，大量留白、精致圆角、微妙阴影、克制高端科技产品质感' },
            { label: 'Material Design', value: 'Material Design 移动端 UI，清晰纸张层级、大胆主色、规范组件状态和响应式交互' },
            { label: 'Fluent Design', value: 'Fluent Design UI，光感、深度、动效和材质层次结合，适合跨平台工具界面' },
            { label: '赛博霓虹', value: '赛博朋克霓虹 UI，深色背景、霓虹发光、高科技边框和未来感数据界面' }
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
