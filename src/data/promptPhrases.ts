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
    }
]
