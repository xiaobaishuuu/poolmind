// 健康检查端到端测试：真正启动应用、打 GET /health，验证「后端 → 测试数据库」链路通。
// 跑在独立的 poolmind_test 库上（见 setup-e2e.ts），与开发数据隔离。
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // GET /health 应返回 200，且 status=ok、db=ok（证明测试库连接正常）。
  it('GET /health 返回 ok 且数据库连通', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});
