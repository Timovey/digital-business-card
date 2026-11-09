import { z } from 'zod';

/**
 * Единый источник правды для конфигурации времени выполнения.
 * При невалидном env приложение не стартует, а не падает на первом запросе.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  GRAPHQL_SANDBOX: z.stringbool().default(true),
  // Лимиты сложности запроса (docs/graphql-query-limits.md). Легитимные запросы визитки:
  // глубина ≤ 5, стоимость ≈ 125, алиасов ≤ 3 — значения по умолчанию дают запас в 1.2–8 раз.
  GRAPHQL_MAX_DEPTH: z.coerce.number().int().positive().default(6),
  GRAPHQL_MAX_ALIASES: z.coerce.number().int().nonnegative().default(15),
  GRAPHQL_MAX_COST: z.coerce.number().positive().default(1000),
  PRISMA_LOG_QUERIES: z.stringbool().default(false),

  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),

  S3_ENDPOINT: z.url(),
  S3_PUBLIC_ENDPOINT: z.url(),
  // Необязательный базовый адрес публичных объектов (CDN, домен R2); пустая строка = не задан.
  S3_PUBLIC_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().optional()),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(3),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z.stringbool().default(true),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv<T extends z.ZodType>(schema: T, raw: Record<string, unknown>): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const validateEnv = (raw: Record<string, unknown>): Env => parseEnv(envSchema, raw);
