import type { StyleTemplate } from '../types'

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
        prompt: '生成一张高级商业广告大片。主体有明确品牌感，构图干净有冲击力，布光精准，材质细节和轮廓清晰。背景应服务主体，可保留适当留白用于后期添加标题或 logo。整体像现代消费品牌的正式 campaign visual，不要杂乱，不要随机文字。',
        image: '',
        description: '适合品牌宣传、活动视觉和高级广告图。'
    },
    {
        id: 'magazine-cover',
        title: '杂志封面大片',
        category: '商业视觉',
        mode: 'both',
        tags: ['杂志', '封面', '编辑'],
        prompt: '生成一张杂志封面风格大片。主体位于强视觉中心，姿态和眼神有记忆点，背景干净但有质感，画面上方或侧边保留标题排版空间。使用编辑摄影风格、精致造型、自然但高级的修图，不添加任何真实文字或水印。',
        image: '',
        description: '适合人物封面、时尚大片和社媒封面。'
    },
    {
        id: 'poster-key-visual',
        title: '海报主视觉',
        category: '商业视觉',
        mode: 'both',
        tags: ['海报', '主视觉', '活动'],
        prompt: '生成一张活动海报主视觉。主体清楚、有强识别度，画面层次分明，光影和色彩能制造视觉冲击。构图需要适合后期排版，保留标题区和信息区，但不要直接生成文字。整体应像专业设计团队产出的 key visual。',
        image: '',
        description: '适合活动 KV、宣传海报和封面主图。'
    },
    {
        id: 'beauty-editorial',
        title: '美妆编辑大片',
        category: '人像时尚',
        mode: 'both',
        tags: ['美妆', '人像', '棚拍'],
        prompt: '生成一张美妆编辑大片。脸部和妆容细节清晰，皮肤真实但精致，光线柔和可控，背景干净。重点表现眼妆、唇妆、发丝和面部轮廓，避免塑料皮肤和过度磨皮。整体像高端美妆杂志或品牌视觉。',
        image: '',
        description: '适合美妆、头像、人像特写和妆容参考。'
    },
    {
        id: 'kpop-studio-concept',
        title: 'K-pop 棚拍概念照',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['棚拍', '概念照', '回归'],
        prompt: '生成一张 K-pop 回归棚拍概念照。人物造型、妆发、服装和背景需要围绕同一个视觉主题展开，像官方 teaser image 或 concept photo。使用专业棚拍布光，脸部、发丝、服装材质和配饰清楚，姿态有记忆点但不过度摆拍。画面保留适当留白，不添加文字、水印或真实 logo。',
        image: '',
        description: '适合回归预告、概念视觉和官方社媒物料。'
    },
    {
        id: 'mv-concept-still',
        title: '概念 MV 剧照',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['MV', '概念', '剧照'],
        prompt: '生成一张概念 MV 剧照感图片。画面像音乐视频中的关键静帧，有明确场景、主题色彩和叙事氛围。人物处于自然动作或凝视瞬间，妆发和服装完整，光影有戏剧性但主体脸部清楚。整体应有 K-pop MV 视觉质感，不要生成字幕、歌词、电视台台标或水印。',
        image: '',
        description: '适合 MV 截帧、概念故事和视觉叙事。'
    },
    {
        id: 'album-photobook',
        title: '专辑内页写真',
        category: 'K-pop 物料',
        mode: 'both',
        tags: ['专辑', '内页', '写真'],
        prompt: '生成一张 K-pop 专辑 photobook 内页写真。人物造型完整，妆容、发型、服装和配饰有统一企划感。构图像专辑写真内页，画面干净、有编辑摄影质感，可以保留环境或道具但不要杂乱。皮肤真实精致，身体比例自然，不添加任何文字或条形码。',
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
        prompt: '生成一张 K-pop comeback teaser poster 主视觉。人物和场景有强主题感，构图适合后期添加标题、日期和专辑信息，但画面中不要直接生成文字。妆发、服装、道具和光线要服务同一个概念，整体像官方预告海报或社媒 teaser image，精致、清晰、有悬念。',
        image: '',
        description: '适合回归预告、活动视觉和概念海报。'
    },
    {
        id: 'luxury-product-still',
        title: '奢侈品静物',
        category: '商业视觉',
        mode: 'both',
        tags: ['产品', '静物', '高级'],
        prompt: '生成一张奢侈品静物摄影。主体放置在精致台面或极简布景中，材质反射、阴影、边缘和纹理都要真实。光线克制，色彩低饱和，画面有高级留白。适合香水、首饰、包袋、电子产品或包装盒。',
        image: '',
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
        image: '',
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
        prompt: '生成一张 K-pop 直拍视频封面感图片。主体在舞台上处于清晰的高光瞬间，眼神有抓取感，动作停在最有记忆点的一帧。舞台灯光、LED 背景和浅景深要明显，但主体脸部和服装细节保持清楚。构图适合竖版或方形封面，不添加文字，不生成水印。',
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
        prompt: '生成一张高级产品主视觉。主体清晰居中，背景干净，光线精准，阴影和反射真实可控。画面需要给标题或版式留出适当空间，材质边缘清楚，颜色克制，不要杂乱。最终效果像现代消费品牌的电商主图或活动视觉。',
        image: '',
        description: '适合商品、设备、包装或任意主体。'
    },
    {
        id: 'cinematic-environment',
        title: '电影级环境氛围',
        category: '叙事场景',
        mode: 'both',
        tags: ['电影感', '环境', '光影'],
        prompt: '生成一张电影剧照感环境图。主体明确，前景、中景、背景有层次，光影有叙事感但不要过度夸张。环境需要真实可信，材质和透视准确，颜色不要过饱和。画面像高预算电影里的一个静帧。',
        image: '',
        description: '适合把人物或主体放进更完整的故事环境。'
    }
]

const builtinTemplateEnglishPrompts: Record<string, string> = {
    'commercial-campaign': 'Create a premium commercial advertising campaign image. The subject should have a clear brand presence, a clean and impactful composition, precise lighting, and crisp material details and edges. The background should support the subject, with appropriate negative space for adding a title or logo later. The overall result should feel like an official campaign visual from a modern consumer brand. Avoid clutter and random text.',
    'magazine-cover': 'Create a magazine-cover editorial image. Place the subject in a strong visual center with memorable posture and eye contact. Keep the background clean but textured, leaving space near the top or side for cover typography. Use editorial photography, refined styling, and natural but polished retouching. Do not add real text or watermarks.',
    'poster-key-visual': 'Create a campaign poster key visual. The subject should be clear, recognizable, and visually strong, with layered composition, impactful lighting, and color. The layout should work for later typography, leaving title and information areas, but do not generate text directly. The result should look like a professional design-team key visual.',
    'beauty-editorial': 'Create a beauty editorial image. Facial and makeup details should be clear, with realistic but refined skin, soft controlled lighting, and a clean background. Emphasize eye makeup, lip color, hair strands, and facial contours. Avoid plastic skin and excessive smoothing. The result should feel like a high-end beauty magazine or brand visual.',
    'kpop-studio-concept': 'Create a K-pop comeback studio concept photo. Styling, makeup, hair, clothing, and background should follow one unified visual theme, like an official teaser image or concept photo. Use professional studio lighting with clear facial details, hair, fabric texture, and accessories. The pose should be memorable but not overly staged. Leave some clean space and do not add text, watermarks, or real logos.',
    'mv-concept-still': 'Create a concept music-video still. The image should feel like a key frame from an MV, with a clear setting, theme color, and narrative atmosphere. The subject should be in a natural movement or gaze moment, with complete styling, makeup, hair, and outfit. Lighting can be dramatic but the face must remain clear. Keep a K-pop MV visual quality. Do not generate subtitles, lyrics, broadcast logos, or watermarks.',
    'album-photobook': 'Create a K-pop album photobook page image. The subject should have complete styling, unified makeup, hair, outfit, and accessories. The composition should feel like an album photobook spread: clean, editorial, and polished, with environment or props only when they support the concept. Keep realistic refined skin and natural body proportions. Do not add text or barcodes.',
    'photocard-portrait': 'Create a K-pop photocard collectible portrait. Use a close-up headshot or half-body composition with a natural friendly expression, refined makeup and hair, clear face, and a simple atmospheric background. It can feel like a backstage selfie, fansign selfie, or official photocard shoot. Do not add text, signatures, borders, or random graphics. The image should crop well into a vertical photocard.',
    'artist-profile-photo': 'Create an official artist profile photo. Use a simple clean background, front-facing or slight three-quarter pose, and clear face, hair, makeup, and upper-body styling. Lighting should be soft and even. The result should feel like an agency profile page, promotional material, or official avatar. Avoid excessive beauty filters and do not generate text, nameplates, logos, or watermarks.',
    'comeback-teaser-poster': 'Create a K-pop comeback teaser poster key visual. The subject and scene should have a strong theme. The composition should leave room for adding title, date, and album information later, but do not generate any text in the image. Makeup, hair, outfit, props, and lighting should all support one concept. The result should feel like an official teaser poster or social teaser image: polished, clear, and suspenseful.',
    'luxury-product-still': 'Create a luxury product still-life photograph. Place the subject on a refined surface or minimalist set. Reflections, shadows, edges, and textures should be realistic. Use restrained lighting, low-saturation color, and premium negative space. Suitable for perfume, jewelry, bags, electronics, packaging, or similar products.',
    'editorial-fashion-fullbody': 'Create a full-body fashion editorial image. Body proportions should be natural, with clear outfit silhouette, fabric texture, and styling layers. The pose should be confident but not stiff. Use a simple designed background and lighting that feels like a professional studio or editorial location shoot. Suitable for lookbooks, magazine pages, or brand styling images.',
    'phone-selfie-natural': 'Create a natural phone front-camera selfie. The subject looks at the camera with a slightly casual handheld composition, realistic skin texture, natural expression, and mild phone-lens distortion. Lighting should feel like indoor window light or street-side natural light. Avoid studio lighting, excessive smoothing, and commercial campaign polish. The image should feel like a real social media snapshot.',
    'korean-ootd-mirror': 'Create a Korean OOTD mirror selfie. The subject stands in front of a full-length mirror, holding a phone that may cover part of the face or sit naturally near the chest. The outfit should be clean, layered, and stylish, with relaxed posture. The background can be an apartment entryway, dressing room, cafe restroom, or clean street-store facade. Preserve vertical phone composition, reflections, natural light, and everyday realism.',
    'idol-backstage-selfie': 'Create a K-pop idol backstage selfie style image. The subject appears to be taking a phone selfie in a music-show backstage room, makeup room, or practice studio. Makeup and hair are refined but expression is natural; the outfit has stage-styling energy. The background may include soft vanity lights, clothing racks, blurred staff, or practice-room mirrors, but should not be messy. The image should feel like an official social media update, not a movie still or commercial ad.',
    'fancam-cover': 'Create a K-pop fancam video cover image. The subject is on stage at a crisp highlight moment, with eye contact that grabs attention and movement frozen at a memorable frame. Stage lighting, LED background, and shallow depth of field should be visible, while the face and outfit details remain clear. The composition should work as a vertical or square cover. Do not add text or watermarks.',
    'airport-preview': 'Create a Korean entertainment airport preview image. The subject wears everyday but styled airport fashion and walks naturally near an airport entrance, terminal corridor, or van. The image should feel like a telephoto media shot or fansite preview, with crowds, luggage, flashes, and slight motion blur in the background. Keep a realistic candid feel, not a red-carpet or studio-shoot look.',
    'after-work-preview': 'Create an idol after-work preview image. The subject is leaving a TV station, practice room, or event venue in private clothes or partial stage styling, with a van, staff, fans, and flashes nearby. Use night telephoto candid photography, slight noise, background blur, and authentic media-photo texture. The subject should be clear and atmospheric, but not look like a formal photoshoot.',
    'korean-cafe-snapshot': 'Create a Korean cafe daily snapshot. The subject sits near a window, counter, or small round table, with a relaxed phone-snapshot feeling. Use soft light and background details such as coffee cups, desserts, glass windows, street view, or clean interior design. Keep it clean, natural, and social-media friendly. Avoid heavy filters and overly commercial styling.',
    'street-paparazzi': 'Create a street media candid photograph. The subject walks naturally or glances back, captured from a distance with a telephoto lens. The background includes city streets, cars, pedestrians, and slight compression. Expression and posture should not feel overly posed. Outfit details should be clear. The result should feel like real street photography or a news image, with a little grain, motion, and environmental imperfection.',
    'figure-collectible': 'Transform the reference character into a collectible desktop figure. Place the figure on a clean computer desk with a transparent round acrylic base. Add a premium toy packaging box nearby, using artwork inspired by the reference character. The background can include a screen showing a modeling process. Preserve the character identity, outfit colors, hairstyle, accessories, and proportions. Do not generate unreadable text on the base or packaging.',
    'product-hero': 'Create a premium product hero visual. The subject should be clear and centered, with a clean background, precise lighting, and controlled shadows and reflections. The image should leave appropriate room for titles or layout design. Material edges should be crisp, colors restrained, and the scene uncluttered. The final result should feel like a modern consumer-brand ecommerce hero image or campaign visual.',
    'cinematic-environment': 'Create a cinematic environmental scene. The subject should be clear, with layered foreground, midground, and background. Lighting should feel narrative but not exaggerated. The environment must be believable, with accurate materials and perspective, and colors should not be oversaturated. The image should feel like a still frame from a high-budget film.'
}

for (const template of styleTemplates) {
    template.promptEn = template.promptEn || builtinTemplateEnglishPrompts[template.id]
}
