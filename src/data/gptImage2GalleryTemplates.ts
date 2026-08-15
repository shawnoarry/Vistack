import type { StyleTemplate } from '../types'

export const GPT_IMAGE2_GALLERY_SOURCE = {
    repository: 'https://github.com/wuyoscar/GPT-Image2-Skill',
    commit: '068dd9e24aadc8731e46f38548ca4dcd94515d35',
    license: 'MIT'
} as const

interface GalleryTemplateRecord {
    number: number
    sourceFile: string
    sourceImage: string
    template: Omit<StyleTemplate, 'image' | 'mode'>
}

const galleryTemplateRecords: GalleryTemplateRecord[] = [
    {
        number: 33,
        sourceFile: 'gallery-typography-and-posters.md',
        sourceImage: 'docs/typography-posters/tea-poster.png',
        template: {
            id: 'gallery-chinese-tea-launch-poster',
            title: '山川茶事新品海报',
            category: '海报排版',
            tags: ['新品海报', '中文排版', '茶饮', '信息层级'],
            description: '新中式茶饮新品发布海报，包含完整价格、活动与风味信息。',
            prompt: `设计一张 3:4 竖版中国潮流茶饮新品海报。采用轻奢、克制的新中式视觉风格，配色为深绿色、米白色和金色，结合宣纸纹理、优雅留白、山水元素和现代版式设计。

主体是一杯具有吸引力的冷泡茶，周围有茶叶、西柚、冰块和少量金箔点缀。

海报必须准确显示以下中文文案：
“山川茶事” / “山柚观音” / “冷泡系列” / “新品上市”
“一口清醒，半城入夏” / “限定尝鲜价”
“中杯 16 元” / “大杯 19 元”
“门店活动” / “第二杯半价” / “加 3 元升级轻乳版” / “每日前 100 名赠限定杯套”
“推荐风味” / “观音茶底 / 西柚果香 / 轻乳云顶 / 冰感回甘”
“活动时间 4月20日 至 5月10日” / “扫码点单” / “SHANCHUAN TEA”

小字：“图片仅供参考，请以门店实际售卖为准”

保持清楚的促销信息层级，同时让整体显得高级，而不是廉价或过度电商化。特别注意小字、数字、价格、信息模块和中文排版美感。`,
            promptEn: `Design a 3:4 vertical poster for a new Chinese trendy tea launch. Use a New Chinese visual style that feels light-luxury and restrained. The palette should be dark green, off-white, and gold, with rice-paper texture, elegant negative space, landscape accents, and modern layout design.

Main subject:
a visually appealing cold-brew tea with tea leaves, citrus, ice cubes, and touches of gold foil.

The poster must accurately display the following exact Chinese copy:
"山川茶事" / "山柚观音" / "冷泡系列" / "新品上市"
"一口清醒，半城入夏" / "限定尝鲜价"
"中杯 16 元" / "大杯 19 元"
"门店活动" / "第二杯半价" / "加 3 元升级轻乳版" / "每日前 100 名赠限定杯套"
"推荐风味" / "观音茶底 / 西柚果香 / 轻乳云顶 / 冰感回甘"
"活动时间 4月20日 至 5月10日" / "扫码点单" / "SHANCHUAN TEA"

Fine print: "图片仅供参考，请以门店实际售卖为准"

Maintain a clear promotional hierarchy while keeping the overall feeling sophisticated rather than cheap or overly e-commerce-like. Pay special attention to small text, numbers, prices, info modules, and Chinese typography aesthetics.`
        }
    },
    {
        number: 35,
        sourceFile: 'gallery-typography-and-posters.md',
        sourceImage: 'docs/typography-posters/saul-bass-poster.png',
        template: {
            id: 'gallery-minimalist-thriller-poster',
            title: '极简悬疑电影海报',
            category: '海报排版',
            tags: ['电影海报', '剪纸几何', '复古', '准确文字'],
            description: '奶油纸张、红黑几何和负形错觉构成的复古悬疑海报。',
            prompt: `创作一张 Saul Bass 风格的极简悬疑电影海报，3:4 竖版。使用带有细微复古颗粒的米白色纸张背景、大块平面剪纸形状、醒目的几何构图和负形错觉。

构图：画面中央只有一个深红色的风格化奔跑人物剪影；人物的影子扭曲成一把向上指向标题的刀刃。画面下三分之一有黑色墨刷飞溅，左上方留白中出现一个黄色眼睛图案。

准确文字：
- 黑色大型手写衬线标题：“THE LAST HEIR”
- 深红色小型大写无衬线副标题：“EVERY FAMILY KEEPS A SECRET. HIS WILL BURY THEM ALL.”
- 底部演职员信息：“PRODUCERS JANE NORRIS  LEWIS HAHN    DIRECTED BY MAYA ALVAREZ    A CINERA RELEASE    IN CINEMAS OCTOBER 31”

配色为奶油色、炭黑、深红和芥末黄点缀。纯平面图形设计，不使用摄影元素、渐变或 3D，延续经典剪纸几何悬疑片头与海报的视觉谱系。`,
            promptEn: `A Saul-Bass-style minimalist thriller movie poster, 3:4 portrait. Off-white paper background with subtle vintage grain. Large flat-color cut-paper shapes, bold geometry, negative-space illusion.

Composition: a single stylised human silhouette in crimson running across centre; the shadow warps into a knife blade pointing up into the title. Black ink-brush splatter across the lower third. A single yellow eye motif in the upper-left negative space.

Exact typography:
- Title (large hand-lettered serif, black): "THE LAST HEIR"
- Tagline (small caps sans-serif, dark red): "EVERY FAMILY KEEPS A SECRET. HIS WILL BURY THEM ALL."
- Bottom credit block: "PRODUCERS JANE NORRIS  LEWIS HAHN    DIRECTED BY MAYA ALVAREZ    A CINERA RELEASE    IN CINEMAS OCTOBER 31"

Palette: cream, charcoal black, crimson red, mustard-yellow accent. Pure flat graphic design, no photo elements, no gradients, no 3D — in the lineage of Bass's "Anatomy of a Murder", "Vertigo", and "The Man with the Golden Arm".`
        }
    },
    {
        number: 36,
        sourceFile: 'gallery-typography-and-posters.md',
        sourceImage: 'docs/typography-posters/vogue-cover.png',
        template: {
            id: 'gallery-fashion-magazine-cover',
            title: '高级时尚杂志封面',
            category: '海报排版',
            tags: ['杂志封面', '时尚人像', '编辑摄影', '准确文字'],
            description: '完整刊头、封面标题与条码信息的高端时尚杂志封面。',
            prompt: `创作一张 3:4 竖版高级时尚杂志封面，采用巴黎与英国顶级时尚杂志的编辑美学。

人物：一位身材高挑、深棕肤色、约三十五岁的女性模特，以四分之三角度站立并直视镜头。她穿雕塑感高领象牙白羊毛大衣，内搭深茄紫色真丝吊带裙，佩戴极简银色螺旋耳环。头发梳成利落低发髻，仅有一缕发丝自然垂落；妆容为哑光暖铜色皮肤与光泽梅子色唇妆。

背景：低饱和混凝土灰无缝背景纸，左上方投下一束冷调日光，使用浅景深。

封面文字必须为清晰、拼写正确的英文：
- 大型白色全大写衬线刊头：“VOGUE”
- 左上角小型日期栏：“NOVEMBER 2026 · PARIS EDITION · €9.00”
- 居中的粗体无衬线主标题：“THE QUIET POWER ISSUE”
- 右侧纵向排列：“THE NEW MINIMALISTS — a 40-page portfolio” / “HOW AI TOOLS ARE REWRITING THE ATELIER” / “MARTIN MARGIELA'S UNREVEALED ARCHIVE” / “SKIN · INVESTMENT · WHERE THE MONEY GOES NEXT”
- 左下角条码与编号：“VG1126”

灯光为经典时尚编辑摄影：柔和单一主光、轻微补光、一侧脸部保留深阴影，并带细腻胶片颗粒。`,
            promptEn: `A high-fashion magazine cover, 3:4 portrait, Vogue Paris / British Vogue editorial aesthetic.

Subject: a tall female model, medium-dark skin tone, mid-thirties, standing three-quarters to camera, direct piercing gaze. She wears a sculptural high-collared ivory wool coat over a silk slip dress in deep aubergine. Minimalist silver spiral earrings. Hair in a sleek low chignon with a single escaped strand. Makeup: matte bronze-warm, glossy plum lip.

Background: muted concrete-grey seamless paper backdrop, vertical shaft of cool daylight from upper left. Shallow depth of field.

Exact cover typography (all English, crisp, correctly spelled):
- Masthead, huge uppercase serif, white: "VOGUE"
- Date strip top-left, tiny caps: "NOVEMBER 2026 · PARIS EDITION · €9.00"
- Main cover line, bold sans-serif centered: "THE QUIET POWER ISSUE"
- Right-edge cover lines, stacked:
   "THE NEW MINIMALISTS — a 40-page portfolio"
   "HOW AI TOOLS ARE REWRITING THE ATELIER"
   "MARTIN MARGIELA'S UNREVEALED ARCHIVE"
   "SKIN · INVESTMENT · WHERE THE MONEY GOES NEXT"
- Bottom-left barcode with catalog code "VG1126"

Lighting: classic fashion editorial — soft single-source key, subtle fill, deep shadow on one cheek, fine film grain.`
        }
    },
    {
        number: 37,
        sourceFile: 'gallery-typography-and-posters.md',
        sourceImage: 'docs/typography-posters/pulp-scifi-cover.png',
        template: {
            id: 'gallery-retro-pulp-scifi-cover',
            title: '复古科幻通俗杂志封面',
            category: '海报排版',
            tags: ['科幻封面', '1950年代', '手绘', '准确文字'],
            description: '火箭、外星荒漠与怪物构成的 1950 年代手绘通俗杂志封面。',
            prompt: `创作一张 1950 年代复古科幻通俗杂志封面，3:4 竖版。使用经典科幻杂志的美学：水粉手绘插画、泛黄纸张纹理、略微错位的套色印刷和边缘浅棕色旧化。

封面插画：一艘银色铬金属火箭正在降落到红色荒漠外星球，紫色天空中有两颗带环卫星。左前景站着一位穿深红色增压服、佩戴球形玻璃头盔的 1950 年代宇航员，手持射线枪，面对一只从地裂中出现的多触手半透明绿色生物。

准确文字：
- 顶部巨大黄色复古展示衬线刊头：“ASTOUNDING STORIES”
- 刊头下方红色卷期栏：“VOL. XXXVII · NO. 5 · MARCH 1957 · 25¢”
- 左下角粗体红色故事标题：“THE MEN FROM RIGEL — a novelette by E. A. KLEIN”

表现可见的水粉笔触，使用金丝雀黄、橙、红、电光紫和银色的饱和通俗杂志配色，配合手写标题、粗糙纸纹与角落轻微霉斑。`,
            promptEn: `A vintage sci-fi pulp magazine cover from the 1950s, 3:4 portrait. Classic "Astounding Science Fiction" / "Galaxy" aesthetic — painted gouache illustration with pulp-yellow paper texture, screen-printing registration slightly off, pale browned paper tone around edges.

Cover illustration: a chrome-silver rocket ship descending toward an alien red-desert planet with two Saturn-like ringed moons in a violet sky. A lone astronaut in a bulbous 1950s-style glass-dome space helmet stands foreground-left in a crimson pressurised suit, holding a ray-gun, facing a many-tentacled translucent green creature emerging from a fissure.

Exact typography:
- Masthead, huge yellow retro display serif arched across the top: "ASTOUNDING STORIES"
- Volume banner, red, under masthead: "VOL. XXXVII · NO. 5 · MARCH 1957 · 25¢"
- Featured story callout, bold red sans-serif bottom-left: "THE MEN FROM RIGEL — a novelette by E. A. KLEIN"

Art direction: painted gouache with visible brush strokes, saturated pulp palette (canary yellow, orange, red, electric violet, chrome silver), hand-lettered headlines, slightly rough paper texture, faint foxing on corners.`
        }
    },
    {
        number: 27,
        sourceFile: 'gallery-cinematic-and-animation.md',
        sourceImage: 'docs/cinematic-animation/noir-detective.png',
        template: {
            id: 'gallery-1940s-film-noir-still',
            title: '1940 年代黑色电影剧照',
            category: '电影画面',
            tags: ['黑色电影', '黑白', '雨夜', '电影剧照'],
            description: '雨夜街角、侦探与明暗对照构成的经典黑色电影镜头。',
            prompt: `创作一张 1940 年代黑色电影风格的黑白电影剧照，16:9 横版，高反差，模拟 35mm 胶片并保留明显颗粒。

场景：凌晨两点，一名穿风衣、戴软呢帽的侦探独自站在被雨水浸透的街角，手里夹着香烟，烟雾向上盘旋。湿润鹅卵石反射一盏嗡鸣的路灯。砖墙上有一块“HOTEL”霓虹招牌，但字母 L 已熄灭，只显示“HOTE_”。路边停着一辆 1946 年复古轿车，尾灯穿过细雨发光。

灯光：经典明暗对照，右上方只有一盏硬主光，人物身后墙面出现百叶窗投影。保持深黑、银色高光以及从纯白到纯黑的完整灰阶，不出现任何色彩。画面应像从经典黑色电影中截取的真实镜头。`,
            promptEn: `A 1940s film-noir black-and-white movie still, landscape 16:9, high contrast. Shot on 35mm with visible grain.

Scene: a detective in trench coat and fedora stands alone at a rain-soaked street corner at 2 a.m., cigarette in hand, smoke curling upward. Wet cobblestones reflecting a single buzzing street lamp. A "HOTEL" neon sign on brick facade with letters "HOTE_" (the L flickered out). A vintage 1946 sedan parked at the curb, tail-lights glowing through drizzle.

Lighting: classic chiaroscuro — single hard key light above right, venetian-blind shadows on the wall behind him. Deep blacks, silvered highlights, full tonal range from pure white to pure black. No colour. Frame should feel lifted from "The Maltese Falcon", "Double Indemnity", or "The Third Man".`
        }
    },
    {
        number: 28,
        sourceFile: 'gallery-cinematic-and-animation.md',
        sourceImage: 'docs/cinematic-animation/storyboard.png',
        template: {
            id: 'gallery-six-panel-film-storyboard',
            title: '六格电影分镜',
            category: '电影画面',
            tags: ['分镜', '电影制作', '镜头设计', '多格'],
            description: '包含镜头说明、运动标记和动作连续性的六格专业电影分镜。',
            prompt: `制作一张整体为 16:9 横版的六格电影分镜，使用 3×2 网格。每格都是带白色边框的铅笔与马克笔草图，下方附一条小型信息栏。

场景是一场穿过雨中东京巷道、最终以屋顶跳跃结束的追逐：
第 1 格，广角建立镜头：湿润霓虹巷道，奔跑者从左侧进入；信息为“PANEL 1 · EXT. ALLEY · NIGHT · WIDE / static / 2s”。
第 2 格，越肩跟拍：从后方看到奔跑者，追逐者剪影在十米外；信息为“PANEL 2 · OTS TRACKING / follow-cam / pan-L 45° / 3s”。
第 3 格，脸部特写：汗水、急促目光转向消防梯；信息为“PANEL 3 · CU RUNNER / static / 1.5s / SFX: breath”。
第 4 格，低角度：奔跑者跃上消防梯，雨线清楚；信息为“PANEL 4 · LOW ANGLE / tilt-up 30° / 2s”。
第 5 格，空中广角：奔跑者以霓虹天际线为背景准备跃过屋顶；信息为“PANEL 5 · WIDE AERIAL / crane-down / 4s”。
第 6 格，匹配剪辑：靴子落在湿屋顶并溅起水花；信息为“PANEL 6 · MATCH CUT CU / static / 1s / SFX: splash”。

采用经典动画学院分镜风格：铅笔线稿、灰色马克笔明暗，并在第 2、5 格使用红铅笔箭头标记摄影机运动和动作轨迹，背景为米白色纸张纹理。`,
            promptEn: `A 6-panel film storyboard laid out as a 3×2 grid, landscape 16:9 overall. Each panel is a rectangular pencil-and-marker sketch with a white margin border and a small information strip underneath.

Scene: a chase through a rainy Tokyo alleyway, ending in a rooftop jump.

Panel 1 — WIDE establishing: wet neon alleyway, runner entering from left; kanji signage on both walls. Info: "PANEL 1 · EXT. ALLEY · NIGHT · WIDE / static / 2s"
Panel 2 — OTS tracking: runner mid-stride from behind; pursuer silhouette 10 m back. Info: "PANEL 2 · OTS TRACKING / follow-cam / pan-L 45° / 3s"
Panel 3 — Close-up: runner's face, sweat, eyes darting up toward fire escape. Info: "PANEL 3 · CU RUNNER / static / 1.5s / SFX: breath"
Panel 4 — Low angle: runner leaping onto fire-escape ladder; rain streaks. Info: "PANEL 4 · LOW ANGLE / tilt-up 30° / 2s"
Panel 5 — Wide aerial: runner silhouetted against neon skyline, about to leap rooftops. Info: "PANEL 5 · WIDE AERIAL / crane-down / 4s"
Panel 6 — Match cut: runner's boots landing on wet rooftop; splash. Info: "PANEL 6 · MATCH CUT CU / static / 1s / SFX: splash"

Art direction: classic animation-school storyboard — pencil line-work, grey marker shading, red-pencil arrow annotations on panels 2 and 5 (camera move and action arc). Off-white paper texture background.`
        }
    },
    {
        number: 147,
        sourceFile: 'gallery-cinematic-film-references.md',
        sourceImage: 'docs/cinematic-film-references/anderson-symmetric-pastel-hotel.png',
        template: {
            id: 'gallery-symmetric-pastel-conservatory',
            title: '对称粉彩温室电影场景',
            category: '电影画面',
            tags: ['对称构图', '粉彩', '温室', '电影感'],
            description: '玩偶屋般严格对称、粉彩配色且充满奇趣细节的电影场景。',
            prompt: `创作一个严格对称的广角电影画面，延续奇趣、精密布置的粉彩电影美学。场景是一座种满异域植物、散布粉色火烈鸟的大型玻璃温室，正中央摆放一张位置完全居中的黄色天鹅绒沙发。严格使用千禧粉、开心果绿和芥末黄配色。

画面中的每个元素都经过精密排列，采用平直正面的玩偶屋式透视。光线柔和均匀，没有强烈阴影，呈现超现实绘画质感。画面中心站着一位穿薰衣草色门童制服的男性，完全静止地握着一枝红玫瑰。使用复古宽银幕电影摄影质感，图像清晰细腻并带轻微怀旧暖意。整体氛围古怪、迷人、高度受控，突出强迫式秩序之美。`,
            promptEn: `A perfectly symmetrical, wide-angle cinematic shot in the lineage of Wes Anderson's whimsical aesthetic. The scene is a grand glass conservatory filled with exotic plants and pink flamingos, centered on a perfectly placed yellow velvet sofa. The color palette is a strict pastel scheme of 'Millennial Pink', 'Pistachio Green', and 'Mustard Yellow'. Every element in the frame is meticulously arranged, with a flat, front-on perspective that feels like a dollhouse. The lighting is soft and even, with no harsh shadows, giving the scene a surreal, painterly quality. In the center of the frame, a man in a lavender bellhop uniform stands perfectly still, holding a single red rose. The camera is a vintage Panavision, capturing a crisp, detailed image with a slight, nostalgic warmth. The mood is quirky, charming, and highly controlled, emphasizing the beauty of obsessive organization.`
        }
    },
    {
        number: 151,
        sourceFile: 'gallery-cinematic-film-references.md',
        sourceImage: 'docs/cinematic-film-references/blade-runner-neo-noir-orange.png',
        template: {
            id: 'gallery-neo-noir-orange-fog',
            title: '橙色迷雾新黑色电影',
            category: '电影画面',
            tags: ['新黑色电影', '科幻城市', '橙色迷雾', '宽银幕'],
            description: '橙色毒雾、废墟城市与蓝色悬浮车构成的末世宽银幕场景。',
            prompt: `创作一个新黑色科幻电影风格的宽幅镜头：一座未来城市被浓厚、有毒的橙色放射性迷雾吞没，残破古代雕像和锯齿状摩天楼的轮廓在雾中若隐若现。一辆带蓝色推进器灯光的孤独悬浮车穿过橙色昏暗环境，形成强烈色彩对比。

光线压抑而漫射，看不到太阳，只有持续诡异的橙色辉光压平建筑细节。使用琥珀橙与钴蓝双色调，低角度仰视具有压迫感的城市结构。模拟 35mm 变形宽银幕镜头和轻微镜头光晕。整体气氛末世、孤独且壮观，重点表现雾的密度和废墟尺度。`,
            promptEn: `A cinematic wide shot in the lineage of Blade Runner 2049, depicting a futuristic city buried in a thick, toxic orange radioactive fog. The silhouettes of crumbling, ancient statues and jagged skyscrapers are barely visible through the haze. A lone hover-vehicle with blue thruster lights cuts through the orange gloom, creating a sharp color contrast. The lighting is oppressive and diffused, with no visible sun, only a constant, eerie orange glow that flattens all features. The color palette is a striking 'Amber and Cobalt' duo-tone. The composition is low-angle, looking up at the oppressive structures of the city. The camera uses a 35mm anamorphic lens, creating a cinematic wide aspect ratio and subtle lens flares. The mood is apocalyptic, lonely, and visually stunning in its desolation, focusing on the atmospheric density and the scale of the ruins.`
        }
    },
    {
        number: 129,
        sourceFile: 'gallery-fashion-editorial.md',
        sourceImage: 'docs/fashion-editorial/streetwear-tokyo-lookbook.png',
        template: {
            id: 'gallery-shibuya-streetwear-lookbook',
            title: '涩谷夜间街头穿搭',
            category: '时尚编辑',
            tags: ['街头穿搭', '涩谷', '霓虹', '全身'],
            description: '雨后涩谷路口、机能羽绒服与霓虹散景组成的竖版型录摄影。',
            prompt: `拍摄一张全身时尚型录照片：黄昏时分，一名模特站在雨水打湿的涩谷十字路口中央。模特穿电光钴蓝色超大多口袋机能羽绒服，带反光银色细节，下搭哑光黑色阔腿工装裤和厚底运动鞋。

使用 35mm 镜头的清晰中广角构图，背景霓虹招牌虚化成粉色和青色柔和散景。灯光来自周围数字广告牌，方向明确、反差强烈，突出外套材质。画面节奏都市而快速，带 Portra 400 式细微胶片颗粒。使用适合时尚杂志的干净竖版布局，角落以极简无衬线字体轻微压印“NEO-URBAN”，不要出现品牌 logo。`,
            promptEn: `Full-body lookbook photography of a model standing in the center of a rain-slicked Shibuya crossing at twilight. The model wears an oversized, multi-pocketed technical puffer jacket in 'Electric Cobalt' with reflective silver detailing, paired with wide-leg cargo trousers in matte black and chunky platform sneakers. The composition is a sharp medium-wide shot using a 35mm lens, capturing the vibrant neon signs of the background blurred into a soft bokeh of pinks and cyans. Lighting is dramatic and directional, sourced from the surrounding digital billboards, creating high-contrast highlights on the jacket's texture. The mood is urban and fast-paced, with a subtle film grain characteristic of Portra 400. The image features a clean vertical layout suitable for a fashion magazine, with the text 'NEO-URBAN' subtly embossed in the corner in a minimalist sans-serif font. No brand logos are visible.`
        }
    },
    {
        number: 130,
        sourceFile: 'gallery-fashion-editorial.md',
        sourceImage: 'docs/fashion-editorial/haute-couture-sculptural-runway.png',
        template: {
            id: 'gallery-haute-couture-runway',
            title: '前卫高级定制秀场',
            category: '时尚编辑',
            tags: ['高级定制', '秀场', '建筑空间', '雕塑服装'],
            description: '粗野主义混凝土教堂中的雕塑感高级定制秀场摄影。',
            prompt: `拍摄一张高角度高级定制秀场编辑照片，秀场位于粗野主义混凝土教堂内部。模特身穿雕塑感礼服，褶皱虹彩欧根纱像液态水银一样流动。配色以香槟金和阴影灰为主。

使用一束强烈顶光制造锐利戏剧阴影，强调服装的建筑体积。模特采用极简空灵妆容，眉部点缀银箔。使用 50mm 定焦镜头和较深景深，同时呈现布料精细纹理与背景冰冷宏大的混凝土空间。气氛庄严、艺术化且具有高级时装感，突出纺织品与空间的交汇。`,
            promptEn: `High-angle editorial photograph of a haute couture runway show set within a brutalist concrete cathedral. The model is draped in a sculptural gown made of pleated iridescent organza that mimics the fluid movement of liquid mercury. The color palette is dominated by 'Champagne Gold' and 'Shadow Grey'. Lighting is a single, powerful overhead spotlight that creates sharp, dramatic shadows and emphasizes the architectural volume of the garment. The model has a minimalist, ethereal makeup look with silver leaf accents on the brow. The camera uses a 50mm prime lens with a deep depth of field to capture both the intricate texture of the fabric and the cold, vast scale of the concrete architecture in the background. The atmosphere is solemn, artistic, and high-fashion, focusing on the intersection of textile and space.`
        }
    },
    {
        number: 131,
        sourceFile: 'gallery-fashion-editorial.md',
        sourceImage: 'docs/fashion-editorial/y2k-revival-cyber-pop.png',
        template: {
            id: 'gallery-y2k-cyber-pop-editorial',
            title: 'Y2K 赛博流行棚拍',
            category: '时尚编辑',
            tags: ['Y2K', '赛博流行', '棚拍', '鱼眼'],
            description: '高光地面、霓虹色和鱼眼畸变组成的千禧年流行时尚棚拍。',
            prompt: `创作一张鲜艳的 Y2K 时尚编辑棚拍。摄影棚使用高光白色地面和弧形薰衣草色背景。模特穿带蝴蝶图案的赛博粉丝绒运动套装，佩戴半透明彩色墨镜，使用冰蓝色眼影。

灯光明亮而有泡泡般的轻盈感，使用环形灯在眼睛中形成圆形高光，并呈现早期 2000 年代音乐录像式柔亮皮肤。采用近距离鱼眼镜头，俏皮地拉伸比例。颜色为高饱和霓虹绿、亮粉和冰蓝。模特周围漂浮低多边形 3D 爱心与塑料质感星星，顶部用厚实的 3D 铬金属泡泡字体写“GLOSS”。整体怀旧、塑料感强、超数字化。`,
            promptEn: `A vibrant Y2K-inspired fashion editorial shot in a studio with a high-gloss white floor and a curved lavender backdrop. The model is styled in a 'Cyber-Pink' velour tracksuit with butterfly motifs, tinted translucent sunglasses, and frosted blue eyeshadow. The lighting is bright and 'bubbly,' using ring lights to create circular catchlights in the eyes and a soft, glowy skin texture reminiscent of early 2000s music videos. The composition is a close-up fish-eye lens shot, distorting the proportions for a playful, energetic effect. Colors are saturated neon greens, hot pinks, and icy blues. Floating around the model are low-poly 3D heart shapes and plastic-textured stars. The text 'GLOSS' is written in a chunky, 3D chrome bubble font across the top. The overall aesthetic is nostalgic, plastic, and hyper-digital.`
        }
    },
    {
        number: 132,
        sourceFile: 'gallery-fashion-editorial.md',
        sourceImage: 'docs/fashion-editorial/old-money-equestrian-estate.png',
        template: {
            id: 'gallery-old-money-equestrian-estate',
            title: '老钱风马术庄园',
            category: '时尚编辑',
            tags: ['静奢', '庄园', '马术', '黄金时刻'],
            description: '英国乡间庄园、经典服装与黄金时刻构成的静奢编辑摄影。',
            prompt: `在黄金时刻的英国大型乡间庄园拍摄静奢时尚编辑照片。一名模特优雅地坐在石墙上，穿剪裁合体的驼色羊绒大衣、带传统纹样的真丝颈巾和深棕色皮革马靴。背景中，一辆深绿色复古敞篷车停在石灰岩与常春藤覆盖的马厩附近。

光线温暖而漫射，在修整整齐的草坪上投下柔长阴影。配色成熟克制：森林绿、浓郁棕褐、奶油色和桃花心木色。模拟中画幅 Hasselblad 的浓郁奶油质感，清楚表现羊毛和皮革细节。氛围强调永恒优雅、家族传承与宁静乡村生活，不出现现代 logo 或干扰元素。`,
            promptEn: `Quiet luxury editorial photography set on a sprawling English country estate during the golden hour. A model sits gracefully on a stone wall, dressed in a tailored 'Camel' cashmere coat, a silk neck scarf with a heritage print, and dark brown leather riding boots. In the background, a vintage dark green convertible is parked near a stable of limestone and ivy. The lighting is warm and diffused, casting long, soft shadows across the manicured lawn. The color palette is earthy and sophisticated: forest green, rich tan, cream, and mahogany. The camera is a medium-format Hasselblad, producing a rich, creamy texture and incredibly fine detail in the wool and leather. The mood is one of timeless elegance, inherited wealth, and serene countryside life. There are no modern logos or distracting elements; the focus is on quality and tradition.`
        }
    },
    {
        number: 47,
        sourceFile: 'gallery-illustration.md',
        sourceImage: 'docs/illustration/papercut-forest-market.png',
        template: {
            id: 'gallery-papercut-forest-night-market',
            title: '纸雕森林夜市',
            category: '插画艺术',
            tags: ['纸雕', '森林夜市', '童书', '叙事细节'],
            description: '巨型蘑菇下充满摊位故事和手工纸张层次的温暖夜市插画。',
            prompt: `创作一张横版分层纸雕风格编辑插画：一座微型森林夜市隐藏在巨大的蘑菇和蕨叶下。加入售卖橡果蛋糕的暖灯摊位、甲虫出租车、狐狸书法家、獾茶商、撑叶子雨伞的孩子，以及组成柔和点状小径的萤火虫。

风格锚点是中世纪儿童读物插画与当代分层纸艺立体场景的结合，清楚表现剪纸边缘、层与层之间的柔和阴影，并使用低饱和苔藓绿、南瓜橙、奶油色和墨蓝配色。第一眼看到温暖发光的市场剪影，第二眼发现许多摊主小故事，第三眼看到手工纸纹、小招牌与动物动作。不使用照片写实、塑料 3D 感或拥挤难辨的人脸。`,
            promptEn: `Create a landscape editorial illustration in layered paper-cut style: a tiny forest night market hidden beneath giant mushrooms and fern leaves. Include warm lantern stalls selling acorn cakes, beetle taxis, a fox calligrapher, a badger tea vendor, children holding leaf umbrellas, and fireflies forming soft dotted paths. Style anchor: mid-century children’s book illustration meets contemporary layered paper diorama, visible cut-paper edges, soft shadows between layers, muted moss green, pumpkin orange, cream, and ink-blue palette. First glance: a cozy glowing market silhouette. Second glance: many small vendor stories. Third glance: handmade paper texture, tiny signage, and playful animal gestures. No photorealism, no 3D plastic look, no cluttered unreadable faces.`
        }
    },
    {
        number: 49,
        sourceFile: 'gallery-watercolor.md',
        sourceImage: 'docs/watercolor/rainy-botanical-greenhouse.png',
        template: {
            id: 'gallery-rainy-greenhouse-watercolor',
            title: '雨中植物温室水彩',
            category: '插画艺术',
            tags: ['水彩', '植物温室', '雨天', '纸张纹理'],
            description: '透明水彩、雨滴玻璃和清晨银光构成的轻盈植物温室。',
            prompt: `创作一幅清晨雨中植物温室的精致水彩插画，采用横版构图、透明罩染、颗粒颜料、柔和湿画法晕染，并保留冷压水彩纸纹理。

场景包括拱形玻璃温室骨架、沿玻璃流下的雨滴、垂吊蕨类、兰花、陶盆、狭窄石径、一张放着打开园艺笔记本的木长椅，以及漫射银色日光。配色使用鼠尾草绿、桉树灰、淡薰衣草紫、暖陶土色和少量黄色花朵点缀。保持画面轻盈诗意，保留纸张白色高光，不使用生硬数字渐变、照片镜头效果或厚重轮廓线。`,
            promptEn: `Create a delicate watercolor illustration of a rainy botanical greenhouse in early morning. Landscape composition, transparent washes, granulating pigments, soft wet-on-wet blooms, visible cold-pressed paper texture. Scene: arched glass greenhouse ribs, raindrops streaming down panes, hanging ferns, orchids, clay pots, a narrow stone path, a wooden bench with an open gardening notebook, and diffused silver daylight. Palette: sage green, eucalyptus gray, pale lavender, warm terracotta, and tiny yellow flower accents. Keep the image airy and poetic, with preserved white paper highlights, no hard digital gradients, no photorealistic lens effects, and no heavy outlines.`
        }
    },
    {
        number: 51,
        sourceFile: 'gallery-ink-and-chinese.md',
        sourceImage: 'docs/ink-chinese/song-night-market-scroll.png',
        template: {
            id: 'gallery-song-night-market-scroll',
            title: '宋代夜市长卷',
            category: '插画艺术',
            tags: ['水墨长卷', '宋代', '夜市', '工笔建筑'],
            description: '工笔建筑与写意水墨结合的宋代河岸夜市连续长卷。',
            prompt: `创作一幅横向中国水墨长卷，描绘宋代河岸夜市。以工笔级建筑细节结合松动写意的水墨氛围：拱形石桥、灯笼船、茶楼阳台、书摊、面汤蒸汽、灯下读书的文人、追逐纸兔灯的孩子，以及消失在雾中的远处城墙。

加入小而清晰的毛笔店招：“茶”“书”“面”“灯市”。配色为黑墨、暖灯赭色、低饱和朱砂印章和淡蓝灰月光。构图应像连续展开的手卷，以有节奏的人群组团和水面留白连接场景。避免现代物件、动漫脸、杂乱伪书法和过度饱和的海报灯光。`,
            promptEn: `Create a horizontal Chinese ink-and-wash handscroll scene of a Song dynasty riverside night market. Use gongbi-level architectural detail combined with loose ink atmosphere: arched stone bridge, lantern boats, teahouse balconies, book stalls, noodle steam, scholars reading under lamps, children chasing paper rabbits, and distant city walls fading into mist. Add small readable Chinese shop signs in brush style: "茶", "书", "面", "灯市". Palette: black ink, warm lantern ochre, muted cinnabar seals, and pale blue-gray moonlight. Composition should read as a continuous scroll with rhythmic clusters of people and negative-space water. Avoid modern objects, anime faces, fake calligraphy clutter, and overly saturated poster lighting.`
        }
    },
    {
        number: 136,
        sourceFile: 'gallery-fine-art-painting.md',
        sourceImage: 'docs/fine-art-painting/impasto-floral-swirls.png',
        template: {
            id: 'gallery-impasto-floral-rhythms',
            title: '厚涂花卉律动',
            category: '插画艺术',
            tags: ['油画', '厚涂', '花卉', '表现主义'],
            description: '用厚重刮刀笔触和强烈色彩表现向日葵与鸢尾花的油画。',
            prompt: `创作一幅具有后印象派厚涂谱系的鲜艳油画，描绘茂密的向日葵和鸢尾花花园。使用刮刀将颜料以厚重、有节奏的旋涡和团块堆叠，在画布上形成可触摸般的立体纹理。

色彩是铬黄、深群青和朱红的爆发，并加入可见的铅白笔触表现闪烁光线。构图紧密而略显混乱，花卉排列仿佛充满振动能量。使用强烈正午阳光，让厚颜料的隆起内部形成深阴影。不要留下平坦表面，整张画布都由富有表现力、湍动的笔触覆盖。突出原始情绪、媒介的物质存在，以及光线在油彩峰谷上的变化。`,
            promptEn: `A vivid oil painting in the lineage of post-impressionist impasto, featuring a dense garden of sunflowers and irises. The paint is applied in thick, rhythmic swirls and heavy dollops with a palette knife, creating a tangible 3D texture on the canvas. The color palette is an explosion of 'Chrome Yellow', 'Deep Ultramarine', and 'Vermilion Red', with visible strokes of white lead to indicate shimmering light. The composition is a tight, chaotic floral arrangement that seems to vibrate with energy. The lighting is harsh midday sun, which creates deep shadows within the ridges of the thick paint. There are no flat surfaces; every inch of the 'canvas' is covered in expressive, turbulent movement. The overall effect is one of raw emotion and the physical presence of the medium, focusing on the light-play over the peaks of the oil paint.`
        }
    },
    {
        number: 102,
        sourceFile: 'gallery-ui-ux-mockups.md',
        sourceImage: 'docs/uiux-mockups/mobile-budgeting-app-neobank.png',
        template: {
            id: 'gallery-mobile-budgeting-app',
            title: '移动预算应用概念',
            category: 'UI 与图形',
            tags: ['移动应用', '金融', '仪表盘', '准确文字'],
            description: '包含余额、消费图表和交易记录的完整移动金融应用首页。',
            prompt: `为虚构数字银行 AURAE 设计一张精致的移动金融应用 UI Mockup，展示在 1290×2796 的正面智能手机屏幕上，背景为柔和米白色并带轻微阴影。使用深海军蓝、薄荷绿、暖灰和白色的平静配色，创建完整首页，要求字体清晰、间距整洁、卡片圆角统一、图标对齐准确。

顶部显示“AURAE”“Good morning, Lina”“Total balance $12,480.36”。加入三枚摘要标签：“Income +$4,200”“Spent -$1,830”“Saved 32%”。展示标注“Mon Tue Wed Thu Fri Sat Sun”的周消费柱状图，以及交易列表：“Metro Pass $18.50”“Green Bowl $14.20”“Rent $1,240.00”。底部导航为“Home”“Cards”“Budget”“Profile”。优先保证清晰的信息层级、真实移动应用风格、准确标签和可交付级 Mockup 表现。`,
            promptEn: `Design a polished mobile finance app UI mockup for a fictional neobank called AURAE, shown on a 1290x2796 smartphone screen, front-facing, with a soft off-white background and subtle shadow. Use a calm palette of deep navy, mint green, warm gray, and white. Create a complete home screen with crisp typography, clean spacing, rounded cards, and precise icon alignment. Include a top header with the in-image text "AURAE", "Good morning, Lina", and "Total balance $12,480.36". Add three summary chips labeled "Income +$4,200", "Spent -$1,830", and "Saved 32%". Show a weekly spending bar chart labeled "Mon Tue Wed Thu Fri Sat Sun" and a recent transactions list with "Metro Pass $18.50", "Green Bowl $14.20", and "Rent $1,240.00". Include a bottom nav with "Home", "Cards", "Budget", and "Profile". Prioritize crisp UI hierarchy, realistic mobile app styling, sharp labels, and production-quality mockup presentation.`
        }
    },
    {
        number: 103,
        sourceFile: 'gallery-ui-ux-mockups.md',
        sourceImage: 'docs/uiux-mockups/desktop-analytics-dashboard-operations.png',
        template: {
            id: 'gallery-desktop-operations-dashboard',
            title: '桌面运营数据面板',
            category: 'UI 与图形',
            tags: ['SaaS', '桌面面板', '数据图表', '运营'],
            description: '含侧栏、KPI、图表、表格和告警模块的桌面 SaaS 运营面板。',
            prompt: `为虚构平台 HELIX OPS 创建一张高端桌面 SaaS 分析面板 Mockup，展示在 1600×1000 的 16:10 显示器画布中。使用板岩灰、钴蓝、青绿色、浅灰和白色的冷静配色，结合轻微玻璃面板与严格网格对齐。

布局包含左侧栏、顶部筛选栏、KPI 卡片、折线图、数据表和告警面板。准确显示文字：“HELIX OPS”“Operations Overview”“Last 30 Days”“Uptime 99.982%”“Tickets 184”“Latency 42 ms”“Conversion 6.4%”。折线图横轴为“Apr 1”至“Apr 30”，环形图标题为“Traffic Sources”，表格列为“Site”“Status”“Region”“Load”，告警标签为“3 Critical”和“12 Warning”。保持真实、可展示的产品界面质感，层级清楚、间距精确、留白平衡、渲染锐利。`,
            promptEn: `Create a high-end desktop SaaS analytics dashboard mockup for a fictional platform named HELIX OPS, displayed on a 16:10 monitor canvas at 1600x1000. Use a cool palette of slate, cobalt blue, teal, pale gray, and white, with subtle glass panels and tight grid alignment. The layout should include a left sidebar, top filter bar, KPI cards, line charts, data table, and alert panel. Use crisp typography and correct labels. Include in-image text: "HELIX OPS", "Operations Overview", "Last 30 Days", "Uptime 99.982%", "Tickets 184", "Latency 42 ms", and "Conversion 6.4%". Show a line chart labeled "Apr 1" through "Apr 30", a donut chart titled "Traffic Sources", and a table with columns "Site", "Status", "Region", and "Load". Add alert pills reading "3 Critical" and "12 Warning". Composition should feel realistic and presentation-ready, with clean hierarchy, precise spacing, balanced negative space, and ultra-sharp dashboard UI rendering.`
        }
    },
    {
        number: 104,
        sourceFile: 'gallery-ui-ux-mockups.md',
        sourceImage: 'docs/uiux-mockups/design-system-component-card-set.png',
        template: {
            id: 'gallery-design-system-card-set',
            title: '设计系统组件卡片集',
            category: 'UI 与图形',
            tags: ['设计系统', '组件库', 'UI Kit', '规范展示'],
            description: '按钮、输入框、状态、卡片与字体标本组成的系统化组件展板。',
            prompt: `为虚构产品语言 LUMEN UI 生成一张干净的设计系统总览展板，在 2048×2048 正方形画布上排列为组件画廊。使用象牙白、炭黑、低饱和蓝、鼠尾草绿和珊瑚色点缀的中性配色。

以整齐卡片网格展示按钮、输入框、徽章、开关、标签页、头像、告警和价格卡。保持字体清晰、间距均匀、阴影克制、对齐精确，像从专业设计工具中导出。标注分区：“LUMEN UI”“Buttons”“Inputs”“Status”“Cards”“Type Scale”。示例按钮为“Primary”“Secondary”“Danger”，徽章为“Success”“Pending”“Error”，字体标本为“Display 48”“Heading 24”“Body 16”。整体应系统化、编辑感强、高度易读，具备设计系统画廊所需的统一性。`,
            promptEn: `Generate a clean design system overview board for a fictional product language called LUMEN UI, arranged as a square component gallery on a 2048x2048 canvas. Use a neutral palette of ivory, charcoal, muted blue, sage, and coral accents. The composition should be an orderly grid of cards showing buttons, input fields, badges, toggles, tabs, avatars, alerts, and pricing cards. Include crisp typography, even spacing, subtle shadows, and exact alignment as if exported from a professional design tool. Add labeled sections with the in-image text "LUMEN UI", "Buttons", "Inputs", "Status", "Cards", and "Type Scale". Include sample button labels "Primary", "Secondary", and "Danger"; badge labels "Success", "Pending", and "Error"; and typography specimens "Display 48", "Heading 24", and "Body 16". Ensure the board feels systematic, editorial, and highly legible, with clean hierarchy, correct labels, and polished component consistency suitable for a design systems gallery.`
        }
    },
    {
        number: 106,
        sourceFile: 'gallery-ui-ux-mockups.md',
        sourceImage: 'docs/uiux-mockups/health-tracker-wellness-app.png',
        template: {
            id: 'gallery-health-tracker-app',
            title: '健康追踪应用概念',
            category: 'UI 与图形',
            tags: ['健康应用', '移动 UI', '进度环', '数据可视化'],
            description: '含健康指标、进度环、周图表和洞察卡片的移动应用界面。',
            prompt: `为虚构健康产品 VITA LOOP 创建一张精致的移动健康追踪应用界面，展示在一台修长智能手机上，采用明亮编辑式 UI。配色为柔和薄荷绿、深森林绿、奶油色、珊瑚色和冷灰色。

构建每日总览页面，使用整洁卡片、圆形进度环、小型图表和规整底部导航。准确显示：“VITA LOOP”“Daily Summary”“Steps 8,420”“Sleep 7.6 h”“Heart Rate 64 bpm”“Hydration 2.1 L”。加入三个进度环：“Move 78%”“Recovery 84%”“Focus 66%”。展示标注“Mon Tue Wed Thu Fri Sat Sun”的周图表，以及“Log Meal”“Start Session”两个按钮。健康洞察卡显示“Recovery improved 12% this week”。整体应达到可交付产品级，医疗感干净、间距严谨、文字锐利准确。`,
            promptEn: `Create a refined mobile health tracking app screen for a fictional wellness product named VITA LOOP, displayed on a tall smartphone with a bright editorial UI aesthetic. Use a palette of soft mint, deep forest green, cream, coral, and cool gray. Compose a daily overview screen with clean cards, circular progress rings, miniature charts, and a tidy bottom navigation. Include crisp in-image text: "VITA LOOP", "Daily Summary", "Steps 8,420", "Sleep 7.6 h", "Heart Rate 64 bpm", and "Hydration 2.1 L". Add three progress rings labeled "Move 78%", "Recovery 84%", and "Focus 66%". Show a weekly chart labeled "Mon Tue Wed Thu Fri Sat Sun" and two buttons reading "Log Meal" and "Start Session". Add a health insight card with the text "Recovery improved 12% this week". The result should feel production-ready, medically clean, carefully spaced, sharply rendered, and optimized for crisp typography and accurate labels.`
        }
    },
    {
        number: 117,
        sourceFile: 'gallery-architecture-and-interior.md',
        sourceImage: 'docs/architecture-interior/japanese-minimalist-living-room-render.png',
        template: {
            id: 'gallery-japanese-minimalist-living-room',
            title: '日式极简客厅',
            category: '建筑与技术',
            tags: ['室内设计', '日式极简', '建筑渲染', '自然光'],
            description: '浅木、障子元素和晨光构成的宁静写实日式客厅。',
            prompt: `以照片级建筑可视化风格渲染一间宁静的日式极简客厅，视点为平视，具有 28mm 镜头感。空间包含浅色橡木地板、障子风格滑动门、低矮模块化座椅、凹入式床之间壁龛、亚麻纹理，以及从左侧进入的柔和晨光。

使用暖米色、浅橡木、炭灰、低饱和苔藓绿和宣纸白配色。在一块小型落地平面图板上清晰显示“Room 6.4 m x 4.8 m”和“AURAE House”。加入低矮茶桌、一个陶瓷花瓶、一株盆景式植物和 3000K 间接灯槽照明。构图宁静平衡、留白明确，阴影真实、材质行为准确，达到室内杂志级渲染品质，重点表现照片写实、建筑细节、清晰边缘和克制极简，而不是风格化幻想。`,
            promptEn: `Render a serene Japanese minimalist living room interior in photorealistic architectural visualization style, viewed from eye level with a 28 mm lens feel. The space should feature light oak flooring, shoji-inspired sliding panels, low modular seating, a recessed tokonoma niche, linen textures, and soft morning light entering from the left. Use a restrained palette of warm beige, pale oak, charcoal, muted moss green, and rice-paper white. Include subtle in-image text on a small framed floor plan board that reads "Room 6.4 m x 4.8 m" and "AURAE House". Add a low tea table, one ceramic vase, a bonsai-like plant, and indirect cove lighting at 3000 K. Composition should be calm and balanced with strong negative space, realistic shadows, accurate material behavior, and magazine-quality interior rendering. Prioritize photorealism, architectural detail, crisp edges, and tasteful minimalism rather than stylized fantasy.`
        }
    },
    {
        number: 118,
        sourceFile: 'gallery-architecture-and-interior.md',
        sourceImage: 'docs/architecture-interior/brutalist-concrete-museum-atrium.png',
        template: {
            id: 'gallery-brutalist-museum-atrium',
            title: '粗野主义美术馆中庭',
            category: '建筑与技术',
            tags: ['粗野主义', '美术馆', '建筑渲染', '空间尺度'],
            description: '天窗、长坡道和巨大几何空洞构成的纪念性混凝土中庭。',
            prompt: `创建一张照片级室内渲染，表现一座纪念碑式粗野主义美术馆中庭。空间使用裸露木模板混凝土、戏剧性天窗、长坡道和巨大的几何空洞。视点略低且广，突出垂直尺度与阴影。

配色为冷灰混凝土、黑钢、低饱和砂岩、浅色日光，并加入少量铁锈色导视点缀。稀疏标牌应清晰显示：“Gallery A”“Level 02”“Atrium 18.0 m”。加入少量小型人物作为尺度参考，但建筑必须占主导。空间包括悬空步道、中央雕塑基座和抛光混凝土地面上的反射光。构图既有电影感又保持建筑精确，材质真实、光照准确、反差受控，具备画廊级渲染品质。`,
            promptEn: `Create a photorealistic interior render of a monumental brutalist museum atrium with exposed board-formed concrete, dramatic skylights, long ramps, and massive geometric voids. Viewpoint is slightly low and wide, emphasizing vertical scale and shadow. Use a palette of cool gray concrete, black steel, muted sandstone, pale daylight, and a few rust-colored wayfinding accents. Include sparse signage with crisp in-image text: "Gallery A", "Level 02", and "Atrium 18.0 m". Add a few small human figures for scale, but keep the architecture dominant. The space should include suspended walkways, a central sculpture plinth, and reflected light from polished concrete floors. Composition must feel cinematic yet architecturally precise, with realistic material textures, accurate lighting, controlled contrast, and gallery-quality rendering. Prioritize believable spatial depth, clean geometry, subtle atmospheric perspective, and sharp signage.`
        }
    },
    {
        number: 112,
        sourceFile: 'gallery-technical-illustration.md',
        sourceImage: 'docs/technical-illustration/mechanical-watch-exploded-view.png',
        template: {
            id: 'gallery-mechanical-watch-exploded-view',
            title: '机械腕表爆炸图',
            category: '建筑与技术',
            tags: ['爆炸图', '机械腕表', '工业设计', '技术标注'],
            description: '带精准分层、材质和编号标注的高级机械腕表技术图。',
            prompt: `为虚构机械腕表 Meridian 8 创作一张高级技术爆炸图，主体居中于带细蓝图网格点缀的深板岩色背景。将腕表零件按垂直方向精确分层：蓝宝石镜面、表盘、指针、刻度环、机芯夹板、擒纵机构、摆轮、发条盒、表壳、表冠和皮革表带部分。

使用写实拉丝钢、黄铜、红宝石轴承点缀和深海军蓝表盘细节。以清晰引线和文字标注：“Meridian 8”“Exploded Assembly”“42 mm Case”“25 Jewels”“Power Reserve 72 h”。加入“01”至“10”的编号标注，并使用“Balance Wheel”“Mainspring Barrel”“Sapphire Crystal”等短标签。结果应高度细致、技术可信、渲染锐利，适合作为层级清楚、文字准确、材质精致的工业设计图版。`,
            promptEn: `Create a premium technical exploded-view illustration of a fictional mechanical wristwatch called the Meridian 8, centered on a dark slate background with fine blueprint grid accents. Show the watch components separated vertically with precise spacing: sapphire crystal, dial, hands, chapter ring, movement plates, escapement, balance wheel, mainspring barrel, case, crown, and leather strap sections. Use realistic brushed steel, brass, ruby jewel accents, and deep navy dial details. Add crisp callouts and labels with the in-image text "Meridian 8", "Exploded Assembly", "42 mm Case", "25 Jewels", and "Power Reserve 72 h". Include numbered callouts "01" through "10" with short labels like "Balance Wheel", "Mainspring Barrel", and "Sapphire Crystal". The result should be highly detailed, technically believable, sharply rendered, and suitable for an industrial design plate with clean hierarchy, exact labeling, and refined material realism.`
        }
    },
    {
        number: 116,
        sourceFile: 'gallery-technical-illustration.md',
        sourceImage: 'docs/technical-illustration/smartphone-internals-layered-view.png',
        template: {
            id: 'gallery-smartphone-internals-layered',
            title: '智能手机内部结构分层图',
            category: '建筑与技术',
            tags: ['手机结构', '爆炸图', '产品可视化', '技术标注'],
            description: '前后视角、内部组件和规格文字完整呈现的旗舰手机分层图。',
            prompt: `为虚构旗舰手机 HELIX ONE 制作一张精致爆炸分层图，在柔和炭灰渐变背景上同时展示手机正面与背面，零件按垂直方向分层组装。分离玻璃、OLED 面板、中框、电池、相机岛、无线充电线圈、逻辑板、均热板、扬声器和后壳。

使用写实材质：拉丝钛金属边框、陶瓷后盖、黑色玻璃、铜制散热元件和蓝色 PCB 走线。准确显示清晰标注：“HELIX ONE”“Layered Internal Architecture”“6.7 in OLED”“5,100 mAh”“Vapor Chamber 3,200 mm2”。部件标签包括“Main Camera 50 MP”“Ultrawide 13 MP”“Coil”“Battery”“Logic Board”“Speaker Module”。保持构图优雅、技术可信，间距准确、字体锐利、引线干净，达到高级产品可视化品质。`,
            promptEn: `Produce a sleek exploded-view illustration of a fictional flagship smartphone called the HELIX ONE, shown front and back in a vertically layered assembly on a soft charcoal gradient background. Separate the glass, OLED panel, midframe, battery, camera island, wireless charging coil, logic board, cooling vapor chamber, speakers, and rear shell. Use realistic materials including brushed titanium edges, ceramic back, black glass, copper thermal elements, and blue PCB traces. Add crisp labels and in-image text: "HELIX ONE", "Layered Internal Architecture", "6.7 in OLED", "5,100 mAh", and "Vapor Chamber 3,200 mm2". Label components "Main Camera 50 MP", "Ultrawide 13 MP", "Coil", "Battery", "Logic Board", and "Speaker Module". Keep the composition elegant, technical, and believable, with exact spacing, sharp typography, clean callout leaders, and premium product-visualization quality.`
        }
    },
    {
        number: 153,
        sourceFile: 'gallery-beauty-and-lifestyle.md',
        sourceImage: 'docs/beauty-lifestyle/skincare-morning-routine-tray.png',
        template: {
            id: 'gallery-skincare-morning-tray',
            title: '静奢护肤晨间托盘',
            category: '美妆生活',
            tags: ['护肤', '静物摄影', '静奢', '晨光'],
            description: '洞石台面、透明玻璃和自然晨光组成的高级护肤生活方式静物。',
            prompt: `创作一张 3:4 竖版高级护肤晨间仪式生活方式摄影。场景位于柔和磨砂窗边的洞石浴室台面，摆放极简玻璃精华瓶、陶瓷洁面软管、面霜罐、折叠亚麻毛巾、玉石滚轮、装着珍珠发夹的小碟，以及一朵带露水的白山茶花。

使用自然晨间侧光、柔和反射、真实玻璃厚度、轻柔阴影和干净留白。美学为静奢，将日式极简与现代水疗编辑摄影结合，配色为奶油色、暖石色和半透明淡绿色。不出现品牌 logo，不生成可读的虚假标签，只有一个极小通用标记“AM ROUTINE”；不出现人脸、杂乱陈设或过度 CGI 光泽。`,
            promptEn: `Create a 3:4 vertical beauty lifestyle photograph for a premium skincare morning routine. Scene: a travertine bathroom counter beside a soft frosted window, with a minimal glass serum bottle, ceramic cleanser tube, cream jar, folded linen towel, jade roller, small dish of pearl hair clips, and a single dewy white camellia flower. Lighting: natural morning side light, gentle reflections, realistic glass thickness, soft shadows, clean negative space. Aesthetic: quiet luxury, Japanese minimalism meets modern spa editorial, cream / warm stone / translucent pale green palette. No visible brand logos, no readable fake labels except a tiny generic mark "AM ROUTINE", no human face, no clutter, no overdone CGI shine.`
        }
    },
    {
        number: 154,
        sourceFile: 'gallery-beauty-and-lifestyle.md',
        sourceImage: 'docs/beauty-lifestyle/fragrance-evening-ritual-vanity.png',
        template: {
            id: 'gallery-fragrance-evening-vanity',
            title: '香氛夜间仪式梳妆台',
            category: '美妆生活',
            tags: ['香氛', '静物摄影', '蓝调时刻', '静奢'],
            description: '烛光、冷调窗光和大理石反射构成的夜间香氛编辑静物。',
            prompt: `创作一张竖版高级美妆生活方式编辑图，主题是精品香氛夜间仪式。蓝调时刻，一处温暖大理石梳妆台靠近柔和发光的卧室窗边，摆放两个雕塑感香水瓶、一条丝带、珍珠发夹、一张小手写便签、一杯气泡水和几朵带露感白花。

造型应静奢、女性化、现代且令人向往，但自然克制而不过度制作。配色使用香槟金、暖象牙白、灰玫瑰色、柔和薰衣草阴影和清透玻璃高光。灯光由烛光与冷调夜窗光混合，大理石上有精致反射，使用浅景深和高级产品摄影写实感。构图为竖版杂志静物，留白优雅，不出现品牌 logo、真实人物身份或杂乱元素，只允许小而雅致的便签文字“EVENING RITUAL”。`,
            promptEn: `Create a portrait-oriented premium beauty and lifestyle editorial image for a boutique fragrance evening ritual. Scene: a warm marble vanity beside a softly lit bedroom window at blue hour, with two sculptural perfume bottles, a silk ribbon, pearl hair pins, a small handwritten note, a crystal glass of sparkling water, and a few dewy white flowers. Styling should feel quiet-luxury, feminine, modern, and aspirational, but natural rather than overproduced. Use a palette of champagne gold, warm ivory, dusty rose, soft lavender shadows, and clear glass highlights. Lighting: candle glow mixed with cool evening window light, glossy reflections on marble, shallow depth of field, premium product-photography realism. Composition: vertical magazine still life, elegant negative space, no brand logos, no real-person likeness, no clutter, no text except a tiny tasteful note reading "EVENING RITUAL".`
        }
    },
    {
        number: 15,
        sourceFile: 'gallery-gaming.md',
        sourceImage: 'docs/gaming/dark-fantasy-hunt.png',
        template: {
            id: 'gallery-dark-fantasy-swamp-hunt',
            title: '黑暗幻想沼泽首领战',
            category: '游戏视觉',
            tags: ['动作 RPG', '黑暗幻想', '游戏截图', 'HUD'],
            description: '蓝调沼泽、怪物猎人和可信 HUD 组成的次世代动作 RPG 截图。',
            prompt: `创作一张原创 AAA 黑暗幻想动作 RPG 游戏截图。蓝调时刻，一名银发怪物猎人身穿多层皮革盔甲，站在破败沼泽中，拔剑面对一只从雾气中升起的巨大翼状沼泽怪物。

采用电影化越肩构图，加入可信的生命值、耐力、药水图标、任务文字和小地图 HUD。环境包含湿石、枯树、火把光、月光雾气和克制的炼金术符号。材质高度细致，构图戏剧化但信息可读，呈现高级次世代游戏质感，16:9 横版。`,
            promptEn: `Create an original AAA dark-fantasy action RPG screenshot. A silver-haired monster hunter in layered leather armor stands in a ruined marsh at blue hour, sword drawn toward a huge winged swamp beast rising from mist. Cinematic over-the-shoulder framing, believable HUD with health, stamina, potion icons, quest text, and minimap. Wet stones, dead trees, torchlight, moonlit fog, subtle alchemy glyphs, highly detailed materials, dramatic but readable composition, premium next-gen game look, 16:9 landscape.`
        }
    },
    {
        number: 20,
        sourceFile: 'gallery-gaming.md',
        sourceImage: 'docs/gaming/mobile-moba-arena-hud.png',
        template: {
            id: 'gallery-mobile-moba-arena-hud',
            title: '移动 MOBA 竞技场 HUD',
            category: '游戏视觉',
            tags: ['MOBA', '移动游戏', 'HUD', '竞技场'],
            description: '完整操作控件、比分和战场信息的原创移动 MOBA 游戏截图。',
            prompt: `创作一张原创横版移动 MOBA / 动作 RPG 游戏截图，借鉴竞技线路战斗游戏的类型语言，但不复制任何现有作品。使用 16:9 横版和精致移动游戏 HUD。

场景：黄金时刻黄昏的明亮幻想竞技场，三名风格化英雄在中央河桥和发光水晶目标附近交战。摄影机为略微抬高的等距第三人称游戏视角，战场线路、小兵、法术特效、草丛、炮塔剪影和远处首领目标坑都清楚可读。

HUD：左下为半透明虚拟摇杆，右下为四个带冷却数字的圆形技能按钮；终极技能按钮发光但只充能 87%；顶部比分“12 - 11”，计时器“08:42”，显示队伍生命条；左上角为小地图，另有快捷装备栏和金币“3,420”。保持移动端安全边距、图标锐利，不出现真实游戏 logo。美术方向为高级动漫幻想 3D 移动游戏，使用高饱和青绿、金色和紫色，UI 清晰、法术特效动态、材质细致，呈现真实屏幕截图感，而不是海报或 Mockup 展板。`,
            promptEn: `Create an original landscape mobile MOBA / action-RPG gameplay screenshot, inspired by competitive lane-battle games but not copying any existing franchise. 16:9 landscape, polished mobile game HUD. Scene: a bright fantasy arena at golden-hour dusk, three stylized heroes clash near a central river bridge and glowing crystal objective. Camera: slightly elevated isometric third-person gameplay view, readable battlefield lanes, minions, spell effects, terrain brush, turret silhouettes, and a boss-objective pit in the distance. HUD design: bottom-left translucent virtual joystick, bottom-right four circular ability buttons with cooldown numbers, ultimate button glowing but 87% charged, top-center score bar reading "12 - 11", match timer "08:42", team health bars, mini-map in the top-left, item quick slots, gold counter "3,420", clean mobile-safe margins, crisp icons, no real game logos. Art direction: premium anime-fantasy 3D mobile game, saturated teal / gold / violet palette, sharp readable UI, dynamic spell VFX, high-detail materials, readable text, screen-capture feel, not a poster, not a mockup board.`
        }
    }
]

export const gptImage2GalleryTemplateSources = Object.fromEntries(
    galleryTemplateRecords.map(({ number, sourceFile, sourceImage, template }) => [
        template.id,
        { number, sourceFile, sourceImage }
    ])
) as Record<string, { number: number; sourceFile: string; sourceImage: string }>

export const gptImage2GalleryTemplates: StyleTemplate[] = galleryTemplateRecords.map(({ template }) => ({
    ...template,
    mode: 'text',
    image: `/template-previews/gallery/${template.id}.webp`
}))

export const GPT_IMAGE2_GALLERY_TEMPLATE_IDS = gptImage2GalleryTemplates.map(template => template.id)
