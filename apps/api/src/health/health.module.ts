// 健康检查模块：装配 /health 接口与其服务。是本脚手架里唯一含真实逻辑的模块。
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
