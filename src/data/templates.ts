import type { StyleTemplate } from '../types'
import { gptImage2GalleryTemplates } from './gptImage2GalleryTemplates'

const completedTemplatePreviewById: Record<string, string> = {
    'kbo-broadcast-identity-anchor': '/template-previews/kbo-broadcast-identity-anchor.webp',
    'commercial-campaign': '/template-previews/commercial-campaign.webp',
    'magazine-cover': '/template-previews/magazine-cover.webp',
    'poster-key-visual': '/template-previews/poster-key-visual.webp',
    'beauty-editorial': '/template-previews/beauty-editorial.webp',
    'mv-concept-still': '/template-previews/mv-concept-still.webp',
    'album-photobook': '/template-previews/album-photobook.webp',
    'photocard-portrait': '/template-previews/photocard-portrait.webp',
    'artist-profile-photo': '/template-previews/artist-profile-photo.webp',
    'comeback-teaser-poster': '/template-previews/comeback-teaser-poster.webp',
    'editorial-fashion-fullbody': '/template-previews/editorial-fashion-fullbody.webp',
    'korean-ootd-mirror': '/template-previews/korean-ootd-mirror.webp',
    'idol-backstage-selfie': '/template-previews/idol-backstage-selfie.webp',
    'fancam-cover': '/template-previews/fancam-cover.webp',
    'airport-preview': '/template-previews/airport-preview.webp',
    'after-work-preview': '/template-previews/after-work-preview.webp',
    'korean-cafe-snapshot': '/template-previews/korean-cafe-snapshot.webp',
    'street-paparazzi': '/template-previews/street-paparazzi.webp',
    'product-hero': '/template-previews/product-hero.webp',
    'cinematic-environment': '/template-previews/cinematic-environment.webp',
    'gpt-image2-edit-identity-scene': '/template-previews/gpt-image2-edit-identity-scene.webp',
    'gpt-image2-edit-outfit-only': '/template-previews/gpt-image2-edit-outfit-only.webp',
    'gpt-image2-edit-background-only': '/template-previews/gpt-image2-edit-background-only.webp',
    'gpt-image2-edit-multi-reference': '/template-previews/gpt-image2-edit-multi-reference.webp',
    'gpt-image2-edit-local-detail': '/template-previews/gpt-image2-edit-local-detail.webp'
}

export const styleTemplates: StyleTemplate[] = [
    {
        id: 'kbo-broadcast-identity-anchor',
        title: 'KBO 观众席转播抓拍',
        category: '真实摄影',
        mode: 'image',
        tags: ['参考图', '身份保持', 'KBO', '转播截图', '长焦'],
        prompt: '把上传的参考图作为最强身份锚点。画面中的女性必须看起来就是参考图里的同一位成年女性，而不是相似的韩国女性。高优先级保留她的面部身份：小巧鹅蛋脸、精致下颌线、大而清澈的眼睛、相同眼距、相同眼睑形状、直鼻、柔和低饱和粉色嘴唇、白皙清透肤色、克制平静的神情，以及黑色长卷发。生成一张超写实、像 KBO 棒球直播中被电视摄像机偶然拍到的观众席截图。球队信息是 LG 和 F1。她的脸应比普通球迷更接近参考图，不要把她变成另一个人，不要让脸变宽、变老、变锋利、变欧美化或变成偶像脸。保留参考图里的精致棚拍身份感，但自然转译到真实球场环境中。她坐在热闹的韩国棒球观众席里，手拿冰饮和应援棒，穿干净白色棒球球衣，里面是简单休闲上衣。她一只手正在整理头发，注意到镜头后露出轻微自然的笑，有一点惊讶但保持从容。使用真实远距离电视转播镜头质感：长焦压缩、轻微软的视频画质、人群有轻微运动模糊、球场灯光、自然皮肤纹理、不完美的抓拍构图、16:9 横向电视转播构图。',
        promptEn: 'Use the uploaded reference image as the strongest identity anchor. The woman must look like the exact same adult woman from the reference image, not just a similar Korean woman. Preserve her exact facial identity with high priority: same small oval face, same delicate jawline, same large clear eyes, same eye spacing, same eyelid shape, same straight nose, same soft muted pink lips, same pale clear skin tone, same refined calm expression, and same long black softly wavy hair. Create an ultra-realistic candid KBO baseball broadcast screenshot of the same woman accidentally caught by a live TV camera in the spectator seats. The team name is LG and F1. Her face should remain closer to the reference image than to a generic stadium fan. Do not change her into another person. Do not make her face wider, older, sharper, more westernized, or more idol-like. Keep the same delicate studio-portrait identity, but translated naturally into a real stadium environment. She is seated among a lively Korean baseball crowd, holding an iced drink and a cheering stick, wearing a clean white baseball jersey over a simple casual top. She is adjusting her hair with one hand. She notices the camera and gives a small natural smile, slightly surprised but composed. Use a realistic far-distance broadcast camera look: telephoto compression, mild video softness, slight motion blur in the crowd, stadium lighting, natural skin texture, imperfect candid framing, 16:9 horizontal TV broadcast composition.',
        image: '',
        description: '适合参考图人像身份保持，把棚拍人像自然转成 KBO 球场直播抓拍。'
    },
    {
        id: 'commercial-campaign',
        title: '商业广告大片',
        category: '商业视觉',
        mode: 'both',
        tags: ['广告', '大片', '品牌'],
        prompt: `生成目标：
为【现代生活方式品牌】制作一张以【核心产品或人物】为主角的高级商业广告主视觉，清楚传达【可靠、精致且具有吸引力的品牌印象】与【一个最重要的产品卖点】。

可编辑内容：
主体设定为【核心产品或成年人物】，场景设定为【简洁的品牌摄影棚】，主色为【中性色搭配一个鲜明品牌色】，造型或道具为【与卖点直接相关的少量物件】，画幅为【4:5 竖版】。

参考图处理：
如上传参考图，先判断每张图负责【人物身份、产品外观、服装或场景】中的哪一项，只提取对应信息。产品参考需保留标志性轮廓、结构和材质；如参考图包含人物，只保留可识别身份与必要特征，不要把参考图的头部像贴纸一样原样复制；应根据【自然利落的新发型】、【自信放松的新表情】、【轻微侧面的新视角】和【舒展有力量的新动作】重新生成连贯的头颈、身体与姿态。

画面设计：
建立明确的主体层级，以【克制、现代、可信】为视觉方向，用【一处关键道具或色块】强化卖点。背景服务主体并保留品牌呼吸感，不依赖复杂装饰制造高级感。

镜头与构图：
使用【50mm 商业摄影镜头感】和【略低于视线的平视机位】，主体占据画面【约三分之二】，在【画面上方和右侧】保留可用于后期标题与 logo 的干净区域，边缘、透视和主体比例准确。

光线与材质：
采用【大型柔光主灯配窄角轮廓光】，让皮肤、玻璃、金属、织物或包装分别呈现真实材质反应；阴影干净但有层次，高光不过曝，最终质感接近正式品牌 campaign。

避免：
避免随机文字、伪造 logo、廉价促销感、无关道具、过度饱和、塑料皮肤、错误反射、变形手指、僵硬姿态、头身比例失衡，以及主体与背景光线不一致。`,
        image: '',
        description: '适合品牌宣传、活动视觉和高级广告图。'
    },
    {
        id: 'magazine-cover',
        title: '杂志封面大片',
        category: '商业视觉',
        mode: 'both',
        tags: ['杂志', '封面', '编辑'],
        prompt: `生成目标：
为【一本当代时尚与文化杂志】创作一张以【成年人物】为主角的封面级编辑摄影，主题是【冷静、自信与现代感】，画面应有鲜明观点而不是普通棚拍肖像。

可编辑内容：
人物穿着【结构感黑白时装】，发型改为【带自然空气感的短发或盘发】，表情为【平静直视镜头】，背景为【带细微纸张或墙面肌理的纯色空间】，主色为【黑、白、冷红三色】，画幅为【4:5 竖版】。

参考图处理：
如上传人物参考图，将其用于保持【面部身份与年龄感】，不要锁死原图的发型、表情、拍摄角度、头部朝向或姿势。不要把参考图的头部像贴纸一样原样复制；请按照【新的妆发】、【新的视线方向】和【新的肩颈姿态】完整重建自然连贯的头部、颈部和身体。

画面设计：
造型、妆容和背景围绕【克制的先锋编辑感】统一设计，以【一个醒目的轮廓或配饰】形成记忆点。皮肤保留真实纹理，修图精致但不过度，画面具有可出版的时尚质感。

镜头与构图：
使用【85mm 人像镜头感】，采用【胸像到半身构图】，人物略偏【画面左侧】，眼睛位于上三分区；在【顶部、右侧和下方】留出封面刊头、标题与条码的排版空间，但图中不直接生成文字。

光线与材质：
使用【柔和正面主光配一侧硬质切光】，清楚呈现脸部结构、发丝、织物纹理与配饰边缘；背景与人物之间保持适度层次，色彩准确，高光细腻。

避免：
避免直接生成杂志名、标题、条码、水印或随机字母；避免对称证件照构图、塑料皮肤、过度磨皮、僵硬肩颈、固定原发型、五官漂移、头身拼接感和不自然眼神。`,
        image: '',
        description: '适合人物封面、时尚大片和社媒封面。'
    },
    {
        id: 'poster-key-visual',
        title: '海报主视觉',
        category: '商业视觉',
        mode: 'both',
        tags: ['海报', '主视觉', '活动'],
        prompt: `生成目标：
为【城市创意节或品牌发布活动】制作一张专业海报主视觉，以【核心人物或主题物件】表达【连接、突破与未来感】的活动概念，第一眼就能形成清楚的视觉识别。

可编辑内容：
主角为【成年人物或标志性产品】，核心动作或状态为【向前移动并与环境产生互动】，场景为【抽象化的城市展览空间】，视觉符号为【重复的几何框架与一道明亮色带】，配色为【深灰、象牙白和荧光绿】，画幅为【2:3 竖版】。

参考图处理：
如上传参考图，分别提取【人物身份、产品结构、品牌色或空间气质】，不要把多张参考图的内容平均混合。如参考图包含人物，只保留可识别身份与必要特征，不要把参考图的头部像贴纸一样原样复制；应根据【有方向感的新发型】、【专注的新表情】、【三分之二侧面视角】和【具有动势的新动作】重建完整人物。

画面设计：
使用【一个主视觉焦点、两层辅助图形和清晰负空间】建立层级，让视觉符号与活动概念有关，而不是纯装饰。画面既有冲击力又能承载后期信息排版。

镜头与构图：
采用【35mm 广角但无明显畸变的镜头感】，主体位于【中下部偏左】，通过前景、中景、背景形成空间深度；在【顶部约四分之一和右下角】预留标题、日期与地点区域，不在图中直接生成文字。

光线与材质：
使用【高对比侧光与环境反射光】，让人物、产品、金属框架、半透明材质和地面阴影关系可信；色彩强烈但受控，边缘清晰，具有设计团队完成的 KV 质感。

避免：
避免随机文字、伪造 logo、无意义符号堆叠、主体被装饰遮挡、透视冲突、过度霓虹、廉价光效、人物僵硬、头身比例不协调、参考图头部直接复制和信息区被复杂背景占满。`,
        image: '',
        description: '适合活动 KV、宣传海报和封面主图。'
    },
    {
        id: 'beauty-editorial',
        title: '美妆编辑大片',
        category: '人像时尚',
        mode: 'both',
        tags: ['美妆', '人像', '棚拍'],
        prompt: `生成目标：
创作一张以【成年人物的清透光泽妆容】为核心的高端美妆编辑大片，重点展示【细腻眼妆、自然唇色与健康皮肤质感】，达到可用于杂志内页或品牌视觉的完成度。

可编辑内容：
妆容主题为【冷调珍珠光泽妆】，发型为【露出面部轮廓的湿感束发】，表情为【放松而有力量的轻微侧视】，背景为【柔和灰粉渐变摄影棚】，点缀物为【少量透明亚克力或水滴】，画幅为【4:5 竖版】。

参考图处理：
如上传人物参考图，仅用来维持【同一人物的脸部身份、肤色与年龄感】，允许按照模板改变发型、妆容、表情、视线和脸部角度。不要把参考图的头部像贴纸一样原样复制；请围绕【新的三分之二侧脸角度】重新建立五官透视、耳朵、发际线、颈部、肩部与身体连接。

画面设计：
让【眼部光泽、唇部颜色和皮肤纹理】成为清楚的三级重点，配饰与背景只负责衬托。保留毛孔、细小绒毛和真实肤色变化，同时进行精细但克制的商业修饰。

镜头与构图：
使用【100mm 微距人像镜头感】，采用【面部特写到肩部构图】，对焦在【靠近镜头的眼睛】，让另一侧脸部自然进入浅景深；裁切干净，不切断下巴、嘴唇或关键妆容区域。

光线与材质：
采用【大型柔光箱正侧光、下方柔和补光和细窄轮廓光】，准确表现皮肤、唇釉、眼影、发丝与透明道具的差异；高光柔润而不油腻，肤色不发灰。

避免：
避免塑料皮肤、过度磨皮、假睫毛粘连、眼睛大小不一、牙齿或嘴唇变形、过强油光、发丝糊成块、固定原发型、参考图头部直接复制、随机文字、品牌 logo 和水印。`,
        image: '',
        description: '适合美妆、头像、人像特写和妆容参考。'
    },
    {
        id: 'kpop-studio-concept',
        title: 'K-pop 棚拍概念照',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['棚拍', '概念照', '回归'],
        prompt: `生成目标：
为【一位成年 K-pop solo 艺人】创作一张官方回归棚拍概念照，概念为【未来感极简与冷静力量】，像完整企划中的主视觉而不是普通写真。

可编辑内容：
人物发型为【利落高马尾配少量碎发】，妆容为【低饱和冷调眼妆与自然唇色】，服装为【结构感银灰舞台套装，完整覆盖且适合公开宣传】，表情为【克制而自信】，背景装置为【镜面金属框架与半透明灯片】，画幅为【4:5 竖版】。

参考图处理：
如上传人物参考图，将其作为【同一成年人物的身份参考】，保持脸型与核心五官关系，但允许明确更换发型、妆容、表情、头部角度、姿态和服装。不要把参考图的头部像贴纸一样原样复制；请根据【略微仰头的三分之二侧面】与【肩部转向镜头的站姿】重新生成协调的头颈、肩线、躯干和四肢。

画面设计：
妆发、服装、配饰、背景装置和主题色全部围绕【冷银与深红的未来舞台感】统一，使用【一个不对称金属耳饰】作为记忆点。造型精致但不堆砌，具备官方 teaser 的识别度。

镜头与构图：
使用【70mm 棚拍人像镜头感】，采用【膝上构图】，机位【略低于眼睛】，人物偏【画面右侧】并在左上方留出发布文案空间；姿态有张力但关节自然，身体重心可信。

光线与材质：
采用【硬质侧上方主光、柔和正面补光和红色边缘光】，清楚呈现皮肤、发丝、金属、织物和半透明装置；保留真实皮肤纹理与服装褶皱，画面锐利但不过度磨皮。

避免：
避免随机文字、真实团体 logo、水印、暴露或内衣式造型、通用偶像脸、固定原发型、参考图头部直接复制、表情僵硬、手脚变形、头身比例失衡、身体像假人以及背景装置穿过人物。`,
        image: '/template-previews/kpop-studio-concept.webp',
        description: '适合回归预告、概念视觉和官方社媒物料。'
    },
    {
        id: 'mv-concept-still',
        title: '概念 MV 剧照',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['MV', '概念', '剧照'],
        prompt: `生成目标：
创作一张像【高预算 K-pop 音乐视频】关键静帧的电影感画面：一位【成年艺人】正在【雨后深夜的空旷地铁站】经历【离开前最后一次回望】的叙事瞬间。

可编辑内容：
场景为【潮湿反光的末班地铁站】，人物发型为【被风轻轻吹动的中长发】，服装为【深色长外套与简洁舞台内搭】，动作和表情为【快步离开时突然回望，呼吸微急但神情清醒】，主题色为【青绿色环境光与暖橙信号灯】，画幅为【16:9 横版】。

参考图处理：
如上传人物参考图，只将其用于保持【同一成年人物的面部身份和年龄感】，不要沿用原图的正面角度、静态表情、发型轮廓或棚拍姿势。不要把参考图的头部像贴纸一样原样复制；应依据【回头运动中的侧后方角度】重建正确的五官透视、发丝运动、颈肩扭转与全身重心。

画面设计：
让【远处即将关闭的列车门、地面倒影和人物回望】共同讲述一个明确瞬间，环境细节支持故事但不过度解释。画面应像真实 MV 截帧，而不是摆拍海报。

镜头与构图：
使用【40mm 电影镜头感】和【略低的手持跟拍机位】，人物位于【右侧三分之一】，前景加入【轻微虚化的站台立柱】，中景是人物，背景是列车与纵深线；保留适度运动模糊，但脸部仍可辨认。

光线与材质：
以【顶部冷色荧光灯】为环境光，用【列车门内的暖光】勾勒面部和外套边缘；湿地、金属、玻璃和织物反射真实，暗部保留细节，整体具有电影级色彩层次。

避免：
避免字幕、歌词、电视台台标、水印、随机文字、过度烟雾、廉价霓虹、脸部完全陷入黑暗、固定原发型、参考图头部直接复制、人物动作僵硬、颈肩扭曲、四肢重复和明显摆拍感。`,
        image: '',
        description: '适合 MV 截帧、概念故事和视觉叙事。'
    },
    {
        id: 'album-photobook',
        title: '专辑内页写真',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['专辑', '内页', '写真'],
        prompt: `生成目标：
为【一张以夏末记忆为主题的 K-pop 专辑】制作一幅 photobook 内页写真，呈现【成年艺人在安静旅途中短暂停留】的自然状态，既有生活感又保留完整的编辑摄影品质。

可编辑内容：
地点为【傍晚的海边汽车旅馆走廊】，发型为【自然松散的低马尾】，妆容为【清透低饱和妆面】，服装为【宽松浅蓝衬衫与白色长裤】，动作和表情为【靠在栏杆上看向远处，随后轻微回头】，道具为【一台旧胶片相机】，画幅为【3:4 竖版】。

参考图处理：
如上传人物参考图，用它确认【同一成年人物的面部身份、肤色与年龄感】，同时允许根据企划重新设计妆发、表情、视角、动作和服装。不要把参考图的头部像贴纸一样原样复制；请为【自然回头的侧面角度】重建连贯的发际线、耳朵、下颌、颈肩、躯干与四肢关系。

画面设计：
以【褪色蓝、暖白和夕阳橙】建立统一企划感，让建筑线条、海风、服装和胶片相机共同支持“旅途记忆”主题。环境有真实生活痕迹，但没有无关杂物。

镜头与构图：
使用【55mm 胶片人像镜头感】，采用【大腿以上构图】，人物偏【画面左侧】，走廊延伸线通向远处海面；保留【右页方向的干净负空间】，使画面适合与另一张照片组合成跨页。

光线与材质：
使用【夕阳侧逆光与走廊墙面柔和反射光】，皮肤、棉质衬衫、旧墙面、金属栏杆和胶片相机材质真实；加入克制的细颗粒与柔和高光，保持肤色自然。

避免：
避免文字、条形码、logo、水印、过度滤镜、塑料皮肤、杂乱道具、固定原发型、参考图头部直接复制、僵硬站姿、身体比例失衡、手指错误和像商业广告一样过度精修。`,
        image: '',
        description: '适合专辑写真、内页视觉和主题组图。'
    },
    {
        id: 'photocard-portrait',
        title: '小卡收藏照',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['小卡', '自拍', '收藏'],
        prompt: '生成一张 K-pop photocard 小卡收藏照。构图以近距离大头或半身为主，表情自然有亲近感，妆发精致，脸部清晰，背景简单但有氛围。可以像后台自拍、签售自拍或官方小卡拍摄，不要添加文字、签名、边框或随机图案。画面适合裁切成竖版小卡。',
        image: '',
        description: '适合小卡、头像、近景自拍和收藏感人像。'
    },
    {
        id: 'artist-profile-photo',
        title: '艺人公式照',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['公式照', '资料照', '头像'],
        prompt: '生成一张艺人官方 profile photo。背景简洁干净，人物正面或微侧身，脸部、发型、妆容和上半身造型清楚。光线柔和均匀，整体像经纪公司资料页、宣传资料或官方头像，不要过度美颜，不要生成文字、姓名牌、logo 或水印。',
        image: '',
        description: '适合资料页头像、官方介绍和干净人像。'
    },
    {
        id: 'comeback-teaser-poster',
        title: '回归预告海报',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['预告', '海报', 'teaser'],
        prompt: `生成目标：
为【一位成年 K-pop 艺人的新专辑】制作一张 comeback teaser poster 主视觉，以【身份分裂与重新觉醒】为概念，画面精致、清晰并保留足够悬念。

可编辑内容：
人物发型为【不对称湿感短发】，妆容为【冷调金属眼妆与自然唇色】，服装为【黑色结构感长外套，完整覆盖且适合公开宣传】，场景为【被一面裂纹镜分隔的暗色摄影棚】，关键道具为【一束白色花与一条红线】，配色为【黑、银、暗红】，画幅为【4:5 竖版】。

参考图处理：
如上传人物参考图，只保留【同一成年人物的身份、脸部结构与年龄感】，允许企划要求的发型、妆容、表情、镜头角度、动作和服装发生明显变化。不要把参考图的头部像贴纸一样原样复制；请按照【侧身面对镜面、脸转向镜头】的动作重建可信的五官透视、头颈旋转、肩线和全身姿态。

画面设计：
用【真实人物、镜中局部反射和红线】构成三层信息，所有元素围绕“分裂与觉醒”服务。镜面反射应具有叙事意义，不能复制出无关人物；整体像官方预告而不是普通时尚照。

镜头与构图：
使用【65mm 人像镜头感】，采用【膝上竖版构图】，人物位于【下方偏右】，镜面裂纹引导视线到脸部；在【顶部约五分之一和左下方】为后期标题、日期与专辑信息留出干净区域，图中不直接生成文字。

光线与材质：
采用【窄角硬质主光、镜面反射补光和暗红轮廓光】，准确呈现皮肤、湿发、黑色织物、玻璃裂纹与花瓣；暗部有层次，轮廓清晰，色彩浓郁但不过曝。

避免：
避免随机文字、日期、真实 logo、水印、暴露或内衣式服装、镜中多脸、无意义碎玻璃、固定原发型、参考图头部直接复制、僵硬姿态、头身比例不协调、手部畸形和廉价恐怖片效果。`,
        image: '',
        description: '适合回归预告、活动视觉和概念海报。'
    },
    {
        id: 'luxury-product-still',
        title: '奢侈品静物',
        category: '商业视觉',
        mode: 'both',
        tags: ['产品', '静物', '高级'],
        prompt: `生成目标：
为【一款高端香水或珠宝产品】创作一张奢侈品静物广告照片，重点表达【稀有材质、克制工艺与安静力量】，达到杂志跨页或品牌橱窗视觉的完成度。

可编辑内容：
主产品为【透明玻璃香水瓶与金属瓶盖】，陈列台面为【深色抛光石材】，辅助物为【一片磨砂玻璃与一枝白色花材】，背景为【低饱和暖灰空间】，主色为【烟灰、象牙白与少量香槟金】，画幅为【4:5 竖版】。

参考图处理：
如上传产品参考图，将其作为【产品造型、比例、材质和真实标识位置】的依据，保持轮廓与结构可识别；允许根据【新的陈列角度】重新计算透视、反射和遮挡。场景或材质参考图只提供对应信息，不得改变产品设计，也不要凭空补造不可读标签。

画面设计：
以【主产品、一个辅助材质和一道负空间】建立克制层级，产品是唯一视觉中心。道具数量少且彼此有材质对比，画面留白用于后期品牌排版，不依赖华丽装饰表现昂贵感。

镜头与构图：
使用【90mm 静物摄影镜头感】，采用【略高于台面的三分之二侧视角】，主产品位于【下方偏左】并保持垂直稳定；在【上方和右侧】留出干净区域，景深足以让产品名称区域和关键边缘清楚。

光线与材质：
采用【大型条形柔光、窄角轮廓光与黑旗控反射】，准确呈现玻璃厚度、液体折射、金属拉丝、石材纹理和花瓣柔软度；阴影方向统一，高光细长而不过曝。

避免：
避免随机文字、错误标签、伪造 logo、产品结构变形、瓶盖漂浮、玻璃像塑料、金属过曝、反射中出现摄影设备、道具堆积、过度金色、廉价亮片和不可信接触阴影。`,
        image: '/template-previews/luxury-product-still.webp',
        description: '适合产品质感、包装展示和电商高级主图。'
    },
    {
        id: 'editorial-fashion-fullbody',
        title: '时尚编辑全身',
        category: '人像时尚',
        mode: 'both',
        tags: ['时尚', '全身', '杂志'],
        prompt: '生成一张时尚编辑全身大片。人物全身比例自然，服装轮廓、面料和搭配层次清楚。姿态自信但不僵硬，背景简洁有设计感，光线像专业摄影棚或编辑外景。整体适合 lookbook、杂志内页或品牌造型图。',
        image: '',
        description: '适合全身穿搭、lookbook 和品牌服装图。'
    },
    {
        id: 'phone-selfie-natural',
        title: '手机镜头自拍',
        category: '手机人像',
        mode: 'both',
        tags: ['自拍', '手机感', '真实皮肤'],
        prompt: '生成一张像手机前置摄像头拍摄的自然自拍。主体看向镜头，构图轻微随手感，保留真实皮肤纹理、自然表情和轻微镜头畸变。光线像室内窗边或街边自然光，不要棚拍感，不要过度磨皮，不要商业大片质感。画面应该像真实社交平台随手发布的照片。',
        image: '/template-previews/phone-selfie-natural.webp',
        description: '更接近真实手机自拍，而不是精修写真。'
    },
    {
        id: 'korean-ootd-mirror',
        title: '韩式 OOTD 镜自拍',
        category: '手机人像',
        mode: 'both',
        tags: ['OOTD', '镜自拍', '韩系穿搭'],
        prompt: '生成一张韩式 OOTD 镜自拍。主体站在全身镜前，用手机遮住部分脸或自然拿在胸前，服装搭配清爽、有层次，姿态放松。背景可以是公寓玄关、衣帽间、咖啡店洗手间或简洁街区店面。保留真实手机拍摄的纵向构图、环境反射、自然光和生活感。',
        image: '',
        description: '适合穿搭、服装参考和日常社交图。'
    },
    {
        id: 'idol-backstage-selfie',
        title: 'Idol 后台自拍',
        category: 'K-pop 生态',
        mode: 'both',
        tags: ['idol', '后台', '自拍'],
        prompt: '生成一张 K-pop idol 后台自拍风格图片。主体像在打歌后台、化妆间或练习室用手机自拍，妆发精致但表情自然，服装有舞台造型感。背景出现柔和的化妆灯、衣架、工作人员虚化或练习室镜面，但不要杂乱。画面质感应该像官方社媒更新，不要像电影剧照或商业广告。',
        image: '',
        description: '适合做偶像社媒自拍、后台花絮感图像。'
    },
    {
        id: 'fancam-cover',
        title: '直拍封面',
        category: 'K-pop 生态',
        mode: 'both',
        tags: ['直拍', '舞台', '封面'],
        prompt: '生成一张 K-pop 直拍视频封面感图片。主体在舞台上处于清晰的高光瞬间，眼神有抓取感，动作停在最有记忆点的一帧。服装应为适合公开演出的完整覆盖舞台造型，不使用内衣式服装、胸前镂空、低胸、露腰或强调身体曲线的姿势。舞台灯光、LED 背景和浅景深要明显，但主体脸部和服装细节保持清楚。构图适合竖版或方形封面，不添加文字，不生成水印。',
        image: '',
        description: '偏舞台直拍截图和粉丝会收藏的封面图。'
    },
    {
        id: 'airport-preview',
        title: '机场路透',
        category: 'K-pop 生态',
        mode: 'both',
        tags: ['机场', '站姐', '媒体图'],
        prompt: '生成一张韩娱机场路透风格图片。主体穿着日常但有造型感的机场穿搭，正在机场出入口、航站楼通道或保姆车旁自然行走。画面像长焦媒体图或站姐预览图，背景有人群、行李箱、闪光灯和轻微运动模糊。保留真实抓拍感，不要过度摆拍，不要红毯或棚拍质感。',
        image: '',
        description: '用于机场、出入境、媒体抓拍类图像。'
    },
    {
        id: 'after-work-preview',
        title: '下班路透',
        category: 'K-pop 生态',
        mode: 'both',
        tags: ['下班路', '站姐', '夜景'],
        prompt: '生成一张 idol 下班路透风格图片。主体从电视台、练习室或活动场馆离开，穿着私服或半舞台造型，身边有保姆车、工作人员、粉丝和闪光灯。使用夜间长焦抓拍、轻微噪点、背景虚化和真实媒体图质感。主体应清楚、有氛围，但不要像正式写真。',
        image: '',
        description: '适合“下班路”“出勤”“饭拍预览”的氛围。'
    },
    {
        id: 'korean-cafe-snapshot',
        title: '韩系咖啡店随拍',
        category: '生活方式',
        mode: 'both',
        tags: ['咖啡店', '日常', '自然光'],
        prompt: '生成一张韩系咖啡店日常随拍。主体坐在窗边、吧台或小圆桌旁，画面有手机随手拍的松弛感。光线柔和，背景有咖啡杯、甜点、玻璃窗、街景或简洁室内设计。整体干净、自然、轻社交平台风格，不要厚重滤镜，不要过度商业化。',
        image: '',
        description: '适合生活照、约会感、社媒日常图。'
    },
    {
        id: 'street-paparazzi',
        title: '街头媒体抓拍',
        category: '真实摄影',
        mode: 'both',
        tags: ['抓拍', '长焦', '街拍'],
        prompt: '生成一张街头媒体抓拍风格图片。主体自然行走或回头，画面来自远处长焦镜头，背景有城市街区、车辆、行人和轻微压缩感。表情和姿态不要太摆拍，服装细节清楚，整体像真实街拍或新闻图片。保留一点颗粒、运动感和环境不完美。',
        image: '',
        description: '更真实的街拍、路透和媒体图质感。'
    },
    {
        id: 'figure-collectible',
        title: '桌面手办风格',
        category: '角色商品化',
        mode: 'image',
        tags: ['角色', '手办', '包装'],
        prompt: '把参考角色转成收藏级桌面手办。手办放在干净电脑桌上，有透明圆形亚克力底座，旁边有高级玩具包装盒，包装图案来自参考角色。背景可以出现显示建模过程的屏幕。保留角色身份、服装颜色、发型、配饰和比例，不要在底座或包装上生成不可读文字。',
        image: '/1.png',
        description: '保留原有热门手办玩法，但改成中文可读。'
    },
    {
        id: 'product-hero',
        title: '产品级主视觉',
        category: '商业视觉',
        mode: 'both',
        tags: ['产品', '电商', '海报'],
        prompt: `生成目标：
为【一款现代消费电子产品】制作一张清楚、可信且具有品牌完成度的产品级主视觉，突出【轻薄结构、精密材质和易用体验】，适合电商首屏或新品发布页面。

可编辑内容：
产品为【无线耳机及充电盒】，展示状态为【盒盖开启、耳机悬停在正确收纳位置上方】，背景为【明亮柔和的浅灰摄影棚】，品牌色点缀为【克制的珊瑚红】，辅助元素为【一条表示连接关系的柔和光线】，画幅为【16:9 横版】。

参考图处理：
如上传产品参考图，严格保留【真实外形、尺寸比例、按键、接口、接缝、材质和颜色】，只改变陈列方式、相机角度、背景和光线。若另有场景参考图，仅提取【空间气质与配色】，不得混入其中的其他产品、文字或品牌标识。

画面设计：
建立【主产品、功能关系和负空间】三层信息，第一眼看清产品，第二眼理解【开盒与无线连接】。背景简洁但不空洞，品牌色只用于引导视线，不把产品变成概念雕塑。

镜头与构图：
使用【70mm 产品摄影镜头感】，采用【略高的三分之二视角】，产品组位于【画面右侧中央】，在【左侧约三分之一】保留标题与卖点区域；部件之间距离合理，透视一致，产品没有被画面边缘切断。

光线与材质：
采用【大面积顶部柔光、正面轻补光和细窄边缘光】，准确表现哑光塑料、金属触点、半透明指示灯和接触阴影；白色产品仍有清楚轮廓，高光干净，背景不过曝。

避免：
避免随机文字、伪造 logo、额外按键、接口数量错误、左右耳结构混乱、部件漂浮失重、产品比例改变、塑料质感廉价、过强镜面反射、过多道具、杂乱背景和不合理阴影。`,
        image: '',
        description: '适合商品、设备、包装或任意主体。'
    },
    {
        id: 'cinematic-environment',
        title: '电影级环境氛围',
        category: '叙事场景',
        mode: 'both',
        tags: ['电影感', '环境', '光影'],
        prompt: `生成目标：
创作一张来自【现实主义科幻电影】的环境叙事静帧：一位【成年旅人】在【暴雨刚停的山城交通站】发现【远处重新亮起的最后一班缆车】，画面应像高预算电影中的真实场景而不是概念拼贴。

可编辑内容：
主体为【穿深色防雨外套的成年旅人】，地点为【沿山而建的混凝土交通站】，时间为【蓝调时刻之后的夜晚】，天气为【雨后薄雾】，关键事件为【缆车灯光重新亮起】，主色为【冷灰、潮湿青绿与少量钨丝暖黄】，画幅为【2.39:1 宽银幕】。

参考图处理：
如上传参考图，人物图只负责【身份与基本外形】，环境图只负责【建筑语言、地形和气候】，服装图只负责【款式与材质】。人物身份应可识别，但允许根据【背向镜头后轻微回头】的视角重建发型、表情、头颈和身体；所有参考信息都必须服从同一透视与光线。

画面设计：
以前景【积水与近处栏杆】、中景【人物和候车平台】、背景【缆车与层叠山城灯光】构成三层叙事。环境细节说明地点、天气与事件，但不使用文字解释故事。

镜头与构图：
使用【32mm 电影镜头感】，机位位于【人物后方略低处】，人物处在【左下三分点】，站台线条将视线引向右上方缆车；保留真实建筑尺度、人物比例和空间纵深，加入轻微自然镜头呼吸感。

光线与材质：
以【阴天蓝色环境光】为基础，用【站台顶灯和缆车暖光】形成叙事焦点；混凝土、湿金属、玻璃、积水、雾气和防雨织物均有可信材质反应，暗部保留细节，色彩克制。

避免：
避免过度霓虹、无来源光束、夸张爆炸、随机文字、悬浮建筑、透视冲突、塑料材质、过饱和青橙调色、背景尺度错误、人物像贴上去、头身比例失衡、僵硬动作和过量烟雾。`,
        image: '',
        description: '适合把人物或主体放进更完整的故事环境。'
    },
    {
        id: 'retro-minimal-concept-illustration',
        title: '复古极简概念插画',
        category: '插画艺术',
        mode: 'both',
        tags: ['重画风', '复古海报', '概念插画', '极简', '数字厚涂'],
        prompt: '将用户指定的任意主题完整重画为复古海报感的极简概念插画。主题可以是人物、动物、器物、建筑、自然、室内、事件或抽象概念；根据主题自由选择最有表现力的景别和视角，不要默认生成草原、山脉或风景。\n\n使用大块概括性形体、简化轮廓、清晰明暗分组和层叠色面重新组织画面；以数字厚涂、不透明水粉和干刷质感表现，保留手工绘制的边缘、轻微飞白和纸面颗粒。采用低饱和的有限色盘，由奶油白、雾蓝、橄榄绿、黄褐、砖红或炭黑中选择三到五种适合主题的颜色，形成温暖、克制、略带褪色印刷感的调性。\n\n用显著的尺度关系、负空间、引导线或单一强轮廓建立画面记忆点，让构图具有电影感环境概念艺术的宁静张力，但不限定场景类型。如果有参考图，保留核心主体、语义和可识别特征，但彻底重构造型、色彩、光影和绘画媒介，不做写实修图或浅层滤镜。避免照片级写实、3D 渲染、过度细碎的纹理、高饱和霓虹、无关装饰、随机文字、logo 和水印。',
        promptEn: 'Fully redraw any subject specified by the user as a minimalist concept illustration with the character of a vintage poster. The subject may be a person, animal, object, building, natural element, interior, event, or abstract idea. Choose the most expressive framing and viewpoint for that subject; do not default to grasslands, mountains, or landscape scenery.\n\nReorganize the image through broad simplified shapes, reduced silhouettes, clear value grouping, and layered color fields. Render it with digital impasto, opaque gouache, and dry-brush texture, retaining hand-painted edges, subtle scumbling, and visible paper grain. Use a muted limited palette of three to five subject-appropriate colors selected from cream, dusty blue, olive green, ochre, brick red, and charcoal, producing a warm, restrained, slightly faded printed character.\n\nCreate one memorable visual relationship through pronounced scale contrast, negative space, a leading line, or a strong singular silhouette. Give the composition the quiet tension and spatial intelligence of cinematic environment concept art without restricting the type of scene. If a reference image is provided, preserve its core subject, meaning, and recognizable attributes while thoroughly rebuilding form, palette, lighting, and painterly medium. This is a full stylistic redraw, not realistic retouching or a superficial filter. Avoid photorealism, glossy 3D rendering, excessively fine texture, saturated neon, unrelated decoration, random text, logos, and watermarks.',
        image: '',
        description: '将任意主题重画为低饱和、大色块、强构图的复古极简概念插画。'
    },
    {
        id: 'retro-flatlay-packaging-print',
        title: '复古平铺包装版画',
        category: '插画艺术',
        mode: 'both',
        tags: ['重画风', '俯拍平铺', '复古包装', '颗粒版画', 'Risograph'],
        prompt: '将用户指定的任意主题完整重画为俯拍平铺构图的复古包装设计插画。主题可以是人物、动物、植物、器物、建筑、场景、活动或抽象概念；将其转译为可从正上方阅读的图形化主视觉，不要默认生成食物、甜品、商品或塑料包装盒。\n\n采用 top-down flat lay 正俯视角，让核心主体居中或按清晰网格排列，根据主题自由设计容器、背板、包裹、抽屉、标本盒、展示盘或纯平面框架；这些结构只服务主题，不强制把主题变成商品。搭配少量复古标签形状、价格签形状、圆形徽章、线描小图标、手写记号和轻微涂鸦建立编辑排版节奏；如果用户没有提供准确文案，标签仅作为无字图形或极简符号，不生成伪文字。\n\n使用数字水粉、丝网印刷、孔版印刷与 Risograph 融合质感：概括的不透明色块、干刷边缘、明显纸纹、油墨不均、局部磨损、网点和轻微套色错位。从奶油白、雾蓝、焦糖棕、砖红、芥末黄、鼠尾草绿中选择有限低饱和色盘，营造 1980 年代日本生活杂志、商品目录和旧印刷品的温暖怀旧气质。如果有参考图，保留主体身份、语义和关键特征，但彻底重构为上述平面插画与印刷媒介，不做写实修图或浅层滤镜。避免写实商品摄影、光滑 3D 塑料感、过度立体透视、密集装饰、随机文字、logo 和水印。',
        promptEn: 'Fully redraw any subject specified by the user as a vintage packaging-design illustration in a top-down flat-lay composition. The subject may be a person, animal, plant, object, building, place, activity, or abstract idea. Translate it into a graphic key visual readable from directly above; do not default to food, desserts, consumer products, or a plastic package tray.\n\nUse a true top-down flat-lay viewpoint, placing the core subject centrally or arranging its parts on a clear grid. According to the subject, freely devise a container, backing board, wrapping, drawer, specimen case, display tray, or purely flat framing device. These structures must support the subject and must not force it to become a commercial product. Add a restrained mix of vintage label shapes, price-tag shapes, circular seals, small line icons, handwritten marks, and light doodles to establish editorial rhythm. Unless the user supplies exact copy, keep labels textless or use only minimal abstract marks rather than invented lettering.\n\nCombine digital gouache with screen print, stencil print, and risograph texture: simplified opaque color fields, dry-brush edges, visible paper grain, uneven ink, localized wear, halftone, and subtle color misregistration. Choose a limited muted palette from cream, dusty blue, caramel brown, brick red, mustard yellow, and sage green, evoking the warm nostalgia of 1980s Japanese lifestyle magazines, product catalogues, and aged print ephemera. If a reference image is supplied, preserve the subject\'s identity, meaning, and key attributes while thoroughly rebuilding it in this flat illustrative and printed medium. This is a full stylistic redraw, not realistic retouching or a superficial filter. Avoid realistic product photography, glossy 3D plastic, strong dimensional perspective, decorative clutter, random text, logos, and watermarks.',
        image: '',
        description: '将任意主题重画为正俯视平铺、复古包装编辑排版与颗粒版画质感。'
    },
    {
        id: 'japanese-retro-goods-packaging',
        title: '日系复古商品包装插画',
        category: '插画艺术',
        mode: 'both',
        tags: ['重画风', '食品插画', '商品包装', '俯拍平铺', '颗粒版画'],
        prompt: '将用户指定的食品或日常物品完整重画为日系复古商品包装插画。主题可以是甜品、烘焙、饮品、果蔬、零食、日用品、文具、玩具、工具、电子产品、服饰配件、护理用品或收藏品。如果用户没有指定具体主题，从上述食品与物品中随机选择一种有视觉趣味的具体对象，每次尽量变化品类、包装形式、配色和标签布局。\n\n使用 top-down flat lay 正俯视角和竖版海报构图，让一件主商品或一组同类商品居中、完整、尺度清楚地呈现。根据主题选择合理的零售包装：透明塑料盒、吸塑托盘、纸盒、纸袋、玻璃瓶、铁盒、标本盒、套筒、绑带或挂卡；包装必须符合内容物的形状、数量和材质，能看清内容物的关键结构。使用主标签、价格贴、圆形品质徽章、条码、线描小图标、手写记号和少量涂鸦建立丰富但有秩序的编辑层级。文字排版是画面风格的重要部分：如果用户提供准确文案，必须逐字清晰呈现，不得改写、翻译、增删或添加其他文字；如果用户没有提供文案，根据主题自动创作简短、有意义且可读的虚构包装文案，包含一个醒目的商品名称、一个副标题、两到四个短标签，以及可选的价格或日期。在没有明确文案时，画面中的所有可读文字必须只使用简洁英文；即使用户用中文描述主题，也不得自行生成中文汉字、中文标题、中文标语或中文手写字；除非用户明确要求，也不使用日文、韩文或其他语言，不做双语混排。所有英文必须拼写正确、语义相关、清晰可读，不使用真实品牌。\n\n使用数字水粉、不透明平涂、丝网印刷、孔版印刷和 Risograph 融合质感：食物或物品保持清楚可识别，但用概括色块、干刷边缘和少量手绘高光重新塑造；包装表面保留纸张颗粒、油墨不均、局部磨损、网点和轻微套色错位。从奶油白、雾蓝、焦糖棕、砖红、芥末黄、鼠尾草绿中选择四到六种有限低饱和颜色，呈现 1980 年代日本生活杂志、烘焙店标签、商品目录和旧印刷广告的温暖怀旧感。如果有参考图，保留食品或物品的种类、外形、颜色、材质和标志性结构，但彻底重构包装、构图和绘画媒介，不做写实修图或浅层滤镜。避免摄影级写实、光滑 3D 渲染、现代极简无印刷纹理的包装、与主题无关的道具、过度拥挤、密集微小文字、乱码、无意义字符、拼写错误、真实品牌、伪造 logo 和水印。',
        promptEn: 'Fully redraw a food item or everyday object specified by the user as a Japanese retro retail-packaging illustration. The subject may be a dessert, baked good, drink, fruit or vegetable, snack, household item, stationery object, toy, tool, electronic device, fashion accessory, personal-care item, or collectible. If the user provides no subject, randomly choose one visually interesting concrete item from those food and object categories, varying the category, package format, palette, and label layout between generations.\n\nUse a true top-down flat-lay viewpoint and a vertical poster composition. Present one hero item or a coherent set of matching items centrally, completely, and at a clearly readable scale. Select packaging appropriate to the subject: a transparent clamshell, blister tray, paper carton, paper bag, glass bottle, tin, specimen case, sleeve, band, or hanging card. The package must make physical sense for the contents, their quantity, shape, and material, while keeping the defining structure of the contents visible. Build a rich but orderly editorial hierarchy with a main label, price sticker, circular quality seal, barcode, small line icons, handwritten marks, and a few restrained doodles. Typography is an essential part of the style. If the user provides exact copy, render it verbatim and clearly without rewriting, translating, adding, or removing text. If no copy is provided, automatically create concise, meaningful, readable fictional package copy appropriate to the subject: one prominent product name, one subtitle, two to four short labels, and an optional price or date. When exact copy has not been provided, all readable text in the image must use simple English only. A Chinese-language subject description does not authorize Chinese packaging copy: do not independently add Chinese characters, Chinese titles, Chinese slogans, or handwritten Chinese. Do not use Japanese, Korean, any other language, or bilingual layouts unless the user explicitly requests them. Every English word must be correctly spelled, relevant, and clearly readable; do not use real brands.\n\nCombine digital gouache, opaque flat color, screen print, stencil print, and risograph texture. Keep the food or object clearly recognizable while rebuilding it with simplified color shapes, dry-brush edges, and a few hand-painted highlights. Give package surfaces visible paper grain, uneven ink, localized wear, halftone, and subtle color misregistration. Choose four to six muted colors from cream, dusty blue, caramel brown, brick red, mustard yellow, and sage green, evoking 1980s Japanese lifestyle magazines, bakery labels, product catalogues, and aged print advertising. If a reference image is supplied, preserve the item category, silhouette, color, material, and defining structure while thoroughly rebuilding its packaging, composition, and illustrated medium. This is a full stylistic redraw, not realistic retouching or a superficial filter. Avoid photographic realism, glossy 3D rendering, textureless modern-minimal packaging, unrelated props, overcrowding, dense tiny copy, gibberish, meaningless characters, misspellings, unrequested non-English text, real brands, fabricated logos, and watermarks.',
        image: '',
        description: '专门生成食品或日常物品的日系复古包装插画，自动搭配可读商品文案。'
    },
    {
        id: 'gpt-image2-edit-identity-scene',
        title: '保持身份换场景',
        category: '精准改图配方',
        mode: 'image',
        tags: ['精准改图', '身份保持', '换场景', '人物'],
        prompt: '编辑目标：保持参考图 1 中的人物身份，把人物放到【目标环境】，并呈现【目标拍摄语境或质感】。\n\n参考职责：参考图 1 只作为人物身份锚点。最终人物必须是参考图中的同一位人物，而不是外貌相似的新人物。\n\n需要改变：将环境、光线语境和拍摄质感调整为【具体变化】，让人物像在目标环境中被真实拍摄。\n\n必须保持：脸型、五官比例、眼型、鼻唇结构、肤色、年龄感、发型主体特征和自然体型。不要改变人物身份，不要过度磨皮或改成通用偶像脸。\n\n画面要求：统一人物与环境的透视、光线、色温、阴影和边缘。避免多余人物抢占主体、脸部漂移、身体变形、随机文字和水印。',
        image: '',
        description: '插入后替换【】内容；适合保留同一人物，只改变环境和拍摄语境。'
    },
    {
        id: 'gpt-image2-edit-outfit-only',
        title: '只换服装',
        category: '精准改图配方',
        mode: 'image',
        tags: ['精准改图', '换装', '身份保持', '双参考图'],
        prompt: '编辑目标：只替换参考图 1 中人物的服装。\n\n参考职责：参考图 1 提供人物身份、脸部、发型、体型、姿态、镜头和背景；参考图 2 只提供目标服装的版型、颜色、材质、纹理和配饰细节。\n\n需要改变：把参考图 2 的完整服装自然穿到参考图 1 的人物身上，服装应符合原有身体比例和姿态，并呈现合理褶皱、遮挡和受光。\n\n必须保持：参考图 1 的脸、发型、肤色、年龄感、身体比例、手部位置、姿态、构图、镜头、背景和光线。不要换脸，不要改变动作，不要重做背景。\n\n避免：混入参考图 2 的人物身份或背景，避免服装漂浮、肢体穿模、额外配饰、随机文字和水印。',
        image: '',
        description: '人物图放参考图 1，服装图放参考图 2；只替换服装。'
    },
    {
        id: 'gpt-image2-edit-background-only',
        title: '只换背景',
        category: '精准改图配方',
        mode: 'image',
        tags: ['精准改图', '换背景', '人物保持', '双参考图'],
        prompt: '编辑目标：只把参考图 1 的背景替换为参考图 2 中的【目标环境】。\n\n参考职责：参考图 1 提供人物、姿态、服装、前景物体、构图和相机位置；参考图 2 只提供空间类型、环境材料、背景陈设和氛围。\n\n需要改变：重建人物身后的环境，使其自然成为【目标环境】，并让背景透视、景深、光线方向和色温与人物一致。\n\n必须保持：人物身份、脸、发型、服装、身体比例、姿态、手部位置、前景物体、主体尺寸和原始构图。人物轮廓、头发边缘和半透明细节必须自然。\n\n避免：把参考图 2 中的人或前景物体复制进画面，避免人物被重新设计、边缘发光、明显拼贴、随机文字和水印。',
        image: '',
        description: '插入后替换【】内容；原图放参考图 1，环境图放参考图 2。'
    },
    {
        id: 'gpt-image2-edit-multi-reference',
        title: '多参考图按角色合成',
        category: '精准改图配方',
        mode: 'image',
        tags: ['精准改图', '多参考图', '人物', '服装', '背景'],
        prompt: '合成目标：生成一张【目标画面类型】，人物、服装和背景分别来自不同参考图。\n\n参考职责：参考图 1 只负责人物身份、脸部结构、发型、肤色、年龄感和自然体型；参考图 2 只负责服装版型、颜色、材质、纹理和配饰，不采用其中的人物或背景；参考图 3 只负责场景空间、环境材料、背景陈设和整体光线语境，不采用其中的人物。\n\n组合方式：让参考图 1 的同一人物自然穿着参考图 2 的服装，处于参考图 3 的环境中。统一三者的透视、人物尺度、光线方向、阴影、色温和景深，使画面像一次真实拍摄。\n\n必须保持：人物身份不能与参考图 2 或 3 混合；服装不能被随意改款；背景不能覆盖人物或改变人物姿态。\n\n避免：平均五官、换脸、复制其他人物、服装与身体穿模、明显拼贴边缘、随机文字和水印。',
        image: '',
        description: '插入后替换【】内容；按人物、服装、背景顺序放置三张参考图。'
    },
    {
        id: 'gpt-image2-edit-local-detail',
        title: '视觉遮罩局部修正',
        category: '精准改图配方',
        mode: 'image',
        tags: ['精准改图', '局部修正', '视觉遮罩', '细节'],
        prompt: '局部编辑目标：只修正【需要修正的部位或细节】，目标结果是【正确形态或效果】。\n\n参考职责：参考图 1 是原始底图；参考图 2 是黑白视觉遮罩。白色区域对应允许修改的范围，黑色区域对应必须尽量保持的画面。\n\n需要改变：只在白色区域内完成【具体修改】，并让结构、遮挡、材质、边缘和受光与原图自然一致。\n\n必须保持：遮罩外的人物身份、脸、发型、身体、服装、饰品、姿态、背景、构图、颜色和光线。不要扩大编辑范围，不要重绘整张图片。\n\n避免：【该部位常见错误】、遮罩外内容漂移、结构变形、边缘拼贴、随机文字和水印。',
        image: '',
        description: '插入后替换【】内容；用于“底图 + 黑白视觉遮罩”，不是原生 alpha mask。'
    },
    {
        id: 'gpt-image2-edit-exact-text',
        title: '准确替换图片文字',
        category: '精准改图配方',
        mode: 'image',
        tags: ['精准改图', '准确文字', '海报', '排版'],
        prompt: '编辑目标：只替换参考图 1 中的【目标文字区域】，保持原设计不变。\n\n需要显示的准确文字：\n【字段名称 1】：“【逐字填写最终文字】”\n【字段名称 2】：“【逐字填写最终文字；不需要可删除本行】”\n\n文字要求：逐字准确、清晰可读，不得改写、增删、翻译或生成拼音。新文字继续使用原文字的区域、层级、对齐方式和相近视觉重量。\n\n必须保持：原画布比例、背景图像、人物或主体、颜色、材质、装饰、留白、版式网格，以及目标区域以外的现有内容。不要重新设计整张图片。\n\n避免：乱码、错别字、额外英文、伪造 logo、重复文字、随机小字、水印，以及改变非目标文字。',
        image: '/template-previews/gpt-image2-edit-exact-text.webp',
        description: '插入后逐字填写【】内容；适合海报标题、日期和其他指定文字。'
    },
    ...gptImage2GalleryTemplates
]

const builtinTemplateEnglishPrompts: Record<string, string> = {
    'commercial-campaign': `Goal:
Create a premium commercial campaign visual for 【a modern lifestyle brand】, led by 【the core product or an adult person】 and clearly communicating 【a refined, reliable, desirable brand impression】 together with 【one primary product benefit】.

Editable Elements:
Set the subject to 【the hero product or an adult campaign model】, the location to 【a clean branded studio set】, the palette to 【neutrals with one vivid brand color】, the styling or props to 【a few objects directly related to the benefit】, and the format to 【4:5 portrait】.

Reference Handling:
If references are supplied, assign each one only to 【identity, product appearance, wardrobe, or environment】. Preserve a product's defining silhouette, structure, and materials. For a person, preserve recognizable identity rather than the original pixels. Do not paste the reference head unchanged like a sticker; rebuild a coherent head, neck, body, and pose using 【a clean new hairstyle】, 【a relaxed confident expression】, 【a slight three-quarter camera angle】, and 【an open, purposeful action】.

Visual Design:
Build a clear subject hierarchy with a 【restrained, modern, trustworthy】 direction. Use 【one purposeful prop or color field】 to reinforce the main benefit. Keep the environment supportive and spacious instead of relying on decorative clutter for a premium impression.

Camera and Composition:
Use a 【50 mm commercial-photography lens feel】 from 【an eye-level or slightly low position】. Let the subject fill 【about two thirds of the frame】 and preserve clean space in 【the upper and right areas】 for later title and logo placement. Keep perspective, edges, and proportions accurate.

Lighting and Materials:
Use 【a large soft key light with a narrow rim light】. Render skin, glass, metal, fabric, and packaging with distinct, believable responses. Shadows should be clean but dimensional, highlights controlled, and the finish comparable to an official brand campaign.

Avoid:
Avoid random text, invented logos, discount-ad aesthetics, unrelated props, excessive saturation, plastic skin, incorrect reflections, malformed fingers, stiff posture, poor head-to-body proportions, and lighting that separates the subject from the environment.`,
    'magazine-cover': `Goal:
Create a cover-level editorial portrait for 【a contemporary fashion and culture magazine】 featuring 【an adult subject】 under the theme 【calm confidence and modern presence】. The image should express a clear point of view rather than feel like a generic studio portrait.

Editable Elements:
Dress the subject in 【structured black-and-white fashion】, change the hair to 【an airy short cut or sculpted updo】, use 【a calm direct gaze】, place them against 【a solid background with subtle paper or wall texture】, use 【black, white, and cool red】, and frame it as 【4:5 portrait】.

Reference Handling:
If a portrait reference is supplied, use it to preserve 【facial identity and apparent age】, not the original hairstyle, expression, camera angle, head direction, or pose. Do not paste the reference head unchanged like a sticker. Rebuild the head, neck, and body coherently around 【new hair and makeup】, 【a new gaze direction】, and 【a new shoulder and neck posture】.

Visual Design:
Unify styling, makeup, and background around 【restrained avant-garde editorial design】. Create one memorable accent through 【a strong silhouette or a single accessory】. Retain real skin texture with polished but controlled retouching suitable for print.

Camera and Composition:
Use an 【85 mm portrait-lens feel】 with 【a bust or half-body crop】. Place the subject slightly toward 【the left side】 with the eyes near the upper third. Leave room in 【the top, right side, and lower area】 for masthead, cover lines, and barcode, but generate no text in the image.

Lighting and Materials:
Use 【a soft frontal key with one harder shaped side light】 to define facial structure, individual hair strands, fabric texture, and accessory edges. Maintain separation from the background, accurate color, and delicate highlights.

Avoid:
Avoid magazine names, cover lines, barcodes, watermarks, random letters, passport-photo symmetry, plastic skin, excessive smoothing, stiff shoulders, an unchanged reference hairstyle, identity drift, pasted head-to-body transitions, and unnatural eyes.`,
    'poster-key-visual': `Goal:
Create a professional poster key visual for 【an urban creative festival or product launch】. Use 【a central adult figure or iconic object】 to communicate 【connection, momentum, and a forward-looking idea】 with immediate visual recognition.

Editable Elements:
Set the hero to 【an adult person or signature product】, the action to 【moving forward while interacting with the space】, the environment to 【an abstracted city exhibition venue】, the visual motif to 【repeating geometric frames and one bright color ribbon】, the palette to 【charcoal, ivory, and fluorescent green】, and the format to 【2:3 portrait】.

Reference Handling:
Assign supplied references separately to 【identity, product structure, brand color, or spatial mood】 instead of averaging them together. For a person, preserve recognizable identity rather than the original head pixels. Do not paste the reference head unchanged like a sticker; reconstruct the full person using 【a directional new hairstyle】, 【a focused new expression】, 【a three-quarter side view】, and 【a dynamic but natural action】.

Visual Design:
Build hierarchy with 【one dominant focal point, two supporting graphic layers, and clear negative space】. Every motif should support the event concept rather than act as filler. The visual must be impactful while remaining practical for later typography.

Camera and Composition:
Use a 【35 mm wide-angle feel without obvious distortion】. Place the subject in 【the lower-left central area】 and build depth across foreground, middle ground, and background. Reserve 【roughly the top quarter and the lower-right corner】 for title, date, and venue information without generating text.

Lighting and Materials:
Use 【high-contrast side light with believable environmental bounce】. Make skin, product surfaces, metal frames, translucent panels, and ground shadows respond consistently. Keep color bold but controlled and edges suitable for a design-team key visual.

Avoid:
Avoid random text, invented logos, meaningless symbol piles, decoration covering the hero, conflicting perspective, excessive neon, cheap glow effects, stiff figures, poor head-to-body proportions, pasted reference heads, and busy detail inside the reserved information areas.`,
    'beauty-editorial': `Goal:
Create a high-end beauty editorial centered on 【luminous makeup for an adult subject】, showcasing 【precise eye makeup, natural lip color, and healthy skin texture】 at a level suitable for a beauty magazine or premium campaign.

Editable Elements:
Set the makeup concept to 【cool pearl luminosity】, the hairstyle to 【wet-look pulled-back hair that reveals the face】, the expression to 【relaxed strength with a slight side glance】, the background to 【a soft gray-pink studio gradient】, the accent prop to 【minimal clear acrylic or water droplets】, and the format to 【4:5 portrait】.

Reference Handling:
If a portrait reference is supplied, use it only to maintain 【the same identity, skin tone, and apparent age】 while allowing a new hairstyle, makeup, expression, gaze, and face angle. Do not paste the reference head unchanged like a sticker. Reconstruct facial perspective, ears, hairline, neck, shoulders, and body connection around 【a new three-quarter face angle】.

Visual Design:
Create a clear three-level focus across 【eye luminosity, lip color, and skin texture】. Accessories and background should remain supporting elements. Preserve pores, fine facial hair, and natural tonal variation while applying refined, restrained commercial retouching.

Camera and Composition:
Use a 【100 mm macro-portrait lens feel】 with 【a face-to-shoulder close-up】. Focus on 【the eye closest to camera】 and let the far side fall naturally into shallow depth of field. Crop cleanly without cutting through the chin, lips, or key makeup details.

Lighting and Materials:
Use 【a large front-side softbox, gentle lower fill, and a narrow rim light】. Differentiate skin, lip gloss, eye shadow, hair, and transparent props accurately. Highlights should be dewy rather than oily, with natural skin color.

Avoid:
Avoid plastic skin, excessive smoothing, clumped lashes, mismatched eye sizes, distorted teeth or lips, greasy highlights, blocky hair, an unchanged reference hairstyle, pasted reference heads, random text, brand logos, and watermarks.`,
    'kpop-studio-concept': `Goal:
Create an official comeback studio concept photo for 【an adult K-pop solo artist】 under the concept 【futuristic minimalism and controlled strength】. It should feel like the lead visual from a complete campaign, not an ordinary portrait session.

Editable Elements:
Use 【a clean high ponytail with a few loose strands】, 【muted cool eye makeup and a natural lip】, 【a structured silver-gray performance outfit with full public-facing coverage】, 【a restrained confident expression】, 【mirrored metal frames and translucent light panels】, and a 【4:5 portrait format】.

Reference Handling:
If a portrait reference is supplied, treat it as 【the identity reference for the same adult person】. Preserve face shape and core facial relationships while clearly allowing new hair, makeup, expression, head angle, pose, and wardrobe. Do not paste the reference head unchanged like a sticker. Rebuild coordinated head, neck, shoulders, torso, and limbs around 【a slightly raised three-quarter head angle】 and 【a standing pose with the shoulders turning toward camera】.

Visual Design:
Unify hair, makeup, wardrobe, accessories, set pieces, and color around 【cool silver with deep red futuristic stage energy】. Use 【one asymmetrical metal earring】 as the memorable accent. Keep the styling polished and recognizable without decorative overload.

Camera and Composition:
Use a 【70 mm studio-portrait lens feel】 with 【a knee-up composition】 from 【slightly below eye level】. Place the subject toward 【the right side】 and preserve clean space in the upper left for release copy. The pose should carry tension while keeping natural joints and believable weight.

Lighting and Materials:
Use 【a hard upper-side key, soft frontal fill, and red edge light】. Clearly render skin, hair strands, metal, fabric, and translucent panels. Retain natural skin texture and plausible garment folds with crisp but controlled detail.

Avoid:
Avoid random text, real group logos, watermarks, lingerie-like or revealing wardrobe, generic idol faces, an unchanged reference hairstyle, pasted reference heads, frozen expressions, malformed hands or feet, poor head-to-body proportions, mannequin-like bodies, and set pieces crossing through the subject.`,
    'mv-concept-still': `Goal:
Create a cinematic key frame from 【a high-budget K-pop music video】 in which 【an adult artist】 experiences 【one final look back before leaving】 inside 【an empty subway station just after midnight rain】.

Editable Elements:
Use 【a wet reflective last-train platform】, 【medium-length hair moving gently in the air】, 【a dark long coat over a simple performance outfit】, 【a sudden look back while walking quickly, breathing hard but alert】, 【teal ambient light with warm orange signal lamps】, and a 【16:9 landscape frame】.

Reference Handling:
If a portrait reference is supplied, use it only to maintain 【the same adult identity and apparent age】, not the original frontal angle, static expression, hairstyle silhouette, or studio pose. Do not paste the reference head unchanged like a sticker. Rebuild facial perspective, moving hair, neck and shoulder rotation, and full-body balance for 【a rear-side angle captured during the turn】.

Visual Design:
Let 【a departing train door, reflections on the floor, and the subject's glance】 tell one legible story beat. Environmental detail should support the moment without explaining it literally. The result should look like an authentic MV frame, not a posed poster.

Camera and Composition:
Use a 【40 mm cinema-lens feel】 from 【a slightly low handheld tracking position】. Place the subject on 【the right third】, with 【a softly blurred platform column】 in the foreground, the subject in the middle ground, and the train and vanishing lines behind. Keep mild motion blur while preserving a recognizable face.

Lighting and Materials:
Use 【cool overhead fluorescent ambience】 with 【warm train-interior light】 shaping the face and coat edge. Render wet flooring, metal, glass, and fabric with believable reflections. Preserve detail in shadows and cinematic color separation.

Avoid:
Avoid subtitles, lyrics, broadcast marks, watermarks, random text, excessive smoke, cheap neon, a face lost in darkness, an unchanged reference hairstyle, pasted reference heads, stiff movement, twisted necks or shoulders, duplicated limbs, and obvious posing.`,
    'album-photobook': `Goal:
Create a photobook page for 【a K-pop album about late-summer memories】, showing 【an adult artist pausing during a quiet journey】 with natural intimacy and complete editorial polish.

Editable Elements:
Set the location to 【a seaside motel walkway at dusk】, the hairstyle to 【a loose low ponytail】, the makeup to 【clear muted natural makeup】, the wardrobe to 【an oversized pale-blue shirt with white trousers】, the action to 【leaning on the railing, looking away, then turning slightly back】, the prop to 【a vintage film camera】, and the format to 【3:4 portrait】.

Reference Handling:
If a portrait reference is supplied, use it to confirm 【the same adult identity, skin tone, and apparent age】 while allowing the campaign to redesign hair, makeup, expression, viewpoint, action, and wardrobe. Do not paste the reference head unchanged like a sticker. Rebuild hairline, ear, jaw, neck, shoulders, torso, and limbs coherently for 【a natural turning side angle】.

Visual Design:
Unify the concept through 【faded blue, warm white, and sunset orange】. Let the architecture, sea breeze, clothing, and film camera reinforce the theme of travel memory. Keep believable signs of everyday life without unrelated clutter.

Camera and Composition:
Use a 【55 mm film-portrait lens feel】 with 【a thigh-up crop】. Place the subject toward 【the left side】 while the walkway lines lead toward the distant sea. Preserve 【clean space toward the facing page】 so the image can pair naturally in a spread.

Lighting and Materials:
Use 【sunset side-backlight with soft bounce from the walkway wall】. Render skin, cotton, aged plaster, metal railing, and the film camera realistically. Add restrained fine grain and gentle highlights while keeping natural skin color.

Avoid:
Avoid text, barcodes, logos, watermarks, heavy filters, plastic skin, cluttered props, an unchanged reference hairstyle, pasted reference heads, stiff standing poses, poor body proportions, malformed fingers, and overly polished commercial-ad styling.`,
    'photocard-portrait': 'Create a K-pop photocard collectible portrait. Use a close-up headshot or half-body composition with a natural friendly expression, refined makeup and hair, clear face, and a simple atmospheric background. It can feel like a backstage selfie, fansign selfie, or official photocard shoot. Do not add text, signatures, borders, or random graphics. The image should crop well into a vertical photocard.',
    'artist-profile-photo': 'Create an official artist profile photo. Use a simple clean background, front-facing or slight three-quarter pose, and clear face, hair, makeup, and upper-body styling. Lighting should be soft and even. The result should feel like an agency profile page, promotional material, or official avatar. Avoid excessive beauty filters and do not generate text, nameplates, logos, or watermarks.',
    'comeback-teaser-poster': `Goal:
Create a comeback teaser poster for 【an adult K-pop artist's new album】 based on the concept 【divided identity and reawakening】. The image should be polished, readable, and deliberately mysterious.

Editable Elements:
Use 【asymmetric wet-look short hair】, 【cool metallic eye makeup with a natural lip】, 【a structured black long coat with full public-facing coverage】, 【a dark studio divided by a cracked mirror】, 【one white flower and a red thread】, 【black, silver, and deep red】, and a 【4:5 portrait format】.

Reference Handling:
If a portrait reference is supplied, preserve only 【the same adult identity, facial structure, and apparent age】 while allowing substantial changes to hair, makeup, expression, camera angle, action, and wardrobe. Do not paste the reference head unchanged like a sticker. Reconstruct facial perspective, head and neck rotation, shoulder line, and full-body pose for 【a body facing the mirror while the face turns toward camera】.

Visual Design:
Build three layers from 【the real subject, a partial mirror reflection, and the red thread】, with every element supporting the divided-identity concept. The reflection should carry narrative meaning and must not create unrelated duplicate people. The result should feel like an official teaser rather than a standard fashion portrait.

Camera and Composition:
Use a 【65 mm portrait-lens feel】 with 【a knee-up vertical composition】. Place the subject 【low and slightly right】 while mirror cracks guide attention to the face. Reserve 【roughly the top fifth and the lower-left area】 for later title, date, and album information without generating text.

Lighting and Materials:
Use 【a narrow hard key, reflected mirror fill, and a deep-red rim light】. Render skin, wet hair, black fabric, cracked glass, and petals accurately. Keep dimensional shadows, crisp contours, and rich color without clipping highlights.

Avoid:
Avoid random text, dates, real logos, watermarks, revealing or lingerie-like wardrobe, duplicate mirror faces, meaningless broken glass, an unchanged reference hairstyle, pasted reference heads, stiff posing, poor head-to-body proportions, malformed hands, and cheap horror-film effects.`,
    'luxury-product-still': `Goal:
Create a luxury still-life campaign photograph for 【a premium fragrance or jewelry object】 expressing 【rare materials, restrained craft, and quiet strength】 at a quality suitable for a magazine spread or brand window display.

Editable Elements:
Use 【a clear glass fragrance bottle with a metal cap】, 【a dark polished stone surface】, 【one frosted-glass panel and a single white flower】, 【a muted warm-gray background】, 【smoke gray, ivory, and a small champagne-gold accent】, and a 【4:5 portrait format】.

Reference Handling:
If a product reference is supplied, use it as the authority for 【shape, proportion, material, and real label placement】. Keep the design recognizable while recalculating perspective, reflections, and occlusion for 【a new display angle】. Material or scene references may contribute only their assigned qualities and must not redesign the product or invent unreadable labels.

Visual Design:
Build a restrained hierarchy from 【the hero product, one supporting material, and a field of negative space】. The product must remain the only visual center. Use few props with meaningful material contrast, leaving space for later brand layout rather than signaling luxury through decoration.

Camera and Composition:
Use a 【90 mm still-life lens feel】 from 【a slightly elevated three-quarter angle】. Place the product 【low and left of center】 while keeping it vertically stable. Preserve clean space in 【the upper and right areas】 and enough depth of field for the label zone and defining edges.

Lighting and Materials:
Use 【a large strip softbox, a narrow rim light, and black flags for reflection control】. Accurately show glass thickness, liquid refraction, brushed metal, stone texture, and petal softness. Keep shadows consistent and highlights long, clean, and controlled.

Avoid:
Avoid random text, incorrect labels, invented logos, distorted product structure, floating caps, plastic-looking glass, clipped metal highlights, visible studio equipment in reflections, excessive props, too much gold, cheap glitter, and implausible contact shadows.`,
    'editorial-fashion-fullbody': 'Create a full-body fashion editorial image. Body proportions should be natural, with clear outfit silhouette, fabric texture, and styling layers. The pose should be confident but not stiff. Use a simple designed background and lighting that feels like a professional studio or editorial location shoot. Suitable for lookbooks, magazine pages, or brand styling images.',
    'phone-selfie-natural': 'Create a natural phone front-camera selfie. The subject looks at the camera with a slightly casual handheld composition, realistic skin texture, natural expression, and mild phone-lens distortion. Lighting should feel like indoor window light or street-side natural light. Avoid studio lighting, excessive smoothing, and commercial campaign polish. The image should feel like a real social media snapshot.',
    'korean-ootd-mirror': 'Create a Korean OOTD mirror selfie. The subject stands in front of a full-length mirror, holding a phone that may cover part of the face or sit naturally near the chest. The outfit should be clean, layered, and stylish, with relaxed posture. The background can be an apartment entryway, dressing room, cafe restroom, or clean street-store facade. Preserve vertical phone composition, reflections, natural light, and everyday realism.',
    'idol-backstage-selfie': 'Create a K-pop idol backstage selfie style image. The subject appears to be taking a phone selfie in a music-show backstage room, makeup room, or practice studio. Makeup and hair are refined but expression is natural; the outfit has stage-styling energy. The background may include soft vanity lights, clothing racks, blurred staff, or practice-room mirrors, but should not be messy. The image should feel like an official social media update, not a movie still or commercial ad.',
    'fancam-cover': 'Create a K-pop fancam video cover image. The subject is on stage at a crisp highlight moment, with eye contact that grabs attention and movement frozen at a memorable frame. Use a performance-appropriate stage outfit with full torso coverage. Avoid lingerie styling, chest cutouts, plunging necklines, exposed midriff, and body-emphasizing poses. Stage lighting, LED background, and shallow depth of field should be visible, while the face and outfit details remain clear. The composition should work as a vertical or square cover. Do not add text or watermarks.',
    'airport-preview': 'Create a Korean entertainment airport preview image. The subject wears everyday but styled airport fashion and walks naturally near an airport entrance, terminal corridor, or van. The image should feel like a telephoto media shot or fansite preview, with crowds, luggage, flashes, and slight motion blur in the background. Keep a realistic candid feel, not a red-carpet or studio-shoot look.',
    'after-work-preview': 'Create an idol after-work preview image. The subject is leaving a TV station, practice room, or event venue in private clothes or partial stage styling, with a van, staff, fans, and flashes nearby. Use night telephoto candid photography, slight noise, background blur, and authentic media-photo texture. The subject should be clear and atmospheric, but not look like a formal photoshoot.',
    'korean-cafe-snapshot': 'Create a Korean cafe daily snapshot. The subject sits near a window, counter, or small round table, with a relaxed phone-snapshot feeling. Use soft light and background details such as coffee cups, desserts, glass windows, street view, or clean interior design. Keep it clean, natural, and social-media friendly. Avoid heavy filters and overly commercial styling.',
    'street-paparazzi': 'Create a street media candid photograph. The subject walks naturally or glances back, captured from a distance with a telephoto lens. The background includes city streets, cars, pedestrians, and slight compression. Expression and posture should not feel overly posed. Outfit details should be clear. The result should feel like real street photography or a news image, with a little grain, motion, and environmental imperfection.',
    'figure-collectible': 'Transform the reference character into a collectible desktop figure. Place the figure on a clean computer desk with a transparent round acrylic base. Add a premium toy packaging box nearby, using artwork inspired by the reference character. The background can include a screen showing a modeling process. Preserve the character identity, outfit colors, hairstyle, accessories, and proportions. Do not generate unreadable text on the base or packaging.',
    'product-hero': `Goal:
Create a clear, credible, brand-ready product hero image for 【a modern consumer electronics product】 emphasizing 【thin construction, precise materials, and ease of use】 for an ecommerce header or product-launch page.

Editable Elements:
Set the product to 【wireless earbuds with their charging case】, the display state to 【the lid open with both earbuds suspended just above their correct slots】, the background to 【a bright soft-gray studio】, the brand-color accent to 【restrained coral red】, the supporting element to 【one soft light trace suggesting connection】, and the format to 【16:9 landscape】.

Reference Handling:
If a product reference is supplied, strictly preserve 【real shape, proportions, buttons, ports, seams, materials, and color】 while changing only display arrangement, camera angle, background, and lighting. If a scene reference is also supplied, extract only 【spatial mood and palette】 without importing other products, text, or logos.

Visual Design:
Create three clear levels: 【the hero product, the functional relationship, and negative space】. The product should be understood first and 【open-case wireless connection】 second. Keep the background simple but intentional, and use the brand accent only to guide attention.

Camera and Composition:
Use a 【70 mm product-photography lens feel】 from 【a slightly elevated three-quarter view】. Place the product group in 【the center-right area】 and reserve 【roughly the left third】 for title and benefits. Keep component spacing plausible, perspective consistent, and every product part fully inside the frame.

Lighting and Materials:
Use 【large overhead soft light, gentle frontal fill, and a narrow edge light】. Accurately render matte plastic, metal contacts, translucent indicators, and contact shadows. Preserve clear contours on a light-colored product without overexposing the background.

Avoid:
Avoid random text, invented logos, extra buttons, incorrect port counts, mismatched left and right earbuds, weightless floating parts, changed product proportions, cheap plastic texture, excessive mirror reflections, unnecessary props, cluttered backgrounds, and inconsistent shadows.`,
    'cinematic-environment': `Goal:
Create an environmental narrative frame from 【a grounded science-fiction film】: 【an adult traveler】 at 【a mountainside transit station just after heavy rain】 notices 【the final cable car lighting up again in the distance】. The result should feel like a real high-budget film scene rather than a concept-art collage.

Editable Elements:
Use 【an adult traveler in a dark rain shell】, 【a concrete transit station built into a steep hillside】, 【night just after blue hour】, 【post-rain mist】, 【the cable-car lights returning】, 【cool gray, wet teal, and small tungsten-yellow accents】, and a 【2.39:1 widescreen frame】.

Reference Handling:
Assign supplied images separately: a person reference provides 【identity and basic appearance】, an environment reference provides 【architecture, terrain, and climate】, and a wardrobe reference provides 【garment design and material】. Keep the identity recognizable while rebuilding hair, expression, head, neck, and body for 【a figure facing away and turning slightly back】. All references must obey one perspective and lighting system.

Visual Design:
Create three narrative layers using 【puddles and a nearby railing】 in the foreground, 【the traveler and waiting platform】 in the middle ground, and 【the cable car with layered hillside lights】 in the background. Let environmental detail establish location, weather, and event without explanatory text.

Camera and Composition:
Use a 【32 mm cinema-lens feel】 from 【a slightly low position behind the subject】. Place the traveler on 【the lower-left third】 while station lines lead toward the cable car in the upper right. Preserve believable architecture scale, human proportion, spatial depth, and subtle natural lens character.

Lighting and Materials:
Base the scene on 【overcast blue ambient light】 and use 【platform fixtures plus warm cable-car light】 as the narrative focus. Render concrete, wet metal, glass, puddles, mist, and rain-resistant fabric believably. Keep shadow detail and restrained cinematic color.

Avoid:
Avoid excessive neon, unmotivated light beams, explosions, random text, floating architecture, conflicting perspective, plastic materials, oversaturated teal-orange grading, incorrect background scale, pasted-on people, poor head-to-body proportions, stiff action, and excessive fog.`,
    'gpt-image2-edit-identity-scene': 'Editing goal: preserve the identity of the person in reference image 1 while placing that same person in [target environment] with [target photographic context or visual treatment]. Reference roles: use reference image 1 only as the identity anchor; the final person must be the exact same person, not a similar-looking replacement. Change the environment, lighting context, and capture style according to [specific changes]. Must preserve face shape, facial proportions, eyes, nose and lip structure, skin tone, apparent age, defining hairstyle, and natural body type. Unify perspective, light direction, color temperature, shadows, and edges. Avoid identity drift, generic beauty retouching, body deformation, extra prominent people, random text, and watermarks.',
    'gpt-image2-edit-outfit-only': 'Editing goal: replace only the clothing worn by the person in reference image 1. Reference roles: reference image 1 supplies identity, face, hair, body type, pose, camera, lighting, and background; reference image 2 supplies only the target garment silhouette, color, material, texture, and accessory details. Fit the complete outfit naturally to the original body and pose with plausible folds, occlusion, and lighting. Must preserve the face, hair, skin tone, apparent age, body proportions, hand positions, pose, composition, camera, background, and lighting from reference image 1. Do not borrow the person or background from reference image 2. Avoid floating garments, body intersections, extra accessories, random text, and watermarks.',
    'gpt-image2-edit-background-only': 'Editing goal: replace only the background of reference image 1 with the [target environment] shown by reference image 2. Reference roles: reference image 1 supplies the person, pose, clothing, foreground objects, composition, and camera position; reference image 2 supplies only the space, materials, background furnishings, and atmosphere. Rebuild the environment behind the subject and match perspective, depth of field, light direction, and color temperature. Must preserve identity, face, hair, clothing, body proportions, pose, hand positions, foreground objects, subject scale, and original framing. Keep hair edges and translucent details natural. Avoid copying people or foreground objects from reference image 2, redesigning the subject, glowing edges, collage artifacts, random text, and watermarks.',
    'gpt-image2-edit-multi-reference': 'Composition goal: create a [target image type] in which person, clothing, and environment come from separate references. Reference roles: reference image 1 supplies only identity, facial structure, hair, skin tone, apparent age, and natural body type; reference image 2 supplies only garment silhouette, color, material, texture, and accessories, not its person or background; reference image 3 supplies only the location, environmental materials, furnishings, and lighting context, not its people. Place the exact person from image 1 naturally in the outfit from image 2 and environment from image 3. Unify perspective, subject scale, lighting, shadows, color temperature, and depth of field. Must preserve identity, garment design, and pose. Avoid blended identities, face replacement, copied bystanders, body intersections, collage edges, random text, and watermarks.',
    'gpt-image2-edit-local-detail': 'Local editing goal: change only [part or detail to repair] so that it has [correct structure or intended result]. Reference roles: reference image 1 is the original image; reference image 2 is a black-and-white visual mask. The white area marks the allowed edit region, while the black area marks content that must remain as unchanged as possible. Make only [specific correction] inside the white area and match the original structure, occlusion, material, edges, and lighting. Must preserve identity, face, hair, body, clothing, accessories, pose, background, composition, color, lighting, and everything outside the mask. Do not expand the edit area or redraw the full image. Avoid [common errors for this detail], changes outside the mask, deformation, pasted edges, random text, and watermarks.',
    'gpt-image2-edit-exact-text': 'Editing goal: replace only [target text area] in reference image 1 while keeping the original design unchanged. Exact text to display: [field 1]: "[enter final text exactly]"; [field 2]: "[enter final text exactly, or remove this field]". Render every character exactly as provided, clearly and legibly, without rewriting, adding, deleting, translating, or transliterating it. Keep each replacement in the original text region with the same hierarchy, alignment, and similar visual weight. Must preserve the canvas ratio, background image, people or subject, colors, materials, decoration, negative space, layout grid, and all content outside the target text areas. Do not redesign the whole image. Avoid garbled text, spelling errors, extra English, fake logos, duplicated text, random small text, watermarks, and changes to non-target text.'
}

for (const template of styleTemplates) {
    template.image = completedTemplatePreviewById[template.id] || template.image
    template.promptEn = template.promptEn || builtinTemplateEnglishPrompts[template.id]
}
