// 环境变量校验：应用启动时用 zod 校验 .env，缺项/格式错直接报错退出，避免带病启动。
import { z } from 'zod';

// 定义我们要求存在的环境变量及其格式。
const envSchema = z.object({
  // 数据库连接串，必须是合法 URL（postgresql://...）
  DATABASE_URL: z.string().url(),
  // 运行环境，只允许这三种，缺省当作 development
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  // HTTP 端口，字符串转数字，缺省 3000
  PORT: z.coerce.number().int().positive().default(3000),
  // 时区，缺省钉死香港
  TZ: z.string().default('Asia/Hong_Kong'),
});

// 从校验后的 schema 推导出类型，供全局 ConfigService<Env> 使用。
export type Env = z.infer<typeof envSchema>;

// ConfigModule 的 validate 回调：传入原始 process.env，返回校验并带默认值后的对象。
export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    // 把 zod 的错误整理成人能看懂的一行行提示。
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`环境变量校验失败（检查 .env 文件）:\n${details}`);
  }
  return parsed.data;
}
