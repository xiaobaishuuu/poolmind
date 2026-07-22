// Prisma 模块：全局导出 PrismaService，任何业务模块无需重复 import 即可注入数据库访问。
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
