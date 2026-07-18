# 交接日志（每天追加，最新在上）

## 2026-07-18

**已完成**
1. 恢复共识流程：Critic 评审 v2 → **REVISE**（2 MAJOR：里程碑↔§13 验收映射不可测；缺证号唯一身份锚）。
2. Planner 修订 **v3**：新增验收映射表（跨里程碑项显式拆分+M6 终验复核）、数据模型铁律 4（证号全局唯一）与 5（情形 B 联系即建意向 Application 定证件授权时点）、双侧幂等守卫、工期口径统一 **20 周**（加权缓冲）、passkey 二期/SMS 仅占位声明、测试负例补齐。
3. Critic 复核 → **APPROVED**（附一条 M2 实现护栏：意向 Application 不入待确认列表、不触发冲突隐藏，已写入计划）。
4. 补 ADR 章节。ralplan 状态已清。

**当前状态**：`.omc/plans/poolmind-phase1-plan.md` v3 = 共识达成，**PENDING APPROVAL**——等用户明确批准后才能开始执行（team/ralph 二选一）。

**下次第一步**
1. 问用户是否批准执行计划 v3；批准 → invoke team 或 ralph（带计划路径）。
2. 未 commit：07-14 起全部文档变更仍攒在工作区，问用户要不要 commit。

**07-18 追加（计划批准后）**
1. 用户**批准计划 v3**，并加两条执行规则（已写入计划"执行方式约束"+ 记忆）：逐功能停下演示审核；每个函数中文注释（引用 SPEC 章节号）。
2. 设计阶段启动：产出三轮样稿于 `docs/design/`——`style-directions.html`（配色向，被指出跑偏）→ `layout-styles.html`（5 种版式骨架）→ **`all-pages-demo.html`（10 个主要页面 + 风格 A/C 与 4 主题色切换按钮）**。
3. 新功能定案：**界面个性化**——主管设置页自选风格（卡片/磁贴）+ 主题色，仅影响本人；已写入 SPEC §8 + 验收标准 + 计划 M5。
4. 用户侧待办（Spike 周并行）：① Meta 商业验证/WhatsApp 商用号申请（需我给指引）② 提供 3–5 张真实救生员证样本测 OCR。
5. 下一步：等用户看完 all-pages-demo 反馈 → 修订样稿/确认设计基因 → 开始 Spike 周与 M0（脚手架）。执行方式：逐功能推进+审核门（不开全自动循环）。

## 2026-07-17（SPEC v1.0 定稿之后）

**已完成**
1. `docs/SPEC.md` v1.0 定稿 = 唯一事实来源（含香港合规两条：AES-256 静态加密；证件图 Private Storage+后端 Stream+禁公开 URL）。
2. SPEC 补充：救生员端更表可见同池同事+管辖主管，一键 wa.me 联系（§7.2+验收标准）。
3. 启动 `omc-plan --consensus --direct docs/SPEC.md`：
   - Planner 产出计划 v1 → `.omc/plans/poolmind-phase1-plan.md`
   - Architect 评审：**APPROVE_WITH_IMPROVEMENTS**，8 条改进（2 条阻断：①财务时限事实来源须落 Postgres（autoConfirmAt+sweeper+事务幂等守卫+HK 时区）②证件流缺逐证范围授权）
   - 计划 **v2 已写好**（8 条全部并入，见文件末 Changelog）：模块化单体（NestJS 托管 SPA 静态产物，单部署）、pg-boss 替代 Redis、招募页 OG meta、Spike 周（第一天启动 Meta 商业验证+OCR 实测+交换交互原型）、工期 13 周开发+45% 缓冲≈19 周、Assignment 三条铁律
4. 文档整理：`.claude/CLAUDE.md` 固化文档约定；`.gitignore` 建好；`deep-interview-spec.md` 冻结为档案。

**卡在哪**：Critic 终审未跑（用户 token 用尽，中断）。ralplan 状态已置 inactive。

**下次第一步**
1. 读本文件 + `docs/SPEC.md` + `.omc/plans/poolmind-phase1-plan.md`。
2. 恢复共识：spawn `oh-my-claudecode:critic` 评审计划 v2（核查 8 项：原则一致性/备选公平/风险具体/SPEC §2–§10 覆盖扫描/验证可操作/pre-mortem+四层测试/Architect 阻断项复核/19 周工期）。
3. Critic 通过 → 计划标 `pending approval` 停下等用户批准执行；REVISE → 修订后重走 Architect→Critic（最多 5 轮）。
4. 未 commit：07-14 与 07-17 全部文档变更攒在工作区，问用户要不要 commit。
