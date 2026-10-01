# dsh-status-bar · 一眼看清你的 agent 正在做什么

> [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 原生底部状态栏一条线塞下太多内容，窗口一窄就会被**截断**。本插件带来**接近原生体验的可配置状态栏**：17 个信息段任你挑选——会话状态、当前模型、上下文压力、Token 消耗、**生成速度（TPS）**、费用估算、任务与队列等，两下点击即可开关与排序；还提供换行显示、实时 TPS、逐模型费用估算等多项实用选项。替换内置统计行，卸载后原样恢复。

[![DSH](https://img.shields.io/badge/DSH-0.2.0--rc.2-blue)](https://github.com/deepseek-ai/deepseek-harness) [![version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Frepos%2FStarlight-bananice%2Fdsh-status-bar%2Ftags&query=%24%5B0%5D.name&label=version&color=green)](https://github.com/Starlight-bananice/dsh-status-bar/releases) [![npm](https://img.shields.io/npm/v/@bananiceee/dsh-status-bar)](https://www.npmjs.com/package/@bananiceee/dsh-status-bar) [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![topic](https://img.shields.io/badge/topic-dsh--plugin-orange)](https://github.com/topics/dsh-plugin) [![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

[English](README.md) · [中文](README.zh.md)

---

## Overview（概览）

**解决的问题：** DSH 原生底部状态栏是一条超长的固定统计行——内容一多就被**截断**，窗口变窄时尤其明显；既看不到当前模型、上下文窗口还剩多少、Token 流式生成多快、这个会话花了多少钱，也没法按自己的习惯排列这些信息。

**适合谁：** 日常重度使用 DSH 的开发者与团队——希望不离开输入栏就能掌握会话实时状态，又不想额外开一个监视器的人。

**核心能力：**

- **接近原生体验 · 16 个可开关、可排序的信息段** —— 状态点、模型、标题、工作区、轮次与步数、模型/工具耗时、TTFT 与解码速度、缓存命中率、Token、上下文占用、实时 TPS、会话时长、费用估算、后台任务、队列、错误
- **实时吞吐（TPS）** —— 底栏在浏览器内直接折叠本会话的实时流（`assistant/live-chunk`），流式生成期间速度随分块实时刷新；无需轮询、无需 host 往返，也无需外部 live-stats 插件
- **费用估算 + 用户维护的模型价格手册** —— 每个模型独立的价格与峰/谷时段，**每条消息/每一步按实际产出它的模型计费**（输入、缓存命中、缓存写入、输出四类分别计价，峰谷按该步发生时刻取价）；「用量与费用」弹窗内置堆叠费用趋势图（日/周/月）、分页的逐步用量历史（含独立的缓存命中列）与总成本。
- **零配置开箱即用** —— 13 个信息段默认开启，其余勾选即得
- **多项实用选项** —— 换行显示（内容再多也不会被截断省略）、实时 TPS、逐模型费用估算（支持峰谷计价）、币种切换（CNY / USD）、齿轮快捷开关菜单与专属设置页、一键重置
- **干净的接管机制** —— 插件底栏以低优先级同 id 遮蔽内置 `stats` 单元格：加载期间由其渲染，卸载后内置统计行自动恢复，互不污染
- **双语界面** —— 客户端文案内置英文与中文，遵循 DSH locale 体系

## 界面预览

以接近原生的底栏体验替换内置统计行，实时呈现会话状态（状态 · 模型 · 轮次 · 上下文 · 缓存 · TPS · 会话时长 · 任务 · 队列 · 错误），通过专属设置页统一管理——含逐模型价格手册（支持峰谷计价）：

![状态栏实时显示](assets/screenshot-status-bar-zh.png)

![设置页与模型价格手册](assets/screenshot-settings-page-zh.png)

| 随时开关与排序（信息段列表） | 用量与消耗弹窗（趋势图 · 统计卡 · 历史） |
|---|---|
| ![信息段列表](assets/screenshot-settings-segments.png) | ![用量与消耗弹窗](assets/screenshot-usage-cost-dialog.png) |

## Compatibility（兼容性）

| 项目 | 说明 |
|---|---|
| DSH 版本 | `0.2.0-rc.2`（本次发版适配的桌面版线）——**不再支持** 0.1.x |
| 最后验证日期 | 2026-10-01 |
| 运行环境 | Node ≥ 22（host）+ 现代浏览器（client）；无外部服务依赖 |
| 共存关系 | 与任何其他状态栏/TPS 插件互不干扰：实时速率在客户端直接折叠本会话的事件窗口，插件**不注册任何共享投影键**——任何对等插件的键名、`stateVersion` 或注册先后都无法顶掉底栏的 TPS |

### 移植说明 —— 0.2.0（适配 DSH 0.2.0-rc.2）

DSH 0.2.0 移除了 `@deepseek-ai/dsh-client-runtime`，并把旧 Conversation 快照承载的数据拆到了不同的域；本次发版即针对该结构完成移植：

- **会话数据搬家。** 消息节点、轮次时间、流式 partial 与运行中的工具调用改由 Chat 域提供（`useChat`）；生命周期事实（`running`、`lastAgentError`）来自会话快照（`useSession`）；排队消息数来自输入框收件箱（`useInput`）。
- **后台任务的原字段已删除。** `SessionListState.jobsBySession` 不复存在；任务段改为读取客户端任务花名册（`ctx.jobs`），与内置的会话头部任务列表同源。
- **实时 TPS 移入浏览器。** 0.2.0 不再有持久化的 `assistant/chunk` 事件，原先提供速率的 host 投影收不到输入。现在底栏在客户端直接折叠本会话的实时流（`assistant/live-chunk`）——估算器与语义不变——插件不再注册任何实时速率投影键。
- **`Agent 预设` 段已下线**（0.1.1 的 `SessionSummary.agentPreset` 已不存在，0.2.0 仅把预设暴露给新会话的 Hero 芯片）。该段本来就是默认关闭；旧配置里若仍列有它，会在读取时被自动过滤。
- **构建不再需要 DSH 源码检出。** 编译所依赖的 DSH 包以 `0.2.0-rc.2` 精确钉住为 devDependencies；`pnpm install && pnpm run build` 即可完成全部构建。


## Install / Uninstall（安装 / 卸载）

### 安装

```sh
# 从 npm 安装（推荐）
dsh plugin --profile web add @bananiceee/dsh-status-bar

# 或钉住 npm 上的确切版本
dsh plugin --profile web add @bananiceee/dsh-status-bar@0.2.1

# 从本地目录装配（profile 级；`web` 是 `--profile web` 的内置别名）
dsh plugin --profile web add ../dsh-status-bar

# 或从 GitHub 仓库安装
dsh plugin --profile web add github:Starlight-bananice/dsh-status-bar

# 或安装固定版本的 release tgz —— 不可变且带版本号（随每个 GitHub
# release 附带；适合不便直连 git 仓库的场景）
dsh plugin --profile web add https://github.com/Starlight-bananice/dsh-status-bar/releases/download/v0.2.1/bananiceee-dsh-status-bar-0.2.1.tgz
```
> **提示：** pnpm 11 对发布未满 24 小时的包默认拒绝安装——若当天刚发布的新版本被拒，在 `dsh plugin add` 命令末尾追加 `--config.minimumReleaseAge=0`。

> **提示：** pnpm 从 `codeload.github.com` 下载 GitHub 包，且不读取你的 git 代理配置。若安装卡住或报网络错误（如 `error (23)`），请先导出代理再重试：`export HTTPS_PROXY=http://127.0.0.1:7890 HTTP_PROXY=http://127.0.0.1:7890`。

> **自 v0.1.5 起：** 构建产物 `lib/` 已随仓库提交 —— git 安装后开箱即用，**无需任何构建步骤**；`dsh plugin add` 完成后重启 DSH Web 即可。（≤ v0.1.4 的安装不含 `lib/`，需要按 Development 一节手动构建。）

```sh
# 或免重启的运行时注入（开发流程）
#   dev_inject_plugin / dsh-super-injector → 指向本仓库
```

之后启动/重启 DSH Web 即可，无需任何配置——底栏会以默认设置出现。

### 升级

```sh
# npm 安装：直接更新到 registry 上的最新版本
dsh plugin --profile web update @bananiceee/dsh-status-bar

# 或重新 add 钉住的版本
dsh plugin --profile web add @bananiceee/dsh-status-bar@0.2.1

# github: 安装——pnpm 会把不带 ref 的 github: 依赖钉在首次安装时解析到
# 的 commit，`dsh plugin update github:...` 只会提示 "Already up to date"
# 并保留旧构建。升级请用重新 add：
dsh plugin --profile web remove @bananiceee/dsh-status-bar
dsh plugin --profile web add github:Starlight-bananice/dsh-status-bar#v0.2.1
```

### 禁用

- **只隐藏底栏** —— 客户端总开关（设置 → 状态栏，或齿轮快捷菜单）可立即隐藏底栏；host 侧的投影与用量账本仍继续运行。
- **完全停止插件** —— 从 profile 的 `bundles` 列表中移除（等价于下面的卸载）；重新 add 即可恢复。

### 卸载

```sh
dsh plugin --profile web remove @bananiceee/dsh-status-bar
```

卸载后内置统计行自动恢复（遮蔽单元格被释放）。**数据残留说明：** 浏览器 `localStorage`（`dsh.statusBar.v1`）与 host 侧用量文件（见 [Permissions & data](#permissions--data权限与数据)）不会自动删除——需要彻底清除时请手动删除。

## Quick start（快速上手）

1. 按上文安装并重启 DSH Web。
2. 开始一个会话——底栏默认显示：状态 · 模型 · 轮次 · 耗时 · 速度 · 缓存命中 · Token · 上下文 · TPS · 会话时长 · 任务 · 队列 · 错误。
3. 打开 **设置 → 状态栏**（设置左侧导航中名为「状态栏」的独立分区）开关/排序信息段、开启换行，或一键重置。
4. 想要费用估算？把你在用的模型加入**模型价格手册**：

   ```sh
   # 设置 → 状态栏 → 模型价格手册：
   # 模型 "deepseek-chat" → 输入 2 / 缓存读 0.5 / 缓存写 2 / 输出 8（CNY，每 1M tokens）
   # 可选：启用峰谷计价，默认使用 DeepSeek 官方时段 09:00–12:00、14:00–18:00
   ```

   底栏随即显示如 `≈¥0.0123` 的当前会话费用；该数字为**各模型用量 × 各自价格**之和（会话中途切换模型时，各段按各自价格分别计费）。点击齿轮旁的图表按钮可打开「用量与费用」弹窗（统计卡、费率卡、分页的用量历史——每页 20 条、最多 10 页，含输入/缓存命中/输出/成本列，以及可 ‹ › 翻页、按模型分色的费用趋势图）。

## Configuration（配置）

全部配置均在客户端，存于浏览器 `localStorage` 的 **`dsh.statusBar.v1`** 键下，通过设置页或输入栏齿轮菜单修改。

| 配置项 | 默认值 | 含义 |
|---|---|---|
| `enabled` | `true` | 总开关；`false` 时整条底栏隐藏 |
| `wrap` | `true` | 允许底栏在输入框宽度内换行多行显示而非截断省略（无论开关与否，底栏都不会超出输入框左右边界） |
| `segments` | 13 开 / 3 关（见下） | 已启用的信息段有序列表 |
| `cost.currency` | `CNY` | 费用显示币种（`CNY` / `USD`） |
| `cost.models` | `{}` | 用户维护的模型价格手册（模型 id → 价格 + 峰谷时段） |

**默认信息段状态：** 开启——状态、模型、轮次、耗时、速度、缓存命中、Token、上下文、TPS、会话时长、任务、队列、错误；关闭——标题、工作区、费用。

**模型价格手册条目**（新增模型时的初始值）：输入 `2`、缓存读 `0.5`、缓存写 `2`、输出 `8`（每 1M tokens，按配置币种）；默认不启用峰谷；启用时默认采用 DeepSeek 官方时段 `09:00–12:00`、`14:00–18:00`，时区 `local`。

**环境变量：** `DSH_HOME`（host 侧）——插件本地数据目录的基准路径（默认 `~/.dsh`）。无其他环境变量，无密钥，无 Token。

**信息段速查**（全部 16 个，均可开关/排序）：

| 段 | 内容 | 数据源 |
|---|---|---|
| 会话状态 | ● 运行中 / 空闲 / 出错（彩色状态点） | 会话快照 `running` / `lastAgentError` + Chat `partial` / `runningCalls` |
| 当前模型 | 最近一次响应的模型标识 | `sessionModel` 投影（host 折叠 assistant/message 事件） |
| 会话标题 | 标题或项目名（超长截断） | SessionSummary |
| 工作区 | 工作区目录名 | SessionSummary |
| 轮次与步数 | N 轮 · M 步 | `sessionStats` 投影（无投影时窗口折叠回退） |
| 模型与工具耗时 | LLM 耗时 · 工具调用耗时 | `sessionStats` |
| TTFT 与解码 | 平均首 Token · tok/s | `sessionStats` |
| 缓存命中 | 提示词缓存命中占比（两位小数，上限 99.99%） | `tokenUsage` |
| Token | 计费输入/输出总量 | `tokenUsage` |
| 上下文 | 上下文窗口占用 % | `contextPressure` |
| 实时 TPS | 当前生成速率（默认开启） | 客户端折叠会话事件窗口（`assistant/live-chunk`）；分块感知估算（约 4 字符/token + 块/角色框架开销，`block-end` 时按整块重定价，EWMA 抗突发冲刷），provider 上报用量后转为精确值；会话停止时显示 0 |
| 会话时长 | 挂钟时间，运行时走动 | `turnTimings` |
| 费用估算 | ≈¥0.0123（默认关闭） | `sessionUsage` 投影——每个模型的用量 × 其自身生效价格（平峰或峰谷，按当前时刻），跨模型求和 |
| 后台任务 | 运行中的后台任务 | `ctx.jobs` 花名册（与内置会话头部任务列表同源） |
| 队列 | 排队中的消息 | 输入框收件箱（`useInput` → `queue`） |
| 错误 | 失败/重试/超限计数（仅 >0 显示） | node 折叠 |

## Permissions & data（权限与数据）

| 类别 | 插件会触及什么 |
|---|---|
| 文件 | host 侧将用量账本写入 `<DSH_HOME>/dsh-status-bar/usage.jsonl`（默认 `~/.dsh/dsh-status-bar/usage.jsonl`；每条 assistant 消息一条记录：时间戳、模型、input/cacheRead/cacheWrite/output 四类 token 数）。内存历史为 120 天滚动窗口。 |
| 网络 | **绝无出站请求。** 唯一端点为本插件的本地 webserver 路由 `/status-bar/api/usage`（与 DSH Web 同源，`127.0.0.1`），用于向图表提供分桶数据。 |
| 凭据 | **无。** 插件从不读取、存储或传输 API 密钥、Token 或 Cookie。 |
| 用户数据 | 客户端：`localStorage["dsh.statusBar.v1"]`（底栏配置 + 价格手册，不含任何对话内容）。host 侧：上述用量账本（仅 token 计数，不含提示词、消息、文件内容）。 |

## Troubleshooting（故障排查）

| 现象 | 原因与处理 |
|---|---|
| 底栏不显示 | 总开关被关闭 → 在 设置 → 状态栏 或齿轮菜单中开启。`localStorage` 被清空？配置已重置为默认。 |
| TPS 段为 0 / 空白 | 尚无流式输出，或流处于重试间隔。每次 `llm/retry` 会重启测量窗口；首个流之后保留的速率不会再变空白。 |
| TPS 与其他插件冲突 | 设计上不存在——本插件使用自己的 `statusBarLiveTokenUsage` 键；`@linxin666/dsh-live-stats`（若加载）为自己的 UI 使用独立的 `liveTokenUsage` 键。键不同，注册表同时保留两个单元，同时启用两个插件也不会让底栏实时速度消失。 |
| 费用估算缺失 | 会话所用模型都未在价格手册中（或价格全为 0）→ 在 设置 → 状态栏 → 模型价格手册 中添加。费用按手册费率估算（逐模型、平峰或峰谷），非 provider 账单。 |
| 用量图表为空 | 该时段内还没有带 provider 用量上报的 assistant 消息，或 `DSH_HOME` 指向了别处（核对上面 `usage.jsonl` 的位置）。 |
| 升级后界面异常 | 硬刷新浏览器（客户端 bundle 可能过期），并在设置中核对插件版本。 |
| 不确定当前装的是哪个版本 | 在 profile 目录（macOS/Linux）执行：`node -p "require(process.env.HOME + '/.dsh/profiles/web/node_modules/@bananiceee/dsh-status-bar/package.json').version"`。低于 `v0.1.5`？按上面的升级步骤重装。 |

**日志位置：** 插件自身不写日志文件——host 侧诊断信息出现在 DSH web 进程输出（profile 日志）中；客户端问题可在浏览器 devtools 控制台查看。

**回滚方式：** 设置页提供一键**重置**（恢复全部默认值）。插件本体：卸载后用 `dsh plugin --profile web add <pkg>@<旧版本>` 重新安装旧版；移除插件后内置统计行始终自动恢复。

## Development（开发）

```sh
pnpm install            # devDependencies：typescript / tsdown / react / @types，以及本插件编译所依赖的 DSH 包（精确钉在 @deepseek-ai/*@0.2.0-rc.2）
pnpm run build          # host tsc → lib/，客户端声明 → lib/types/client，tsdown → lib/client.js
pnpm run typecheck:client   # 仅做客户端类型检查
pnpm run verify         # 重新构建并在提交的 lib/ 与 src/ 不一致时报错
```

自 v0.1.5 起 `lib/` 构建产物**已提交入库**，普通 git 安装开箱即用，无需构建；上面的命令用于发版前刷新产物。构建不再需要 DeepSeek Harness 源码检出：所有 `@deepseek-ai/*` 依赖包都以精确版本钉为 devDependencies，直接从本包自己的 `node_modules` 解析。host 侧为纯 TypeScript（Cordis 插件），客户端为 React + DSH client UI slots。

**保持 `lib/` 与源码同步：** 先执行 `pnpm install --frozen-lockfile`（重建必须用 `pnpm-lock.yaml` 钉住的精确工具链，可复现），再在推送前执行 `npm run verify`（`scripts/verify.sh` 会重新构建 host + client，并在提交的 `lib/` 与 `src/` 不一致时直接报错）。仓库还附带 pre-push hook，push 触及 `src/` 或构建配置时自动执行该检查——启用一次即可：

```sh
git config core.hooksPath .githooks
```

`lib-sync` GitHub Actions 工作流在 CI 中施加同样的约束：每次 push/PR 跑快速产物完整性检查；触及 `src/` 的 PR 与手动触发时跑完整"重建 vs `lib/`"漂移检查。

**贡献方式：** fork 本仓库，从 `main` 开分支，提交 PR——欢迎小而聚焦、描述清晰的改动。Bug 请在 Issues 中提交，附上 DSH 版本、浏览器与最小复现步骤。

## License & security（许可证与安全）

- **许可证：** [MIT](LICENSE)（© 2026 Starlight-bananice）。
- **安全：** 本插件不持有任何凭据、不发起任何网络调用，攻击面即为 DSH host 进程本身。如需私下报告安全问题，请使用本仓库的 GitHub **Security Advisories**（https://github.com/Starlight-bananice/dsh-status-bar/security/advisories/new）——漏洞请勿公开发 Issue。
