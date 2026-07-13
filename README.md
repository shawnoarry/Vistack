# Vistack

Vistack 是一个基于 Vue 3 和 TypeScript 的 AI 图像生成工作台。它通过可配置的 OpenAI 兼容接口和供应商专用接口，支持文生图、参考图再创作、本地历史记录、资产库、画布工作台和创作工具箱。

## 主要功能

- 文生图与参考图生成
- 自定义接口、模型、API 预设和本地代理
- 针对不同供应商的请求格式与图像尺寸兼容
- 本地生成历史与资产管理
- 支持本地项目保存的画布工作台
- 图片反推提示词、自定义模特、一键换装和遮罩编辑等创作工具
- 自动隐藏凭据的诊断信息复制功能

浏览器数据保存在 `localStorage` 和 IndexedDB 中。API 凭据由用户在应用内填写，不应提交到仓库。

## 本地开发

环境要求：

- Node.js 18 或更高版本
- npm

```bash
npm install
npm run dev
```

开发服务器默认地址为 `http://localhost:3000`。

## 完整检查

```bash
npm run check
```

该命令会依次运行 Vue 与 Node TypeScript 检查、Vitest 测试和生产构建。

也可以单独运行：

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

## 项目结构

```text
api/             本地及部署环境使用的代理实现
docs/            当前项目记录与历史归档
src/components/  Vue 界面组件
src/services/    API 请求构建与供应商适配
src/types/       共用 TypeScript 类型
src/utils/       存储、诊断、端点和尺寸工具
```

文档入口见 [docs/README.md](docs/README.md)。当前开发状态和后续事项记录在 [docs/codex-project-progress.md](docs/codex-project-progress.md)。

## 许可证

本项目使用 MIT 许可证，详见 [LICENSE](LICENSE)。第三方代码来源见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
