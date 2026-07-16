# GPT Image Playground 优化整合计划

状态：规划基线；P0 和 P1 5.1 已完成，其余 P1-P3 未授权运行时实现

更新：2026-07-16

适用范围：在保持 Vistack 当前可用性和正在进行的 UI 工作稳定的前提下，选择性借鉴 `gpt-image-playground` 的能力。

## 1. 参考仓库与固定基线

- 参考仓库：<https://github.com/shawnoarry/gpt-image-playground.git>
- 默认分支：`main`
- 固定参考提交：`c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd`
- 提交页面：<https://github.com/shawnoarry/gpt-image-playground/tree/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd>
- 本地核对状态：参考仓库工作区干净，`HEAD`、`origin/main` 和 `origin/HEAD` 均指向上述提交。

固定 commit 是异机复工的事实基线。即使 fork 后续更新，未经过重新审查也不能静默改用新版本，避免参考行为和数据格式发生漂移。

Vistack 当前实施基线：

- UI 稳定门禁已在提交 `4d2bb94`（`feat: move couple photo assistant to toolbar`）完成。
- 阶段 1、阶段 2A、阶段 2B 和阶段 3 均已完成；当前事实状态仍以 `docs/codex-project-progress.md` 为准。
- `docs/phase-3-result-history-brief.md` 已完成本计划 5.1 的任务级实际参数、逐图修订提示词和所选生成诊断。
- Responses API 和参考图粘贴/排序仍是后续独立工作项，尚未获得实施授权，也不会因 5.1 完成而自动启动。

异机准备：

```powershell
git clone https://github.com/shawnoarry/Vistack.git
git clone https://github.com/shawnoarry/gpt-image-playground.git
git -C gpt-image-playground checkout c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd
git -C gpt-image-playground rev-parse HEAD
```

参考仓库只作为设计和测试样本，不作为 Vistack 的 Git submodule、npm 依赖或构建依赖。实际整合必须按 Vue/Vistack 的数据模型重新实现。

## 2. 总体判断

Vistack 已有生成、参考图、批量任务、API 预设、代理、历史、资产管理、遮罩画布和异步任务恢复。整合目标不是替换现有产品，而是补齐四类能力：

1. 让每次生成的实际参数和诊断可以追溯。
2. 让高频改图路径获得原生遮罩和更完整的 OpenAI 协议支持。
3. 在存储升级前建立可恢复的数据保护能力。
4. 在真实需求出现时，再扩展服务商和部署方式。

以下原则不可违反：

- 现有 Images、Edit、Chat、Grsai 和供应商专用行为继续作为默认路径。
- 新协议以独立适配器或能力开关加入，不通过大重构替换现有路由。
- 新历史字段必须可选，旧记录读取不能报错。
- 数据迁移只能复制、校验和回退，不得先删除旧数据。
- P0 UI 稳定门禁已经完成；此后仍不得在对应单项产品简报获批前修改 `App.vue`、结果详情、参考图上传、工具箱或资产库交互。
- 每个阶段仍需先提交单独产品简报，并获得明确确认；本计划不等于实现授权。

## 3. 优先级总览

| 优先级 | 工作项 | 决策 | 主要原因 |
| --- | --- | --- | --- |
| P0 | UI 稳定基线与回归门禁 | 已完成（`4d2bb94`） | 防止当前 UI 编码与数据/API 改动互相干扰 |
| P1 | 任务级实际参数、耗时、改写提示词和原始错误 | UI 稳定后优先 | 直接支持选中历史结果的参数与诊断 |
| P1 | Responses API 独立适配器 | 优先 | 补齐 GPT Image 正式协议，不影响现有请求路径 |
| P1 | 参考图粘贴与安全排序 | 优先 | 直接缩短高频改图操作；复用现有角色元数据 |
| P2 | 原生遮罩提交与当前兜底并存 | 后续重点 | 价值高，但涉及工具箱、请求能力识别和文件校验 |
| P2 | 完整版本化备份与合并恢复 | 数据改造前置 | 日常优先级不高，但 Storage v2 前必须完成 |
| P2 | Storage v2：缩略图、统一图片去重、渐进迁移 | 备份后实施 | 提升大图历史性能和可靠性，迁移风险较高 |
| P2 | Provider/model capability profiles | 渐进实施 | 减少端点字符串判断，同时保护供应商专用行为 |
| P3 | fal.ai 与通用同步/异步服务商 manifest | 有真实接口需求再做 | 复杂度和回归面大，当前已有供应商链路可用 |
| P3 | 高级批量选择、右键图片操作 | 可后置 | 属于效率增强，不阻塞核心改图 |
| P3 | Docker、Cloudflare、PWA、更新提醒 | 部署需求出现再做 | 不改善当前生成质量或数据可靠性 |
| 搁置 | 整体搬运 React UI、Zustand store 或任务墙布局 | 不做 | 与 Vistack 产品结构和 Vue 技术栈冲突 |
| 搁置 | URL 携带 API Key、默认开放任意代理 | 不做 | 容易泄露共享凭据或扩大代理风险 |
| 搁置 | 无需求时加入 Codex CLI 模式、硬编码 16 图上限 | 不做 | 应由实际服务商和模型能力决定 |

## 4. P0：UI 稳定与实施门禁

目标不是增加功能，而是保护当前 UI 工作。

状态：已完成。`4d2bb94` 之前的阶段 1、2A、2B 均已通过对应测试和桌面/手机浏览器验证；后续机器必须从远端拉取包含该提交及更新文档的最新 `main`，不能重新执行 P0 UI 改造。

进入任何 P1 工作前必须满足：

- 当前 UI 阶段已经验收并形成独立 Git checkpoint。
- `npm run check` 通过。
- 桌面和手机核心改图路径完成一次浏览器回归。
- 记录当前历史数据结构、API 请求快照和主要界面截图。
- 工作区没有来源不明的未提交改动；如有用户改动，后续实现必须在其基础上继续。

建议每个整合项单独分支或单独提交，不把 UI 收尾、API 协议和数据迁移放进同一个 checkpoint。

## 5. P1：UI 稳定后的首批整合

施工顺序不是表格中的三个 P1 同时开始。`docs/phase-3-result-history-brief.md` 已完成当前结果、持久历史、选中记录诊断和 5.1 可选实际参数字段。5.2 Responses API 与 5.3 参考图粘贴/排序仍需分别提交产品简报并获得明确确认。

### 5.1 任务级实际参数与诊断

参考实现：

- [任务和实际参数类型](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/types.ts)
- [请求完成后的参数保存](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/store.ts)
- [任务详情展示](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/components/DetailModal.tsx)

Vistack 目标：

- 给生成响应和历史记录增加可选的 `actualParams`、逐图参数、`revisedPrompt`、耗时和经过脱敏的原始错误摘要。
- 先只采集和保存，再在已确认的结果/历史详情设计中展示。
- 诊断必须绑定选中的历史生成，而不是继续只表示最后一次请求。

验收重点：旧历史正常打开；API Key、Bearer token 和代理密码不进入诊断；现有请求体完全不变。

### 5.2 Responses API 独立适配器

参考实现：

- [OpenAI Images/Responses 请求和解析](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/openaiCompatibleImageApi.ts)
- [协议与参数兼容规则](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/paramCompatibility.ts)

Vistack 目标：新增明确的 `responses` 能力，不改变现有 Images、Edit、Chat、Grsai 路由。只有用户选择支持 Responses 的配置时才进入新路径。

验收重点：请求和响应解析有独立测试；现有供应商行为锁定测试全部通过；失败时显示明确模式与端点，不自动切换到其他协议重试。

### 5.3 参考图粘贴与安全排序

参考实现：

- [参考图上传、粘贴和拖动](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/components/InputBar.tsx)
- [提示词图片引用重排](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/promptImageMentions.ts)

Vistack 目标：先增加剪贴板粘贴和桌面/手机排序。排序时必须同步图片、名称、角色和说明，不能只移动图片数组。

`@图片` 引用单独评估，不应取代现有的人物、服装、背景、产品和风格角色系统。参考图数量继续服从模型能力，不硬编码统一 16 张。

## 6. P2：后续重点

### 6.1 原生遮罩

参考实现：

- [遮罩编辑器](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/components/MaskEditorModal.tsx)
- [遮罩预处理](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/maskPreprocess.ts)
- [原生 mask 请求](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/openaiCompatibleImageApi.ts)

保留 Vistack 当前“底图 + 遮罩参考图 + 提示词约束”的通用兜底。只有 capability profile 明确支持时，才提交 `mask` 或 `input_image_mask`。必须校验底图与遮罩尺寸、透明区域、文件格式和载荷大小。

### 6.2 完整备份与合并恢复

参考实现：

- [ZIP manifest 数据结构](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/types.ts)
- [ZIP 导入与导出](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/store.ts)

这与用户已确认的“多选图片分别下载”是两件事：日常下载继续输出独立图片，完整 ZIP 只用于低频灾难恢复和异机迁移。

Vistack 备份必须覆盖历史、生成图片、API 预设、画布、工具箱资产和必要设置。含 API Key/代理密码时必须明确告知；导入默认合并和去重，不覆盖、不清空现有数据。

### 6.3 Storage v2

参考实现：

- [IndexedDB 图片、缩略图与 SHA-256 去重](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/db.ts)

迁移顺序固定为：完成备份能力，创建新库，复制记录，校验数量和哈希，切换读取优先级，保留旧库回退。不得在同一版本中删除旧库。

缩略图应后台渐进生成，缺失时回退原图；不能让首次升级长时间阻塞主界面。

### 6.4 Provider/model capability profiles

参考实现：

- [API profiles 与自定义服务商定义](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/apiProfiles.ts)
- [参数兼容规则](https://github.com/shawnoarry/gpt-image-playground/blob/c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd/src/lib/paramCompatibility.ts)

先为 Vistack 已使用的模型建立小型能力表，例如支持的协议、最大参考图、尺寸格式、原生遮罩和批量上限，并保留 generic fallback。不要在第一版引入完整通用 manifest DSL。

## 7. P3：可后置能力

以下项目只有出现明确使用场景时才进入产品简报：

- fal.ai：需要真实账号、模型和队列恢复需求后再接入。
- 自定义服务商 manifest：至少出现两个无法由现有适配器覆盖的接口后再设计。
- 框选、Ctrl/Command 连选、移动端侧滑多选：资产数量和批量操作频率证明有价值后再做。
- 图片右键复制、下载和打开原图：可作为资产操作小优化，不应打断结果/历史主结构。
- Docker、Cloudflare Workers、PWA、版本提醒：团队部署或离线安装成为实际问题后再做。
- URL 配置导入：如实施，只允许默认不含密钥的模板链接，并提供显式确认。

## 8. 明确搁置

- 不搬运 React 组件、Zustand store、Tailwind 视觉结构或整套任务墙。
- 不用 playground 的状态模型替换 Vistack 的 `App.vue`、本地存储和供应商路由。
- 不为了“统一”删除或重写现有供应商特殊参数。
- 不将完整备份 ZIP 改成日常多图下载方式。
- 不在 URL、日志、诊断或导出文件中默认暴露 API Key。
- 不因为参考项目支持某项功能就自动加入；必须由 Vistack 的真实工作流证明价值。

## 9. 每阶段实施方法

每个工作项使用同一流程：

1. 核对 Vistack 当前代码、参考 fork 固定 commit 和现有测试。
2. 提交单项产品简报：现状、问题、方案、替代方案、不变范围、数据风险和验收标准。
3. 获得明确确认后建立小范围测试和请求快照。
4. 以适配器、可选字段或 capability flag 实现，保持旧路径为默认。
5. 运行 `npm run check`，再做桌面/手机核心流程验证。
6. 更新本计划和 `codex-project-progress.md`，创建单一目的的 Git checkpoint。

如果参考项目的代码被实质改编，而不是只借鉴设计，应在 `THIRD_PARTY_NOTICES.md` 中补充仓库、固定 commit 和 MIT 来源。不得复制 React 代码后仅做语法转换。

## 10. 异机复工检查表

新机器或新会话开始时：

1. 阅读 `docs/resume-quickstart.md`、`docs/codex-project-progress.md`、本计划和主进度中当前 TODO 指向的产品文档。
2. 在 Vistack 执行 `git status --short --branch`，保留所有未知改动。
3. 检查参考仓库 `origin` 和固定 commit：

```powershell
git -C ..\gpt-image-playground remote -v
git -C ..\gpt-image-playground rev-parse HEAD
git -C ..\gpt-image-playground status --short --branch
```

4. 如果参考仓库缺失，按第 1 节重新克隆并 checkout 固定 commit。
5. 如果准备升级参考基线，先比较旧、新 commit，重新运行相关测试，再更新本计划；不能只修改 SHA。
6. 只恢复当前已确认的一个工作项，不因整体路线图存在而连续实现后续阶段。
