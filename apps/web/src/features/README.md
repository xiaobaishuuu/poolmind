# features/ 按业务模块组织的前端逻辑

每个业务域一个子目录，放该域的 API 调用 hooks（TanStack Query）、类型、状态。与后端 `apps/api/src/modules/` 的划分对应（auth、certificates、recruitment、chat、roster、payroll…）。校验 schema 从 `packages/shared` 复用（前后端同源）。本单元先留空，后续单元逐域补齐。
