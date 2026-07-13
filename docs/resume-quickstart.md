# Vistack 异机开工一页纸

用途：换电脑、换 Codex 会话或隔一段时间继续开发时，照着本页执行即可。

## 第一次到新机器

打开 PowerShell：

```powershell
cd D:\github
git clone https://github.com/shawnoarry/Vistack.git
git clone https://github.com/shawnoarry/gpt-image-playground.git
git -C gpt-image-playground checkout --detach c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd
cd Vistack
npm install
```

如果仓库已经存在，不要重复克隆。进入 `D:\github\Vistack` 即可。

## 每次开工只做这五步

### 1. 先看 Git 状态

```powershell
cd D:\github\Vistack
git status --short --branch
```

- 没有 `M`、`A`、`D`、`??`：可以继续。
- 出现上述标记：不要删除、还原或覆盖，让 Codex 先判断这些改动是谁的。
- 需要同步远端时，只在工作区干净的情况下执行 `git pull --ff-only`。

### 2. 确认参考仓库版本

```powershell
git -C D:\github\gpt-image-playground remote -v
git -C D:\github\gpt-image-playground rev-parse HEAD
git -C D:\github\gpt-image-playground status --short --branch
```

正确的参考 commit 必须是：

```text
c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd
```

参考仓库只用于查看实现，不能整体复制 React UI，也不能作为 Vistack 的运行依赖。

### 3. 必读两个文件

1. `docs/codex-project-progress.md`：现在做到哪里、下一步是什么。
2. `docs/gpt-image-playground-integration-plan.md`：哪些能力优先、后置或搁置。

只看整合计划不够；当前是否可以开工，以项目进度记录和用户本次明确批准为准。

### 4. 把下面整段发给 Codex

```text
这是 Vistack 的异机复工任务。

请先完整阅读：
1. docs/codex-project-progress.md
2. docs/gpt-image-playground-integration-plan.md
3. docs/resume-quickstart.md

然后执行只读检查：
- git status --short --branch
- git log -5 --oneline --decorate
- 核对 package.json 和当前相关代码
- 核对参考仓库 D:\github\gpt-image-playground
- 参考仓库必须固定在 commit
  c4dd477c18ee7639a1e6de27bee7b2849e3ff9bd

先用中文汇报：
- 当前分支和未提交改动
- 已完成阶段
- 当前明确批准的工作
- 建议的唯一下一步
- 会修改哪些文件、有什么数据风险

在我明确确认前，不要修改运行时代码，不要自动执行计划中的 P1-P3，
不要清理现有改动，不要改写供应商专用行为，不要迁移或删除本地数据。
```

### 5. 开工前验证

```powershell
npm run check
```

失败时先记录原始错误，不要通过删除数据、重置 Git 或大范围改代码来强行通过。

## 当前整合顺序

- `P0`：先完成当前 UI、验证并建立 Git 检查点；不开发整合功能。
- `P1`：实际参数与诊断、独立 Responses API、参考图粘贴与安全排序。
- `P2`：原生遮罩、完整备份、Storage v2、模型能力配置。
- `P3`：fal.ai、自定义服务商、高级批量操作、Docker/PWA；有真实需求再做。
- 搁置：整体搬 React/Zustand UI、URL 携带 API Key、无需求的 Codex CLI 模式。

路线图表示优先级，不表示已经授权。每次只确认和实施一个工作项。

## 本地预览

```powershell
npm run dev:local
```

浏览器打开终端显示的地址，通常是 `http://127.0.0.1:3000/`。结束时在终端按 `Ctrl+C`。

## 完工交接

每个工作项完成后必须：

```powershell
npm run check
git status --short --branch
git diff --check
```

同时完成：

1. 浏览器验证桌面和手机核心流程。
2. 更新 `docs/codex-project-progress.md`。
3. 只提交本次工作相关文件，不夹带未知改动。
4. 用户要求后再推送；确认远端包含提交，另一台机器才能继续。

## 绝对不要做

- 不执行 `git reset --hard` 或随意还原用户改动。
- 不因参考项目有某功能就直接搬进 Vistack。
- 不在 URL、日志、诊断或普通截图中暴露 API Key 和代理密码。
- 不在完整备份可用前迁移或删除旧存储。
- 不把 UI 收尾、API 协议和数据库迁移混在同一个提交。
