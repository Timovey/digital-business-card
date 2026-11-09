/**
 * Rate limit на реальном HTTP-стеке. Маленький лимит задаётся через env до импорта AppModule:
 * Jest изолирует модули каждого файла, поэтому основной e2e работает со своим лимитом.
 */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';

const LIMIT = 3;
process.env.RATE_LIMIT_PER_MINUTE = String(LIMIT);

describe('Rate limit (e2e)', () => {
  let app: INestApplication;

  const query = () =>
    request(app.getHttpServer() as App)
      .post('/graphql')
      .send({ query: '{ profile { id } }' });

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves requests up to the limit, then answers TOO_MANY_REQUESTS with Retry-After', async () => {
    for (let i = 0; i < LIMIT; i++) {
      const ok = await query().expect(200);
      expect(ok.body).not.toHaveProperty('errors');
    }

    // HTTP 200 по соглашению GraphQL (см. GqlThrottlerGuard); сигнал — код и Retry-After.
    const limited = await query().expect(200);
    const body = limited.body as { errors?: { extensions?: { code?: string } }[] };
    expect(body.errors?.[0]?.extensions?.code).toBe('TOO_MANY_REQUESTS');
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('never throttles the health check used by Docker', async () => {
    for (let i = 0; i < LIMIT * 2; i++) {
      await request(app.getHttpServer() as App)
        .get('/health')
        .expect(200);
    }
  });
});
