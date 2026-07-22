# common/ 共享后端构件

这里放**跨业务模块复用**的后端基础设施，本脚手架单元先留空，按需在后续单元补齐：

- **guards/**：权限守卫。第一期核心是「主管管辖链」作用域守卫——按 `SupervisorLink` 链式过滤，集中实现、防止散落在各处 `where` 漏判导致越权（见实施计划「数据模型骨架」与 Architect 改进 f）。
- **interceptors/**：如 companyId / 管辖链过滤的集中注入拦截器、审计日志拦截器。
- **decorators/**：如 `@CurrentUser()`、`@Roles()` 等参数/元数据装饰器。
- **filters/**：统一异常过滤与错误响应格式。

> 约定：证件图相关响应必须带 `Cache-Control: private, no-store`，证件 URL/id 不得进日志与 Sentry（合规三重防线，见实施计划证件图存储行）。相关拦截器/守卫落地时放这里。
