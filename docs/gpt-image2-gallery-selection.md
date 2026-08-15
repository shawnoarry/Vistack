# GPT Image2 Gallery 模板选择清单

状态：28 条 Curated 模板已批准并接入

接入时间：2026-08-15

上游仓库：`wuyoscar/GPT-Image2-Skill`

固定版本：`068dd9e24aadc8731e46f38548ca4dcd94515d35`

## 接入方式

- 只选择上游明确标记为 `Curated` 的条目，不导入本批次中带个人 `Author + Source` 的社区条目。
- 保留完整英文 Prompt 的设计意图，新增忠实中文版本，不强行改写成 Vistack 专用工作流。
- 每条模板都绑定其上游匹配示例图；图片转换为本地 `512×640`、WebP、质量 82 的轻量预览，完整内容使用留边适配，不产生付费生图请求。
- 继续使用 Vistack 现有模板搜索、分类、语言切换和提示词插入流程，不修改生成 API、模型参数、预设、历史或存储。
- 上游 MIT License 保存在 `docs/licenses/GPT-Image2-Skill-LICENSE.txt`，运行时代码中的来源编号与路径保存在 `src/data/gptImage2GalleryTemplates.ts`。

## 已选模板

| No. | Vistack 标题 | 分类 | 上游分类文件 |
|---:|---|---|---|
| 33 | 山川茶事新品海报 | 海报排版 | `gallery-typography-and-posters.md` |
| 35 | 极简悬疑电影海报 | 海报排版 | `gallery-typography-and-posters.md` |
| 36 | 高级时尚杂志封面 | 海报排版 | `gallery-typography-and-posters.md` |
| 37 | 复古科幻通俗杂志封面 | 海报排版 | `gallery-typography-and-posters.md` |
| 27 | 1940 年代黑色电影剧照 | 电影画面 | `gallery-cinematic-and-animation.md` |
| 28 | 六格电影分镜 | 电影画面 | `gallery-cinematic-and-animation.md` |
| 147 | 对称粉彩温室电影场景 | 电影画面 | `gallery-cinematic-film-references.md` |
| 151 | 橙色迷雾新黑色电影 | 电影画面 | `gallery-cinematic-film-references.md` |
| 129 | 涩谷夜间街头穿搭 | 时尚编辑 | `gallery-fashion-editorial.md` |
| 130 | 前卫高级定制秀场 | 时尚编辑 | `gallery-fashion-editorial.md` |
| 131 | Y2K 赛博流行棚拍 | 时尚编辑 | `gallery-fashion-editorial.md` |
| 132 | 老钱风马术庄园 | 时尚编辑 | `gallery-fashion-editorial.md` |
| 47 | 纸雕森林夜市 | 插画艺术 | `gallery-illustration.md` |
| 49 | 雨中植物温室水彩 | 插画艺术 | `gallery-watercolor.md` |
| 51 | 宋代夜市长卷 | 插画艺术 | `gallery-ink-and-chinese.md` |
| 136 | 厚涂花卉律动 | 插画艺术 | `gallery-fine-art-painting.md` |
| 102 | 移动预算应用概念 | UI 与图形 | `gallery-ui-ux-mockups.md` |
| 103 | 桌面运营数据面板 | UI 与图形 | `gallery-ui-ux-mockups.md` |
| 104 | 设计系统组件卡片集 | UI 与图形 | `gallery-ui-ux-mockups.md` |
| 106 | 健康追踪应用概念 | UI 与图形 | `gallery-ui-ux-mockups.md` |
| 117 | 日式极简客厅 | 建筑与技术 | `gallery-architecture-and-interior.md` |
| 118 | 粗野主义美术馆中庭 | 建筑与技术 | `gallery-architecture-and-interior.md` |
| 112 | 机械腕表爆炸图 | 建筑与技术 | `gallery-technical-illustration.md` |
| 116 | 智能手机内部结构分层图 | 建筑与技术 | `gallery-technical-illustration.md` |
| 153 | 静奢护肤晨间托盘 | 美妆生活 | `gallery-beauty-and-lifestyle.md` |
| 154 | 香氛夜间仪式梳妆台 | 美妆生活 | `gallery-beauty-and-lifestyle.md` |
| 15 | 黑暗幻想沼泽首领战 | 游戏视觉 | `gallery-gaming.md` |
| 20 | 移动 MOBA 竞技场 HUD | 游戏视觉 | `gallery-gaming.md` |

## 范围边界

- 这 28 条是普通创作模板，不替代现有 6 条 `精准改图配方`。
- 本批次不导入剩余 134 条上游 Prompt，不导入完整上游图片库，也不执行任何付费生成。
- 现有 30 条 Vistack 模板中仍有 26 条没有示例图；是否继续补齐它们需要单独确定素材或费用方案。
