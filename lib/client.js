window.__ModuleLoader__.load({
	id: "@bananiceee/dsh-status-bar",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/**
		* status-bar dictionaries. zh is the key-set source of truth; en is checked
		* complete against it. The namespace merges into LocaleNamespaceMap so the
		* framework synthesizes the `t` seat for registered entries.
		*/
		const NS = "status-bar";
		const zh = {
			nav: "状态栏",
			"section.intro": "管理对话输入区下方的底栏：选择要显示的统计段、调整顺序，或配置费用估算单价。默认状态栏会替换内置统计行；卸载插件后内置统计行自动恢复。",
			"section.enabled": "启用状态栏",
			"section.enabledHint": "关闭后底栏整体隐藏（内置统计行仍被本插件接管）。",
			"section.wrap": "允许换行",
			"section.wrapHint": "开启后统计段自动折行显示完整内容；关闭时单行省略，悬停查看全文。",
			"section.segments": "统计段",
			"section.segmentsHint": "勾选显示、取消隐藏；↑↓ 调整顺序。无数据的段会自动隐藏。",
			"section.cost": "费用估算",
			"section.costHint": "按 token 用量 × 单价估算会话花费，仅作参考。",
			"section.currency": "币种",
			"section.source.peak": "峰时价",
			"section.source.offpeak": "谷时价",
			"section.priceInput": "输入（未命中缓存）",
			"section.priceCacheRead": "缓存命中",
			"section.priceCacheWrite": "缓存写入（可选）",
			"modelBook.cacheWriteHint": "缓存写入价仅供 Anthropic、Gemini 等按写入单独计费的提供方；DeepSeek 等不单独收取，保持 0 即可。",
			"section.priceOutput": "输出",
			"section.peakOffpeak": "启用峰谷计价",
			"section.peakOffpeakHint": "按所选时区与峰谷时段，对该模型的输入/输出/缓存命中价格采用峰/谷两档；缓存写入仍使用平峰价。DeepSeek 现行规则：北京时间周一至周五 09:00–12:00、14:00–18:00 为峰时，其余时段（含周末、法定节假日、调休休息日全天）为谷时；谷时价为峰时价的一半。",
			"section.presetDeepseek": "套用 DeepSeek 官方规则",
			"section.dayRules": "按工作日/节假日区分峰谷",
			"section.dayRulesHint": "开启后：周末与法定节假日、调休休息日全天按谷时计价，峰时时段只在工作日生效；需要下方节假日日历保持最新。",
			"section.dayRulesOff": "已关闭：仅按上方的时钟时段判断峰谷，不考虑星期与节假日（旧版行为）。",
			"section.weekendOffpeak": "周末全天按谷时",
			"section.holidayOffpeak": "法定节假日与调休休息日全天按谷时",
			"section.calendarTitle": "节假日日历",
			"section.calendarHint": "DeepSeek 按中国法定节假日与国务院调休安排判定工作日，每年由国务院另行公布，因此插件不会把日期写死：一键拉取当年日历并缓存在本地，失效时可手动改。调休上班的周末、法定节假日全天都按谷时计价。",
			"section.autoFetch": "自动获取并缓存节假日日历",
			"section.addWindow": "增加峰谷时段",
			"section.removeWindow": "删除该时段",
			"section.timezone": "时区",
			"section.zoneLocal": "本地时间",
			"section.peakWindowStart": "峰时开始",
			"section.peakWindowEnd": "峰时结束",
			"section.peakPrices": "峰时价格",
			"section.offpeakPrices": "谷时价格",
			"section.peak": "峰时",
			"section.offpeak": "谷时",
			"section.peakNext": "{time} 起转峰时",
			"section.offpeakNext": "{time} 起转谷时",
			"reason.peak": "峰时时段",
			"reason.night": "非峰时时段",
			"reason.weekend": "周末",
			"reason.holiday": "法定节假日",
			"reason.customOff": "手动设为休息日",
			"reason.customWork": "调休上班日",
			"cal.workday": "工作日",
			"cal.weekend": "周末",
			"cal.holiday": "节假日",
			"cal.wd0": "周日",
			"cal.wd1": "周一",
			"cal.wd2": "周二",
			"cal.wd3": "周三",
			"cal.wd4": "周四",
			"cal.wd5": "周五",
			"cal.wd6": "周六",
			"cal.loaded": "已缓存 {years} 年日历 · 更新于 {time}",
			"cal.loading": "获取中…",
			"cal.never": "未获取",
			"cal.disabled": "已关闭自动获取",
			"cal.refresh": "刷新日历",
			"cal.error": "日历获取失败：{error}——已回退为仅按星期判断，可在下方手动补充日期。",
			"cal.overrideDate": "日期",
			"cal.overrideKind": "按什么算",
			"cal.overrideNote": "备注（可选）",
			"cal.overrideNotePlaceholder": "如：公司调休",
			"cal.overrideAdd": "添加例外",
			"cal.overrideEmpty": "暂无手动例外——上面的日历已覆盖周末与法定节假日。",
			"cal.overrideRemove": "删除 {date} 的例外",
			"cal.kindOff": "休息日（谷时）",
			"cal.kindWork": "工作日（峰时）",
			"cal.kindAuto": "恢复日历默认",
			"section.reset": "恢复默认",
			"section.preview": "预览（示例数据）",
			"modelBook.title": "模型价格库",
			"modelBook.hint": "添加你使用的模型并填写单价（每 1M token）；每个模型可单独设置峰谷时段与价格。底栏费用段与用量弹窗按当前会话的模型自动选用对应价格。",
			"modelBook.current": "当前会话",
			"modelBook.remove": "删除 {model}",
			"modelBook.addLabel": "新模型",
			"modelBook.add": "添加",
			"modelBook.empty": "尚未添加模型——输入模型名（如 deepseek-flash）后点击添加。",
			"modelBook.currentModel": "当前会话使用：{model}",
			"modelBook.unconfigured": "未在价格库中配置，费用段将隐藏",
			"usage.title": "用量与消耗",
			"usage.subtitle": "当前会话的用量与费用明细（token 用量来自每次 API 返回结果）",
			"usage.close": "关闭",
			"usage.totalCost": "估算总成本",
			"usage.unknownModel": "发送消息后显示模型与费用估算",
			"usage.unconfigured": "模型 {model} 尚未配置价格——请在 设置 → 状态栏 中添加",
			"usage.addDefault": "用默认价添加",
			"usage.input": "输入",
			"usage.inputHint": "未命中缓存 + 缓存命中 + 缓存写入",
			"usage.cacheRead": "缓存命中",
			"usage.cacheWrite": "缓存写入",
			"usage.output": "输出",
			"usage.cacheHitRate": "缓存命中率",
			"usage.context": "上下文占用",
			"usage.prices": "{model} 单价（每 1M token）",
			"usage.pIn": "输入",
			"usage.pCache": "缓存命中",
			"usage.pOut": "输出",
			"usage.flat": "平峰价",
			"usage.history": "使用历史",
			"usage.historyHint": "最近步骤的提供方报告用量（每步按当时所用模型的价格估算成本）",
			"usage.time": "时间",
			"usage.model": "模型",
			"usage.cost": "成本",
			"usage.empty": "暂无带用量报告的步骤。",
			"usage.prev": "上一页",
			"chart.title": "消耗趋势（按模型细分）",
			"chart.day": "当天",
			"chart.week": "本周",
			"chart.month": "本月",
			"chart.prev": "上一周期",
			"chart.next": "下一周期",
			"chart.loading": "加载中…",
			"chart.empty": "该周期暂无用量记录。",
			"chart.fail": "加载失败：{error}",
			"chart.retry": "重试",
			"chart.unpriced": "未配置价格",
			"usage.next": "下一页",
			"usage.page": "第 {current} / {total} 页",
			"seg.status": "会话状态",
			"seg.statusHint": "运行中 / 空闲 / 出错 状态点与文字。",
			"seg.model": "当前模型",
			"seg.modelHint": "最近一次响应的模型标识。",
			"seg.title": "会话标题",
			"seg.titleHint": "当前会话的标题或项目名。",
			"seg.workspace": "工作区",
			"seg.workspaceHint": "当前会话的工作区目录名。",
			"seg.agent": "Agent 预设",
			"seg.agentHint": "当前会话使用的 Agent 预设名。",
			"seg.counts": "轮次与步数",
			"seg.countsHint": "会话总轮次与执行步数。",
			"seg.durations": "模型与工具耗时",
			"seg.durationsHint": "LLM 与工具调用的累计墙钟时间。",
			"seg.speeds": "首 token 与解码速度",
			"seg.speedsHint": "首 token 平均延迟与解码速率。",
			"seg.cacheHit": "缓存命中率",
			"seg.cacheHitHint": "提示词输入中缓存命中的占比。",
			"seg.tokens": "输入/输出 Token",
			"seg.tokensHint": "累计计费输入与输出 token 数。",
			"seg.context": "上下文占用",
			"seg.contextHint": "当前上下文窗口占用百分比。",
			"seg.tps": "吞吐 TPS",
			"seg.tpsHint": "实时生成速率，会话停止时显示 0。",
			"seg.sessionTime": "会话用时",
			"seg.sessionTimeHint": "从第一轮开始到现在的墙钟时间，运行中每秒跳动。",
			"seg.cost": "费用估算",
			"seg.costHint": "按下方单价估算的累计花费，默认关闭。",
			"seg.jobs": "后台任务",
			"seg.jobsHint": "当前会话正在运行的后台任务数。",
			"seg.queue": "队列",
			"seg.queueHint": "等待处理的消息数。",
			"seg.errors": "错误与重试",
			"seg.errorsHint": "失败步骤、模型重试与超限提醒计数，仅在大于 0 时显示。",
			"bar.status.running": "运行中",
			"bar.status.idle": "空闲",
			"bar.status.error": "出错",
			"bar.counts": "{turns} 轮 · {steps} 步",
			"bar.llm": "LLM {duration}",
			"bar.toolCall": "工具调用 {duration}",
			"bar.ttftAverage": "首 token 平均 {duration}",
			"bar.decodeSpeed": "{throughput} tok/s",
			"bar.cacheHit": "缓存命中 {percent}%",
			"bar.tokens": "输入 {input} tok · 输出 {output} tok",
			"bar.context": "上下文 {percent}%",
			"bar.tps": "TPS {throughput} tok/s",
			"bar.sessionTime": "用时 {duration}",
			"bar.cost": "≈{cost}",
			"bar.jobs": "后台任务 {count}",
			"bar.queue": "队列 {count}",
			"bar.errors": "错误 {count}",
			"quick.title": "底栏显示设置",
			"quick.master": "启用状态栏",
			"quick.reset": "恢复默认",
			"preview.line": "2 轮 · 51 步 | deepseek-flash | 上下文 62% | 缓存命中 98% | TPS 123 tok/s"
		};
		const en = {
			nav: "Status Bar",
			"section.intro": "Manage the status band under the composer: choose which segments to show, reorder them, or configure cost-estimate prices. The default bar replaces the built-in stats line; unloading the plugin restores it automatically.",
			"section.enabled": "Enable status bar",
			"section.enabledHint": "Hides the whole bar when off (the built-in stats cell stays taken over).",
			"section.wrap": "Allow wrapping",
			"section.wrapHint": "Segments wrap onto multiple lines when on; a single elided line with hover tooltip when off.",
			"section.segments": "Segments",
			"section.segmentsHint": "Check to show, uncheck to hide; use ↑↓ to reorder. Segments without data hide automatically.",
			"section.cost": "Cost estimate",
			"section.costHint": "Rough session spend = token usage × prices.",
			"section.currency": "Currency",
			"section.source.peak": "Peak rate",
			"section.source.offpeak": "Off-peak rate",
			"section.priceInput": "Input (uncached)",
			"section.priceCacheRead": "Cache hit",
			"section.priceCacheWrite": "Cache write (optional)",
			"modelBook.cacheWriteHint": "Cache-write rates are only billed by providers like Anthropic and Gemini; DeepSeek etc. do not charge separately — keep 0.",
			"section.priceOutput": "Output",
			"section.peakOffpeak": "Peak/off-peak billing",
			"section.peakOffpeakHint": "Apply this model's peak/off-peak input, cache-hit & output rates in its timezone; cache-write stays at the flat rate. DeepSeek's current rule: 09:00–12:00 and 14:00–18:00 Beijing time on Mon–Fri are peak, everything else — nights, weekends, statutory holidays and 调休 rest days — is off-peak at half the peak rate.",
			"section.presetDeepseek": "Apply DeepSeek official rules",
			"section.dayRules": "Split peak/off-peak by working day vs holiday",
			"section.dayRulesHint": "When on: weekends, statutory holidays and 调休 rest days bill off-peak all day, and peak windows only apply on working days. Requires the holiday calendar below to stay current.",
			"section.dayRulesOff": "Off: peak/off-peak follows the clock windows above only — no weekday or holiday awareness (the old behavior).",
			"section.weekendOffpeak": "Weekends are off-peak all day",
			"section.holidayOffpeak": "Statutory holidays & 调休 rest days are off-peak all day",
			"section.calendarTitle": "Holiday calendar",
			"section.calendarHint": "DeepSeek decides working days from Chinese statutory holidays and the State Council's 调休 (make-up workday) schedule, which is re-announced every year — so no dates are hard-coded here: fetch the current calendar into a local cache, and edit it by hand whenever it drifts. Weekends that are 调休 workdays and holidays in full are billed off-peak.",
			"section.autoFetch": "Fetch and cache the holiday calendar automatically",
			"section.addWindow": "Add peak window",
			"section.removeWindow": "Remove this window",
			"section.timezone": "Timezone",
			"section.zoneLocal": "Local time",
			"section.peakWindowStart": "Peak starts",
			"section.peakWindowEnd": "Peak ends",
			"section.peakPrices": "Peak rates",
			"section.offpeakPrices": "Off-peak rates",
			"section.peak": "Peak",
			"section.offpeak": "Off-peak",
			"section.peakNext": "peak from {time}",
			"section.offpeakNext": "off-peak from {time}",
			"reason.peak": "peak window",
			"reason.night": "outside peak windows",
			"reason.weekend": "weekend",
			"reason.holiday": "public holiday",
			"reason.customOff": "marked as a rest day",
			"reason.customWork": "调休 make-up workday",
			"cal.workday": "Workday",
			"cal.weekend": "Weekend",
			"cal.holiday": "Holiday",
			"cal.wd0": "Sun",
			"cal.wd1": "Mon",
			"cal.wd2": "Tue",
			"cal.wd3": "Wed",
			"cal.wd4": "Thu",
			"cal.wd5": "Fri",
			"cal.wd6": "Sat",
			"cal.loaded": "Cached calendar for {years} · updated {time}",
			"cal.loading": "Fetching…",
			"cal.never": "never",
			"cal.disabled": "Automatic fetching is off",
			"cal.refresh": "Refresh calendar",
			"cal.error": "Calendar fetch failed: {error} — falling back to the weekday rule; add dates by hand below.",
			"cal.overrideDate": "Date",
			"cal.overrideKind": "Treat as",
			"cal.overrideNote": "Note (optional)",
			"cal.overrideNotePlaceholder": "e.g. company 调休",
			"cal.overrideAdd": "Add exception",
			"cal.overrideEmpty": "No manual exceptions — the calendar above already covers weekends and public holidays.",
			"cal.overrideRemove": "Remove the exception for {date}",
			"cal.kindOff": "Rest day (off-peak)",
			"cal.kindWork": "Workday (peak)",
			"cal.kindAuto": "Use the calendar default",
			"section.reset": "Reset to defaults",
			"section.preview": "Preview (sample data)",
			"modelBook.title": "Model price book",
			"modelBook.hint": "Add the models you use and fill in their rates (per 1M tokens); each model has its own peak/off-peak schedule. The bar cost segment and the usage dialog pick the current session model automatically.",
			"modelBook.current": "current session",
			"modelBook.remove": "Remove {model}",
			"modelBook.addLabel": "New model",
			"modelBook.add": "Add",
			"modelBook.empty": "No models yet — type a model id (e.g. deepseek-flash) and press Add.",
			"modelBook.currentModel": "Current session uses: {model}",
			"modelBook.unconfigured": "not in the price book; the cost segment hides",
			"usage.title": "Usage & cost",
			"usage.subtitle": "Token usage of this conversation and its estimated cost (usage comes from each API response)",
			"usage.close": "Close",
			"usage.totalCost": "Estimated total cost",
			"usage.unknownModel": "Model and cost will appear after the first message",
			"usage.unconfigured": "Model {model} has no price configured — add it in Settings → Status Bar",
			"usage.addDefault": "Add at default rates",
			"usage.input": "Input",
			"usage.inputHint": "uncached + cache hit + cache write",
			"usage.cacheRead": "Cache hit",
			"usage.cacheWrite": "Cache write",
			"usage.output": "Output",
			"usage.cacheHitRate": "Cache hit rate",
			"usage.context": "Context",
			"usage.prices": "{model} rates (per 1M tokens)",
			"usage.pIn": "Input",
			"usage.pCache": "Cache hit",
			"usage.pOut": "Output",
			"usage.flat": "Flat rate",
			"usage.history": "Usage history",
			"usage.historyHint": "Provider-reported usage of recent steps (each step priced at its own model's rates)",
			"usage.time": "Time",
			"usage.model": "Model",
			"usage.cost": "Cost",
			"usage.empty": "No steps with reported usage yet.",
			"usage.prev": "Previous",
			"chart.title": "Cost trend (by model)",
			"chart.day": "Day",
			"chart.week": "Week",
			"chart.month": "Month",
			"chart.prev": "Previous period",
			"chart.next": "Next period",
			"chart.loading": "Loading…",
			"chart.empty": "No usage recorded in this period.",
			"chart.fail": "Load failed: {error}",
			"chart.retry": "Retry",
			"chart.unpriced": "no price configured",
			"usage.next": "Next",
			"usage.page": "Page {current} / {total}",
			"seg.status": "Session status",
			"seg.statusHint": "Running / idle / error dot and label.",
			"seg.model": "Current model",
			"seg.modelHint": "Model identity of the latest response.",
			"seg.title": "Session title",
			"seg.titleHint": "Title or project name of the current session.",
			"seg.workspace": "Workspace",
			"seg.workspaceHint": "Workspace directory name of the current session.",
			"seg.agent": "Agent preset",
			"seg.agentHint": "Agent preset the current session runs on.",
			"seg.counts": "Turns & steps",
			"seg.countsHint": "Total turns and executed steps.",
			"seg.durations": "Model & tool time",
			"seg.durationsHint": "Cumulative wall time of LLM calls and tool calls.",
			"seg.speeds": "TTFT & decode speed",
			"seg.speedsHint": "Average first-token latency and decode rate.",
			"seg.cacheHit": "Cache hit rate",
			"seg.cacheHitHint": "Share of prompt input served from the cache.",
			"seg.tokens": "Input/output tokens",
			"seg.tokensHint": "Billed input and output token totals.",
			"seg.context": "Context occupancy",
			"seg.contextHint": "Percent of the context window in use.",
			"seg.tps": "Throughput TPS",
			"seg.tpsHint": "Live generation rate; 0 when idle.",
			"seg.sessionTime": "Session time",
			"seg.sessionTimeHint": "Wall time since the first turn; ticks each second while running.",
			"seg.cost": "Cost estimate",
			"seg.costHint": "Estimated cumulative spend at the prices below; off by default.",
			"seg.jobs": "Background jobs",
			"seg.jobsHint": "Background jobs still running for this session.",
			"seg.queue": "Queue",
			"seg.queueHint": "Messages waiting to be processed.",
			"seg.errors": "Errors & retries",
			"seg.errorsHint": "Failed steps, model retries, and over-limit notices; shown only above zero.",
			"bar.status.running": "Running",
			"bar.status.idle": "Idle",
			"bar.status.error": "Error",
			"bar.counts": "{turns} turns · {steps} steps",
			"bar.llm": "LLM {duration}",
			"bar.toolCall": "Tool call {duration}",
			"bar.ttftAverage": "TTFT avg {duration}",
			"bar.decodeSpeed": "{throughput} tok/s",
			"bar.cacheHit": "Cache hit {percent}%",
			"bar.tokens": "Input {input} tok · Output {output} tok",
			"bar.context": "Context {percent}%",
			"bar.tps": "TPS {throughput} tok/s",
			"bar.sessionTime": "Elapsed {duration}",
			"bar.cost": "≈{cost}",
			"bar.jobs": "Jobs {count}",
			"bar.queue": "Queue {count}",
			"bar.errors": "Errors {count}",
			"quick.title": "Status bar display",
			"quick.master": "Enable status bar",
			"quick.reset": "Reset to defaults",
			"preview.line": "2 turns · 51 steps | deepseek-flash | Context 62% | Cache hit 98% | TPS 123 tok/s"
		};
		/** Trailing measurement window of the estimated branch, in stream-time ms. */
		const RATE_WINDOW_MS = 1500;
		/** The idle state every settle lands on (window dropped, rate reported as 0). */
		function settled() {
			return {
				turn: null,
				step: null,
				firstOutputTime: null,
				latestOutputTime: null,
				samples: [],
				outputTokens: 0,
				tokensPerSecond: 0,
				blocks: [],
				pricedTokens: 0,
				pricedBlocks: 0,
				exact: false
			};
		}
		/** Fresh state before any output: no rate measured yet (the segment hides). */
		function idle() {
			return {
				...settled(),
				tokensPerSecond: null
			};
		}
		/** The current stream is the one tracked by the fold state. */
		function isTracked(state, turn, step) {
			return state.turn === turn && state.step === step;
		}
		/** Provider-reported output tokens, guarded the way the stats fold guards node usage. */
		function usageOutputTokens(usage) {
			if (usage === void 0) return null;
			const value = usage.outputTokens;
			return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
		}
		/**
		* Append one sample and drop everything that fell out of the trailing window,
		* keeping exactly one sample at or before the cutoff as the window base (the
		* rate then divides real tokens by real elapsed time across the whole window).
		*/
		function pushSample(samples, sample) {
			const next = [...samples, sample];
			const cutoff = sample.time - RATE_WINDOW_MS;
			let base = 0;
			while (base + 2 < next.length && (next[base + 1]?.time ?? Number.POSITIVE_INFINITY) <= cutoff) base += 1;
			return base === 0 ? next : next.slice(base);
		}
		/**
		* Estimated generation rate over the trailing window: real accumulated tokens
		* over real elapsed stream time, so the figure does not depend on how finely
		* the host forwarded the stream. Falls back to the whole stream while the
		* window is younger than MIN_SPAN_MS; returns the carried rate when the
		* available stamps carry no elapsed time at all (a single-timestamp burst).
		*/
		function windowRate(samples, firstOutputTime, outputTokens, nowTime, carried) {
			const base = samples[0];
			let tokens = base === void 0 ? outputTokens : outputTokens - base.tokens;
			let span = base === void 0 ? 0 : nowTime - base.time;
			if (span < 250) {
				tokens = outputTokens;
				span = nowTime - firstOutputTime;
			}
			if (span <= 0) return carried;
			return Math.round(tokens * 1e3 / span * 10) / 10;
		}
		/** Window average for the exact branch: real tokens over real elapsed time, span-floored. */
		function spanRateOf(outputTokens, firstTime, nowTime) {
			const span = Math.max(nowTime - firstTime, 250);
			return Math.round(outputTokens * 1e3 / span * 10) / 10;
		}
		const MAX_UNKNOWN_BLOCK_CHARS = 4096;
		function estimateTextBlockTokens(characters) {
			return Math.ceil(characters / 4) + 4;
		}
		function estimateToolCallBlockTokens(nameCharacters, argumentCharacters) {
			return Math.ceil(nameCharacters / 4) + Math.ceil(argumentCharacters / 4) + 4;
		}
		function estimateUnknownBlockTokens(block) {
			const serialized = JSON.stringify(block);
			const length = serialized.length > MAX_UNKNOWN_BLOCK_CHARS ? MAX_UNKNOWN_BLOCK_CHARS : serialized.length;
			return 4 + Math.ceil(length / 4);
		}
		function estimateContentTokens(blocks) {
			let tokens = 0;
			for (const block of blocks) switch (block.type) {
				case "text":
				case "reasoning":
					tokens += estimateTextBlockTokens(block.text.length);
					break;
				case "tool-call":
					tokens += estimateToolCallBlockTokens(block.name.length, block.arguments.length);
					break;
				default: tokens += estimateUnknownBlockTokens(block);
			}
			return tokens;
		}
		/** Per-block estimate of one priced slot (what `write` diffs against). */
		function blockEstimate(block) {
			switch (block.kind) {
				case "text":
				case "reasoning": return estimateTextBlockTokens(block.characters);
				case "tool-call": return estimateToolCallBlockTokens(block.nameCharacters, block.argumentCharacters);
				case "fixed": return block.tokens;
			}
		}
		/**
		* Incremental output pricing: apply one stream chunk to the block book and
		* return the MARGINAL token estimate it added. The first delta of a block
		* charges its framing overhead; later deltas charge only the character growth
		* crossing a `charsPerToken` boundary, so a fragmented delta stream cannot
		* inflate the figure. A `block-end` chunk replaces its slot with the
		* full-block estimate. Non-output chunks and empty deltas are no-ops and
		* return null — the fold then leaves the state untouched.
		*/
		function applyOutputChunk(book, chunk) {
			const write = (index, build) => {
				const previous = book.blocks[index] ?? void 0;
				const next = build(previous);
				const before = previous === void 0 ? 0 : blockEstimate(previous);
				const after = blockEstimate(next);
				book.blocks[index] = next;
				book.pricedTokens += after - before;
				if (previous === void 0) book.pricedBlocks += 1;
				return after - before;
			};
			switch (chunk.type) {
				case "text-delta":
					if (chunk.text === "") return null;
					return write(chunk.index, (previous) => ({
						kind: "text",
						characters: (previous?.kind === "text" ? previous.characters : 0) + chunk.text.length
					}));
				case "reasoning-delta":
					if (chunk.text === "") return null;
					return write(chunk.index, (previous) => ({
						kind: "reasoning",
						characters: (previous?.kind === "reasoning" ? previous.characters : 0) + chunk.text.length
					}));
				case "tool-call-delta":
					if (chunk.name === void 0 && chunk.argumentsDelta === "") return null;
					return write(chunk.index, (previous) => ({
						kind: "tool-call",
						nameCharacters: chunk.name?.length ?? (previous?.kind === "tool-call" ? previous.nameCharacters : 0),
						argumentCharacters: (previous?.kind === "tool-call" ? previous.argumentCharacters : 0) + chunk.argumentsDelta.length
					}));
				case "block-end": return write(chunk.index, () => ({
					kind: "fixed",
					tokens: estimateContentTokens([chunk.block])
				}));
				default: return null;
			}
		}
		/** Plugin-merged retry marker: not in the static SessionEvent union, matched structurally. */
		function isRetryMarker(event) {
			return event.type === "llm/retry";
		}
		/**
		* The bar's live-rate source. One instance per client plugin registration; the
		* bar starts and stops the session watch through `watch`.
		*/
		var LiveRateStore = class {
			state = idle();
			snapshot = {};
			listeners = /* @__PURE__ */ new Set();
			getSnapshot() {
				return this.snapshot;
			}
			subscribe(listener) {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			}
			/**
			* Retain one session and follow its event window until the returned stop
			* function runs. The window's transient `assistant/live-chunk` entries are
			* the stream this fold measures; durable `assistant/message`, `step/end`,
			* `turn/end` and the merged retry marker close or restart the window.
			*/
			watch(sessions, sessionId) {
				const reference = sessions.retain(sessionId, { source: "statusBarLiveRate" });
				const source = reference.binding.eventSource;
				this.seed(source.getSnapshot());
				const off = source.subscribe(() => {
					this.accept(source.getSnapshot());
				});
				return () => {
					off();
					reference.release();
				};
			}
			/** Drop the measured window (plugin teardown). */
			reset() {
				this.state = idle();
				this.publish();
			}
			/** Fold one window revision through its incremental delta. */
			accept(window) {
				const change = window.change;
				switch (change.kind) {
					case "append":
						for (const entry of change.entries) this.applyEntry(entry);
						break;
					case "replace":
						this.state = idle();
						for (const entry of window.entries) this.applyEntry(entry);
						break;
					case "settle-assistant": if (change.entry !== void 0) this.applyEntry(change.entry);
				}
				this.publish();
			}
			/** First read: fold the whole current window, ignoring its `change` delta. */
			seed(window) {
				this.state = idle();
				for (const entry of window.entries) this.applyEntry(entry);
				this.publish();
			}
			publish() {
				const next = this.state.tokensPerSecond === null ? {} : { tokensPerSecond: this.state.tokensPerSecond };
				if (next.tokensPerSecond === this.snapshot.tokensPerSecond) return;
				this.snapshot = next;
				for (const listener of [...this.listeners]) listener();
			}
			applyEntry(entry) {
				const event = entry.event;
				if (event.type === "assistant/live-chunk") {
					this.applyChunk(event);
					return;
				}
				switch (event.type) {
					case "assistant/message":
						if (isTracked(this.state, event.data.turn, event.data.step)) this.state = settled();
						break;
					case "step/end":
						if (isTracked(this.state, event.data.turn, event.data.step)) this.state = settled();
						break;
					case "turn/end":
						if (this.state.turn !== null) this.state = settled();
						break;
					default: if (isRetryMarker(event) && this.state.turn !== null) {
						const data = event.data;
						if (data?.turn === this.state.turn && data?.step === this.state.step) this.state = {
							...settled(),
							turn: this.state.turn,
							step: this.state.step,
							tokensPerSecond: this.state.tokensPerSecond
						};
					}
				}
			}
			/** One live chunk: either the provider's exact usage or one output delta. */
			applyChunk(event) {
				const { turn, step, chunk } = event.data;
				const time = event.time;
				const state = this.state;
				const fresh = !isTracked(state, turn, step);
				if (chunk.type === "usage") {
					const reported = usageOutputTokens(chunk.usage);
					if (reported === null) return;
					const first = fresh || state.firstOutputTime === null ? time : state.firstOutputTime;
					this.state = {
						...state,
						turn,
						step,
						firstOutputTime: first,
						latestOutputTime: time,
						samples: [],
						outputTokens: reported,
						exact: true,
						blocks: [],
						pricedTokens: 0,
						pricedBlocks: 0,
						tokensPerSecond: spanRateOf(reported, first, time)
					};
					return;
				}
				if (!fresh && state.exact) return;
				const book = {
					blocks: [...state.blocks],
					pricedTokens: state.pricedTokens,
					pricedBlocks: state.pricedBlocks
				};
				const added = applyOutputChunk(book, chunk);
				if (added === null) return;
				const outputTokens = book.pricedBlocks === 0 ? 0 : book.pricedTokens + 4;
				const firstOutputTime = state.firstOutputTime === null ? time : state.firstOutputTime;
				if (added <= 0) {
					this.state = {
						...state,
						turn,
						step,
						blocks: book.blocks,
						pricedTokens: book.pricedTokens,
						pricedBlocks: book.pricedBlocks,
						firstOutputTime,
						outputTokens
					};
					return;
				}
				const samples = pushSample(state.samples, {
					time,
					tokens: outputTokens
				});
				this.state = {
					...state,
					turn,
					step,
					blocks: book.blocks,
					pricedTokens: book.pricedTokens,
					pricedBlocks: book.pricedBlocks,
					firstOutputTime,
					latestOutputTime: time,
					samples,
					outputTokens,
					tokensPerSecond: windowRate(samples, firstOutputTime, outputTokens, time, state.tokensPerSecond)
				};
			}
		};
		//#endregion
		//#region src/client/pricing-types.ts
		const DAY_TYPES = [
			"workday",
			"weekend",
			"holiday"
		];
		//#endregion
		//#region src/client/timezone.ts
		/**
		* Timezone-aware peak/off-peak billing math.
		*
		* DeepSeek bills peak rates only on **working days**: Mon–Fri, excluding
		* Chinese statutory holidays, inside a few clock windows. Weekends, holidays
		* AND 调休 adjusted rest days are off-peak all day, and both the windows and
		* the calendar change without notice — so this module models the rule instead
		* of one snapshot of it:
		*
		*   peak  ⟺  today is a working day
		*            AND now falls in a peak window enabled for today's day type
		*
		* Everything else is off-peak, which is why keeping the holiday calendar
		* current is enough — no re-tuning window lists when the schedule shifts.
		*/
		/** IANA timezones offered in the settings (plus 'local' = the browser zone). */
		const TIMEZONE_OPTIONS = [
			"local",
			"Asia/Shanghai",
			"Asia/Hong_Kong",
			"Asia/Taipei",
			"Asia/Tokyo",
			"Asia/Seoul",
			"Asia/Singapore",
			"Asia/Kolkata",
			"Europe/London",
			"Europe/Paris",
			"Europe/Berlin",
			"America/New_York",
			"America/Chicago",
			"America/Los_Angeles",
			"UTC"
		];
		/** The zone the published schedule is written in (docs give Beijing time). */
		const DEFAULT_PRICING_TIMEZONE = "Asia/Shanghai";
		/** Resolved IANA zone for a model ('' / 'local' → the browser zone). */
		function zoneId(timezone) {
			if (timezone !== "" && timezone !== "local") return timezone;
			try {
				return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
			} catch {
				return "UTC";
			}
		}
		const minuteFormatters = /* @__PURE__ */ new Map();
		const dateFormatters = /* @__PURE__ */ new Map();
		function minuteFormatter(timezone) {
			let formatter = minuteFormatters.get(timezone);
			if (formatter === void 0) {
				formatter = new Intl.DateTimeFormat("en-GB", {
					timeZone: timezone,
					hour: "2-digit",
					minute: "2-digit",
					hourCycle: "h23"
				});
				minuteFormatters.set(timezone, formatter);
			}
			return formatter;
		}
		function dateFormatter(timezone) {
			let formatter = dateFormatters.get(timezone);
			if (formatter === void 0) {
				formatter = new Intl.DateTimeFormat("en-CA", {
					timeZone: timezone,
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					weekday: "short"
				});
				dateFormatters.set(timezone, formatter);
			}
			return formatter;
		}
		/** Minute of day (0-1439) in the given zone ('local' or '' = the browser zone). */
		function minuteInTimezone(timezone, at = /* @__PURE__ */ new Date()) {
			if (timezone === "local" || timezone === "") return at.getHours() * 60 + at.getMinutes();
			try {
				const parts = minuteFormatter(timezone).formatToParts(at);
				const read = (type) => Number(parts.find((part) => part.type === type)?.value ?? "0");
				return read("hour") * 60 + read("minute");
			} catch {
				return at.getHours() * 60 + at.getMinutes();
			}
		}
		const WEEKDAY_TOKENS = {
			Sun: 0,
			Mon: 1,
			Tue: 2,
			Wed: 3,
			Thu: 4,
			Fri: 5,
			Sat: 6
		};
		/**
		* Calendar date and weekday at `at` in the given zone. This decides "which day
		* is it" for holiday/weekend rules — never the UTC date, which is already the
		* next day for most of the Beijing evening.
		*/
		function dateInTimezone(timezone, at = /* @__PURE__ */ new Date()) {
			const iso = (year, month, day) => `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
			if (timezone === "local" || timezone === "") return {
				date: iso(at.getFullYear(), at.getMonth() + 1, at.getDate()),
				weekday: at.getDay(),
				year: at.getFullYear()
			};
			try {
				const parts = dateFormatter(timezone).formatToParts(at);
				const read = (type) => parts.find((part) => part.type === type)?.value ?? "";
				const year = Number(read("year"));
				return {
					date: iso(year, Number(read("month")), Number(read("day"))),
					weekday: WEEKDAY_TOKENS[read("weekday")] ?? at.getDay(),
					year
				};
			} catch {
				return {
					date: iso(at.getFullYear(), at.getMonth() + 1, at.getDate()),
					weekday: at.getDay(),
					year: at.getFullYear()
				};
			}
		}
		/** Add `days` to a `YYYY-MM-DD` date. */
		function shiftDate(date, days) {
			const [year, month, day] = date.split("-").map(Number);
			if (year === void 0 || month === void 0 || day === void 0) return date;
			const shifted = new Date(Date.UTC(year, month - 1, day + days));
			return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
		}
		/** Weekday (0 = Sunday) of a `YYYY-MM-DD` date. */
		function weekdayOf(date) {
			const [year, month, day] = date.split("-").map(Number);
			if (year === void 0 || month === void 0 || day === void 0) return 0;
			return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
		}
		/** Parse `HH:MM` → minutes since midnight; NaN-safe. */
		function parseHHMM(value) {
			const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
			if (match === null) return NaN;
			const hours = Number(match[1]);
			const minutes = Number(match[2]);
			if (hours > 23 || minutes > 59) return NaN;
			return hours * 60 + minutes;
		}
		/**
		* Normalize a user-typed clock time to `HH:MM` (24-hour, zero-padded).
		* Accepts `9:00`, `09:00`, `9：00`, `09:00:00`, `0900`, `9`; null when
		* unparseable, so the caller can keep what the user typed until it is valid.
		*/
		function normalizeHHMM(value) {
			const trimmed = value.trim().replace(/[：.]/g, ":");
			const colon = /^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/.exec(trimmed);
			const compact = /^(\d{3,4})$/.exec(trimmed);
			const bare = /^(\d{1,2})$/.exec(trimmed);
			let hours;
			let minutes;
			if (colon !== null) {
				hours = Number(colon[1]);
				minutes = Number(colon[2]);
			} else if (compact !== null) {
				const digits = compact[1] ?? "";
				hours = Number(digits.slice(0, -2));
				minutes = Number(digits.slice(-2));
			} else if (bare !== null) {
				hours = Number(bare[1]);
				minutes = 0;
			} else return null;
			if (hours > 23 || minutes > 59) return null;
			return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
		}
		/** Format minutes since midnight as `HH:MM` (24-hour). */
		function formatHHMM(minute) {
			const wrapped = (Math.round(minute) % 1440 + 1440) % 1440;
			return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
		}
		/** Is `minute` inside the [start, end) window? Windows may cross midnight. */
		function inPeakWindow(minute, start, end) {
			const from = parseHHMM(start);
			const to = parseHHMM(end);
			if (Number.isNaN(from) || Number.isNaN(to)) return false;
			if (from === to) return true;
			if (from < to) return minute >= from && minute < to;
			return minute >= from || minute < to;
		}
		/** Does this window apply to the given day type? */
		function windowAppliesTo(window, dayType) {
			return window.days.length === 0 || window.days.includes(dayType);
		}
		/** Human label of the peak windows, e.g. `09:00–12:00, 14:00–18:00`. */
		function peakWindowsLabel(windows) {
			return windows.map((window) => `${window.start}–${window.end}`).join(", ");
		}
		/** Build the date-keyed lookup from calendars (oldest first) + overrides. */
		function holidayIndex(calendars, overrides) {
			const published = /* @__PURE__ */ new Map();
			for (const calendar of calendars) for (const day of calendar.days) published.set(day.date, day);
			const overrideMap = /* @__PURE__ */ new Map();
			for (const override of overrides) overrideMap.set(override.date, override);
			return {
				published,
				overrides: overrideMap
			};
		}
		/** Classify one date for billing (weekend / workday / holiday + calendar facts). */
		function classifyDate(date, index) {
			const weekday = weekdayOf(date);
			const isWeekend = weekday === 0 || weekday === 6;
			const published = index.published.get(date);
			const override = index.overrides.get(date);
			const hasCalendar = published !== void 0 || override !== void 0 && override.kind !== "auto";
			let isWorkday;
			let kind;
			let custom = false;
			if (override !== void 0 && override.kind !== "auto") {
				custom = true;
				isWorkday = override.kind === "work";
				kind = isWorkday ? "workday" : isWeekend ? "weekend" : "holiday";
			} else if (published !== void 0) {
				isWorkday = !published.isOffDay;
				kind = isWorkday ? "workday" : isWeekend ? "weekend" : "holiday";
			} else {
				isWorkday = !isWeekend;
				kind = isWeekend ? "weekend" : "workday";
			}
			const facts = {
				date,
				weekday,
				kind,
				isWorkday,
				custom,
				hasCalendar
			};
			const name = override?.label !== void 0 && override.label !== "" ? override.label : published?.name;
			if (name !== void 0 && name !== "") facts.name = name;
			return facts;
		}
		/** Resolve the billing tier for one model at one instant. */
		function resolveBilling(config, index, at, dayRules = true) {
			const timezone = zoneId(config.timezone);
			const moment = new Date(at);
			const day = classifyDate(dateInTimezone(timezone, moment).date, index);
			if (!config.peakOffpeak) return {
				tier: "flat",
				reason: null,
				day
			};
			if (!dayRules || day.isWorkday ? false : day.kind === "holiday" ? config.holidayOffpeak : config.weekendOffpeak) return {
				tier: "offpeak",
				reason: day.custom ? "customOff" : day.kind === "holiday" ? "holiday" : "weekend",
				day
			};
			const minute = minuteInTimezone(timezone, moment);
			if (config.peakWindows.some((window) => windowAppliesTo(window, dayRules ? day.kind : "workday") && inPeakWindow(minute, window.start, window.end))) return {
				tier: "peak",
				reason: "peak",
				day
			};
			return {
				tier: "offpeak",
				reason: day.custom ? "customWork" : "night",
				day
			};
		}
		/** Format a timestamp as the 24-hour clock time (`HH:MM`) in a zone. */
		function clockInTimezone(timezone, at) {
			return formatHHMM(minuteInTimezone(timezone, new Date(at)));
		}
		/**
		* First instant after `from` whose billing tier differs, or null when nothing
		* changes inside {@link NEXT_CHANGE_WINDOW_MS} (the badge then just says which
		* tier is live). Windows sit on minute boundaries, so the scan steps by minute.
		*/
		const NEXT_CHANGE_WINDOW_MS = 936e5;
		function nextTierChange(config, index, from, dayRules = true) {
			if (!config.peakOffpeak) return null;
			const current = resolveBilling(config, index, from, dayRules).tier;
			const cap = from + NEXT_CHANGE_WINDOW_MS;
			for (let at = from + 6e4; at <= cap; at += 6e4) {
				const tier = resolveBilling(config, index, at, dayRules).tier;
				if (tier !== current) return {
					at,
					tier
				};
			}
			return null;
		}
		/** Classify the next `count` dates from `from` (settings preview strip). */
		function upcomingDays(from, count, index) {
			const rows = [];
			for (let offset = 0; offset < count; offset += 1) {
				const date = shiftDate(from, offset);
				const weekday = weekdayOf(date);
				rows.push({
					facts: classifyDate(date, index),
					weekend: weekday === 0 || weekday === 6
				});
			}
			return rows;
		}
		//#endregion
		//#region src/client/config.ts
		/**
		* Status-bar configuration: segment registry, the user-maintained model
		* price book (each model carries its own prices AND peak/off-peak schedule),
		* and a tiny localStorage-backed store with useSyncExternalStore reactivity
		* so the bar, the usage dialog, and the settings page stay consistent live.
		*/
		const STORAGE_KEY = "dsh.statusBar.v1";
		/** Every segment the bar can render, in stable registry order. */
		const SEGMENT_IDS = [
			"status",
			"model",
			"title",
			"workspace",
			"counts",
			"durations",
			"speeds",
			"cacheHit",
			"tokens",
			"context",
			"tps",
			"sessionTime",
			"cost",
			"jobs",
			"queue",
			"errors"
		];
		/** Segment display metadata; the manager page renders one row per segment. */
		const SEGMENT_META = {
			status: {
				label: "seg.status",
				hint: "seg.statusHint",
				defaultOn: true
			},
			model: {
				label: "seg.model",
				hint: "seg.modelHint",
				defaultOn: true
			},
			title: {
				label: "seg.title",
				hint: "seg.titleHint",
				defaultOn: false
			},
			workspace: {
				label: "seg.workspace",
				hint: "seg.workspaceHint",
				defaultOn: false
			},
			counts: {
				label: "seg.counts",
				hint: "seg.countsHint",
				defaultOn: true
			},
			durations: {
				label: "seg.durations",
				hint: "seg.durationsHint",
				defaultOn: true
			},
			speeds: {
				label: "seg.speeds",
				hint: "seg.speedsHint",
				defaultOn: true
			},
			cacheHit: {
				label: "seg.cacheHit",
				hint: "seg.cacheHitHint",
				defaultOn: true
			},
			tokens: {
				label: "seg.tokens",
				hint: "seg.tokensHint",
				defaultOn: true
			},
			context: {
				label: "seg.context",
				hint: "seg.contextHint",
				defaultOn: true
			},
			tps: {
				label: "seg.tps",
				hint: "seg.tpsHint",
				defaultOn: true
			},
			sessionTime: {
				label: "seg.sessionTime",
				hint: "seg.sessionTimeHint",
				defaultOn: true
			},
			cost: {
				label: "seg.cost",
				hint: "seg.costHint",
				defaultOn: false
			},
			jobs: {
				label: "seg.jobs",
				hint: "seg.jobsHint",
				defaultOn: true
			},
			queue: {
				label: "seg.queue",
				hint: "seg.queueHint",
				defaultOn: true
			},
			errors: {
				label: "seg.errors",
				hint: "seg.errorsHint",
				defaultOn: true
			}
		};
		/** Fresh id for a peak window row (stable React key / edit target). */
		let peakWindowSeq = 0;
		function nextPeakWindowId() {
			peakWindowSeq += 1;
			return `pw-${Date.now().toString(36)}-${peakWindowSeq}`;
		}
		/**
		* Default peak windows for a newly added model: DeepSeek's published schedule
		* (09:00–12:00 and 14:00–18:00 Beijing time, working days only).
		*/
		const DEFAULT_PEAK_WINDOWS = [{
			id: "peak-1",
			start: "09:00",
			end: "12:00",
			days: ["workday"]
		}, {
			id: "peak-2",
			start: "14:00",
			end: "18:00",
			days: ["workday"]
		}];
		/** DeepSeek's published CNY rates per 1M tokens (flash, peak / off-peak). */
		const DEEPSEEK_RATES = {
			peakInput: 2,
			peakCacheRead: .04,
			peakOutput: 8,
			offpeakInput: 1,
			offpeakCacheRead: .02,
			offpeakOutput: 4
		};
		const DEFAULT_CONFIG = {
			version: 2,
			enabled: true,
			wrap: true,
			segments: SEGMENT_IDS.filter((id) => SEGMENT_META[id].defaultOn),
			cost: {
				currency: "CNY",
				models: {}
			},
			calendar: {
				dayRules: true,
				autoFetch: true,
				overrides: []
			}
		};
		function defaultModelConfig() {
			return {
				input: 2,
				cacheRead: .04,
				cacheWrite: 0,
				output: 8,
				peakOffpeak: true,
				timezone: DEFAULT_PRICING_TIMEZONE,
				peakWindows: DEFAULT_PEAK_WINDOWS.map((window) => ({
					...window,
					days: [...window.days]
				})),
				weekendOffpeak: true,
				holidayOffpeak: true,
				peakInput: DEEPSEEK_RATES.peakInput,
				peakCacheRead: DEEPSEEK_RATES.peakCacheRead,
				peakOutput: DEEPSEEK_RATES.peakOutput,
				offpeakInput: DEEPSEEK_RATES.offpeakInput,
				offpeakCacheRead: DEEPSEEK_RATES.offpeakCacheRead,
				offpeakOutput: DEEPSEEK_RATES.offpeakOutput
			};
		}
		/** Is this a day-type array we can trust? */
		function normalizeDays(raw) {
			if (!Array.isArray(raw)) return [];
			return [...DAY_TYPES.filter((day) => raw.includes(day))];
		}
		/** Sanitize one model config (fills defaults for missing/invalid fields). */
		function normalizeModelConfig(raw) {
			const base = defaultModelConfig();
			if (raw === void 0) return base;
			const merged = {
				...base,
				...raw
			};
			const windows = [];
			if (Array.isArray(merged.peakWindows)) for (const window of merged.peakWindows) {
				if (window === null || typeof window !== "object") continue;
				const start = normalizeHHMM(String(window.start ?? ""));
				const end = normalizeHHMM(String(window.end ?? ""));
				if (start === null || end === null) continue;
				windows.push({
					id: typeof window.id === "string" && window.id !== "" ? window.id : nextPeakWindowId(),
					start,
					end,
					days: window.days === void 0 ? [...DAY_TYPES] : normalizeDays(window.days)
				});
			}
			merged.peakWindows = windows.length > 0 ? windows : base.peakWindows;
			if (typeof merged.timezone !== "string" || merged.timezone === "") merged.timezone = base.timezone;
			for (const key of [
				"input",
				"cacheRead",
				"cacheWrite",
				"output",
				"peakInput",
				"peakCacheRead",
				"peakOutput",
				"offpeakInput",
				"offpeakCacheRead",
				"offpeakOutput"
			]) if (typeof merged[key] !== "number" || !Number.isFinite(merged[key])) merged[key] = base[key];
			merged.peakOffpeak = merged.peakOffpeak === true;
			merged.weekendOffpeak = merged.weekendOffpeak !== false;
			merged.holidayOffpeak = merged.holidayOffpeak !== false;
			return merged;
		}
		/**
		* Migrate a legacy cost block (automatic fetching, global/session price
		* tables, global peak fields) into the user-maintained model book.
		*/
		function migrateCost(raw) {
			const legacy = raw?.cost;
			if (legacy === void 0) return { ...DEFAULT_CONFIG.cost };
			const currency = legacy.currency === "USD" ? "USD" : "CNY";
			const models = {};
			const collect = (table) => {
				if (table === null || typeof table !== "object") return;
				for (const [model, record] of Object.entries(table)) {
					if (record === null || typeof record !== "object") continue;
					const r = record;
					const input = typeof r.input === "number" ? r.input : void 0;
					const output = typeof r.output === "number" ? r.output : void 0;
					if (input === void 0 || output === void 0) continue;
					const patch = {
						input,
						cacheRead: (typeof r.cacheRead === "number" ? r.cacheRead : void 0) ?? .5,
						output,
						peakOffpeak: legacy.peakOffpeak === true,
						timezone: typeof legacy.timezone === "string" ? legacy.timezone : "local"
					};
					if (Array.isArray(legacy.peakWindows)) patch.peakWindows = legacy.peakWindows;
					if (typeof legacy.peakInput === "number") patch.peakInput = legacy.peakInput;
					if (typeof legacy.peakCacheRead === "number") patch.peakCacheRead = legacy.peakCacheRead;
					if (typeof legacy.peakOutput === "number") patch.peakOutput = legacy.peakOutput;
					if (typeof legacy.offpeakInput === "number") patch.offpeakInput = legacy.offpeakInput;
					if (typeof legacy.offpeakCacheRead === "number") patch.offpeakCacheRead = legacy.offpeakCacheRead;
					if (typeof legacy.offpeakOutput === "number") patch.offpeakOutput = legacy.offpeakOutput;
					models[model] = normalizeModelConfig(patch);
				}
			};
			collect(legacy.prices);
			collect(legacy.sessionPrices);
			return {
				currency,
				models
			};
		}
		function load() {
			const raw = readStorage$1();
			if (raw === null) return DEFAULT_CONFIG;
			try {
				const parsed = JSON.parse(raw);
				const segments = Array.isArray(parsed.segments) ? parsed.segments.filter((id) => SEGMENT_IDS.includes(id)) : DEFAULT_CONFIG.segments;
				const cost = parsed.cost !== void 0 && typeof parsed.cost === "object" && "models" in parsed.cost ? {
					currency: parsed.cost.currency === "USD" ? "USD" : "CNY",
					models: parsed.cost.models
				} : migrateCost(parsed);
				const stored = parsed.calendar;
				const calendar = {
					dayRules: stored?.dayRules !== false,
					autoFetch: stored?.autoFetch !== false,
					overrides: Array.isArray(stored?.overrides) ? stored.overrides.filter((override) => override !== null && typeof override === "object" && /^\d{4}-\d{2}-\d{2}$/.test(String(override.date))) : []
				};
				const models = {};
				for (const [model, modelConfig] of Object.entries(cost.models ?? {})) models[model] = normalizeModelConfig(modelConfig);
				return {
					version: 2,
					enabled: parsed.enabled !== false,
					wrap: parsed.wrap === true,
					segments: segments.length > 0 ? segments : DEFAULT_CONFIG.segments,
					cost: {
						currency: cost.currency,
						models
					},
					calendar
				};
			} catch {
				return DEFAULT_CONFIG;
			}
		}
		let config = load();
		const listeners$1 = /* @__PURE__ */ new Set();
		function readStorage$1() {
			try {
				return window.localStorage.getItem(STORAGE_KEY);
			} catch {
				return null;
			}
		}
		function persist(next) {
			config = next;
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			} catch {}
			for (const listener of listeners$1) listener();
		}
		function subscribeConfig(listener) {
			listeners$1.add(listener);
			return () => listeners$1.delete(listener);
		}
		function getConfig() {
			return config;
		}
		/** Apply a partial update (immutable replace) and persist. */
		function updateConfig(patch) {
			persist({
				...config,
				...patch
			});
		}
		/** Toggle one segment's membership in the ordered enabled list. */
		function toggleSegment(id) {
			const segments = config.segments.includes(id) ? config.segments.filter((s) => s !== id) : [...config.segments, id];
			persist({
				...config,
				segments
			});
		}
		/** Move a segment one position in the enabled order (clamped at the ends). */
		function moveSegment(id, delta) {
			const index = config.segments.indexOf(id);
			const target = index + delta;
			if (index < 0 || target < 0 || target >= config.segments.length) return;
			const segments = [...config.segments];
			const [moved] = segments.splice(index, 1);
			if (moved === void 0) return;
			segments.splice(target, 0, moved);
			persist({
				...config,
				segments
			});
		}
		/** Reset the bar/price book to defaults but keep manual holiday overrides. */
		function resetConfig() {
			persist({
				...DEFAULT_CONFIG,
				calendar: {
					...DEFAULT_CONFIG.calendar,
					overrides: config.calendar.overrides
				}
			});
		}
		/** The price-book entry for one model, or undefined when unconfigured. */
		function modelConfigFor(cost, model) {
			if (model === void 0) return void 0;
			return cost.models[model];
		}
		/** Add or update one model's price-book entry (merge semantics). */
		function setModelConfig(model, patch) {
			const current = config.cost.models[model];
			persist({
				...config,
				cost: {
					...config.cost,
					models: {
						...config.cost.models,
						[model]: normalizeModelConfig({
							...current,
							...patch
						})
					}
				}
			});
		}
		/** Remove one model from the price book. */
		function removeModelConfig(model) {
			const models = { ...config.cost.models };
			delete models[model];
			persist({
				...config,
				cost: {
					...config.cost,
					models
				}
			});
		}
		/** Apply a partial update to the shared holiday-calendar settings. */
		function updateCalendar(patch) {
			persist({
				...config,
				calendar: {
					...config.calendar,
					...patch
				}
			});
		}
		/** Add or replace the manual override for one date. */
		function setHolidayOverride(date, kind, label = "") {
			const dateKey = date.trim();
			if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
			const overrides = config.calendar.overrides.filter((override) => override.date !== dateKey);
			if (kind !== "auto") overrides.push({
				date: dateKey,
				kind,
				label: label.trim()
			});
			overrides.sort((a, b) => a.date.localeCompare(b.date));
			updateCalendar({ overrides });
		}
		/** Drop the manual override for one date (back to the published calendar). */
		function removeHolidayOverride(date) {
			updateCalendar({ overrides: config.calendar.overrides.filter((override) => override.date !== date) });
		}
		/** Reset one model's schedule to DeepSeek's published peak/off-peak rules. */
		function applyDeepSeekPreset(model) {
			setModelConfig(model, {
				peakOffpeak: true,
				timezone: DEFAULT_PRICING_TIMEZONE,
				peakWindows: DEFAULT_PEAK_WINDOWS.map((window) => ({
					...window,
					days: [...window.days]
				})),
				weekendOffpeak: true,
				holidayOffpeak: true,
				peakInput: DEEPSEEK_RATES.peakInput,
				peakCacheRead: DEEPSEEK_RATES.peakCacheRead,
				peakOutput: DEEPSEEK_RATES.peakOutput,
				offpeakInput: DEEPSEEK_RATES.offpeakInput,
				offpeakCacheRead: DEEPSEEK_RATES.offpeakCacheRead,
				offpeakOutput: DEEPSEEK_RATES.offpeakOutput
			});
			updateCalendar({ dayRules: true });
		}
		/** Reactive read for React components (bar, usage dialog, settings page). */
		function useStatusBarConfig() {
			return (0, react.useSyncExternalStore)(subscribeConfig, getConfig, getConfig);
		}
		//#endregion
		//#region src/client/live-model.ts
		/**
		* Last model the bar observed for the session in view.
		*
		* 0.2.0-rc.2 removed `SessionListState.current`, so a ROOT-scoped surface (the
		* Settings page) no longer has a global "current session" whose `sessionModel`
		* projection it could read. The session-scoped bar publishes what it sees
		* here, and the price-book section reads it back for its "current model"
		* preview. Absent means no session has rendered yet.
		*/
		let current;
		const listeners = /* @__PURE__ */ new Set();
		function subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		/** Publish the model the bar currently shows (called by the session-scoped bar). */
		function noteCurrentModel(model) {
			if (model === current) return;
			current = model;
			for (const listener of [...listeners]) listener();
		}
		/** Current model name for previews, or undefined before any session rendered. */
		function useCurrentModel() {
			return (0, react.useSyncExternalStore)(subscribe, getCurrentModel, getCurrentModel);
		}
		/** Snapshot reader for the hook (client and hydration snapshot alike). */
		function getCurrentModel() {
			return current;
		}
		//#endregion
		//#region src/client/format.ts
		/**
		* Display formatters for the status bar. All pure, locale-agnostic helpers
		* (the bar's text is assembled in segments.ts with the bound dictionary).
		*/
		/** Compact token count: 517 / 12.2K / 517K / 1.2M (one decimal under three digits). */
		function formatTokens(n) {
			const scaled = (v) => v >= 100 ? String(Math.round(v)) : String(Math.round(v * 10) / 10);
			if (n < 1e3) return String(n);
			if (n < 1e6) return `${scaled(n / 1e3)}K`;
			return `${scaled(n / 1e6)}M`;
		}
		/** Compact duration: 45.2s under a minute, 2m42s from there on. */
		function formatDuration(ms) {
			const s = ms / 1e3;
			if (s < 60) return `${Math.round(s * 10) / 10}s`;
			const whole = Math.round(s);
			return `${Math.floor(whole / 60)}m${whole % 60}s`;
		}
		/** Throughput with one decimal below 100 tok/s (matches the shipped TPS row). */
		function formatTokensPerSecond(value) {
			return String(value < 100 ? Math.round(value * 10) / 10 : Math.round(value));
		}
		/**
		* Adaptive cost rendering: whole numbers below 100 keep two decimals, small
		* amounts keep their meaningful digits (0.0123), big totals round to whole.
		*/
		function formatCost(value, currency) {
			const symbol = currency === "CNY" ? "¥" : "$";
			let digits;
			if (value >= 100) digits = 0;
			else if (value >= 1) digits = 2;
			else if (value >= .01) digits = 3;
			else digits = 4;
			return `${symbol}${value.toFixed(digits)}`;
		}
		//#endregion
		//#region src/client/holidays.ts
		/**
		* Holiday-calendar store for the peak/off-peak pricing.
		*
		* The published Chinese holiday / 调休 calendar changes every year, so the
		* client never hard-codes it: it asks this plugin's own host route
		* (`/status-bar/api/holidays`, which fetches + caches the dataset on disk),
		* keeps the answer in localStorage so the cost segment prices correctly on the
		* first paint, and exposes a `useSyncExternalStore` hook. A failed fetch never
		* throws into render — it degrades to the weekday rule and surfaces a message
		* in the settings page.
		*/
		const HOLIDAY_CACHE_KEY = "dsh.statusBar.holidays.v1";
		const API_PATH = "/status-bar/api/holidays";
		/** Re-ask the host after this long; the host itself re-checks the dataset. */
		const CLIENT_TTL_MS = 432e5;
		function readStorage() {
			try {
				const raw = window.localStorage.getItem(HOLIDAY_CACHE_KEY);
				if (raw === null) return null;
				const parsed = JSON.parse(raw);
				if (!Array.isArray(parsed.years)) return null;
				const years = parsed.years.filter((year) => year !== null && typeof year === "object" && Array.isArray(year.days));
				return {
					fetchedAt: typeof parsed.fetchedAt === "number" ? parsed.fetchedAt : 0,
					years
				};
			} catch {
				return null;
			}
		}
		function writeStorage(value) {
			try {
				window.localStorage.setItem(HOLIDAY_CACHE_KEY, JSON.stringify(value));
			} catch {}
		}
		var HolidayStore = class {
			snapshot;
			inflight = null;
			listeners = /* @__PURE__ */ new Set();
			constructor() {
				const stored = readStorage();
				this.snapshot = {
					calendars: stored?.years ?? [],
					status: {
						loading: false,
						error: null,
						source: null,
						fetchedAt: stored !== null && stored.fetchedAt > 0 ? stored.fetchedAt : null
					}
				};
			}
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			getSnapshot = () => this.snapshot;
			/** Fetch from the plugin host; concurrent callers share one request. */
			async load(refresh = false) {
				if (this.inflight !== null) return this.inflight;
				const request = this.run(refresh);
				this.inflight = request;
				try {
					await request;
				} finally {
					this.inflight = null;
				}
			}
			/** Fetch when the cached copy is stale (never rejects). */
			async loadIfStale() {
				const fetchedAt = this.snapshot.status.fetchedAt;
				if (fetchedAt !== null && Date.now() - fetchedAt < CLIENT_TTL_MS) return;
				await this.load();
			}
			async run(refresh) {
				this.setSnapshot({
					...this.snapshot.status,
					loading: true,
					error: null
				});
				try {
					const response = await fetch(refresh ? `${API_PATH}?refresh=1` : API_PATH, { headers: { accept: "application/json" } });
					if (!response.ok) throw new Error(`HTTP ${response.status}`);
					const payload = await response.json();
					const years = payload.years ?? [];
					const calendars = years.map((year) => year.calendar).filter((calendar) => calendar !== void 0 && Array.isArray(calendar.days)).sort((a, b) => a.year - b.year);
					if (calendars.length === 0) {
						const failed = (payload.errors ?? []).map((item) => `${item.year}: ${item.message}`).join("; ");
						throw new Error(failed === "" ? "empty-calendar" : failed);
					}
					const fetchedAt = Date.now();
					const warnings = [...years.map((year) => year.warning).filter((warning) => typeof warning === "string" && warning !== ""), ...(payload.errors ?? []).map((item) => `${item.year}: ${item.message}`)];
					this.snapshot = {
						calendars,
						status: {
							loading: false,
							error: warnings.length > 0 ? warnings.join("; ") : null,
							source: payload.source ?? null,
							fetchedAt
						}
					};
					writeStorage({
						fetchedAt,
						years: calendars
					});
				} catch (error) {
					this.setSnapshot({
						...this.snapshot.status,
						loading: false,
						error: error instanceof Error ? error.message : String(error)
					});
				}
				this.emit();
			}
			setSnapshot(status) {
				this.snapshot = {
					...this.snapshot,
					status
				};
				this.emit();
			}
			emit() {
				for (const listener of this.listeners) listener();
			}
		};
		const holidayStore = new HolidayStore();
		/** Non-reactive read for pure code paths (segment/cost folds outside render). */
		function currentCalendars() {
			return holidayStore.getSnapshot().calendars;
		}
		/** Merged lookup over the live calendars plus the persisted manual overrides. */
		function useHolidayView(overrides) {
			const { calendars, status } = (0, react.useSyncExternalStore)(holidayStore.subscribe, holidayStore.getSnapshot, holidayStore.getSnapshot);
			return {
				index: (0, react.useMemo)(() => holidayIndex(calendars, overrides), [calendars, overrides]),
				calendars,
				status
			};
		}
		/** Fetch the calendar once on mount when the cached copy is stale. */
		function useHolidayAutoFetch(enabled) {
			(0, react.useEffect)(() => {
				if (!enabled) return;
				holidayStore.loadIfStale();
			}, [enabled]);
		}
		//#endregion
		//#region src/client/session-usage-cost.ts
		/**
		* Shared whole-session cost pricing on the `sessionUsage` projection.
		*
		* The cost segment, usage dialog total, and history rows all price per step
		* with the model that ACTUALLY produced that step's tokens (from the host
		* `sessionUsage` fold), applying that model's own price-book entry AND its
		* peak/off-peak schedule at the step's own wall-clock time — instead of the
		* old whole-session-tokens × last-model-price approximation.
		*/
		/** Resolve the context, filling in whatever the caller did not supply. */
		function pricingContext(context) {
			const config = getConfig();
			const dayRules = context?.dayRules ?? config.calendar.dayRules;
			const overrides = context?.overrides ?? config.calendar.overrides;
			return {
				dayRules,
				overrides,
				index: context?.index ?? holidayIndex(currentCalendars(), overrides)
			};
		}
		/**
		* Split the whole-session usage into a per-model cost breakdown, each model
		* priced with ITS OWN price-book entry (peak/off-peak applied at `now`). A
		* model with no configured entry, or one whose effective prices are all zero,
		* is skipped (its cost is unknowable). Returns null when there is no state or
		* no model could be priced.
		*/
		function costBreakdown(state, cost, now, context) {
			if (state === void 0) return null;
			const rules = pricingContext(context);
			const perModel = /* @__PURE__ */ new Map();
			const pricedModels = [];
			let total = 0;
			for (const [model, usage] of Object.entries(state.models)) {
				const prices = effectivePrices({
					provider: "unknown",
					model
				}, cost, now, rules.dayRules, [], rules.overrides, rules.index);
				if (prices === null) continue;
				if (prices.input <= 0 && prices.cacheRead <= 0 && prices.cacheWrite <= 0 && prices.output <= 0) continue;
				const priced = costOfUsage({
					uncachedInputTokens: usage.input,
					cacheReadTokens: usage.cacheRead,
					cacheWriteTokens: usage.cacheWrite,
					outputTokens: usage.output
				}, prices);
				perModel.set(model, priced);
				total += priced;
				pricedModels.push(model);
			}
			if (pricedModels.length === 0) return null;
			return {
				perModel,
				total,
				pricedModels
			};
		}
		/**
		* Model identity for one step: the host `sessionUsage` fold's `bySeq` entry
		* when present, falling back to the node's own provenance, else null.
		*/
		function stepModel(state, seq, provenance) {
			return state?.bySeq[String(seq)] ?? provenance ?? null;
		}
		/**
		* Cost of ONE step's token usage, priced with the model that produced it and
		* that model's price-book entry at the step's own wall-clock time (peak/off-peak
		* applied to the fold's recorded time, falling back to `now`). Returns null
		* when the step's model is unknown or unconfigured.
		*/
		function stepCost(state, seq, provenance, usage, cost, context) {
			const model = stepModel(state, seq, provenance);
			if (model === null) return null;
			const at = state?.bySeq[String(seq)]?.time ?? Date.now();
			const rules = pricingContext(context);
			const prices = effectivePrices(model, cost, at, rules.dayRules, [], rules.overrides, rules.index);
			if (prices === null) return null;
			if (prices.input <= 0 && prices.cacheRead <= 0 && prices.cacheWrite <= 0 && prices.output <= 0) return null;
			return costOfUsage({
				uncachedInputTokens: usage.inputTokens,
				cacheReadTokens: usage.cacheReadTokens,
				cacheWriteTokens: usage.cacheWriteTokens,
				outputTokens: usage.outputTokens
			}, prices);
		}
		//#endregion
		//#region src/client/segments.ts
		/**
		* Window-scoped fallback fold over the snapshot's settled nodes — mirrors the
		* shipped stats line's fallback so assemblies without the `sessionStats`
		* projection still get counts and wall times.
		*/
		function deriveWindowStats(chat) {
			let turns = 0;
			let steps = 0;
			let llmMs = 0;
			let toolMs = 0;
			let ttftMs = 0;
			let ttftSteps = 0;
			let decodeMs = 0;
			let decodeTokens = 0;
			const seenTurns = /* @__PURE__ */ new Set();
			for (const node of chat.nodes) {
				if (node.kind === "tool-result") {
					if (node.callTime !== null) toolMs += Math.max(0, node.time - node.callTime);
					continue;
				}
				if (node.kind !== "assistant") continue;
				seenTurns.add(node.turn);
				steps += 1;
				const timing = node.timing;
				if (timing !== void 0 && timing.stepStartTime !== null) llmMs += Math.max(0, timing.completedTime - timing.stepStartTime);
				if (timing?.firstTokenTime !== null && timing?.firstTokenTime !== void 0 && timing.stepStartTime !== null) {
					ttftMs += Math.max(0, timing.firstTokenTime - timing.stepStartTime);
					ttftSteps += 1;
				}
				if (timing !== void 0 && node.usage !== void 0) {
					const output = node.usage.outputTokens;
					if (timing.completedTime !== null && output !== void 0 && output > 0) {
						const start = timing.firstTokenTime ?? timing.stepStartTime;
						if (start !== null) {
							decodeMs += Math.max(0, timing.completedTime - start);
							decodeTokens += output;
						}
					}
				}
			}
			turns = seenTurns.size;
			return {
				turns,
				steps,
				llmMs,
				toolMs,
				ttftMs,
				ttftSteps,
				decodeMs,
				decodeTokens
			};
		}
		/** Billed prompt-side tokens (the three disjoint buckets). */
		function billedInputTokens(usage) {
			return usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
		}
		/**
		* Last model identity: the host `sessionModel` projection when served,
		* falling back to the window's last assistant node's provider metadata (the
		* shipped assembly omits it, so the projection is the live path).
		*/
		function lastModel(chat, sessionModel) {
			if (sessionModel !== void 0 && sessionModel.model !== null) return sessionModel;
			for (let i = chat.nodes.length - 1; i >= 0; i -= 1) {
				const node = chat.nodes[i];
				if (node?.kind === "assistant" && node.providerMetadata !== void 0) return node.providerMetadata;
			}
			return null;
		}
		/** Failed/retried steps visible in the window (durable notices + turn errors). */
		function errorCount(chat) {
			let count = 0;
			for (const node of chat.nodes) if (node.kind === "model-retry" || node.kind === "turn-error" || node.kind === "turn-max-tokens") count += 1;
			return count;
		}
		/** Live background jobs (running/stopping) for the session, if the mirror serves them. */
		function liveJobCount(jobs) {
			if (jobs === void 0) return 0;
			let count = 0;
			for (const job of jobs) if (job.status === "running" || job.status === "stopping") count += 1;
			return count;
		}
		/** Session wall time: first turn start → last turn end (or now while running). */
		function sessionElapsed(chat, now) {
			let start = null;
			let end = null;
			for (const timing of chat.turnTimings.values()) {
				if (start === null || timing.startTime < start) start = timing.startTime;
				const t = timing.endTime ?? now;
				if (end === null || t > end) end = t;
			}
			if (start === null || end === null) return null;
			return Math.max(0, end - start);
		}
		/**
		* Fold every enabled segment into display views, in the user's configured
		* order. Segments whose data is absent drop out entirely.
		*/
		function buildSegments(source, config, t) {
			const views = [];
			for (const id of config.segments) {
				const view = segmentView(id, source, config, t);
				if (view !== null) views.push(view);
			}
			return views;
		}
		/**
		* Effective input/output/cache prices per 1M tokens for the current model,
		* straight from the user-maintained price book (each model has its own
		* prices and peak schedule). Returns null when the model has no entry —
		* the cost segment then hides instead of guessing.
		*
		* When the model's peak/off-peak billing is on, the peak/off-peak input,
		* cache-hit, and output prices replace the flat rates. Which tier applies is
		* decided by {@link resolveBilling}: a working day inside one of the model's
		* windows is peak, everything else — nights, weekends, holidays and 调休 rest
		* days — is off-peak. `reason` says which of those it was, for the badges.
		*/
		function effectivePrices(model, cost, now, dayRules = true, calendars = [], overrides = [], index) {
			const config = modelConfigFor(cost, model?.model);
			if (config === void 0) return null;
			const billing = resolveBilling(config, index ?? holidayIndex(calendars, overrides), now, dayRules);
			if (billing.tier === "flat") return {
				input: config.input,
				output: config.output,
				cacheRead: config.cacheRead,
				cacheWrite: config.cacheWrite,
				source: "flat",
				reason: null,
				day: billing.day
			};
			const peak = billing.tier === "peak";
			return {
				input: peak ? config.peakInput : config.offpeakInput,
				output: peak ? config.peakOutput : config.offpeakOutput,
				cacheRead: peak ? config.peakCacheRead : config.offpeakCacheRead,
				cacheWrite: config.cacheWrite,
				source: peak ? "peak" : "offpeak",
				reason: billing.reason,
				day: billing.day
			};
		}
		/** Cost of one token-usage record at the given per-1M-token prices. */
		function costOfUsage(usage, prices) {
			return (usage.uncachedInputTokens * prices.input + usage.cacheReadTokens * prices.cacheRead + usage.cacheWriteTokens * prices.cacheWrite + usage.outputTokens * prices.output) / 1e6;
		}
		/**
		* Recent per-step usage rows from the settled window: the last assistant
		* nodes that carried provider-reported usage, newest first. Each step's cost
		* is priced with the model that ACTUALLY produced that step (from the host
		* `sessionUsage` fold, node provider metadata as fallback), applying that
		* model's own price-book entry (with peak/off-peak) at the step's wall-clock
		* time.
		*/
		function usageHistory(chat, state, cost, limit = 200, context) {
			const rows = [];
			for (let i = chat.nodes.length - 1; i >= 0 && rows.length < limit; i -= 1) {
				const node = chat.nodes[i];
				if (node?.kind !== "assistant" || node.usage === void 0) continue;
				const usage = node.usage;
				if (usage === null || typeof usage !== "object") continue;
				const input = (usage.inputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
				const cacheRead = usage.cacheReadTokens ?? 0;
				const cacheWrite = usage.cacheWriteTokens ?? 0;
				const output = usage.outputTokens ?? 0;
				if (input <= 0 && output <= 0) continue;
				const model = stepModel(state, node.seq, node.providerMetadata);
				const costRow = stepCost(state, node.seq, node.providerMetadata, {
					inputTokens: usage.inputTokens ?? 0,
					cacheReadTokens: cacheRead,
					cacheWriteTokens: cacheWrite,
					outputTokens: output
				}, cost, context);
				rows.push({
					seq: node.seq,
					time: node.time,
					model: model?.model ?? null,
					input,
					cacheRead,
					cacheWrite,
					output,
					cost: costRow
				});
			}
			return rows;
		}
		function segmentView(id, source, config, t) {
			const { chat, session, queueLength, stats, usage, pressure, liveRate, jobs, summary, now } = source;
			switch (id) {
				case "status": {
					const running = session.running || chat.partial !== null || chat.runningCalls.length > 0;
					const failed = !running && session.lastAgentError !== null;
					return {
						id,
						state: running ? "running" : failed ? "error" : "idle",
						text: running ? t("bar.status.running") : failed ? t("bar.status.error") : t("bar.status.idle")
					};
				}
				case "model": {
					const identity = lastModel(chat, source.sessionModel);
					return identity === null ? null : {
						id,
						text: identity.model
					};
				}
				case "title": {
					const title = summary?.displayTitle;
					if (!title) return null;
					return {
						id,
						text: title.length > 24 ? `${title.slice(0, 24)}…` : title
					};
				}
				case "workspace": {
					const cwd = summary?.cwd;
					if (!cwd) return null;
					return {
						id,
						text: cwd.replace(/[\\/]+$/, "").split(/[\\/]/).pop() ?? cwd
					};
				}
				case "counts":
					if (stats === null || stats.steps <= 0) return null;
					return {
						id,
						text: t("bar.counts", {
							turns: stats.turns,
							steps: stats.steps
						})
					};
				case "durations": {
					if (stats === null) return null;
					const parts = [];
					if (stats.llmMs > 0) parts.push(t("bar.llm", { duration: formatDuration(stats.llmMs) }));
					if (stats.toolMs > 0) parts.push(t("bar.toolCall", { duration: formatDuration(stats.toolMs) }));
					return parts.length === 0 ? null : {
						id,
						text: parts.join(" · ")
					};
				}
				case "speeds": {
					if (stats === null) return null;
					const parts = [];
					if (stats.ttftSteps > 0) parts.push(t("bar.ttftAverage", { duration: formatDuration(stats.ttftMs / stats.ttftSteps) }));
					if (stats.decodeMs > 0) parts.push(t("bar.decodeSpeed", { throughput: formatTokensPerSecond(stats.decodeTokens / (stats.decodeMs / 1e3)) }));
					return parts.length === 0 ? null : {
						id,
						text: parts.join(" · ")
					};
				}
				case "cacheHit": {
					if (usage === void 0) return null;
					const denominator = billedInputTokens(usage);
					if (denominator <= 0) return null;
					return {
						id,
						text: t("bar.cacheHit", { percent: Math.min(99.99, usage.cacheReadTokens / denominator * 100).toFixed(2) })
					};
				}
				case "tokens": {
					if (usage === void 0) return null;
					const input = billedInputTokens(usage);
					const output = usage.outputTokens;
					if (input <= 0 && output <= 0) return null;
					return {
						id,
						text: t("bar.tokens", {
							input: formatTokens(input),
							output: formatTokens(output)
						})
					};
				}
				case "context": {
					if (pressure === void 0) return null;
					const used = pressure.projectedTokens ?? pressure.pressureTokens;
					if (used === void 0 || pressure.contextWindow === void 0) return null;
					return {
						id,
						text: t("bar.context", { percent: Math.min(100, Math.round(used / pressure.contextWindow * 100)) })
					};
				}
				case "tps": {
					const live = liveRate;
					const decode = stats !== null && stats.decodeMs > 0 ? stats.decodeTokens / (stats.decodeMs / 1e3) : void 0;
					const rate = live ?? decode;
					if (rate === void 0) return null;
					return {
						id,
						text: t("bar.tps", { throughput: formatTokensPerSecond(rate) })
					};
				}
				case "sessionTime": {
					const elapsed = sessionElapsed(chat, now);
					return elapsed === null ? null : {
						id,
						text: t("bar.sessionTime", { duration: formatDuration(elapsed) })
					};
				}
				case "cost": {
					if (source.sessionUsage !== void 0) {
						const breakdown = costBreakdown(source.sessionUsage, config.cost, now);
						if (breakdown !== null && breakdown.total > 0) return {
							id,
							text: t("bar.cost", { cost: formatCost(breakdown.total, config.cost.currency) })
						};
						return null;
					}
					if (usage === void 0) return null;
					const prices = effectivePrices(lastModel(chat, source.sessionModel), config.cost, now, config.calendar.dayRules, currentCalendars(), config.calendar.overrides);
					if (prices === null) return null;
					if (prices.input <= 0 && prices.cacheRead <= 0 && prices.cacheWrite <= 0 && prices.output <= 0) return null;
					const total = costOfUsage(usage, prices);
					if (total <= 0) return null;
					return {
						id,
						text: t("bar.cost", { cost: formatCost(total, config.cost.currency) })
					};
				}
				case "jobs": {
					const count = liveJobCount(jobs);
					return count <= 0 ? null : {
						id,
						text: t("bar.jobs", { count })
					};
				}
				case "queue": {
					const count = queueLength;
					return count <= 0 ? null : {
						id,
						text: t("bar.queue", { count })
					};
				}
				case "errors": {
					const count = errorCount(chat);
					return count <= 0 ? null : {
						id,
						text: t("bar.errors", { count })
					};
				}
				/* v8 ignore next -- closed SegmentId union */
				default: return null;
			}
		}
		//#endregion
		//#region src/client/StatusBar.tsx
		/**
		* The status bar itself: a composer-dock entry that shadows the shipped
		* `stats` cell (id 'stats', lower priority) and renders the configurable
		* segment line. Unloading the plugin restores the built-in stats line.
		*
		* Layout mirrors the shipped row: block, centered, 12/20 tertiary text,
		* bounded to the composer input card's width, with the ellipsis + delayed
		* hover tooltip as the narrow-column fallback. With `wrap` enabled the bar
		* becomes a flex-wrap line that reflows inside that same width and never
		* truncates — it never runs past the input box's edges in either mode.
		*/
		const STATUS_DOT = {
			running: "#e8b339",
			idle: "#5b8def",
			error: "#e5484d"
		};
		/** Compact dot for the status segment (kept dependency-light). */
		function StatusDot({ state }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "dsb-dot",
				style: { backgroundColor: STATUS_DOT[state] },
				"aria-hidden": true
			});
		}
		/**
		* Trailing-edge throttle for the live TPS figure. The client-side live-rate
		* fold publishes on every stream chunk — potentially many times per second —
		* so the bar would otherwise re-render the segment at stream rate. This keeps
		* the displayed value at most one refresh per `intervalMs` while always
		* converging to the latest measurement: a fresh value arriving after a quiet
		* interval shows immediately, otherwise the newest value lands when the
		* interval elapses.
		*/
		function useThrottled(value, intervalMs) {
			const [display, setDisplay] = (0, react.useState)(value);
			const latest = (0, react.useRef)(value);
			latest.current = value;
			const lastAt = (0, react.useRef)(0);
			const timer = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (latest.current === display) return;
				const now = Date.now();
				const since = now - lastAt.current;
				if (since >= intervalMs) {
					lastAt.current = now;
					setDisplay(latest.current);
					return;
				}
				if (timer.current !== void 0) return;
				timer.current = window.setTimeout(() => {
					timer.current = void 0;
					lastAt.current = Date.now();
					setDisplay(latest.current);
				}, intervalMs - since);
			});
			(0, react.useEffect)(() => () => {
				if (timer.current !== void 0) window.clearTimeout(timer.current);
			}, []);
			return display;
		}
		/** One segment: optional state dot + text (the row owns separators). */
		function Segment({ view }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "dsb-seg",
				children: [view.state !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusDot, { state: view.state }), view.text]
			});
		}
		const StatusBarDockEntry = (0, react.memo)(function StatusBarDockEntry(props) {
			const config = useStatusBarConfig();
			const { useChat, useInput, useJobs, useLiveRate, useProjection, useSession, useSessions, sessionId, t, watchLiveRate, watchRows } = props;
			const projected = useProjection("sessionStats");
			const usage = useProjection("tokenUsage");
			const pressure = useProjection("contextPressure");
			const liveRate = useThrottled(useLiveRate((view) => view.tokensPerSecond), 500);
			(0, react.useEffect)(() => watchLiveRate(sessionId), [sessionId, watchLiveRate]);
			const sessionModelValue = useProjection("sessionModel");
			const sessionModel = sessionModelValue !== void 0 && sessionModelValue.model !== null ? {
				provider: sessionModelValue.provider ?? "unknown",
				model: sessionModelValue.model
			} : void 0;
			const sessionUsage = useProjection("sessionUsage");
			const session = {
				running: useSession((state) => state.running),
				lastAgentError: useSession((state) => state.lastAgentError)
			};
			const chat = useChat((state) => state.legacy);
			const queueLength = useInput((state) => state.queue.length);
			const jobs = useJobs((state) => state.rows[sessionId]);
			const summary = useSessions((state) => state.byId[sessionId]);
			(0, react.useEffect)(() => watchRows(sessionId), [sessionId, watchRows]);
			const currentModelName = sessionModel?.model;
			(0, react.useEffect)(() => {
				noteCurrentModel(currentModelName);
			}, [currentModelName]);
			const [now, setNow] = (0, react.useState)(() => Date.now());
			const wantsClock = config.enabled && config.segments.includes("sessionTime");
			(0, react.useEffect)(() => {
				if (!wantsClock || !session.running) return;
				const timer = window.setInterval(() => setNow(Date.now()), 1e3);
				return () => window.clearInterval(timer);
			}, [wantsClock, session.running]);
			const rootRef = (0, react.useRef)(null);
			const [truncated, setTruncated] = (0, react.useState)(false);
			const stats = projected ?? deriveWindowStats(chat);
			const views = config.enabled ? buildSegments({
				chat,
				session,
				queueLength,
				stats,
				usage,
				pressure,
				liveRate,
				sessionModel,
				sessionUsage,
				jobs,
				summary,
				now
			}, config, t) : [];
			const line = views.map((view) => view.text).join(" | ");
			(0, react.useLayoutEffect)(() => {
				const el = rootRef.current;
				if (el === null) return;
				const measure = () => {
					setTruncated(el.scrollWidth > el.clientWidth);
				};
				measure();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(measure);
				observer.observe(el);
				return () => {
					observer.disconnect();
				};
			}, [
				line,
				config.wrap,
				config.enabled
			]);
			if (!config.enabled || views.length === 0) return null;
			if (config.wrap) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: rootRef,
				className: "dsb-bar dsb-wrap",
				children: views.map((view, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segment, { view }), i < views.length - 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "dsb-sep",
					"aria-hidden": true,
					children: "|"
				})] }, view.id))
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: line,
				side: "top",
				delayMs: 500,
				disabled: !truncated,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					ref: rootRef,
					className: "dsb-bar",
					children: views.map((view, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [i > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsb-sep",
						"aria-hidden": true,
						children: "|"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segment, { view })] }, view.id))
				})
			});
		});
		//#endregion
		//#region src/client/QuickMenu.tsx
		/**
		* Quick-toggle menu: a small gear button at the right end of the composer
		* tool row (`conversation.input.right`) that flips the master switch and
		* individual segments without opening Settings. Shares the same config store
		* as the bar and the settings page, so every surface stays in sync live.
		*/
		const MASTER_ID = "dsb-master";
		const RESET_ID = "dsb-reset";
		const QuickMenuEntry = (0, react.memo)(function QuickMenuEntry(props) {
			const config = useStatusBarConfig();
			const { t } = props;
			const [open, setOpen] = (0, react.useState)(false);
			const anchorRef = (0, react.useRef)(null);
			const items = [
				{
					id: MASTER_ID,
					label: t("quick.master")
				},
				{
					type: "separator",
					id: "dsb-sep-1"
				},
				...SEGMENT_IDS.map((id) => ({
					id,
					label: t(SEGMENT_META[id].label)
				})),
				{
					type: "separator",
					id: "dsb-sep-2"
				},
				{
					id: RESET_ID,
					label: t("quick.reset")
				}
			];
			const selectedIds = [...config.enabled ? [MASTER_ID] : [], ...config.segments];
			const onSelect = (id) => {
				if (id === MASTER_ID) updateConfig({ enabled: !config.enabled });
				else if (id === RESET_ID) resetConfig();
				else if (SEGMENT_IDS.includes(id)) toggleSegment(id);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					ref: anchorRef,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsb-quick",
						title: t("quick.title"),
						"aria-label": t("quick.title"),
						"aria-expanded": open,
						onClick: () => setOpen(!open),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineRegular, { size: 14 })
					})
				}),
				items,
				selectedIds,
				onSelect,
				onClose: () => setOpen(false),
				align: "end",
				portal: true,
				dense: true
			});
		});
		//#endregion
		//#region src/client/StatusPill.tsx
		/**
		* Live "which tier applies right now, and why" badge, shared by the usage
		* dialog and the settings price book. Renders nothing when the model bills a
		* flat rate. The reason words are what makes the peak/off-peak math auditable:
		* a user sees 谷时（法定节假日）or 谷时（调休上班）instead of an unexplained number.
		*/
		const REASON_KEYS = {
			peak: "reason.peak",
			night: "reason.night",
			weekend: "reason.weekend",
			holiday: "reason.holiday",
			customOff: "reason.customOff",
			customWork: "reason.customWork"
		};
		const StatusPill = (0, react.memo)(function StatusPill({ config, state, index, now, t, compact = false }) {
			if (state.tier === "flat") return null;
			const peak = state.tier === "peak";
			const change = compact ? null : nextTierChange(config, index, now);
			const changeText = change === null ? null : t(change.tier === "peak" ? "section.peakNext" : "section.offpeakNext", { time: clockInTimezone(config.timezone, change.at) });
			const schedule = compact || config.peakWindows.length === 0 ? null : `${peakWindowsLabel(config.peakWindows)} · ${config.timezone === "local" ? t("section.zoneLocal") : config.timezone}`;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: peak ? "dsb-usage-peak on" : "dsb-usage-peak",
				children: [
					peak ? t("section.peak") : t("section.offpeak"),
					state.reason !== null && `（${t(REASON_KEYS[state.reason])}）`,
					schedule !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsb-usage-peak-zone",
						children: ` ${schedule}`
					}),
					changeText !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsb-usage-peak-zone",
						children: ` · ${changeText}`
					})
				]
			});
		});
		//#endregion
		//#region src/client/SettingsSection.tsx
		/**
		* Status-bar management page (`settings.section` entry): master switch,
		* wrap toggle, per-segment checkboxes with reordering, the user-maintained
		* model price book (each model owns its prices AND its peak schedule), and the
		* shared holiday calendar that drives DeepSeek's working-day rules.
		* Writes the same localStorage store as the bar and the usage dialog.
		*/
		/** One row: checkbox + label + hint + reorder arrows. */
		function SegmentRow({ id, enabled, first, last, t }) {
			const meta = SEGMENT_META[id];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsb-set-row",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dsb-set-check",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: enabled,
							onChange: () => {
								updateConfig({ segments: enabled ? getConfig().segments.filter((s) => s !== id) : [...getConfig().segments, id] });
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(meta.label) })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsb-set-hint",
						children: t(meta.hint)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dsb-set-arrows",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "↑",
							disabled: !enabled || first,
							onClick: () => moveSegment(id, -1),
							children: "↑"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "↓",
							disabled: !enabled || last,
							onClick: () => moveSegment(id, 1),
							children: "↓"
						})]
					})
				]
			});
		}
		/** Number field bound to one model-config number key. */
		function PriceField({ label, value, onChange }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "dsb-set-price",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "number",
					min: 0,
					step: .1,
					value: Number.isFinite(value) ? value : 0,
					onChange: (e) => {
						const parsed = Number.parseFloat(e.target.value);
						onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
					}
				})]
			});
		}
		/**
		* Clock field in 24-hour form. The native `input[type=time]` follows the
		* browser locale and renders 12-hour AM/PM for many users, so this keeps a
		* plain text draft, normalizes what it can (`9:00`, `0900`, `9` → `09:00`) and
		* only commits valid values upward.
		*/
		function TimeField({ label, value, onChange }) {
			const [draft, setDraft] = (0, react.useState)(value);
			(0, react.useEffect)(() => {
				setDraft(value);
			}, [value]);
			const commit = (raw) => {
				const normalized = normalizeHHMM(raw);
				if (normalized === null) {
					setDraft(value);
					return;
				}
				setDraft(normalized);
				if (normalized !== value) onChange(normalized);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "dsb-set-price",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					type: "text",
					className: "dsb-time-input",
					inputMode: "numeric",
					placeholder: "09:00",
					maxLength: 5,
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					onBlur: (e) => commit(e.target.value),
					onKeyDown: (e) => {
						if (e.key === "Enter") commit(e.target.value);
					}
				})]
			});
		}
		/** Day-type checkboxes for one peak window. */
		function DayTypePicker({ days, t, onToggle }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsb-set-daytypes",
				children: DAY_TYPES.map((day) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
					className: "dsb-set-check dsb-set-daytype",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: days.includes(day),
						onChange: () => onToggle(day)
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(day === "workday" ? "cal.workday" : day === "weekend" ? "cal.weekend" : "cal.holiday") })]
				}, day))
			});
		}
		/** One model's editable card: prices + peak schedule + live rule state. */
		function ModelCard({ model, config, isCurrent, index, dayRules, now, t }) {
			const [expanded, setExpanded] = (0, react.useState)(isCurrent);
			const patch = (p) => setModelConfig(model, p);
			const patchWindow = (id, p) => {
				patch({ peakWindows: config.peakWindows.map((w) => w.id === id ? {
					...w,
					...p
				} : w) });
			};
			const toggleWindowDay = (id, day) => {
				patch({ peakWindows: config.peakWindows.map((window) => {
					if (window.id !== id) return window;
					const days = window.days.includes(day) ? window.days.filter((value) => value !== day) : [...window.days, day];
					return {
						...window,
						days
					};
				}) });
			};
			const addWindow = () => {
				patch({ peakWindows: [...config.peakWindows, {
					id: nextPeakWindowId(),
					start: "09:00",
					end: "12:00",
					days: ["workday"]
				}] });
			};
			const removeWindow = (id) => {
				if (config.peakWindows.length <= 1) return;
				patch({ peakWindows: config.peakWindows.filter((w) => w.id !== id) });
			};
			const prices = effectivePrices({
				provider: "unknown",
				model
			}, getConfig().cost, now, dayRules, [], [], index);
			const state = prices?.day !== void 0 ? {
				tier: prices.source,
				reason: prices.reason,
				day: prices.day
			} : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: isCurrent ? "dsb-model-card current" : "dsb-model-card",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsb-model-head",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dsb-model-toggle",
						onClick: () => setExpanded(!expanded),
						"aria-expanded": expanded,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-model-name",
								children: model
							}),
							isCurrent && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-model-current",
								children: t("modelBook.current")
							}),
							state !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusPill, {
								config,
								state,
								index,
								now,
								t,
								compact: true
							})
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsb-model-del",
						"aria-label": t("modelBook.remove", { model }),
						title: t("modelBook.remove", { model }),
						onClick: () => removeModelConfig(model),
						children: "×"
					})]
				}), expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsb-model-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-set-cost",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: t("section.priceInput"),
									value: config.input,
									onChange: (v) => patch({ input: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: t("section.priceCacheRead"),
									value: config.cacheRead,
									onChange: (v) => patch({ cacheRead: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: t("section.priceCacheWrite"),
									value: config.cacheWrite,
									onChange: (v) => patch({ cacheWrite: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: t("section.priceOutput"),
									value: config.output,
									onChange: (v) => patch({ output: v })
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsb-set-hint",
							children: t("modelBook.cacheWriteHint")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-set-fetch",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsb-set-check",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: config.peakOffpeak,
									onChange: () => patch({ peakOffpeak: !config.peakOffpeak })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.peakOffpeak") })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dsb-set-reset",
								onClick: () => applyDeepSeekPreset(model),
								children: t("section.presetDeepseek")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsb-set-hint",
							children: t("section.peakOffpeakHint")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "dsb-set-check",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: config.weekendOffpeak,
								onChange: () => patch({ weekendOffpeak: !config.weekendOffpeak })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.weekendOffpeak") })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "dsb-set-check",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: config.holidayOffpeak,
								onChange: () => patch({ holidayOffpeak: !config.holidayOffpeak })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.holidayOffpeak") })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsb-set-hint",
							children: modelScopeHint(config, dayRules, t)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-set-cost",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsb-set-price",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.timezone") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
									value: config.timezone,
									onChange: (e) => patch({ timezone: e.target.value }),
									children: TIMEZONE_OPTIONS.map((tz) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: tz,
										children: tz === "local" ? `${t("section.zoneLocal")} (local)` : tz
									}, tz))
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsb-set-window-actions",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "dsb-set-reset",
									onClick: addWindow,
									children: ["+ ", t("section.addWindow")]
								})
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsb-set-windows",
							children: config.peakWindows.map((window) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsb-set-window",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimeField, {
										label: t("section.peakWindowStart"),
										value: window.start,
										onChange: (value) => patchWindow(window.id, { start: value })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimeField, {
										label: t("section.peakWindowEnd"),
										value: window.end,
										onChange: (value) => patchWindow(window.id, { end: value })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DayTypePicker, {
										days: window.days,
										t,
										onToggle: (day) => toggleWindowDay(window.id, day)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "dsb-set-window-del",
										"aria-label": t("section.removeWindow"),
										title: t("section.removeWindow"),
										disabled: config.peakWindows.length <= 1,
										onClick: () => removeWindow(window.id),
										children: "×"
									})
								]
							}, window.id))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-set-cost",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: `${t("section.peakPrices")} · ${t("section.priceInput")}`,
									value: config.peakInput,
									onChange: (v) => patch({ peakInput: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: `${t("section.peakPrices")} · ${t("section.priceCacheRead")}`,
									value: config.peakCacheRead,
									onChange: (v) => patch({ peakCacheRead: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: `${t("section.peakPrices")} · ${t("section.priceOutput")}`,
									value: config.peakOutput,
									onChange: (v) => patch({ peakOutput: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: `${t("section.offpeakPrices")} · ${t("section.priceInput")}`,
									value: config.offpeakInput,
									onChange: (v) => patch({ offpeakInput: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: `${t("section.offpeakPrices")} · ${t("section.priceCacheRead")}`,
									value: config.offpeakCacheRead,
									onChange: (v) => patch({ offpeakCacheRead: v })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PriceField, {
									label: `${t("section.offpeakPrices")} · ${t("section.priceOutput")}`,
									value: config.offpeakOutput,
									onChange: (v) => patch({ offpeakOutput: v })
								})
							]
						})
					]
				})]
			});
		}
		/** Is the plugin's own day rule active right now for this model? */
		function modelScopeHint(config, dayRules, t) {
			const parts = [config.peakOffpeak ? t("section.peakOffpeak") : t("usage.flat")];
			if (config.peakOffpeak && dayRules) {
				if (config.weekendOffpeak) parts.push(t("cal.weekend"));
				if (config.holidayOffpeak) parts.push(t("cal.holiday"));
			}
			return parts.join(" · ");
		}
		/** Shared holiday-calendar panel: status, refresh, next-7-days, overrides. */
		function CalendarPanel({ t }) {
			const config = useStatusBarConfig();
			const { calendars, status, index } = useHolidayView(config.calendar.overrides);
			const [draftDate, setDraftDate] = (0, react.useState)("");
			const [draftKind, setDraftKind] = (0, react.useState)("off");
			const [draftLabel, setDraftLabel] = (0, react.useState)("");
			useHolidayAutoFetch(config.calendar.autoFetch && config.calendar.dayRules);
			const today = dateInTimezone(zoneId(DEFAULT_PRICING_TIMEZONE)).date;
			const days = upcomingDays(today, 7, index);
			const years = calendars.map((calendar) => calendar.year).join(", ");
			const updated = status.fetchedAt === null ? t("cal.never") : new Date(status.fetchedAt).toLocaleString(void 0, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
			const addOverride = () => {
				if (!/^\d{4}-\d{2}-\d{2}$/.test(draftDate)) return;
				setHolidayOverride(draftDate, draftKind, draftLabel);
				setDraftDate("");
				setDraftLabel("");
			};
			const kindLabel = (override) => override.kind === "work" ? t("cal.kindWork") : t("cal.kindOff");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsb-cal",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsb-cal-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsb-cal-status",
							children: status.loading ? t("cal.loading") : config.calendar.autoFetch ? t("cal.loaded", {
								years: years === "" ? t("cal.never") : years,
								time: updated
							}) : t("cal.disabled")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsb-set-reset",
							disabled: status.loading,
							onClick: () => {
								holidayStore.load(true);
							},
							children: status.loading ? t("cal.loading") : t("cal.refresh")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dsb-set-check",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: config.calendar.dayRules,
							onChange: () => updateCalendar({ dayRules: !config.calendar.dayRules })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.dayRules") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-hint",
						children: t("section.dayRulesHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dsb-set-check",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: config.calendar.autoFetch,
							onChange: () => updateCalendar({ autoFetch: !config.calendar.autoFetch })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.autoFetch") })]
					}),
					!config.calendar.dayRules && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-hint",
						children: t("section.dayRulesOff")
					}),
					status.error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-msg",
						children: t("cal.error", { error: status.error })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-hint",
						children: t("section.calendarHint")
					}),
					days.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsb-cal-strip",
						children: days.map(({ facts }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsb-cal-chip",
							title: facts.name ?? "",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-cal-chip-date",
									children: facts.date.slice(5)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-cal-chip-week",
									children: t(WEEKDAY_KEYS[facts.weekday] ?? "cal.wd0")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: facts.isWorkday ? "dsb-cal-chip-kind work" : "dsb-cal-chip-kind off",
									children: facts.isWorkday ? t("cal.workday") : t(facts.kind === "holiday" ? "cal.holiday" : "cal.weekend")
								}),
								facts.name !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-cal-chip-name",
									children: facts.name
								})
							]
						}, facts.date))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsb-set-cost",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsb-set-price",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("cal.overrideDate") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "date",
									value: draftDate,
									onChange: (e) => setDraftDate(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsb-set-price",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("cal.overrideKind") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									value: draftKind,
									onChange: (e) => setDraftKind(e.target.value),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "off",
											children: t("cal.kindOff")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "work",
											children: t("cal.kindWork")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "auto",
											children: t("cal.kindAuto")
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "dsb-set-price",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("cal.overrideNote") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "text",
									value: draftLabel,
									placeholder: t("cal.overrideNotePlaceholder"),
									onChange: (e) => setDraftLabel(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsb-set-window-actions",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "dsb-set-reset",
									disabled: !/^\d{4}-\d{2}-\d{2}$/.test(draftDate),
									onClick: addOverride,
									children: ["+ ", t("cal.overrideAdd")]
								})
							})
						]
					}),
					config.calendar.overrides.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-usage-empty",
						children: t("cal.overrideEmpty")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsb-set-list",
						children: config.calendar.overrides.map((override) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-set-row",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-cal-override-date",
									children: override.date
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsb-set-hint",
									children: [kindLabel(override), override.label !== "" && ` · ${override.label}`]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsb-set-window-del",
									"aria-label": t("cal.overrideRemove", { date: override.date }),
									title: t("cal.overrideRemove", { date: override.date }),
									onClick: () => removeHolidayOverride(override.date),
									children: "×"
								})
							]
						}, override.date))
					})
				]
			});
		}
		const WEEKDAY_KEYS = {
			0: "cal.wd0",
			1: "cal.wd1",
			2: "cal.wd2",
			3: "cal.wd3",
			4: "cal.wd4",
			5: "cal.wd5",
			6: "cal.wd6"
		};
		const SettingsSection = (0, react.memo)(function SettingsSection(props) {
			const config = useStatusBarConfig();
			const { t } = props;
			const [newModel, setNewModel] = (0, react.useState)("");
			const [now, setNow] = (0, react.useState)(() => Date.now());
			(0, react.useEffect)(() => {
				const timer = window.setInterval(() => setNow(Date.now()), 3e4);
				return () => window.clearInterval(timer);
			}, []);
			const updateCost = (patch) => {
				updateConfig({ cost: {
					...config.cost,
					...patch
				} });
			};
			const modelNames = Object.keys(config.cost.models);
			const currentModel = useCurrentModel();
			const { index } = useHolidayView(config.calendar.overrides);
			useHolidayAutoFetch(config.calendar.autoFetch);
			const currentPricing = effectivePrices(currentModel !== void 0 ? {
				provider: "unknown",
				model: currentModel
			} : null, config.cost, now);
			const addModel = () => {
				const name = newModel.trim();
				if (name.length === 0) return;
				if (modelConfigFor(config.cost, name) === void 0) setModelConfig(name, {});
				setNewModel("");
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsb-set-page",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-intro",
						children: t("section.intro")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dsb-set-check",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: config.enabled,
							onChange: () => updateConfig({ enabled: !config.enabled })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.enabled") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-hint",
						children: t("section.enabledHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dsb-set-check",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: config.wrap,
							onChange: () => updateConfig({ wrap: !config.wrap })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.wrap") })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-hint",
						children: t("section.wrapHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: "dsb-set-heading",
						children: t("section.segments")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-hint",
						children: t("section.segmentsHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsb-set-list",
						children: SEGMENT_IDS.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SegmentRow, {
							id,
							enabled: config.segments.includes(id),
							first: config.segments[0] === id,
							last: config.segments[config.segments.length - 1] === id,
							t
						}, id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: "dsb-set-heading",
						children: t("section.calendarTitle")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CalendarPanel, { t }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: "dsb-set-heading",
						children: t("modelBook.title")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-set-hint",
						children: t("modelBook.hint")
					}),
					currentModel !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: "dsb-set-hint",
						children: [t("modelBook.currentModel", { model: currentModel }), currentPricing === null ? ` · ${t("modelBook.unconfigured")}` : ""]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dsb-set-price dsb-model-add",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("modelBook.addLabel") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-model-add-row",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "text",
								placeholder: "deepseek-flash",
								value: newModel,
								onChange: (e) => setNewModel(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter") addModel();
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dsb-set-reset",
								onClick: addModel,
								disabled: newModel.trim().length === 0,
								children: ["+ ", t("modelBook.add")]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dsb-set-price dsb-model-currency",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.currency") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							value: config.cost.currency,
							onChange: (e) => updateCost({ currency: e.target.value }),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "CNY",
								children: "CNY (¥)"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "USD",
								children: "USD ($)"
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsb-model-list",
						children: [modelNames.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsb-usage-empty",
							children: t("modelBook.empty")
						}), modelNames.map((name) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModelCard, {
							model: name,
							config: config.cost.models[name],
							isCurrent: name === currentModel,
							index,
							dayRules: config.calendar.dayRules,
							now,
							t
						}, name))]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: "dsb-set-heading",
						children: t("section.preview")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsb-bar dsb-wrap dsb-set-preview",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsb-seg",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-dot",
									style: { backgroundColor: "#e8b339" },
									"aria-hidden": true
								}), t("bar.status.running")]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-sep",
								"aria-hidden": true,
								children: "|"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-seg",
								children: t("preview.line")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "dsb-set-reset",
						onClick: resetConfig,
						children: t("section.reset")
					})
				]
			});
		});
		//#endregion
		//#region src/client/ChartCard.tsx
		/**
		* Per-model cost chart card: stacked bar chart of token costs inside the
		* usage dialog. Period switch (day = 24 hours, week = 7 days, month = days
		* of the month) plus previous/next period navigation; data comes from the
		* host usage ledger (`/status-bar/api/usage`) and is priced with the
		* user-maintained model price book (flat rates — peak/off-peak only applies
		* to the live moment, not to historical buckets).
		*/
		const PERIODS = [
			"day",
			"week",
			"month"
		];
		/** Distinct hues cycled by a stable model-name hash. */
		const MODEL_COLORS = [
			"#4e79a7",
			"#f28e2b",
			"#e15759",
			"#76b7b2",
			"#59a14f",
			"#edc948",
			"#b07aa1",
			"#ff9da7",
			"#9c755f",
			"#86bcb6",
			"#d4a6c8",
			"#8cd17d",
			"#f1ce63",
			"#a0cbe8",
			"#ffbe7d"
		];
		function modelColor(model) {
			let hash = 0;
			for (let i = 0; i < model.length; i += 1) hash = hash * 31 + model.charCodeAt(i) >>> 0;
			return MODEL_COLORS[hash % MODEL_COLORS.length] ?? "#4e79a7";
		}
		/** Cost of one bucket usage at a model's flat price-book rates (CNY/USD). */
		function bucketCost(cost, model, usage) {
			const cfg = modelConfigFor(cost, model);
			if (cfg === void 0) return 0;
			return (usage.input * cfg.input + usage.cacheRead * cfg.cacheRead + usage.cacheWrite * cfg.cacheWrite + usage.output * cfg.output) / 1e6;
		}
		/**
		* Load one period's usage. Uses a SYNCHRONOUS XHR on purpose: this GUI's
		* browser environment deterministically stalls async fetch/XHR responses,
		* while sync requests always complete — the payload is a few hundred bytes
		* served from an in-memory host ledger on loopback, so the blocking cost is
		* sub-millisecond and a hang is effectively impossible.
		*/
		function fetchUsageSync(period, offset) {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", `/status-bar/api/usage?period=${period}&offset=${offset}&_=${Date.now()}`, false);
			xhr.send();
			if (xhr.status !== 200) throw new Error(`HTTP ${xhr.status}`);
			return JSON.parse(xhr.responseText);
		}
		/** Local-time start of the CURRENT period (mirrors the host's periodStart). */
		function currentPeriodStart(period, now = Date.now()) {
			const d = new Date(now);
			d.setMinutes(0, 0, 0);
			if (period === "day") {
				d.setHours(0, 0, 0, 0);
				return d.getTime();
			}
			if (period === "week") {
				const mondayOffset = (d.getDay() + 6) % 7;
				d.setDate(d.getDate() - mondayOffset);
				d.setHours(0, 0, 0, 0);
				return d.getTime();
			}
			d.setDate(1);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		}
		/**
		* Hook: while the chart shows the current period (offset 0) with data, poll
		* the calendar boundary every 30s; when the boundary moved past the loaded
		* data's start, bump a tick that re-runs the data effect (which then loads
		* the new current period).
		*/
		function useRolloverRefresh(period, offset, data, retryTick) {
			const [rolloverTick, setRolloverTick] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				if (offset !== 0 || data === null) return;
				const timer = window.setInterval(() => {
					if (currentPeriodStart(period) > data.start) setRolloverTick((t) => t + 1);
				}, 3e4);
				return () => window.clearInterval(timer);
			}, [
				period,
				offset,
				data,
				retryTick
			]);
			return rolloverTick;
		}
		const ChartCard = (0, react.memo)(function ChartCard({ cost, t }) {
			const [period, setPeriod] = (0, react.useState)("day");
			const [offset, setOffset] = (0, react.useState)(0);
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [retryTick, setRetryTick] = (0, react.useState)(0);
			const rolloverTick = useRolloverRefresh(period, offset, data, retryTick);
			(0, react.useEffect)(() => {
				let cancelled = false;
				setError(null);
				setData(null);
				try {
					const body = fetchUsageSync(period, offset);
					if (!cancelled) setData(body);
				} catch (err) {
					if (!cancelled) setError(String(err?.message ?? err));
				}
				return () => {
					cancelled = true;
				};
			}, [
				period,
				offset,
				retryTick,
				rolloverTick
			]);
			const buckets = data?.buckets.map((bucket) => {
				const per = /* @__PURE__ */ new Map();
				let total = 0;
				for (const [model, usage] of Object.entries(bucket.usage)) {
					const c = bucketCost(cost, model, usage);
					if (c <= 0) continue;
					per.set(model, c);
					total += c;
				}
				return {
					key: bucket.key,
					per,
					total
				};
			}) ?? [];
			const maxTotal = Math.max(1, ...buckets.map((b) => b.total));
			const modelTotals = /* @__PURE__ */ new Map();
			for (const bucket of buckets) for (const [model, c] of bucket.per) modelTotals.set(model, (modelTotals.get(model) ?? 0) + c);
			const models = [...modelTotals.entries()].sort((a, b) => b[1] - a[1]);
			const label = data === null ? "" : period === "day" ? new Date(data.start).toLocaleDateString(void 0, {
				month: "long",
				day: "numeric"
			}) : period === "week" ? `${new Date(data.start).toLocaleDateString(void 0, {
				month: "numeric",
				day: "numeric"
			})} – ${(/* @__PURE__ */ new Date(data.end - 1)).toLocaleDateString(void 0, {
				month: "numeric",
				day: "numeric"
			})}` : new Date(data.start).toLocaleDateString(void 0, {
				year: "numeric",
				month: "long"
			});
			const labelStep = period === "day" ? 3 : period === "week" ? 1 : Math.ceil(buckets.length / 10);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsb-chart-card",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsb-chart-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsb-chart-title",
							children: t("chart.title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-chart-controls",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsb-chart-periods",
								children: PERIODS.map((p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: p === period ? "active" : void 0,
									onClick: () => {
										setPeriod(p);
										setOffset(0);
									},
									children: t(`chart.${p}`)
								}, p))
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsb-chart-nav",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t("chart.prev"),
										title: t("chart.prev"),
										onClick: () => setOffset(offset + 1),
										children: "‹"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsb-chart-period-label",
										children: label
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": t("chart.next"),
										title: t("chart.next"),
										disabled: offset <= 0,
										onClick: () => setOffset(Math.max(0, offset - 1)),
										children: "›"
									})
								]
							})]
						})]
					}),
					error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsb-chart-error",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsb-usage-empty",
							children: t("chart.fail", { error })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dsb-set-reset",
							onClick: () => setRetryTick((t) => t + 1),
							children: t("chart.retry")
						})]
					}),
					error === null && data === null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-usage-empty",
						children: t("chart.loading")
					}),
					error === null && data !== null && buckets.every((b) => b.total <= 0) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dsb-usage-empty",
						children: t("chart.empty")
					}),
					error === null && data !== null && buckets.some((b) => b.total > 0) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsb-chart",
						children: buckets.map((bucket, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-chart-col-wrap",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsb-chart-col",
								style: { height: `${Math.max(2, bucket.total / maxTotal * 100)}%` },
								children: bucket.total > 0 && [...bucket.per.entries()].map(([model, c]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsb-chart-seg",
									style: {
										height: `${c / bucket.total * 100}%`,
										backgroundColor: modelColor(model)
									},
									title: `${model}: ${formatCost(c, cost.currency)}`
								}, model))
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-chart-xlabel",
								children: i % labelStep === 0 ? bucket.key : ""
							})]
						}, i))
					}), models.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dsb-chart-legend",
						children: models.map(([model, total]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsb-chart-legend-item",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-chart-legend-swatch",
									style: { backgroundColor: modelColor(model) }
								}),
								model,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-chart-legend-cost",
									children: formatCost(total, cost.currency)
								}),
								modelConfigFor(cost, model) === void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dsb-chart-unpriced",
									children: [
										"(",
										t("chart.unpriced"),
										")"
									]
								})
							]
						}, model))
					})] })
				]
			});
		});
		//#endregion
		//#region src/client/UsageDialog.tsx
		/**
		* Usage & cost dialog: a chart icon button at the right end of the composer
		* tool row (next to the quick-toggle gear) opens a modal with the current
		* conversation's provider-reported token usage, the estimated cost at the
		* current model's price-book entry (flat or peak/off-peak), and a recent
		* per-step usage history table — OpenAI-usage-panel style, but fed entirely
		* by DSH's own accounting.
		*/
		function Row({ label, value, hint }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsb-usage-stat",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsb-usage-stat-value",
						children: value
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsb-usage-stat-label",
						children: label
					}),
					hint !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dsb-usage-stat-hint",
						children: hint
					})
				]
			});
		}
		const HISTORY_PAGE_SIZE = 20;
		/** Cap total history entries shown (page size × max pages: 20 × 10). */
		const HISTORY_MAX_ROWS = 200;
		function HistoryTable({ rows, currency, t }) {
			const [page, setPage] = (0, react.useState)(0);
			const totalPages = Math.max(1, Math.ceil(rows.length / HISTORY_PAGE_SIZE));
			const safePage = Math.min(page, totalPages - 1);
			const pageRows = rows.slice(safePage * HISTORY_PAGE_SIZE, (safePage + 1) * HISTORY_PAGE_SIZE);
			if (rows.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "dsb-usage-empty",
				children: t("usage.empty")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsb-usage-table-wrap",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
					className: "dsb-usage-table",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("usage.time") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("usage.model") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							className: "num",
							children: t("usage.input")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							className: "num",
							children: t("usage.cacheRead")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							className: "num",
							children: t("usage.output")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
							className: "num",
							children: t("usage.cost")
						})
					] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: pageRows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							className: "time",
							children: new Date(row.time).toLocaleString(void 0, {
								month: "2-digit",
								day: "2-digit",
								hour: "2-digit",
								minute: "2-digit"
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							className: "model",
							children: row.model ?? "—"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							className: "num",
							children: formatTokens(row.input)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
							className: "num",
							children: [formatTokens(row.cacheRead), row.cacheWrite > 0 && ` +${t("usage.cacheWrite")} ${formatTokens(row.cacheWrite)}`]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							className: "num",
							children: formatTokens(row.output)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							className: "num",
							children: row.cost === null ? "—" : formatCost(row.cost, currency)
						})
					] }, row.seq)) })]
				})
			}), totalPages > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dsb-usage-pager",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("usage.page", {
						current: safePage + 1,
						total: totalPages
					}) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: safePage <= 0,
						onClick: () => setPage(safePage - 1),
						children: t("usage.prev")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: safePage >= totalPages - 1,
						onClick: () => setPage(safePage + 1),
						children: t("usage.next")
					})
				]
			})] });
		}
		function PeakBadge({ config, index, now, t }) {
			const state = resolveBilling(config, index, now);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusPill, {
				config,
				state,
				index,
				now,
				t
			});
		}
		const UsageDialogEntry = (0, react.memo)(function UsageDialogEntry(props) {
			const config = useStatusBarConfig();
			const { useChat, useProjection, useSessions, sessionId, t } = props;
			const [open, setOpen] = (0, react.useState)(false);
			const session = useChat((state) => state.legacy);
			const usage = useProjection("tokenUsage");
			const pressure = useProjection("contextPressure");
			const sessionUsage = useProjection("sessionUsage");
			const now = Date.now();
			const breakdown = costBreakdown(sessionUsage, config.cost, now);
			const sessionModelValue = useProjection("sessionModel");
			const sessionModel = sessionModelValue !== void 0 && sessionModelValue.model !== null ? {
				provider: sessionModelValue.provider ?? "unknown",
				model: sessionModelValue.model
			} : void 0;
			const summary = useSessions((state) => state.byId[sessionId]);
			const modelConfig = modelConfigFor(config.cost, sessionModel?.model);
			const { index } = useHolidayView(config.calendar.overrides);
			useHolidayAutoFetch(config.calendar.autoFetch);
			const pricing = {
				dayRules: config.calendar.dayRules,
				overrides: config.calendar.overrides
			};
			const prices = effectivePrices(sessionModel ?? null, config.cost, now, pricing.dayRules, currentCalendars(), pricing.overrides, index);
			const rows = usageHistory(session, sessionUsage, config.cost, HISTORY_MAX_ROWS, pricing);
			const billedInput = usage === void 0 ? 0 : usage.uncachedInputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
			const totalCost = breakdown !== null ? breakdown.total : usage !== void 0 && prices !== null ? (usage.uncachedInputTokens * prices.input + usage.cacheReadTokens * prices.cacheRead + usage.cacheWriteTokens * prices.cacheWrite + usage.outputTokens * prices.output) / 1e6 : null;
			const usedTokens = pressure?.projectedTokens ?? pressure?.pressureTokens;
			const contextPercent = usedTokens !== void 0 && pressure?.contextWindow !== void 0 ? Math.min(100, Math.round(usedTokens / pressure.contextWindow * 100)) : null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dsb-quick",
				title: t("usage.title"),
				"aria-label": t("usage.title"),
				onClick: () => setOpen(true),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutlineRegular, { size: 16 })
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				onClose: () => setOpen(false),
				title: t("usage.title"),
				description: t("usage.subtitle"),
				closeLabel: t("usage.close"),
				className: "dsb-usage-modal",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsb-usage-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-usage-hero",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsb-usage-hero-label",
								children: t("usage.totalCost")
							}), totalCost === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dsb-usage-hero-missing",
								children: sessionModel === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-usage-hero-wait",
									children: t("usage.unknownModel")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("usage.unconfigured", { model: sessionModel.model }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "dsb-usage-hero-add",
									onClick: () => setModelConfig(sessionModel.model, {}),
									children: t("usage.addDefault")
								})] })
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-usage-cost-num",
								children: formatCost(totalCost, config.cost.currency)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsb-usage-hero-sub",
								children: [
									modelConfig !== null && modelConfig !== void 0 && modelConfig.peakOffpeak && prices !== null && prices.source !== "flat" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PeakBadge, {
										config: modelConfig,
										index,
										now,
										t
									}),
									sessionModel !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsb-usage-model-chip",
										children: sessionModel.model
									}),
									summary !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dsb-usage-model-chip",
										children: summary.displayTitle
									})
								]
							})] })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChartCard, {
							cost: config.cost,
							t
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-usage-stats",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("usage.input"),
									value: usage === void 0 ? "—" : formatTokens(billedInput),
									hint: t("usage.inputHint")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("usage.cacheRead"),
									value: usage === void 0 ? "—" : formatTokens(usage.cacheReadTokens)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("usage.cacheWrite"),
									value: usage === void 0 ? "—" : formatTokens(usage.cacheWriteTokens)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("usage.output"),
									value: usage === void 0 ? "—" : formatTokens(usage.outputTokens)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("usage.cacheHitRate"),
									value: usage === void 0 || billedInput <= 0 ? "—" : `${Math.min(99.99, usage.cacheReadTokens / billedInput * 100).toFixed(2)}%`
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Row, {
									label: t("usage.context"),
									value: contextPercent === null ? "—" : `${contextPercent}%`,
									hint: usedTokens !== void 0 && pressure?.contextWindow !== void 0 ? `${formatTokens(usedTokens)} / ${formatTokens(pressure.contextWindow)}` : void 0
								})
							]
						}),
						modelConfig !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsb-usage-prices",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-usage-prices-title",
								children: t("usage.prices", { model: sessionModel?.model ?? "?" })
							}), prices !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									t("usage.pIn"),
									" ",
									formatCost(prices.input, config.cost.currency)
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									t("usage.pCache"),
									" ",
									formatCost(prices.cacheRead, config.cost.currency)
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									t("usage.pOut"),
									" ",
									formatCost(prices.output, config.cost.currency)
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsb-usage-price-src",
									children: prices.source === "flat" ? t("usage.flat") : t(prices.source === "peak" ? "section.source.peak" : "section.source.offpeak")
								})
							] })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsb-usage-history-title",
							children: t("usage.history")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsb-set-hint",
							children: t("usage.historyHint")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryTable, {
							rows,
							currency: config.cost.currency,
							t
						})
					]
				})
			})] });
		});
		//#endregion
		//#region src/client/index.ts
		/** Bar + manager styles. Class names are prefixed `dsb-` to stay collision-free. */
		const STYLES = `
.dsb-bar {
  display: block;
  text-align: center;
  width: 100%;
  /* Bound to the composer input card so the bar never runs past the input
     box's edges: single-line mode elides within this cap, wrap mode (below)
     reflows inside it. The composer context provides
     --dsh-composer-card-max-width; the fallback only serves the settings
     preview, whose own box is narrower than 780px anyway. */
  max-width: var(--dsh-composer-card-max-width, 780px);
  margin: 0 auto;
  box-sizing: border-box;
  padding: 4px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.dsb-bar.dsb-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 10px;
  row-gap: 2px;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}
.dsb-sep {
  color: var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.25));
}
.dsb-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: 1px;
  box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 12%, transparent);
}
.dsb-seg {
  display: inline-block;
  max-width: 100%;
}
.dsb-quick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #c8ccd4);
  cursor: pointer;
}
.dsb-quick:hover,
.dsb-quick[aria-expanded="true"] {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #c8ccd4) 14%, transparent);
  color: var(--dsw-alias-label-primary, #e8eaee);
}
.dsb-set-page {
  max-width: 680px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dsw-alias-label-primary, #e8eaee);
}
.dsb-set-intro {
  margin: 0 0 14px;
  color: var(--dsw-alias-label-secondary, #c8ccd4);
}
.dsb-set-heading {
  margin: 18px 0 4px;
  font-size: 13px;
  font-weight: 600;
}
.dsb-set-hint {
  margin: 2px 0 8px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-set-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.dsb-set-check input {
  accent-color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-set-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 6px 0;
}
.dsb-set-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 3px 6px;
  border-radius: 6px;
}
.dsb-set-row:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #c8ccd4) 8%, transparent);
}
.dsb-set-row .dsb-set-check {
  min-width: 150px;
}
.dsb-set-row .dsb-set-hint {
  flex: 1;
  margin: 0;
}
.dsb-set-arrows {
  display: inline-flex;
  gap: 2px;
}
.dsb-set-arrows button {
  width: 22px;
  height: 22px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #c8ccd4);
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}
.dsb-set-arrows button:disabled {
  opacity: 0.35;
  cursor: default;
}
.dsb-set-cost {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin: 6px 0;
}
.dsb-set-price {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-set-price input,
.dsb-set-price select {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 12px;
  height: 30px;
  box-sizing: border-box;
  color-scheme: light dark;
}
.dsb-set-price input:focus,
.dsb-set-price select:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-set-price select option {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-set-preview {
  margin: 6px 0 14px;
  padding: 6px 10px;
  border: 1px dashed var(--dsw-alias-border-l3, rgba(0, 0, 0, 0.16));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.dsb-set-fetch {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 10px;
  flex-wrap: wrap;
}
.dsb-set-fetch .dsb-set-hint {
  margin: 0;
}
.dsb-set-msg {
  margin: 4px 0 10px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 10%, transparent);
  color: var(--dsw-alias-label-secondary, #5b6472);
  white-space: pre-wrap;
  word-break: break-all;
}
.dsb-set-window-actions {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.dsb-set-windows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 4px 0 10px;
}
.dsb-set-window {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.dsb-set-window .dsb-set-price {
  flex: 1;
}
.dsb-set-window-del {
  width: 28px;
  height: 30px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.dsb-set-window-del:hover:not(:disabled) {
  border-color: #e5484d;
  color: #e5484d;
}
.dsb-set-window-del:disabled {
  opacity: 0.35;
  cursor: default;
}
/* Peak-window row: 24-hour clock fields + the day types the window covers. */
.dsb-set-window .dsb-time-input {
  width: 88px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.dsb-set-daytypes {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 6px;
}
.dsb-set-daytype {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #5b6472);
  white-space: nowrap;
}
/* Shared holiday calendar: status row, 7-day strip, manual exceptions. */
.dsb-cal {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 6px 0 14px;
}
.dsb-cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.dsb-cal-status {
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-cal-strip {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin: 6px 0 10px;
}
.dsb-cal-chip {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 62px;
  padding: 5px 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  font-size: 11px;
  line-height: 1.35;
}
.dsb-cal-chip-date {
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-cal-chip-week {
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-cal-chip-kind {
  font-weight: 600;
}
.dsb-cal-chip-kind.off {
  color: #2e9e5b;
}
.dsb-cal-chip-kind.work {
  color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-cal-chip-name {
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-cal-override-date {
  font-variant-numeric: tabular-nums;
  min-width: 92px;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-usage-peak-zone {
  opacity: 0.75;
}
.dsb-set-msg.ok {
  background: color-mix(in srgb, #2ecc71 12%, transparent);
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-set-reset:disabled {
  opacity: 0.5;
  cursor: default;
}
.dsb-set-reset {
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  color: var(--dsw-alias-label-secondary, #5b6472);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
}
.dsb-set-reset:hover {
  border-color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-modal {
  width: min(1080px, calc(100vw - 48px));
}
.dsb-usage-modal .dsb-usage-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  /* The panel's content box is narrower than the viewport (panel padding),
     so sizing against the viewport overflows the panel and its
     overflow:hidden clips the right edge (e.g. the table's cost column).
     Size against the panel content box instead. */
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  max-height: min(80vh, 760px);
  overflow-y: auto;
  padding-right: 4px;
}
.dsb-chart-card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dsb-chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.dsb-chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dsb-chart-periods {
  display: inline-flex;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  overflow: hidden;
}
.dsb-chart-periods button {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
}
.dsb-chart-periods button.active {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 14%, transparent);
  color: var(--dsw-alias-brand-primary, #4176e6);
  font-weight: 600;
}
.dsb-chart-nav {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dsb-chart-nav button {
  width: 24px;
  height: 24px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.dsb-chart-nav button:disabled {
  opacity: 0.35;
  cursor: default;
}
.dsb-chart-period-label {
  min-width: 110px;
  text-align: center;
  font-size: 12px;
  color: var(--dsw-alias-label-primary, #1a1d24);
  font-variant-numeric: tabular-nums;
}
.dsb-chart {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 170px;
  padding-top: 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  min-width: 560px;
  overflow-x: auto;
}
.dsb-chart-col-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 0;
  height: 100%;
}
.dsb-chart-col {
  width: 100%;
  max-width: 26px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 2px 2px 0 0;
  background: color-mix(in srgb, var(--dsw-alias-label-tertiary, #9aa0aa) 18%, transparent);
  min-height: 2px;
}
.dsb-chart-seg {
  width: 100%;
}
.dsb-chart-xlabel {
  font-size: 9px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dsb-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 11px;
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.dsb-chart-legend-swatch {
  width: 9px;
  height: 9px;
  border-radius: 2px;
}
.dsb-chart-legend-cost {
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-chart-unpriced {
  color: #e5484d;
}
.dsb-chart-error {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dsb-chart-error .dsb-usage-empty {
  padding: 0;
}
.dsb-usage-hero {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 16px 18px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
}
.dsb-usage-hero-label {
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-cost-num {
  font-size: 34px;
  font-weight: 650;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-usage-hero-missing {
  font-size: 13px;
  color: #e5484d;
  padding: 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dsb-usage-hero-missing .dsb-usage-hero-wait {
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-hero-add {
  font-size: 12px;
  line-height: 1;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
  cursor: pointer;
}
.dsb-usage-hero-add:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #5b6472) 8%, transparent);
}
.dsb-usage-hero-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.dsb-usage-model-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-label-secondary, #5b6472) 12%, transparent);
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-peak {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, #5b8def 14%, transparent);
  color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-peak.on {
  background: color-mix(in srgb, #e8b339 16%, transparent);
  color: #a06a00;
}
.dsb-usage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.dsb-usage-stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
}
.dsb-usage-stat-value {
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-usage-stat-label {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-stat-hint {
  font-size: 10px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-prices {
  display: flex;
  align-items: center;
  gap: 8px 14px;
  flex-wrap: wrap;
  width: fit-content;
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  font-size: 12px;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-variant-numeric: tabular-nums;
}
.dsb-usage-prices-title {
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1d24);
  margin-right: 6px;
}
.dsb-usage-price-src {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 12%, transparent);
}
.dsb-usage-history-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-usage-table-wrap {
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  overflow-x: auto;
}
.dsb-usage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dsb-usage-table th,
.dsb-usage-table td {
  padding: 7px 10px;
  text-align: left;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  white-space: nowrap;
}
.dsb-usage-table th {
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  font-weight: 500;
}
.dsb-usage-table td.num,
.dsb-usage-table th.num {
  text-align: right;
  white-space: nowrap;
}
.dsb-usage-table td:nth-child(3),
.dsb-usage-table th:nth-child(3),
.dsb-usage-table td:nth-child(4),
.dsb-usage-table th:nth-child(4),
.dsb-usage-table td:nth-child(5),
.dsb-usage-table th:nth-child(5) {
  min-width: 84px;
}
.dsb-usage-table td:nth-child(1),
.dsb-usage-table th:nth-child(1) {
  min-width: 88px;
}
.dsb-usage-table td:nth-child(2),
.dsb-usage-table th:nth-child(2) {
  min-width: 132px;
}
.dsb-usage-table td.model {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsb-model-add {
  margin: 8px 0 4px;
}
.dsb-model-add-row {
  display: flex;
  gap: 8px;
}
.dsb-model-add-row input {
  flex: 1;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-primary, #1a1d24);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  height: 30px;
  box-sizing: border-box;
}
.dsb-model-currency {
  margin: 10px 0 4px;
  max-width: 200px;
}
.dsb-model-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0;
}
.dsb-model-card {
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  overflow: hidden;
}
.dsb-model-card.current {
  border-color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-model-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
}
.dsb-model-toggle {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
  flex-wrap: wrap;
}
.dsb-model-name {
  font-size: 13px;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  color: var(--dsw-alias-label-primary, #1a1d24);
}
.dsb-model-current {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4176e6) 14%, transparent);
  color: var(--dsw-alias-brand-primary, #4176e6);
}
.dsb-model-del {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
}
.dsb-model-del:hover {
  color: #e5484d;
  background: color-mix(in srgb, #e5484d 10%, transparent);
}
.dsb-model-body {
  padding: 0 12px 12px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.08));
  padding-top: 10px;
}
.dsb-usage-pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
.dsb-usage-pager span {
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
}
.dsb-usage-pager button {
  min-width: 64px;
  height: 28px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.12));
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #5b6472);
  font-size: 12px;
  cursor: pointer;
}
.dsb-usage-pager button:hover:not(:disabled) {
  border-color: var(--dsw-alias-label-secondary, #5b6472);
}
.dsb-usage-pager button:disabled {
  opacity: 0.4;
  cursor: default;
}
.dsb-usage-empty {
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary, #9aa0aa);
  padding: 10px 0;
}
`;
		function installStyles() {
			const style = document.createElement("style");
			style.dataset.plugin = "@bananiceee/dsh-status-bar";
			style.textContent = STYLES;
			document.head.appendChild(style);
			return () => {
				style.remove();
			};
		}
		/** Client services required by this plugin. */
		const inject = [
			"slots",
			"locale",
			"jobs",
			"sessions"
		];
		/** Register the bar, the quick menu, and the management page. */
		function apply(ctx) {
			ctx.effect(installStyles, "dsh-status-bar: styles");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-status-bar: locale");
			const liveRate = new LiveRateStore();
			ctx.effect(() => () => {
				liveRate.reset();
			}, "dsh-status-bar: live rate teardown");
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "stats",
				priority: -1,
				order: 0,
				locale: NS,
				inject: () => ({
					hooks: {
						jobs: ctx.jobs.state,
						liveRate
					},
					watchRows: (sessionId) => ctx.jobs.watchRows(sessionId),
					watchLiveRate: (sessionId) => liveRate.watch(ctx.sessions, sessionId)
				})
			}, StatusBarDockEntry));
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "status-bar-quick",
				order: 950,
				locale: NS
			}, QuickMenuEntry));
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "status-bar-usage",
				order: 951,
				locale: NS
			}, UsageDialogEntry));
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "status-bar",
				order: 40,
				label: () => ctx.locale.bind(NS)("nav"),
				locale: NS
			}, SettingsSection));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map