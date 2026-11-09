import type { ApolloDriverConfig } from '@nestjs/apollo';
import type { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import type { Env } from '../config/env.schema';
import { createErrorFormatter } from './format-graphql-error';
import { createGraphQLContext } from './graphql-context';
import { createQueryLimitRules } from './query-limits';

/**
 * Настройки Apollo для `GraphQLModule.forRootAsync({ useFactory })`.
 * Драйвер указывается в самом `forRootAsync`, здесь только опции сервера.
 */
export function getGraphQlConfig(config: ConfigService<Env, true>): ApolloDriverConfig {
  const nodeEnv = config.get('NODE_ENV', { infer: true });
  const isDevelopment = nodeEnv === 'development';
  const sandbox = config.get('GRAPHQL_SANDBOX', { infer: true });

  return {
    // Code-first: схема строится из классов с декораторами. Вне production (start:dev, e2e) она ещё
    // и пишется в schema.gql — это контракт API, его коммитят, а CI проверяет, что он актуален
    // (`npm run schema:check`). В контейнере схема держится в памяти: каталог только для чтения.
    autoSchemaFile: nodeEnv === 'production' ? true : join(process.cwd(), 'schema.gql'),
    sortSchema: true,

    // Встроенный в @nestjs/apollo GraphiQL на GET /graphql. Фронтенда у визитки нет, поэтому страница
    // для тестирования запросов нужна и в production: флаг задаётся явно, а не по NODE_ENV
    // (по умолчанию Nest включает GraphiQL только вне production). Без интроспекции в нём
    // не работали бы документация и автодополнение, поэтому оба включаются одним флагом.
    graphiql: sandbox,
    introspection: sandbox,

    // Схема содержит цикл (Project.experience ↔ Experience.projects): без лимитов один запрос
    // в ~1 КБ раздувает ответ экспоненциально и роняет процесс по памяти.
    // См. docs/graphql-query-limits.md.
    validationRules: createQueryLimitRules({
      maxDepth: config.get('GRAPHQL_MAX_DEPTH', { infer: true }),
      maxAliases: config.get('GRAPHQL_MAX_ALIASES', { infer: true }),
      maxCost: config.get('GRAPHQL_MAX_COST', { infer: true }),
    }),

    // Контекст создаётся на каждый запрос: в нём живут DataLoader-ы этого запроса.
    context: createGraphQLContext,

    // Доменные ошибки → `extensions.code`; неожиданные ошибки маскируются вне разработки.
    formatError: createErrorFormatter(isDevelopment),
    includeStacktraceInErrorResponses: isDevelopment,
  };
}
