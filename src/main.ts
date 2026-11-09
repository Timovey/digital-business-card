import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import type { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // политика обнаружение дублей ендпоинтов
    routeConflictPolicy: { duplicate: 'error', shadow: 'warn' },
    routeResolutionStrategy: 'specificity',
  });
  app.enableShutdownHooks();

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  // За обратным прокси (Caddy на VPS) реальный IP клиента — в X-Forwarded-For. Доверяем ровно
  // стольким прокси, сколько их стоит перед API: иначе клиент подделал бы IP и обошёл rate limit.
  app.set('trust proxy', config.get('TRUST_PROXY', { infer: true }));
  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  Logger.log(`GraphQL API & GraphiQL: http://localhost:${port}/graphql`, 'Bootstrap');
}

void bootstrap();
