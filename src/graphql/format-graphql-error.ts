import { ApolloServerErrorCode, unwrapResolverError } from '@apollo/server/errors';
import type { GraphQLFormattedError } from 'graphql';
import { DomainError } from '../common/errors/domain.error';

/**
 * Отображает доменные ошибки в коды ошибок GraphQL и в продакшене скрывает детали
 * неожиданных ошибок, чтобы стектрейсы и SQL не доходили до потребителей API.
 */
export function createErrorFormatter(exposeInternalErrors: boolean) {
  return (formatted: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
    const original = unwrapResolverError(error);

    if (original instanceof DomainError) {
      return {
        message: original.message,
        locations: formatted.locations,
        path: formatted.path,
        extensions: { code: original.code },
      };
    }

    const isInternal =
      formatted.extensions?.code === ApolloServerErrorCode.INTERNAL_SERVER_ERROR ||
      formatted.extensions?.code === undefined;

    if (isInternal && !exposeInternalErrors) {
      return {
        message: 'Internal server error',
        locations: formatted.locations,
        path: formatted.path,
        extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
      };
    }

    return formatted;
  };
}
