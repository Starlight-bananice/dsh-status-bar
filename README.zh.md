# dsh-status-bar · DSH 底栏管理插件

可配置的会话状态栏（`conversation.composer.dock`），替换内置统计行，提供
17 个可开关、可排序的统计段，并带管理设置页与输入栏快速开关菜单。

- 混合插件：底栏为前端渲染（配置存 `localStorage`，键 `dsh.statusBar.v1`）；
  host 侧注册 `sessionModel` 与 `liveTokenUsage` 投影、用量账本与用量图表 API
- 替换方式为**低优先级同 id 遮蔽**：插件存活期间接管 `stats` 单元格，
  卸载插件后内置统计行自动恢复，互不污染

## 安装

```sh
# 从本地目录装配（profile 级）
dsh plugin --profile web add ../dsh-status-bar
# 或运行时注入（免重启）
# dev_inject_plugin / dsh-super-injector → 路径指向本仓库
```

## 统计段（17 个，全部可开关/排序）

| 段 | 内容 | 数据源 |
|---|---|---|
| 会话状态 | ● 运行中 / 空闲 / 出错（彩色状态点） | snapshot `running` / `partial` / `lastAgentError` |
| 当前模型 | 最近一次响应的模型标识 | `sessionModel` 投影（host 折叠 assistant/message 事件） |
| 会话标题 | 标题或项目名（超长截断） | SessionSummary |
| 工作区 | 工作区目录名 | SessionSummary |
| Agent 预设 | 预设名 | SessionSummary |
| 轮次与步数 | N 轮 · M 步 | `sessionStats` 投影（无投影时窗口折叠回退） |
| 模型与工具耗时 | LLM 耗时 · 工具调用耗时 | `sessionStats` |
| 首 token 与解码速度 | 首 token 平均 · tok/s | `sessionStats` |
| 缓存命中率 | 输入中缓存命中占比（两位小数，上限 99.99%） | `tokenUsage` |
| 输入/输出 Token | 累计计费输入/输出 | `tokenUsage` |
| 上下文占用 | 上下文窗口占用 % | `contextPressure` |
| 吞吐 TPS | 实时生成速率（默认开） | `liveTokenUsage` 投影（本插件 host 折叠流式 chunk 实时估算，provider 上报用量后转精确；空闲保持最近一次速率） |
| 会话用时 | 墙钟时间，运行中每秒跳动 | `turnTimings` |
| 费用估算 | ≈¥0.0123（默认关） | `tokenUsage` × 当前模型有效单价 |
| 后台任务 | 运行中任务数 | `jobsBySession` |
| 队列 | 等待处理消息数 | snapshot `queue` |
| 错误与重试 | 失败/重试/超限计数（>0 才显示） | 节点折叠 |

默认开启：状态 / 轮次步数 / 模型 / 上下文 / 耗时 / 速度 / 缓存 / Token /
TPS / 会话用时 / 后台任务 / 队列 / 错误。费用默认关闭。

## 费用估算（模型价格库）

- **手动维护**：在 设置 → 状态栏 → 模型价格库 中添加你使用的模型
  （可多个），每个模型单独填写每 1M token 的输入/缓存命中/缓存写入/输出
  单价，并独立配置峰谷时段（时区、多个时段、峰/谷三档价格）。
- **消耗计算**：token 用量来自每次 API 返回结果（`tokenUsage` 投影与
  节点级 usage），费用 = 用量 × 该模型单价；会话切换时自动按当前会话
  的模型计价。
- **用量弹窗**：输入栏设置齿轮旁新增「用量与消耗」按钮——弹出当前会话
  明细：估算总成本、输入/缓存/输出/命中率/上下文用量卡、当前模型单价卡、
  以及最近步骤的使用历史表（时间/模型/输入/输出/成本，每页 15 条翻页）。
- **消耗趋势图**：弹窗中部堆叠柱状图，按模型分色展示消耗；可切换
  **当天（24 小时）/ 本周（7 天）/ 本月（每天）**，并支持 ‹ › 查看
  之前的周期（昨天/上周/上月）。数据由 host 端订阅 `session/event`
  事件流聚合，**持久化到插件本地数据目录 `~/.dsh/dsh-status-bar/usage.jsonl`**，
  重启不丢失；费用按模型价格库的平峰价估算。

## 吞吐 TPS（live states）

TPS 段读取 `liveTokenUsage` 投影——由本插件 host 侧经 DSH 会话投影注册表
（host → 浏览器的 live-state 通道）实时提供：

- host 折叠每一条已提交的 `assistant/chunk` 事件，流式生成期间每个 chunk
  都会更新速率（无需轮询，也不依赖外部 live-stats 插件）；底栏显示每
  0.5 秒最多刷新一次
- provider 上报用量前按约 4 字符/token 估算；流中 `usage` chunk 到达后
  转为精确值
- 速率 = 自该流首个输出 token 起的累计平均值；空闲时保持最近一次速率，
  首个流之后该段不会空白；agent 循环重试被卡住的流（`llm/retry` 标记）
  时会重置测量窗口，卡在重试循环里不会让数值一直虚高
- 若同时加载 `@linxin666/dsh-live-stats`：两者共用 `liveTokenUsage` 键，
  会话投影注册表保留先注册者（同键单单元），不会出现重复行

## 管理界面

1. **设置 → 插件 → 状态栏**：总开关、换行开关、17 段勾选 + ↑↓ 排序、
   费用单价（币种 + 4 个每 1M token 价格）、示例预览、恢复默认。
2. **输入栏右侧齿轮按钮**：就地快速开关任意段与总开关，无需进入设置；
   旁边的图表按钮打开「用量与消耗」弹窗。
3. 无数据的段自动隐藏（如从未测得速率时 TPS 段隐藏；无任务时任务段消失）。

## 开发

```sh
npm run build          # junction 链接 + host tsc + client 类型检查
npm run build:client   # tsdown → lib/client.js（ModuleLoader 包）
```

构建依赖 `DSH_CHECKOUT`（或常见路径探测）指向 dsh 源码 checkout；
client 类型检查通过 junction 链接到 checkout 的 `lib/types` 完成。

## 许可

MIT
