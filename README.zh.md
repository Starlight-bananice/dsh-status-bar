# dsh-status-bar · 一眼看清你的 agent 正在做什么

> 为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 输入栏打造的 **17 段可配置会话状态栏**。替换内置统计行，实时呈现会话状态、当前模型、上下文压力、Token 消耗、**生成速度（TPS）**、费用估算、任务与队列——两下点击即可开关与排序，卸载后内置统计行原样恢复。

[![DSH](https://img.shields.io/badge/DSH-0.1.0--rc.5-blue)](https://github.com/deepseek-ai/deepseek-harness) [![version](https://img.shields.io/badge/version-0.1.0-green)]() [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE) [![topic](https://img.shields.io/badge/topic-dsh--plugin-orange)](https://github.com/topics/dsh-plugin)

[English](README.md) · [中文](README.zh.md)

---

## Overview（概览）

**解决的问题：** DSH 输入栏只有一条固定的统计行——看不到当前模型、上下文窗口还剩多少、Token 流式生成多快、这个会话花了多少钱，更没法按自己的习惯排列这些信息。

**适合谁：** 日常重度使用 DSH 的开发者与团队——希望不离开输入栏就能掌握会话实时状态，又不想额外开一个监视器的人。

**核心能力：**

- **17 个可开关、可排序的信息段** —— 状态点、模型、标题、工作区、Agent 预设、轮次与步数、模型/工具耗时、TTFT 与解码速度、缓存命中率、Token、上下文占用、实时 TPS、会话时长、费用估算、后台任务、队列、错误
- **实时吞吐（TPS）** —— host 侧投影逐块折叠 `assistant/chunk` 事件，流式生成期间速度随分块实时刷新；无需轮询，无需外部 live-stats 插件
- **费用估算 + 用户维护的模型价格手册** —— 每个模型独立的价格与峰/谷时段，切换会话自动按该会话模型重新计价；「用量与费用」弹窗内置堆叠费用趋势图（日/周/月）
- **零配置开箱即用** —— 13 个信息段默认开启，其余勾选即得
- **干净的接管机制** —— 插件底栏以低优先级同 id 遮蔽内置 `stats` 单元格：加载期间由其渲染，卸载后内置统计行自动恢复，互不污染
- **双语界面** —— 客户端文案内置英文与中文，遵循 DSH locale 体系

## 界面预览

底栏替换内置统计行，实时呈现会话状态（状态 · 模型 · 轮次 · 上下文 · 缓存 · TPS · 会话时长 · 任务 · 队列 · 错误），通过专属设置页统一管理——含逐模型价格手册（支持峰谷计价）：

![设置页与模型价格手册](assets/screenshot-settings-page-zh.png)

| 随时开关与排序（信息段列表） | 用量与消耗弹窗（趋势图 · 统计卡 · 历史） |
|---|---|
| ![信息段列表](assets/screenshot-settings-segments.png) | ![用量与消耗弹窗](assets/screenshot-usage-cost-dialog.png) |

## Compatibility（兼容性）

| 项目 | 说明 |
|---|---|
| DSH 版本 | `0.1.0-rc.5`（mainline `master`）——更早的 RC 可能可用但未经验证 |
| 最后验证日期 | 2026-08-15 |
| 运行环境 | Node ≥ 22（host）+ 现代浏览器（client）；无外部服务依赖 |
| 共存关系 | 可与 `@linxin666/dsh-live-stats` 共存——双方都提供 `liveTokenUsage` 键，投影注册表只保留先注册者（同键单单元，不会重复显示） |

## Install / Uninstall（安装 / 卸载）

### 安装

```sh
# 从本地目录装配（profile 级；`web` 是 `--profile web` 的内置别名）
dsh plugin --profile web add ../dsh-status-bar

# 或通过 npm 包
dsh plugin --profile web add @dsh-external/dsh-status-bar

# 或免重启的运行时注入（开发流程）
#   dev_inject_plugin / dsh-super-injector → 指向本仓库
```

之后启动/重启 DSH Web 即可，无需任何配置——底栏会以默认设置出现。

### 升级

```sh
dsh plugin --profile web update @dsh-external/dsh-status-bar   # 本地目录则 update ../dsh-status-bar
```

### 禁用

- **只隐藏底栏** —— 客户端总开关（设置 → 插件 → 状态栏，或齿轮快捷菜单）可立即隐藏底栏；host 侧的投影与用量账本仍继续运行。
- **完全停止插件** —— 从 profile 的 `bundles` 列表中移除（等价于下面的卸载）；重新 add 即可恢复。

### 卸载

```sh
dsh plugin --profile web remove @dsh-external/dsh-status-bar
```

卸载后内置统计行自动恢复（遮蔽单元格被释放）。**数据残留说明：** 浏览器 `localStorage`（`dsh.statusBar.v1`）与 host 侧用量文件（见 [Permissions & data](#permissions--data权限与数据)）不会自动删除——需要彻底清除时请手动删除。

## Quick start（快速上手）

1. 按上文安装并重启 DSH Web。
2. 开始一个会话——底栏默认显示：状态 · 模型 · 轮次 · 耗时 · 速度 · 缓存命中 · Token · 上下文 · TPS · 会话时长 · 任务 · 队列 · 错误。
3. 打开 **设置 → 插件 → 状态栏** 开关/排序信息段、开启换行，或一键重置。
4. 想要费用估算？把你在用的模型加入**模型价格手册**：

   ```sh
   # 设置 → 插件 → 状态栏 → 模型价格手册：
   # 模型 "deepseek-chat" → 输入 2 / 缓存读 0.5 / 缓存写 2 / 输出 8（CNY，每 1M tokens）
   # 可选：启用峰谷计价，默认使用 DeepSeek 官方时段 09:00–12:00、14:00–18:00
   ```

   底栏随即显示如 `≈¥0.0123` 的当前会话费用，切换会话/模型时自动重新计价。点击齿轮旁的图表按钮可打开「用量与费用」弹窗（统计卡、费率卡、分页用量历史、可 ‹ › 翻页的费用趋势图）。

## Configuration（配置）

全部配置均在客户端，存于浏览器 `localStorage` 的 **`dsh.statusBar.v1`** 键下，通过设置页或输入栏齿轮菜单修改。

| 配置项 | 默认值 | 含义 |
|---|---|---|
| `enabled` | `true` | 总开关；`false` 时整条底栏隐藏 |
| `wrap` | `false` | 允许底栏换行多行显示而非截断省略 |
| `segments` | 13 开 / 4 关（见下） | 已启用的信息段有序列表 |
| `cost.currency` | `CNY` | 费用显示币种（`CNY` / `USD`） |
| `cost.models` | `{}` | 用户维护的模型价格手册（模型 id → 价格 + 峰谷时段） |

**默认信息段状态：** 开启——状态、模型、轮次、耗时、速度、缓存命中、Token、上下文、TPS、会话时长、任务、队列、错误；关闭——标题、工作区、Agent 预设、费用。

**模型价格手册条目**（新增模型时的初始值）：输入 `2`、缓存读 `0.5`、缓存写 `2`、输出 `8`（每 1M tokens，按配置币种）；默认不启用峰谷；启用时默认采用 DeepSeek 官方时段 `09:00–12:00`、`14:00–18:00`，时区 `local`。

**环境变量：** `DSH_HOME`（host 侧）——插件本地数据目录的基准路径（默认 `~/.dsh`）。无其他环境变量，无密钥，无 Token。

**信息段速查**（全部 17 个，均可开关/排序）：

| 段 | 内容 | 数据源 |
|---|---|---|
| 会话状态 | ● 运行中 / 空闲 / 出错（彩色状态点） | snapshot `running` / `partial` / `lastAgentError` |
| 当前模型 | 最近一次响应的模型标识 | `sessionModel` 投影（host 折叠 assistant/message 事件） |
| 会话标题 | 标题或项目名（超长截断） | SessionSummary |
| 工作区 | 工作区目录名 | SessionSummary |
| Agent 预设 | 预设名 | SessionSummary |
| 轮次与步数 | N 轮 · M 步 | `sessionStats` 投影（无投影时窗口折叠回退） |
| 模型与工具耗时 | LLM 耗时 · 工具调用耗时 | `sessionStats` |
| TTFT 与解码 | 平均首 Token · tok/s | `sessionStats` |
| 缓存命中 | 提示词缓存命中占比（两位小数，上限 99.99%） | `tokenUsage` |
| Token | 计费输入/输出总量 | `tokenUsage` |
| 上下文 | 上下文窗口占用 % | `contextPressure` |
| 实时 TPS | 当前生成速率（默认开启） | `liveTokenUsage` 投影——实时折叠 `assistant/chunk`；分块感知估算（约 4 字符/token + 块/角色框架开销，`block-end` 时按整块重定价，EWMA 抗突发冲刷），provider 上报用量后转为精确值；会话停止时显示 0 |
| 会话时长 | 挂钟时间，运行时走动 | `turnTimings` |
| 费用估算 | ≈¥0.0123（默认关闭） | `tokenUsage` × 该模型生效价格 |
| 后台任务 | 运行中的后台任务 | `jobsBySession` |
| 队列 | 排队中的消息 | snapshot `queue` |
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
| 底栏不显示 | 总开关被关闭 → 在 设置 → 插件 → 状态栏 或齿轮菜单中开启。`localStorage` 被清空？配置已重置为默认。 |
| TPS 段为 0 / 空白 | 尚无流式输出，或流处于重试间隔。每次 `llm/retry` 会重启测量窗口；首个流之后保留的速率不会再变空白。 |
| TPS 与其他插件冲突 | 若同时加载 `@linxin666/dsh-live-stats`，注册表保留先注册者对 `liveTokenUsage` 键的占用——同键单单元，不会出现重复行。 |
| 费用估算缺失 | 模型不在价格手册中 → 在 设置 → 插件 → 状态栏 → 模型价格手册 中添加。费用按手册固定费率估算，非 provider 账单。 |
| 用量图表为空 | 该时段内还没有带 provider 用量上报的 assistant 消息，或 `DSH_HOME` 指向了别处（核对上面 `usage.jsonl` 的位置）。 |
| 升级后界面异常 | 硬刷新浏览器（客户端 bundle 可能过期），并在设置中核对插件版本。 |

**日志位置：** 插件自身不写日志文件——host 侧诊断信息出现在 DSH web 进程输出（profile 日志）中；客户端问题可在浏览器 devtools 控制台查看。

**回滚方式：** 设置页提供一键**重置**（恢复全部默认值）。插件本体：卸载后用 `dsh plugin --profile web add <pkg>@<旧版本>` 重新安装旧版；移除插件后内置统计行始终自动恢复。

## Development（开发）

```sh
npm run build          # junction 链接 + host tsc + 客户端类型检查
npm run build:client   # tsdown → lib/client.js（ModuleLoader bundle）
```

构建需要 `DSH_CHECKOUT`（或公共路径探测）指向 dsh 源码检出；客户端类型检查通过 junction 链接解析到检出目录的 `lib/types`。host 侧为纯 TypeScript（Cordis 插件），客户端为 React + DSH client UI slots。

**贡献方式：** fork 本仓库，从 `main` 开分支，提交 PR——欢迎小而聚焦、描述清晰的改动。Bug 请在 Issues 中提交，附上 DSH 版本、浏览器与最小复现步骤。

## License & security（许可证与安全）

- **许可证：** [MIT](LICENSE)（© 2026 Starlight-bananice）。
- **安全：** 本插件不持有任何凭据、不发起任何网络调用，攻击面即为 DSH host 进程本身。如需私下报告安全问题，请使用本仓库的 GitHub **Security Advisories**（https://github.com/Starlight-bananice/dsh-status-bar/security/advisories/new）——漏洞请勿公开发 Issue。
