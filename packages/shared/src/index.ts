// 前后端共享 schema 的统一出口。
// 真实的业务校验 schema（注册五样、招募帖字段、更表/工资入参等）随各功能单元逐个落地，
// 前端 features/ 与后端 DTO 都从这里 import 同一份 zod schema，保证校验规则不漂移。

// 占位导出，保证包可被正常构建/引用；后续单元用真实 schema 替换。
export const SHARED_PACKAGE_READY = true;
