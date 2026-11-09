import { costLimitRule } from '@escape.tech/graphql-armor-cost-limit';
import { maxAliasesRule } from '@escape.tech/graphql-armor-max-aliases';
import { maxDepthRule } from '@escape.tech/graphql-armor-max-depth';
import type { GraphQLError, ValidationContext, ValidationRule } from 'graphql';

export interface QueryLimits {
  /** Максимальная вложенность полей; фрагменты не добавляют уровней. */
  maxDepth: number;
  /** Максимум алиасов в операции (`a: profile { ... } b: profile { ... }`). */
  maxAliases: number;
  /** Максимальная статическая стоимость операции (объект — 2, скаляр — 1, ×1.5 за уровень). */
  maxCost: number;
}

/**
 * Правила graphql-armor по умолчанию **бросают** исключение (`propagateOnRejection: true`).
 * Apollo вызывает `validate()` без try/catch, поэтому брошенная ошибка стала бы внутренней:
 * `INTERNAL_SERVER_ERROR`, а в production — замаскированной. Вместо этого ошибка передаётся
 * штатным путём валидации, и клиент получает HTTP 400 с `GRAPHQL_VALIDATION_FAILED`
 * и понятным сообщением, как при любой другой ошибке валидации.
 */
const reportAsValidationError = {
  propagateOnRejection: false,
  onReject: [
    (context: ValidationContext | null, error: GraphQLError) => context?.reportError(error),
  ],
};

/**
 * Правила валидации, ограничивающие сложность запроса до его выполнения.
 * Подробно о проблеме и выборе значений — docs/graphql-query-limits.md.
 */
export function createQueryLimitRules(limits: QueryLimits): ValidationRule[] {
  return [
    maxDepthRule({ ...reportAsValidationError, n: limits.maxDepth, flattenFragments: true }),
    maxAliasesRule({ ...reportAsValidationError, n: limits.maxAliases }),
    costLimitRule({ ...reportAsValidationError, maxCost: limits.maxCost, flattenFragments: true }),
  ];
}
