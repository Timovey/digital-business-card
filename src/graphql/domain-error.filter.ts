import { Catch } from '@nestjs/common';
import type { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { DomainError } from '../common/errors/domain.error';

/**
 * Ожидаемые ошибки — нормальный результат, а не сбой сервера: передаём их в Apollo как есть,
 * не давая Nest логировать их со стектрейсом. Это доменные ошибки (например, неизвестный id
 * профиля) и намеренно брошенные транспортным слоем `GraphQLError` (превышен rate limit).
 * Отображение доменных ошибок в `extensions.code` происходит в format-graphql-error.ts.
 */
@Catch(DomainError, GraphQLError)
export class DomainErrorFilter implements GqlExceptionFilter {
  catch(error: DomainError | GraphQLError): DomainError | GraphQLError {
    return error;
  }
}
