import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from './common/common.module';
import { validateEnv } from './config/env.schema';
import { DomainErrorFilter } from './graphql/domain-error.filter';
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
    CommonModule,
    PrismaModule,
    StorageModule,
    HealthModule,
    ApiModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: DomainErrorFilter }],
})
export class AppModule {}
