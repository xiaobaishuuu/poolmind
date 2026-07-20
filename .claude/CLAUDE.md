<!-- OMC:START -->
<!-- OMC:VERSION:4.15.3 -->

# oh-my-claudecode - Intelligent Multi-Agent Orchestration

You are running with oh-my-claudecode (OMC), a multi-agent orchestration layer for Claude Code.
Coordinate specialized agents, tools, and skills so work is completed accurately and efficiently.

<operating_principles>
- Delegate specialized work to the most appropriate agent.
- Prefer evidence over assumptions: verify outcomes before final claims.
- Choose the lightest-weight path that preserves quality.
- Consult official docs before implementing with SDKs/frameworks/APIs.
</operating_principles>

<delegation_rules>
Delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification.
Work directly for: trivial ops, small clarifications, single commands.
Route code to `executor` (use `model=opus` for complex work). Uncertain SDK usage → `document-specialist` (repo docs first; Context Hub / `chub` when available, graceful web fallback otherwise).
</delegation_rules>

<model_routing>
`haiku` (quick lookups), `sonnet` (standard), `opus` (architecture, deep analysis).
Direct writes OK for: `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`.
</model_routing>

<skills>
Invoke via `/oh-my-claudecode:<name>`. Trigger patterns auto-detect keywords.
Tier-0 workflows include `autopilot`, `ultrawork`, `ralph`, `team`, and `ralplan`.
Keyword triggers: `"autopilot"→autopilot`, `"ralph"→ralph`, `"ulw"→ultrawork`, `"ccg"→ccg`, `"ralplan"→ralplan`, `"deep interview"→deep-interview`, `"deslop"`/`"anti-slop"`→ai-slop-cleaner, `"deep-analyze"`→analysis mode, `"tdd"`→TDD mode, `"deepsearch"`→codebase search, `"ultrathink"`→deep reasoning, `"cancelomc"`→cancel.
Team orchestration is explicit via `/team`.
Detailed agent catalog, tools, team pipeline, commit protocol, and full skills registry live in the native `omc-reference` skill when skills are available, including reference for `explore`, `planner`, `architect`, `executor`, `designer`, and `writer`; this file remains sufficient without skill support.
</skills>

<verification>
Verify before claiming completion. Size appropriately: small→haiku, standard→sonnet, large/security→opus.
If verification fails, keep iterating.
</verification>

<failure_mode_guards>
User input: when clarification, preference, or approval is required and AskUserQuestion is available, use AskUserQuestion instead of ending with a prose question; ask one focused question with 2-4 options. Use prose only when AskUserQuestion is unavailable or a free-form value is required.
Session/worktree continuity: before editing after resume/compaction or inside a linked worktree, re-check `git status --short --branch`, current cwd, and relevant `.omc/state/` or `.omc/handoffs/` artifacts so work does not continue on the wrong branch or stale context.
No fake completion: TODO-style placeholder notes, `test.skip`/`.only`, stub tests, and unimplemented branches are blockers, not evidence. Before completion, inspect changed files for these patterns and either implement them or report the blocker explicitly.
</failure_mode_guards>

<execution_protocols>
Broad requests: explore first, then plan. 2+ independent tasks in parallel. `run_in_background` for builds/tests.
Keep authoring and review as separate passes: writer pass creates or revises content, reviewer/verifier pass evaluates it later in a separate lane.
Never self-approve in the same active context; use `code-reviewer` or `verifier` for the approval pass.
Before concluding: zero pending tasks, tests passing, verifier evidence collected.
</execution_protocols>

<hooks_and_context>
Hooks inject `<system-reminder>` tags. Key patterns: `hook success: Success` (proceed), `[MAGIC KEYWORD: ...]` (invoke skill), `The boulder never stops` (ralph/ultrawork active).
Persistence: `<remember>` (7 days), `<remember priority>` (permanent).
Kill switches: `DISABLE_OMC`, `OMC_SKIP_HOOKS` (comma-separated).
</hooks_and_context>

<cancellation>
`/oh-my-claudecode:cancel` ends execution modes. Cancel when done+verified or blocked. Don't cancel if work incomplete.
</cancellation>

<worktree_paths>
State root: `.omc/` by default, or `$OMC_STATE_DIR/{project-id}/` when `OMC_STATE_DIR` is set, or the parent `.omc/` when a `.omc-workspace` marker anchors a multi-repo workspace. Runtime state includes `.omc/state/`, `.omc/state/sessions/{sessionId}/`, `.omc/notepad.md`, `.omc/project-memory.json`, `.omc/plans/`, `.omc/research/`, `.omc/logs/`, `.omc/artifacts/`, `.omc/handoffs/`, and `.omc/ultragoal/`. These are ignored operational artifacts by default; `.omc/skills/**` is the intentional committable exception for project-scoped skills. In linked git worktrees, local `.omc/` state is removed with the worktree unless centralized via `OMC_STATE_DIR`.
</worktree_paths>

## Setup

Say "setup omc" or run `/oh-my-claudecode:omc-setup`.

<!-- OMC:END -->

## PoolMind 文档约定（每次会话必须遵守）

所有项目文档只保存在本仓库，**禁止写入全局目录**（`~/.claude/plans`、`~/.claude` 下任何位置）。

**每次会话/任务开始前，先扫一遍下表，判断本次涉及哪几份要读、收尾时哪几份要写——不要只凭记忆，容易看漏：**

| 文件 | 什么时候要读 | 什么时候要改 |
|------|------|------|
| `docs/SPEC.md` | **正式规格书 v1.0+（唯一事实来源）**；任何涉及业务规则/需求的问题、写代码前必读 | 有新决定/需求变更时直接合并进对应章节，不另开增量文件 |
| `docs/PROGRESS.md` | 每次会话开始/恢复时先读 | 每次会话结束前更新 |
| `docs/HANDOFF.md` | 恢复会话、要知道"上次做到哪、卡在哪"时 | 每次会话结束前追加当日条目（最新在上） |
| `docs/interview-sessions/YYYY-MM-DD.md` | 想知道某个决定"当初为什么这样定"时 | 已冻结的历史访谈存档，不再更新（除非用户明确要求重开访谈） |
| `docs/dev-log/README.md` | 写代码前先看日志格式规范 | 规则本身变了才改 |
| `docs/dev-log/YYYY-MM-DD-<功能名>.md` | 要改某个已完成/更新过的功能前，先翻对应日志 | 每完成/更新一个功能就新增一份 |
| `docs/design/DEMO-RULES.md` | 做任何新一轮 demo 前必读 | demo 规则本身有变化才改（如尺寸规则、四件套结构） |
| `docs/design/DEMO-INDEX.md` | 想找"上一轮 demo 长什么样、改了什么"时 | 每轮 demo 做完在顶部加一行索引 |
| `docs/design/demo-YYYY-MM-DD/*.html` + `TREE.md` | 用户提到某个页面 ID（如 S3、L2）要看/要改时 | **已保存的旧 demo 除非用户明确要求，绝不回写**；新一轮改动一律新建 `demo-YYYY-MM-DD/` 文件夹；该端已在 `confirmed/` 确认过的，本轮跳过不重做 |
| `docs/design/confirmed/0X-角色.html` | 要确认"某端定案的样式长什么样"时；用户要求改已确认样式时直接改这里 | 用户明确认可某端/某页面样式后才新增；改动直接改本体，不必重开一轮 demo |
| `.omc/plans/poolmind-phase1-plan.md` | 要确认当前该做哪个里程碑、技术选型是什么时 | 只有实施计划本身要修订（技术方案/里程碑变化）才改，跟改 SPEC.md 不是一回事 |
| `.omc/specs/poolmind-spec.md` | OMC 下游技能读取正式规格用 | SPEC.md 改完后同步复制（纯同步，不单独做决策） |
| `.omc/state/deep-interview-state.json` | 恢复访谈会话时 | 会话结束前更新 |
| `.omc/project-memory.json` | 一般不用主动读，hooks 自动维护 | 不必手动改；只在发现内容明显过期/出错（如指向已删除文件的 hotPath）时顺手纠正 |

会话收尾固定顺序：**合并决定进 spec → 写当日 interview-sessions 记录（如有访谈）/ dev-log（如完成功能）→ 更新 PROGRESS.md → 更新 HANDOFF.md → 同步 .omc 副本与状态 → 更新记忆**。

### Demo 与开发硬规则（2026-07-19 用户定案，做 demo / 写代码前必读）

- **Demo 四件套**：每轮 demo 一个文件夹 `docs/design/demo-YYYY-MM-DD/`，固定 4 份——`00-all-pages.html`（全页总览）＋ `01-supervisor.html` / `02-lifeguard.html` / `03-admin.html`（三端简单交互）。手机框用**真实机型尺寸且可切换**（iPhone SE 375×667 / iPhone 17 402×874 / 17 Pro Max 440×956 / Android 360×800）。每个页面有**跨轮固定 ID 角标**（S1–S8 主管、L1–L5 救生员、A1–A2 管理员），索引在 `docs/design/DEMO-INDEX.md`，完整规则在 `docs/design/DEMO-RULES.md`。
- **测试壳**：WhatsApp 验证＝显示验证码后 3 秒自动通过；证件 OCR＝任意照片即通过；正式接入等用户通知。代码标 `【壳-待补】`。
- **测试代码标记**：`【长期测试】` 或 `【临时测试-用完即删】`，功能收尾时清掉临时测试，防止残留副作用。
- **功能日志**：每完成/更新一个功能，在 `docs/dev-log/` 新增 `YYYY-MM-DD-<功能名>.md`（格式见该目录 README）。

`.omc/` 其余内容（sessions、state/sessions、logs 等）为运行时产物，已由 `.gitignore` 排除，不提交、不手动维护。恢复会话时先读 `docs/PROGRESS.md`。
