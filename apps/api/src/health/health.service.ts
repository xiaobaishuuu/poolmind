// 健康检查服务：真正对数据库执行一次查询，用来证明「后端到数据库」这条链路是通的。
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 健康检查返回结构。
export interface HealthStatus {
  status: 'ok';
  db: 'ok' | 'error';
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  // 执行一条最轻量的 `SELECT 1`，能返回就说明数据库连接正常。
  async check(): Promise<HealthStatus> {
    let db: 'ok' | 'error' = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // 连不上/查询失败时标记 error，但接口本身仍正常返回，方便前端/监控读取状态。
      db = 'error';
    }
    return {
      status: 'ok',
      db,
      // 时间戳用香港时区（进程级已设 TZ=Asia/Hong_Kong）。
      timestamp: new Date().toISOString(),
    };
  }
}
