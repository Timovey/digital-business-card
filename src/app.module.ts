import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { type Env, validateEnv } from './config/env.schema';
import { DomainErrorFilter } from './graphql/domain-error.filter';
import { GqlThrottlerGuard } from './graphql/gql-throttler.guard';
import { getGraphQlConfig } from './graphql/graphql.config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { StorageModule } from './infra/storage/storage.module';
import { ApiModule } from './modules/api.module';

/** Корневой модуль: инфраструктура и транспорт. Бизнес-модули собраны в {@link ApiModule}. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: getGraphQlConfig,
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const limit = config.get('RATE_LIMIT_PER_MINUTE', { infer: true });
        return { throttlers: [{ ttl: 60_000, limit }], skipIf: () => limit === 0 };
      },
    }),
    CommonModule,
    PrismaModule,
    StorageModule,
    HealthModule,
    ApiModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DomainErrorFilter },
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
  ],
})
export class AppModule {}
