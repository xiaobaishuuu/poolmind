// 健康检查接口：GET /health，返回服务与数据库连通状态，供部署探针/监控/联调使用。
import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // GET /health → { status:'ok', db:'ok'|'error', timestamp }
  @Get()
  check(): Promise<HealthStatus> {
    return this.healthService.check();
  }
}
