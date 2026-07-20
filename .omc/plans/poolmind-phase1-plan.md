# PoolMind 第一期实施计划（v3，已并入 Architect + Critic 评审改进）

| | |
|---|---|
| 输入规格 | `docs/SPEC.md` v1.0（唯一事实来源，2026-07-17 定稿，含救生员同事联系补充） |
| 模式 | ralplan consensus（deliberate：涉及身份认证、支付确认、合规/PII） |
| 状态 | **v3 已获用户批准（2026-07-18）**，进入 UI demo 设计阶段（v1 → Architect APPROVE_WITH_IMPROVEMENTS → v2 → Critic REVISE → v3 → Critic APPROVED 2026-07-18 → 用户批准执行） |
| 范围 | 第一期：响应式网页全功能；原生 App 为第二期，不在本计划内 |

---

## 执行方式约束（用户要求，2026-07-18，约束所有执行阶段）

1. **逐功能审核门**：每完成一个功能（以验收映射表中的 §13 条目/功能块为粒度）即停下，向用户演示可核验的结果（截图/可点的页面/测试输出），获用户审核通过后才继续下一个功能。用户是产品主管（非程序员），演示用业务语言。
2. **注释规范**：未来代码中每一个函数/代码块必须带注释（中文，说明该函数做什么、业务上对应哪条规则）；关键业务规则处引用 SPEC 章节号（如 `// SPEC §7.3：员工确认后启动 7 天倒计时`）。

## RALPLAN-DR 摘要

### Principles（原则）
1. **API-first ≠ 物理分离**：接口即产品——干净的 `/api` REST + Socket 层让第二期 App 零改动接入；但部署形态取单一单元（见综合决策），不为尚不存在的消费者付双部署税。
2. **Assignment 是时间维度工资的唯一来源；调整项是显式、带审计、锁定后的唯一例外写入口**（与 SPEC §6.2/§7.1 严格一致）。
3. **状态机显式建模**：支付确认（7 态）、认证（4 态）、报名（冲突隐藏作为派生视图，不硬塞状态位）实现为显式状态机 + 完备转换测试。**财务性时限（7 天自动确认、午夜锁定）的事实来源在 Postgres，不在任务队列。**
4. **合规默认安全**：证件图无公开路径（含签名 URL）且**逐证范围授权**；数据库静态加密从第一行代码起生效并可举证。
5. **单人可运维**：单部署单元、能删的基础设施都删（无 Redis）、托管服务优先、时区全链钉死 `Asia/Hong_Kong`。

### Decision Drivers（Top 3）
1. 第二期 App 复用：API 与前端逻辑分离，接口即产品。
2. 重交互 UI（拖拽更表、双表并排交换、拆段）需要成熟 React 生态。
3. 实时聊天/通知 + 可靠定时任务（00:00 汇总、7 天自动确认）并存。

### Viable Options 与决策

**Option A：Next.js 全栈单体** — Pros：单一心智模型、招募页 SSR/OG 天然好。Cons：多状态机+管辖链权限在 API Routes 组织性弱（无守卫/DI）；长驻任务照样要独立 worker。
**Option B：NestJS API + React SPA 双部署** — Pros：模块/守卫/DI 匹配本域复杂度。Cons：双部署单元 + CORS + 跨源鉴权，对单人运维面积过大；SPA 招募页丢 OG/SEO（唯一公共分享面）。
**Option C：Rails/Laravel 单体** — 与驱动 1/2 冲突，否决（重前端交互终归 JS 生态，等于两套栈）。

**最终决策（综合方案，吸收 Architect synthesis）：模块化单体 —— NestJS 内核 + 同实例托管 SPA 静态产物。**
- pnpm monorepo：`apps/api`（NestJS + Prisma + PostgreSQL + Socket.IO + **pg-boss**）、`apps/web`（React 18 + Vite + TanStack Query + i18next zh-HK）、`packages/shared`（zod schema 前后端同源校验）。
- **单一部署单元**：Nest `ServeStaticModule` 托管 web 构建产物 → 同源 Cookie 鉴权、无 CORS、一个 Docker 镜像。App 第二期直接打同一 `/api` + Socket。
- **公共招募路由做服务端 OG meta 注入**（仅这几条 URL 由 Nest 渲染 `<meta>`），解决 WhatsApp 链接预览/SEO，不为全站背 SSR。
- **pg-boss 替代 BullMQ+Redis**：延迟任务与 cron 落在本来就有的 Postgres 上，整个删掉 Redis 依赖。单实例 Socket.IO 无需 Redis 适配器；将来横向扩展时再引入。

## 技术选型明细

| 关注点 | 选型 | 理由/合规映射 |
|--------|------|--------------|
| 数据库 | PostgreSQL 16。生产：AWS RDS ap-east-1，**创建时即启用** storage encryption（KMS，AES-256），IaC/截图归档举证。本地：Docker Postgres，数据卷置于加密盘——Windows 必须显式配置 **BitLocker XTS-AES-256**（默认仅 128 位不达标），以 `manage-bde -status` 输出举证；macOS FileVault（XTS-AES-128 的机器需注明并改用容器级 256 方案）。审计文档写明"采存储层 at-rest 解释" | SPEC §10；Architect 改进 3 |
| ORM | Prisma；companyId 与主管管辖链过滤用 **Prisma extension/Nest 拦截器集中注入**，不散落在各 where（防漏一处=越权） | Architect f |
| 任务/定时 | **pg-boss**（Postgres 原生队列）：00:00 汇总（Asia/Hong_Kong cron，幂等 upsert）、7 天自动确认。**财务事实来源在 DB**：`PaymentConfirmation.autoConfirmAt` 列 + 每 5 分钟 sweeper 兜底扫"已过期仍待自动"，转移在事务内重读状态、仅当仍为「员工已确认（待自动）」才执行（幂等守卫，防主管确认与到期并发的双重确认） | SPEC §7.3；Architect 改进 1 |
| 时区 | 全链钉死 `Asia/Hong_Kong`：cron、autoConfirmAt 计算、午夜锁定判定（单点函数）、前端显示 | Architect b |
| 证件图存储 | S3 ap-east-1 私有桶（Block Public Access 全开）；仅后端 IAM 读取，`GET /files/cert/:id` 经守卫后 Stream 返回。**逐证范围授权**：平台管理员可读全部；主管仅可读"报名进其管辖链泳池的救生员"的证件；本人可读自己的。响应加 `Cache-Control: private, no-store`；证件 URL/id 不进日志与 Sentry；本地私有目录确认不在任何静态服务根下。**禁 presigned URL**：ESLint 规则 + CI 扫描 + 桶策略三重防线 | SPEC §10；Architect 改进 2 |
| OCR | 抽象 `OcrProvider`；首选 Google Cloud Vision，可换 Azure；姓名比对规则（忽略大小写/空格/中英对照）自持；**Spike 周用真实证件样本实测定阈值** | SPEC §3.2 |
| WhatsApp 反向验证 | WhatsApp Cloud API **仅入站** webhook（服务会话 $0）；**webhook 做 verify token + `X-Hub-Signature-256` 签名校验**。`PhoneVerifier` 接口：主实现 Cloud API；**break-glass 备选实现**（管理员人工核号 + 预留 SMS OTP 适配器，SPEC §11 暂缓启用但接口就位）；webhook 健康监控告警。**Meta 商业验证在 Spike 周第一天启动**（日历级前置） | SPEC §3.2；Architect 改进 7 |
| 实时/通知 | Socket.IO（单实例）；站内通知同通道；Web Push（VAPID）；wa.me 纯前端拼链接 | SPEC §4.3/§9 |
| Excel | exceljs 服务端生成 | SPEC §7.2 |
| 部署 | 单 Docker 镜像 → AWS EC2/Lightsail 香港区 + RDS + S3；HTTPS via Caddy；每日自动备份（RDS 快照 + S3 版本化） | 原则 5 |
| 观测 | Sentry（前后端，证件路径脱敏）+ pino + AuditLog 表（更表/工资/确认全变更）+ 注册漏斗埋点 + pg-boss 任务成功率/webhook 健康告警 | 预检验尸 |

## 数据模型骨架（关键规则已显式化）

实体：`Company`(租户预留) / `User` / `Certificate`(认证状态机) / `SupervisorLink`(管辖链——**第一期真正的活隔离维度，权限守卫按链式作用域实现并做穿透测试**) / `Venue` / `Pool` / `PoolTemplate` / `PreferenceList` / `RecruitmentPost` / `Application` / `Conversation` / `Message` / `RosterMonth` / `ShiftSlot` / **`Assignment`** / `RateBinding` / `PayrollDay` / `PaymentConfirmation` / `Adjustment` / `Notification` / `AuditLog`

**数据模型铁律**（Architect 改进 6 + Critic 必改 2）：
1. **归属 roster 日期而非墙钟**：跨午夜段（如 22:00–02:00）整段归其更表日期；锁定与 PayrollDay 聚合均按 roster 日期判定。
2. **交换/改人 = supersede**：绝不原地 mutate——作废旧 Assignment（标记 supersededBy）+ 写新行（含按三层规则重算的 rate 快照），审计天然完整。
3. **Adjustment 作用域 = 人×泳池×roster 日**（挂在当日格子上，与 SPEC §6.2 一致），锁定后唯一可写入口，必填原因，计入当日 PayrollDay。
4. **证号为全局唯一身份锚**（SPEC §3.5）：`Certificate.certNumber` 建 DB 唯一约束；注册查重、忘记密码/用户名找回、改名判定"同一人"全部锚定证号；重复证号注册引导登录/找回，坚持注册转管理员仲裁（防冒用）。
5. **情形 B 证件授权时点**：救生员点「联系以报更」即创建最小 Application 记录（报名意向），主管对其证件的流式查看授权随之成立；无任何 Application/会话关系的主管不可见其证件。**实现护栏（Critic 终审附注，M2 断言）**：意向记录与"已具备泳池+更次+时薪的正式待确认报名"在数据上必须区分——意向不得进入主管「待确认列表」、不触发冲突隐藏（SPEC §4.2 情形 B 发卡前不露泳池）。

## 实施里程碑

**Spike 周（新增，M0 之前，1 周）**：① 第一天启动 Meta 商业验证 + WhatsApp 商用号申请（日历级前置，贯穿后续里程碑跟踪）；② 收集真实香港救生员证样本，实测 Google Vision OCR 准确率、定姓名比对阈值；③ 375px 双表并排交换交互原型（可用性验证，定"拖拽 or 点选式"主方案）。
→ 出口判据：OCR 方案可行性结论 + Meta 验证已提交 + 交换交互方案拍板。

**M0 基建（1 周）**：monorepo、CI、Docker Compose（pg+minio 本地，无 Redis）、Prisma 迁移、auth 骨架、私有文件流式通道 + 三重防线、Sentry/pino/AuditLog、时区单点模块。
→ 验收：合规两条技术地基可演示（加密证据 + 流式读取 + 无公开 URL + 范围授权骨架）。

**M1 账号与身份（2 周）**：注册五样+显示名、OCR 集成、Cloud API 入站 webhook（签名校验）+ 反向验证、认证状态机 + 管理员后台（审核队列/证件流式查看）、忘记密码双闸、忘记用户名、换号、保护态标记（本里程碑仅账号侧：禁注销；"未来排班/未结工资"判定在 M3/M4 接入）。**收口：3–5 名真实救生员注册实测（漏斗埋点验证）**。范围声明：passkey 本期不做（SPEC 标可选，随第二期 App 一起上）；SMS 适配器仅接口占位、零实现。
→ 验收：见"验收映射"M1 行。

**M2 泳池/模板/招募/聊天（2 周）**：屋苑/泳池/多模板、偏好名单、招募帖+字段级公开+每主管通用链接（搜索页+默认过滤+OG meta）、WhatsApp 文案生成、报名情形 A/B（含多人报同一短更按报名时间序展示、逐个进聊天议价）、冲突隐藏、永久会话+详情卡片、未认证/驳回高亮（聊天+报名列表侧）。
→ 验收：见"验收映射"M2 行。

**M3 更表与排班（3.5 周，头号进度风险）**：泳池一览→月更表、时段分配（整天默认/自由拆段/数据模型铁律）、拖拽双校验、一键排班、长按菜单、**交换（按 Spike 周拍板的交互；点选式为按期兜底默认，双表拖拽为增强目标）**、请人补空位、取消流、改模板生效范围+冲突清单、救生员端更表视图（泳池+同池同事+管辖主管+一键 wa.me）、未认证/证书过期高亮（更表侧）。
→ 验收：见"验收映射"M3 行。

**M4 工资与支付（2 周）**：三层时薪解析、夜间汇总（pg-boss cron+幂等）、锁定+调整项、支付状态机（DB 事实来源+sweeper+**双侧对称幂等守卫**：主管确认路径同样在事务内重读状态、仅当处于可转移态才执行+自付特例）、主管工资页、救生员端工资单、Excel 导出。
→ 验收：见"验收映射"M4 行（状态机全路径自动化测试为硬门槛）。

**M5 通知/首屏/打磨（1.5 周）**：通知中心、Web Push、关键动作强制 wa.me、主管首屏三块、**界面个性化设置（风格卡片/磁贴 + ≥4 主题色，CSS 变量实现，存用户偏好）**、证书到期提醒（补齐三处高亮的剩余项）、繁中审校、375px 走查。
→ 验收：见"验收映射"M5 行。

**M6 加固与上线（1 周）**：公开 URL 扫描、管辖链权限穿透自测、加密证据归档、种子/顶级主管初始化、备份演练、部署、**SPEC §13 全清单逐条终验（含下方所有跨里程碑复核项）**。

### 验收映射（每个 §13 复选框在"真正可完整验证"的里程碑打勾；Critic 必改 1）
| 里程碑 | 当期可完整验证的 §13 项 | 明确延后项（在依赖落地处验证） |
|--------|------------------------|------------------------------|
| M0 | 加密证据、流式通道+禁公开 URL 骨架 | 逐证范围授权全矩阵 → M1/M6 |
| M1 | 注册/OCR/反向验证、忘记密码双闸、忘记用户名、换号、认证状态机、管理员后台、证号唯一负例 | 显示名多界面生效 → M2/M3/M4 各自界面落地时；未认证全程高亮 → M2（聊天/报名）、M3（更表）；保护态完整判定 → M4；子主管管辖链隔离 → M2/M3/M4 各域数据出现时逐域验 + M6 穿透 |
| M2 | 泳池/模板/冲突清单、招募链接/OG/文案、报名 A/B、多人排序议价、永久会话/卡片、聊天与报名列表的显示名+未认证高亮 | 冲突隐藏"取消后恢复" → M3（依赖取消流）；主管兼救生员资历上传 → M3 排更时 |
| M3 | 更表全组、交换/请人/取消流、救生员端视图+同事联系（含非同池同日不可见负向断言）、更表侧高亮、冲突隐藏恢复闭环 | 主管兼救生员自付 → M4 |
| M4 | 工资全组、状态机矩阵、自付特例、锁定+调整项、Excel、保护态完整判定、工资单显示名 | — |
| M5 | 首屏三块、通知组、证书三处高亮闭环、繁中/375px | — |
| M6 | 全清单逐条终验 + 跨里程碑复核：管辖链穿透、显示名全界面抽查、未认证/过期高亮三处齐、合规证据归档 | — |

**工期**：Spike 1 周 + 开发当量 13 周 + 缓冲（按里程碑加权：M1/M3 外部依赖与交互重区各 +60%，其余 +35%，综合约 45%）→ **总计约 20 周日历期**。Meta 审核、OCR 调优为日历级变量，Spike 周即启动以并行消化。

## Risks & Mitigations

| 风险 | 缓解 |
|------|------|
| Meta 商业验证/商用号审核拖延或被拒 | Spike 周第一天启动；`PhoneVerifier` break-glass（人工核号 + SMS 适配器就位未启用）；webhook 健康告警 |
| OCR 对香港证件识别不准 | Spike 周真实样本实测定阈值；比对规则可调；失败转管理员人工通道 |
| 工资/状态机算错钱 | DB 为财务事实来源 + sweeper + 事务内幂等守卫；状态机穷举测试；Assignment supersede 审计；Excel 对账写进上线手册 |
| 375px 双表拖拽交互失败 | Spike 周原型先行；点选式交换为按期兜底默认，拖拽为增强 |
| iOS 无 PWA 收不到 Web Push | SPEC §9 已接受；关键事件 wa.me 强制跳转兜底；App 第二期根治 |
| 单人运维 | 单部署单元、无 Redis、托管 RDS/S3、每日备份、Sentry 告警 |
| 管辖链越权（第一期真实隔离风险） | 链式作用域集中在守卫/拦截器实现；M6 穿透测试清单（含证件流范围授权） |

## Pre-mortem（三个失败剧本）
1. **"发错钱"**：拆段+调价+锁定竞态叠加 → 防线：Assignment 三条铁律、锁定单点函数（HK 时区）、状态机 property-based 测试、sweeper 幂等、AuditLog、Excel 对账。
2. **"注册漏斗死亡"**：OCR+WhatsApp 双门槛真实失败率高 → 防线：漏斗埋点、每步可走人工通道、M1 收口真实用户实测、break-glass 验证方式。
3. **"证件图泄露"**：重构引入公开路径/越权读取 → 防线：ESLint+CI+桶策略三重防线、逐证范围授权、no-store、日志脱敏、M6 渗透清单。

## Expanded Test Plan
- **Unit**：三层时薪解析；支付状态机全转换/撤回/超时/自付矩阵（含并发幂等守卫）；认证状态机；可用性约束；拆段边界（切点重叠、跨午夜归属）；锁定判定（HK 时区）；冲突隐藏/恢复；Assignment supersede 不变量。
- **Integration**：注册全流程（mock OCR/WhatsApp，含签名校验负例）；**重复证号注册被拒/冒用证件转仲裁负例**；报名 A/B；更表编辑 API 双校验；夜间汇总幂等重跑；sweeper 补偿路径（模拟任务丢失）；**主管确认与自动确认并发竞态（双侧幂等守卫）**；证件流权限矩阵（管理员/管辖内主管/无关主管/本人 → 200/200/403/200，含"无 Application 关系主管不可见"负例）；管辖链数据隔离；**同事联系范围负向断言（非同池同日互不可见联系方式）**。
- **E2E（Playwright，375px 为主）**：SPEC §Verification 六步；交换主方案+兜底方案；取消流；同事联系按钮；Excel 内容抽验。
- **Observability**：AuditLog 全覆盖断言；pg-boss 成功率与 webhook 健康告警接线测试；注册漏斗埋点；Sentry 脱敏验证。

## Verification Steps（批准后执行时）
1. 每里程碑收口跑对应 SPEC §13 分组，CI 绿 + 走查记录归档 `docs/verification/`。
2. M6 全量验收：§13 逐条打勾 + 合规证据（RDS 加密 IaC/截图、`manage-bde -status`、公开 URL 扫描报告、证件流权限矩阵测试报告）。
3. 上线前真实数据彩排完整月周期（排更→取消→交换→月末工资→确认→导出）。

## ADR（共识决议记录）

- **Decision**：以"模块化单体"交付第一期——NestJS 内核（API/守卫/状态机/pg-boss 任务）同实例托管 React SPA 静态产物，单 Docker 部署；PostgreSQL 为唯一持久层（含财务时限事实来源），无 Redis；公共招募路由服务端 OG meta；证件图 S3 私有桶 + 后端流式 + 逐证范围授权；工期 Spike 1 周 + 13 周开发 + 加权缓冲 ≈ 20 周。
- **Drivers**：① 二期 App 零改动复用 API；② 拖拽更表/双表交换等重交互 UI；③ 实时聊天 + 可靠定时任务并存；（约束）单人开发运维、香港合规两条。
- **Alternatives considered**：Next.js 全栈单体（A）——状态机/管辖链权限组织性弱，长驻任务仍需独立 worker；NestJS+SPA 双部署（B 原型）——双部署/CORS 对单人面积过大、招募页丢 OG；Rails/Laravel（C）——与重前端驱动冲突，否决。
- **Why chosen**：综合方案保留 B 的框架内核优势（DI/守卫/模块化状态机），用同实例静态托管消掉 B 的双部署代价，用局部 OG 注入吸收 A 的唯一实质优势，用 pg-boss 删掉整个 Redis 依赖——三个选项的强项取齐、主要代价归零。
- **Consequences**：正面——单部署单元、依赖面最小、财务可靠性落 DB、合规三重防线；代价——将来横向扩展需补 Redis 适配器与拆分部署（届时已有收入支撑）；SSR 永久局限于招募路由（可接受，唯一公共面）。
- **Follow-ups**：Spike 周第一天启动 Meta 商业验证；OCR 真实样本实测；交换交互 375px 原型拍板；M2 实现"意向 Application 不入待确认列表"断言；M6 合规证据归档与管辖链穿透测试。

## Changelog（v1 → v2，Architect 评审吸收）
1. 财务时限事实来源移入 Postgres（autoConfirmAt + sweeper + 事务幂等守卫）；全链 Asia/Hong_Kong。【阻断1】
2. 证件流逐证范围授权 + no-store + 日志脱敏 + 本地目录核查。【阻断2】
3. BitLocker 显式 XTS-AES-256 + 举证方式；RDS 创建即开；审计口径注明存储层解释。
4. 架构裁剪为模块化单体（Nest 托管 SPA 静态产物，单部署单元）；招募路由 OG meta；pg-boss 替代 BullMQ+Redis（删除 Redis）。
5. 新增 Spike 周（Meta 验证第一天启动 + OCR 实测 + 交换交互原型）；缓冲 20%→45%（约 19 周）；M3 扩至 3.5 周且点选式为按期兜底默认。
6. Assignment 三条铁律显式化（roster 日期归属 / supersede / Adjustment 作用域）。
7. PhoneVerifier break-glass + webhook X-Hub-Signature-256 校验。
8. Principle 1/2 表述修正（API-first≠物理分离；调整项为显式例外）；冲突隐藏改为派生视图；点明管辖链为第一期活隔离维度并加穿透测试。

## Changelog（v2 → v3，Critic 评审吸收）
1. 【必改1】新增"验收映射"表：每个 §13 复选框映射到真正可完整验证的里程碑；跨里程碑项（管辖链隔离、主管兼救生员自付、显示名多界面、未认证全程高亮、保护态完整判定、冲突隐藏恢复闭环）显式拆分并在 M6 终验复核。里程碑出口从"§13 整组"改为映射行。
2. 【必改2】数据模型铁律新增第 4 条：证号全局唯一约束 + 查重/找回/改名锚定证号；integration 加重复证号/冒用负例。
3. 铁律第 5 条：情形 B「联系以报更」即建最小 Application，证件查看授权随之成立（澄清授权时点）。
4. 主管确认路径补双侧对称幂等守卫；测试加确认/自动确认并发竞态用例。
5. 工期口径统一：Spike 1 周 + 13 周 + 加权缓冲（M1/M3 +60%、其余 +35%）≈ **20 周**。
6. 范围显式声明：passkey 本期不做（随二期 App）；SMS 适配器仅接口占位零实现。
7. 测试补：同事联系非同池同日负向断言；多人报名排序议价落入 M2；未认证高亮分界面排期（M2 聊天/报名、M3 更表）。
