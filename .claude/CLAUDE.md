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

所有项目文档只保存在本仓库，**禁止写入全局目录**（`~/.claude/plans`、`~/.claude` 下任何位置）：

| 文件 | 用途 | 更新时机 |
|------|------|---------|
| `docs/SPEC.md` | **正式规格书 v1.0+（唯一事实来源）** | 有新决定时直接合并进正文对应章节，不另开增量文件 |
| `docs/deep-interview-spec.md` | 访谈过程档案（历史，含逐轮评分与本体收敛） | 已冻结，不再更新 |
| `docs/PROGRESS.md` | 进度速览 + 恢复指引 | 每次会话结束前更新 |
| `docs/interview-sessions/YYYY-MM-DD.md` | 当日访谈/对话记录 | 每个访谈日新建一份，逐轮记录问答与定案 |
| `.omc/specs/poolmind-spec.md` | 正式规格书副本（OMC 下游技能用） | SPEC.md 改完后同步复制 |
| `.omc/state/deep-interview-state.json` | 访谈恢复状态 | 会话结束前更新 |

会话收尾固定顺序：**合并决定进 spec → 写当日 interview-sessions 记录 → 更新 PROGRESS.md → 同步 .omc 副本与状态 → 更新记忆**。

### Demo 与开发硬规则（2026-07-19 用户定案，做 demo / 写代码前必读）

- **Demo 四件套**：每轮 demo 一个文件夹 `docs/design/demo-YYYY-MM-DD/`，固定 4 份——`00-all-pages.html`（全页总览）＋ `01-supervisor.html` / `02-lifeguard.html` / `03-admin.html`（三端简单交互）。手机框用**真实机型尺寸且可切换**（iPhone SE 375×667 / iPhone 17 402×874 / 17 Pro Max 440×956 / Android 360×800）。每个页面有**跨轮固定 ID 角标**（S1–S8 主管、L1–L5 救生员、A1–A2 管理员），索引在 `docs/design/DEMO-INDEX.md`，完整规则在 `docs/design/DEMO-RULES.md`。
- **测试壳**：WhatsApp 验证＝显示验证码后 3 秒自动通过；证件 OCR＝任意照片即通过；正式接入等用户通知。代码标 `【壳-待补】`。
- **测试代码标记**：`【长期测试】` 或 `【临时测试-用完即删】`，功能收尾时清掉临时测试，防止残留副作用。
- **功能日志**：每完成/更新一个功能，在 `docs/dev-log/` 新增 `YYYY-MM-DD-<功能名>.md`（格式见该目录 README）。

`.omc/` 其余内容（sessions、state/sessions、logs 等）为运行时产物，已由 `.gitignore` 排除，不提交、不手动维护。恢复会话时先读 `docs/PROGRESS.md`。
