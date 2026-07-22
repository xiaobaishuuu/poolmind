# 2026-07-21 仓库骨架搭建（monorepo scaffold）

## 1. 做了什么（业务语言一句话）

搭好整个项目的「空房子骨架」：后端（NestJS）、前端（React）、前后端共享校验包三部分就位，按业务模块分好目录，本机一键起数据库，且**开发库 / 测试库 / 生产库三者严格隔离**——跑测试永远不会弄脏你手动录入的开发数据。本单元只搭骨架和环境，不含任何业务功能（登录、验证、OCR 等都留给后续单元）。

对应实施计划里程碑 **M0 基建**（`.omc/plans/poolmind-phase1-plan.md`）。

## 2. 改了哪些模块/文件/函数（精确到函数级）

### 根目录（工作区/环境）
- **`package.json`**（新增）：pnpm monorepo 根配置。脚本 `dev`（并行起前后端）、`build`、`test`（钉死 `NODE_ENV=test`，只打测试库）、`db:up`/`db:down`。
- **`pnpm-workspace.yaml`**（新增）：声明工作区包 `apps/*`、`packages/*`。
- **`docker-compose.yml`**（新增）：单个 `postgres:16` 服务，卷持久化，健康检查，时区 `Asia/Hong_Kong`；挂载 init 脚本。
- **`docker/initdb/01-create-databases.sql`**（新增）：容器首次启动自动补建独立测试库 `poolmind_test`（`poolmind_dev` 由 `POSTGRES_DB` 建）。
- **`.gitignore`**（修改）：在原有规则后**追加** monorepo 构建产物忽略段（`*.tsbuildinfo`、`.vite/`、`apps/web/dist/`、`.pnpm-store/`）；原有 `.claude`/`.omc`/`node_modules`/`.env*` 规则未动。
- **`README.md`**（改写）：面向非程序员产品主管的中文快速上手（目录说明、6 步启动、常用指令、三库隔离说明），并**保留**原有两条合规须知（AES-256 静态加密、证件图私有目录+串流+禁公开 URL）。

### 后端 `apps/api`
- **`package.json`**（新增）：NestJS 10 + Prisma 5 + zod + class-validator 依赖；脚本 `start:dev`、`build`、`prisma:generate`、`prisma:migrate`、`db:seed`、`test:e2e`。
- **`tsconfig.json` / `tsconfig.build.json`**（新增）：build 版 `exclude` 掉 `prisma`/`test`，保证 `nest build` 产出 `dist/main.js` 在顶层。
- **`nest-cli.json`**（新增）。
- **`.env.example`**（新增）+ 本机用 **`.env`**、**`.env.test`**（不进 git）：dev 连 `poolmind_dev`，test 连 `poolmind_test`。
- **`prisma/schema.prisma`**（新增）：datasource(postgresql) + generator；含一张**占位表 `ScaffoldPlaceholder`**（Prisma 要求至少一张表才能生成 client/迁移，见「遗留事项」，真实模型来了就删）。
- **`prisma/seed.ts`**（新增）：`main()` 种子占位，仅打印提示。
- **`src/main.ts`**（新增）：`bootstrap()` —— 进程级钉死 `TZ=Asia/Hong_Kong`（在 import 应用模块之前）、全局 `ValidationPipe`（whitelist+transform）、监听 `PORT`。
- **`src/app.module.ts`**（新增）：`AppModule` —— 装配全局 `ConfigModule`（按 `NODE_ENV` 选 `.env`/`.env.test` + zod 校验）、`PrismaModule`、`HealthModule`，并注册全部 11 个业务域空壳模块。
- **`src/config/env.validation.ts`**（新增）：`envSchema`（zod）+ `validateEnv()` —— 校验 `DATABASE_URL`/`NODE_ENV`/`PORT`/`TZ`，缺项/格式错启动即报错；导出 `Env` 类型。
- **`src/prisma/prisma.service.ts`**（新增）：`PrismaService extends PrismaClient` —— `onModuleInit()`（尝试连库，失败不拖垮启动，留给首次查询重连）、`onModuleDestroy()`（断开）。
- **`src/prisma/prisma.module.ts`**（新增）：`@Global()` 导出 `PrismaService`。
- **`src/health/health.service.ts`**（新增）：`HealthService.check()` —— 执行 `SELECT 1` 探活，返回 `{status,db,timestamp}`；`HealthStatus` 接口。
- **`src/health/health.controller.ts`**（新增）：`HealthController.check()` —— `GET /health`。
- **`src/health/health.module.ts`**（新增）。
- **`src/common/README.md`**（新增）：说明未来 guards/interceptors/decorators/filters 的职责（含管辖链守卫、证件图 no-store 约定），本单元不写代码。
- **`src/modules/<域>/<域>.module.ts`** ×11（新增，均为空壳 `@Module({})`，顶部一行中文说明业务职责）：`auth`、`certificates`、`supervisor-links`、`venues-pools`、`recruitment`、`chat`、`roster`、`payroll`、`notifications`、`audit`、`admin-tools`。
- **`test/app.e2e-spec.ts`**（新增）：`Health (e2e)` —— 启动应用打 `GET /health`，断言 200 + `status:ok` + `db:ok`（跑在 `poolmind_test`）。
- **`test/jest-e2e.json`**（新增）：ts-jest，`setupFiles` 指向下方 setup。
- **`test/setup-e2e.ts`**（新增）：加载 `.env.test`，强制测试连独立测试库。

### 前端 `apps/web`
- **`package.json`**（新增）：React 18 + Vite 6 + i18next；脚本 `dev`/`build`/`preview`。
- **`tsconfig.json`**（新增，单文件方案：`tsc` 只做类型检查、Vite 负责打包）、**`vite.config.ts`**（新增：React 插件 + `/api`、`/health` 反代到 3000，模拟同源）、**`index.html`**（新增）。
- **`src/main.tsx`**（新增）：入口，先初始化 i18n 再挂载 `App`。
- **`src/App.tsx`**（新增）：`App()` 占位首屏，用 i18n 显示 PoolMind 名称/标语/骨架提示。
- **`src/lib/i18n.ts`**（新增）：i18next 初始化，语言 `zh-HK`。
- **`src/locales/zh-HK/translation.json`**（新增）：示例文案。
- **`src/vite-env.d.ts`**（新增）。
- **README 占位**（新增）：`src/pages/{supervisor,lifeguard,admin}/README.md`（标注 demo ID S/L/A 段）、`src/components/README.md`（对齐 demo 类名 `.filt/.reccard/.wcard`）、`src/features/README.md`。

### 共享包 `packages/shared`
- **`package.json` / `tsconfig.json`**（新增）：`@poolmind/shared`，`tsc` 构建到 `dist`，含 zod 依赖。
- **`src/index.ts`**（新增）：占位导出 `SHARED_PACKAGE_READY`，真实前后端同源 schema 后续单元逐个补。

## 3. 对应 SPEC 章节号

- 三库隔离 / 单部署单元 / 无 Redis：实施计划 ADR 与技术选型明细（SPEC §10 合规映射）。
- 时区全链 `Asia/Hong_Kong`：SPEC 时区要求（main.ts 进程级 + docker TZ + env 校验）。
- 业务模块划分对应 SPEC §3–§9 各域（认证/证件/招募/聊天/更表/工资/通知等）。
- 合规两条（静态加密、证件图私有+串流+禁公开 URL）：SPEC §10（README「合规须知」保留）。

## 4. 已跑过的验证命令与结果

| 命令 | 结果 |
|------|------|
| `corepack pnpm install` | ✅ 成功（前后端+shared 依赖装齐） |
| `pnpm --filter api exec/run prisma:generate` | ✅ 成功生成 Prisma Client v5.22.0 |
| `pnpm --filter @poolmind/shared run build` | ✅ tsc 编译通过 |
| `pnpm --filter api run build`（nest build） | ✅ 编译通过，产出 `dist/main.js` |
| `pnpm --filter web run build`（tsc + vite build） | ✅ 47 模块打包成功 |
| `node dist/main.js`（起后端） | ✅ 11 个业务模块 + Health + Prisma + Config 全部初始化；监听 :3000；`TZ=Asia/Hong_Kong` |
| `curl /health` | ✅ HTTP 200，返回 `{"status":"ok","db":"error",...}`（`db:error` 因本机无 Postgres，属预期） |
| `pnpm --filter web run dev`（起前端） | ✅ Vite ready，`http://localhost:5173` 提供页面；`/health` 经反代打到后端返回 200 |

## 5. 遗留事项 / TODO（给下一单元）

- **【环境阻断-待用户补】本机没装 Docker，也没有本地 Postgres**，故以下三步本单元**未能实跑**，代码已写对，装好 Docker Desktop 后即可一键验证：
  1. `docker compose up -d`（起库并自动建 dev/test 两库）
  2. `pnpm --filter api prisma migrate dev`（对 `poolmind_dev` 建表迁移）
  3. `pnpm --filter api test:e2e`（对 `poolmind_test` 跑健康 e2e，届时 `db` 应为 `ok`）
  上面 `curl /health` 的 `db:"error"` 正是「后端连不上库」的如实回报，装好库后会变 `ok`。
- **【占位表 ScaffoldPlaceholder】**：`prisma/schema.prisma` 里的占位表仅为让 Prisma 能生成 client/跑迁移而存在；下一单元开始建真实模型（`User`/`Certificate`/`SupervisorLink`/`Assignment`…）时**删掉它**。
- 11 个业务模块目前是空壳（`@Module({})`），无 controller/service。真实业务逻辑（认证、证件 OCR、招募、聊天、更表、工资状态机等）由后续各单元逐个实现。
- `packages/shared` 目前只有占位导出，真实前后端同源 zod schema 随各功能落地。
- 无 `【壳-待补】`/`【临时测试-用完即删】` 标记残留（本单元未写业务测试壳）。
