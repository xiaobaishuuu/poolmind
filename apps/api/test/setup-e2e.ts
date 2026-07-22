// e2e 测试全局前置：强制把连接指向独立的测试库 poolmind_test，绝不碰开发库。
// jest 以 NODE_ENV=test 启动，这里显式加载 .env.test 到 process.env，
// 让 Nest 的 ConfigModule 与 Prisma 都读到测试库连接串。
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '..', '.env.test') });
