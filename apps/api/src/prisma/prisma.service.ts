// Prisma 服务：包一层 PrismaClient，接管连接生命周期，供各业务模块注入使用。
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  // 模块启动时尝试连库。这里刻意不让连接失败拖垮整个后端启动：
  // 数据库暂时不可用时，后端仍要能起来，好让 GET /health 如实回报 db:'error'（而不是整个服务挂掉）。
  // Prisma 本身也支持惰性连接，首次查询时会自动重连。
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch {
      console.warn('[PrismaService] 启动时暂未连上数据库，将在首次查询时重试（/health 会回报 db:error）。');
    }
  }

  // 模块销毁时断开连接，避免连接泄漏。
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
