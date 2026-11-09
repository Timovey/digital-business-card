import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // политика обнаружение дублей ендпоинтов
    routeConflictPolicy: { duplicate: 'error', shadow: 'warn' },
    routeResolutionStrategy: 'specificity',
  });
  app.enableShutdownHooks();

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  const port = config.get('PORT', { infer: true });
  await app.listen(port);

  Logger.log(`GraphQL API & GraphiQL: http://localhost:${port}/graphql`, 'Bootstrap');
}

void bootstrap();
