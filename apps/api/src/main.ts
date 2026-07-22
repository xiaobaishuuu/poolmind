// 后端启动入口：钉死香港时区、开启全局校验管道、监听端口。
// 时区必须在任何日期逻辑之前设定，故放在文件最顶部、import 应用模块之前。
process.env.TZ = process.env.TZ || 'Asia/Hong_Kong';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 全局请求校验：自动按 DTO 校验入参、剥除多余字段。
  // 前后端同源部署（Nest 托管 SPA 产物），无需 CORS。
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // 用香港时区打印启动时间，方便确认时区生效。
  console.log(`[PoolMind API] 已启动，监听 :${port}（TZ=${process.env.TZ}）`);
}

bootstrap();
