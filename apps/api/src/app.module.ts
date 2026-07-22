// 应用根模块：装配全局配置、数据库、健康检查，并注册所有业务域模块（当前为骨架空壳）。
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';

// 各业务域模块（本单元均为空壳，业务逻辑由后续单元逐个补齐）。
import { AuthModule } from './modules/auth/auth.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { SupervisorLinksModule } from './modules/supervisor-links/supervisor-links.module';
import { VenuesPoolsModule } from './modules/venues-pools/venues-pools.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { ChatModule } from './modules/chat/chat.module';
import { RosterModule } from './modules/roster/roster.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdminToolsModule } from './modules/admin-tools/admin-tools.module';

@Module({
  imports: [
    // 全局配置：按 NODE_ENV 选 .env 文件，并用 zod 校验必填项。test 环境读 .env.test（连独立测试库）。
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? ['.env.test'] : ['.env'],
      validate: validateEnv,
    }),
    // 全局数据库访问。
    PrismaModule,
    // 健康检查（真实查询数据库）。
    HealthModule,
    // ── 业务域模块（骨架空壳）──
    AuthModule,
    CertificatesModule,
    SupervisorLinksModule,
    VenuesPoolsModule,
    RecruitmentModule,
    ChatModule,
    RosterModule,
    PayrollModule,
    NotificationsModule,
    AuditModule,
    AdminToolsModule,
  ],
})
export class AppModule {}
