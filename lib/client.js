window.__ModuleLoader__.load({
	id: "dsh-status-bar",
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
			"section.peakOffpeakHint": "按所选时区与峰谷时段，对该模型的输入/输出/缓存命中价格采用峰/谷两档；缓存写入仍使用平峰价。",
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
			"section.reset": "恢复默认",
			"section.preview": "预览（示例数据）",
			"modelBook.title": "模型价格库",
			"modelBook.hint": "添加你使用的模型并填写单价（每 1M token）；每个模型可单独设置峰谷时段与价格。底栏费用段与用量弹窗按当前会话的模型自动选用对应价格。",
			"modelBook.current": "当前会话",
			"modelBook.remove": "删除 {model}",
			"modelBook.addLabel": "新模型",
			"modelBook.add": "添加",
			"modelBook.empty": "尚未添加模型——输入模型名（如 deepseek-v4-flash）后点击添加。",
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
			"preview.line": "2 轮 · 51 步 | deepseek-v4-flash | 上下文 62% | 缓存命中 98% | TPS 123 tok/s"
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
			"section.peakOffpeakHint": "Apply peak/off-peak input, cache-hit & output rates for this model in its timezone; cache-write stays at the flat rate.",
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
			"section.reset": "Reset to defaults",
			"section.preview": "Preview (sample data)",
			"modelBook.title": "Model price book",
			"modelBook.hint": "Add the models you use and fill in their rates (per 1M tokens); each model has its own peak/off-peak schedule. The bar cost segment and the usage dialog pick the current session model automatically.",
			"modelBook.current": "current session",
			"modelBook.remove": "Remove {model}",
			"modelBook.addLabel": "New model",
			"modelBook.add": "Add",
			"modelBook.empty": "No models yet — type a model id (e.g. deepseek-v4-flash) and press Add.",
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
			"preview.line": "2 turns · 51 steps | deepseek-v4-flash | Context 62% | Cache hit 98% | TPS 123 tok/s"
		};
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
			"agent",
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
			agent: {
				label: "seg.agent",
				hint: "seg.agentHint",
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
		let peakWindowSeq = 0;
		/** Fresh id for a peak window row. */
		function nextPeakWindowId() {
			peakWindowSeq += 1;
			return `pw-${Date.now().toString(36)}-${peakWindowSeq}`;
		}
		/** Default peak windows for a newly added model (DeepSeek's official schedule). */
		const DEFAULT_PEAK_WINDOWS = [{
			id: "peak-1",
			start: "09:00",
			end: "12:00"
		}, {
			id: "peak-2",
			start: "14:00",
			end: "18:00"
		}];
		const DEFAULT_CONFIG = {
			enabled: true,
			wrap: true,
			segments: SEGMENT_IDS.filter((id) => SEGMENT_META[id].defaultOn),
			cost: {
				currency: "CNY",
				models: {}
			}
		};
		function defaultModelConfig() {
			return {
				input: 2,
				cacheRead: .5,
				cacheWrite: 2,
				output: 8,
				peakOffpeak: false,
				timezone: "local",
				peakWindows: DEFAULT_PEAK_WINDOWS.map((w) => ({ ...w })),
				peakInput: 3,
				peakCacheRead: .1,
				peakOutput: 9,
				offpeakInput: 1.5,
				offpeakCacheRead: .05,
				offpeakOutput: 4.5
			};
		}
		/** Sanitize one model config (fills defaults for missing fields). */
		function normalizeModelConfig(raw) {
			const base = defaultModelConfig();
			if (raw === void 0) return base;
			const merged = {
				...base,
				...raw
			};
			if (!Array.isArray(merged.peakWindows) || merged.peakWindows.length === 0) merged.peakWindows = base.peakWindows;
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
			const raw = readStorage();
			if (raw === null) return DEFAULT_CONFIG;
			try {
				const parsed = JSON.parse(raw);
				const segments = Array.isArray(parsed.segments) ? parsed.segments.filter((id) => SEGMENT_IDS.includes(id)) : DEFAULT_CONFIG.segments;
				const cost = parsed.cost !== void 0 && typeof parsed.cost === "object" && "models" in parsed.cost ? {
					currency: parsed.cost.currency === "USD" ? "USD" : "CNY",
					models: parsed.cost.models
				} : migrateCost(parsed);
				return {
					enabled: parsed.enabled !== false,
					wrap: parsed.wrap === true,
					segments: segments.length > 0 ? segments : DEFAULT_CONFIG.segments,
					cost
				};
			} catch {
				return DEFAULT_CONFIG;
			}
		}
		let config = load();
		const listeners = /* @__PURE__ */ new Set();
		function readStorage() {
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
			for (const listener of listeners) listener();
		}
		function subscribeConfig(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
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
		function resetConfig() {
			persist({ ...DEFAULT_CONFIG });
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
		/** Reactive read for React components (bar, usage dialog, settings page). */
		function useStatusBarConfig() {
			return (0, react.useSyncExternalStore)(subscribeConfig, getConfig);
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
		//#region src/client/timezone.ts
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
		/** Hour of day (0-23) at the given IANA timezone (or the local zone). */
		function hourInTimezone(timezone, at = /* @__PURE__ */ new Date()) {
			if (timezone === "local" || timezone === "") return at.getHours();
			try {
				return Number(new Intl.DateTimeFormat("en-US", {
					timeZone: timezone,
					hour: "2-digit",
					hourCycle: "h23"
				}).format(at));
			} catch {
				return at.getHours();
			}
		}
		/** Parse 'HH:MM' → minutes since midnight; NaN-safe. */
		function parseHHMM(value) {
			const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
			if (m === null) return NaN;
			const h = Number(m[1]);
			const min = Number(m[2]);
			if (h > 23 || min > 59) return NaN;
			return h * 60 + min;
		}
		/** Is `hour` inside the [start, end) window? Supports windows crossing midnight. */
		function inPeakWindow(hour, start, end) {
			const s = parseHHMM(start);
			const e = parseHHMM(end);
			if (Number.isNaN(s) || Number.isNaN(e)) return false;
			if (s === e) return true;
			const h = hour * 60;
			if (s < e) return h >= s && h < e;
			return h >= s || h < e;
		}
		/** Is `hour` inside ANY of the configured peak windows? */
		function inAnyPeakWindow(hour, windows) {
			for (const window of windows) if (inPeakWindow(hour, window.start, window.end)) return true;
			return false;
		}
		/** Human label of the peak windows, e.g. '09:00–12:00, 14:00–18:00'. */
		function peakWindowsLabel(windows) {
			return windows.map((w) => `${w.start}–${w.end}`).join(", ");
		}
		//#endregion
		//#region src/client/session-usage-cost.ts
		/**
		* Split the whole-session usage into a per-model cost breakdown, each model
		* priced with ITS OWN price-book entry (peak/off-peak applied at `now`). A
		* model with no configured entry, or one whose effective prices are all zero,
		* is skipped (its cost is unknowable). Returns null when there is no state or
		* no model could be priced.
		*/
		function costBreakdown(state, cost, now) {
			if (state === void 0) return null;
			const perModel = /* @__PURE__ */ new Map();
			const pricedModels = [];
			let total = 0;
			for (const [model, usage] of Object.entries(state.models)) {
				const prices = effectivePrices({
					provider: "unknown",
					model
				}, cost, now);
				if (prices === null) continue;
				if (prices.input <= 0 && prices.cacheRead <= 0 && prices.cacheWrite <= 0 && prices.output <= 0) continue;
				const stepCost = costOfUsage({
					uncachedInputTokens: usage.input,
					cacheReadTokens: usage.cacheRead,
					cacheWriteTokens: usage.cacheWrite,
					outputTokens: usage.output
				}, prices);
				perModel.set(model, stepCost);
				total += stepCost;
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
		* applied to `now`, or the fold's recorded time when present). Returns null
		* when the step's model is unknown or unconfigured.
		*/
		function stepCost(state, seq, provenance, usage, cost) {
			const model = stepModel(state, seq, provenance);
			if (model === null) return null;
			const prices = effectivePrices(model, cost, state?.bySeq[String(seq)]?.time ?? Date.now());
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
		function deriveWindowStats(session) {
			let turns = 0;
			let steps = 0;
			let llmMs = 0;
			let toolMs = 0;
			let ttftMs = 0;
			let ttftSteps = 0;
			let decodeMs = 0;
			let decodeTokens = 0;
			const seenTurns = /* @__PURE__ */ new Set();
			for (const node of session.nodes) {
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
		* falling back to the window's last assistant node with provenance (the
		* shipped assembly omits provenance, so the projection is the live path).
		*/
		function lastModel(session, sessionModel) {
			if (sessionModel !== void 0 && sessionModel.model !== null) return sessionModel;
			for (let i = session.nodes.length - 1; i >= 0; i -= 1) {
				const node = session.nodes[i];
				if (node?.kind === "assistant" && node.provenance !== void 0) return node.provenance;
			}
			return null;
		}
		/** Failed/retried steps visible in the window (durable notices + turn errors). */
		function errorCount(session) {
			let count = 0;
			for (const node of session.nodes) if (node.kind === "model-retry" || node.kind === "turn-error" || node.kind === "turn-max-tokens") count += 1;
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
		function sessionElapsed(session, now) {
			let start = null;
			let end = null;
			for (const timing of session.turnTimings.values()) {
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
		* When the model's peak/off-peak billing is on, the peak/off-peak input,
		* cache-hit, and output prices replace the flat rates, using the model's
		* timezone at `now` against ANY of its peak windows.
		*/
		function effectivePrices(model, cost, now) {
			const config = modelConfigFor(cost, model?.model);
			if (config === void 0) return null;
			let input = config.input;
			let output = config.output;
			let cacheRead = config.cacheRead;
			const cacheWrite = config.cacheWrite;
			let source = "flat";
			if (config.peakOffpeak) {
				if (inAnyPeakWindow(hourInTimezone(config.timezone, new Date(now)), config.peakWindows)) {
					input = config.peakInput;
					output = config.peakOutput;
					cacheRead = config.peakCacheRead;
					source = "peak";
				} else {
					input = config.offpeakInput;
					output = config.offpeakOutput;
					cacheRead = config.offpeakCacheRead;
					source = "offpeak";
				}
			}
			return {
				input,
				output,
				cacheRead,
				cacheWrite,
				source
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
		* `sessionUsage` fold, node provenance as fallback), applying that model's
		* own price-book entry (with peak/off-peak) at the step's wall-clock time.
		*/
		function usageHistory(session, state, cost, limit = 200) {
			const rows = [];
			for (let i = session.nodes.length - 1; i >= 0 && rows.length < limit; i -= 1) {
				const node = session.nodes[i];
				if (node?.kind !== "assistant" || node.usage === void 0) continue;
				const usage = node.usage;
				if (usage === null || typeof usage !== "object") continue;
				const input = (usage.inputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
				const cacheRead = usage.cacheReadTokens ?? 0;
				const cacheWrite = usage.cacheWriteTokens ?? 0;
				const output = usage.outputTokens ?? 0;
				if (input <= 0 && output <= 0) continue;
				const model = stepModel(state, node.seq, node.provenance);
				const costRow = stepCost(state, node.seq, node.provenance, {
					inputTokens: usage.inputTokens ?? 0,
					cacheReadTokens: cacheRead,
					cacheWriteTokens: cacheWrite,
					outputTokens: output
				}, cost);
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
			const { session, stats, usage, pressure, liveRate, jobs, summary, now } = source;
			switch (id) {
				case "status": {
					const running = session.running || session.partial !== null || session.runningCalls.length > 0;
					const failed = !running && session.lastAgentError !== null;
					return {
						id,
						state: running ? "running" : failed ? "error" : "idle",
						text: running ? t("bar.status.running") : failed ? t("bar.status.error") : t("bar.status.idle")
					};
				}
				case "model": {
					const identity = lastModel(session, source.sessionModel);
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
				case "agent": {
					const preset = summary?.agentPreset;
					return preset ? {
						id,
						text: preset
					} : null;
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
					const elapsed = sessionElapsed(session, now);
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
					const prices = effectivePrices(lastModel(session, source.sessionModel), config.cost, now);
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
					const count = session.queue.length;
					return count <= 0 ? null : {
						id,
						text: t("bar.queue", { count })
					};
				}
				case "errors": {
					const count = errorCount(session);
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
		* Trailing-edge throttle for the live TPS figure. The host emits a
		* `liveTokenUsage` projection update on every stream chunk — potentially
		* many times per second — so the bar would otherwise re-render the segment
		* at stream rate. This keeps the displayed value at most one refresh per
		* `intervalMs` while always converging to the latest measurement: a fresh
		* value arriving after a quiet interval shows immediately, otherwise the
		* newest value lands when the interval elapses.
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
			const { session, useProjection, useSessions, sessionId, t } = props;
			const projected = useProjection("sessionStats");
			const usage = useProjection("tokenUsage");
			const pressure = useProjection("contextPressure");
			const liveRate = useThrottled(useProjection("liveTokenUsage")?.tokensPerSecond, 500);
			const sessionModelValue = useProjection("sessionModel");
			const sessionModel = sessionModelValue !== void 0 && sessionModelValue.model !== null ? {
				provider: sessionModelValue.provider ?? "unknown",
				model: sessionModelValue.model
			} : void 0;
			const sessionUsage = useProjection("sessionUsage");
			const jobs = useSessions((state) => state.jobsBySession[sessionId]);
			const summary = useSessions((state) => state.byId[sessionId]);
			const [now, setNow] = (0, react.useState)(() => Date.now());
			const wantsClock = config.enabled && config.segments.includes("sessionTime");
			(0, react.useEffect)(() => {
				if (!wantsClock || !session.running) return;
				const timer = window.setInterval(() => setNow(Date.now()), 1e3);
				return () => window.clearInterval(timer);
			}, [wantsClock, session.running]);
			const rootRef = (0, react.useRef)(null);
			const [truncated, setTruncated] = (0, react.useState)(false);
			const stats = projected ?? deriveWindowStats(session);
			const views = config.enabled ? buildSegments({
				session,
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
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutline14, {})
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
		//#region src/client/SettingsSection.tsx
		/**
		* Status-bar management page (`settings.section` entry): master switch,
		* wrap toggle, per-segment checkboxes with reordering, and the
		* user-maintained model price book — add any number of models, each with
		* its own per-1M-token prices and its own peak/off-peak schedule.
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
		/** One model's editable card: prices + peak/off-peak schedule. */
		function ModelCard({ model, config, isCurrent, t }) {
			const [expanded, setExpanded] = (0, react.useState)(isCurrent);
			const patch = (p) => setModelConfig(model, p);
			const patchWindow = (id, p) => {
				patch({ peakWindows: config.peakWindows.map((w) => w.id === id ? {
					...w,
					...p
				} : w) });
			};
			const addWindow = () => {
				patch({ peakWindows: [...config.peakWindows, {
					id: nextPeakWindowId(),
					start: "09:00",
					end: "12:00"
				}] });
			};
			const removeWindow = (id) => {
				if (config.peakWindows.length <= 1) return;
				patch({ peakWindows: config.peakWindows.filter((w) => w.id !== id) });
			};
			const hour = hourInTimezone(config.timezone);
			const inPeak = config.peakOffpeak && inAnyPeakWindow(hour, config.peakWindows);
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
							inPeak !== false && inPeak === true && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dsb-usage-peak on",
								children: [
									t("section.peak"),
									" ",
									peakWindowsLabel(config.peakWindows)
								]
							}),
							config.peakOffpeak && inPeak === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsb-usage-peak",
								children: t("section.offpeak")
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
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "dsb-set-check",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: config.peakOffpeak,
								onChange: () => patch({ peakOffpeak: !config.peakOffpeak })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.peakOffpeak") })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsb-set-hint",
							children: t("section.peakOffpeakHint")
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
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "dsb-set-price",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.peakWindowStart") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "time",
											value: window.start,
											onChange: (e) => patchWindow(window.id, { start: e.target.value })
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "dsb-set-price",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("section.peakWindowEnd") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "time",
											value: window.end,
											onChange: (e) => patchWindow(window.id, { end: e.target.value })
										})]
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
		const SettingsSection = (0, react.memo)(function SettingsSection(props) {
			const config = useStatusBarConfig();
			const { useSessions, t } = props;
			const [newModel, setNewModel] = (0, react.useState)("");
			const updateCost = (patch) => {
				updateConfig({ cost: {
					...config.cost,
					...patch
				} });
			};
			const modelNames = Object.keys(config.cost.models);
			const currentModel = useSessions((state) => state.current !== void 0 ? state.byId[state.current]?.projectionValues?.sessionModel?.model ?? void 0 : void 0);
			const currentPricing = effectivePrices(currentModel !== void 0 ? {
				provider: "unknown",
				model: currentModel
			} : null, config.cost, Date.now());
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
								placeholder: "deepseek-v4-flash",
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
		function PeakBadge({ config, now, t }) {
			const inPeak = inAnyPeakWindow(hourInTimezone(config.timezone, new Date(now)), config.peakWindows);
			const zone = config.timezone === "local" ? t("section.zoneLocal") : config.timezone;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: inPeak ? "dsb-usage-peak on" : "dsb-usage-peak",
				children: [
					inPeak ? t("section.peak") : t("section.offpeak"),
					" ",
					peakWindowsLabel(config.peakWindows),
					" · ",
					zone
				]
			});
		}
		const UsageDialogEntry = (0, react.memo)(function UsageDialogEntry(props) {
			const config = useStatusBarConfig();
			const { session, useProjection, useSessions, sessionId, t } = props;
			const [open, setOpen] = (0, react.useState)(false);
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
			const prices = effectivePrices(sessionModel ?? null, config.cost, now);
			const rows = usageHistory(session, sessionUsage, config.cost, HISTORY_MAX_ROWS);
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
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, {})
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
		/**
		* dsh-status-bar client entry: installs the bar's stylesheet and locale, then
		* registers three surfaces —
		*  1. `conversation.composer.dock` id 'stats' at a LOWER priority: shadows the
		*     shipped stats line while this plugin is live (restores on unload).
		*  2. `conversation.input.right`: the quick-toggle gear menu.
		*  3. `settings.section`: the management page.
		*/
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
			style.dataset.plugin = "dsh-status-bar";
			style.textContent = STYLES;
			document.head.appendChild(style);
			return () => {
				style.remove();
			};
		}
		/** Client services required by this plugin. */
		const inject = ["slots", "locale"];
		/** Register the bar, the quick menu, and the management page. */
		function apply(ctx) {
			ctx.effect(installStyles, "dsh-status-bar: styles");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-status-bar: locale");
			ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({
				name: "conversation.composer.dock",
				id: "stats",
				priority: -1,
				order: 0,
				locale: NS
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