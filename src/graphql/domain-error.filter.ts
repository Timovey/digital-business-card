import { Catch } from '@nestjs/common';
import type { GqlExceptionFilter } from '@nestjs/graphql';
import { DomainError } from '../common/errors/domain.error';

/**
 * Доменные ошибки — ожидаемый результат (например, неизвестный id профиля), а не сбой сервера:
 * передаём их в Apollo как есть, не давая Nest логировать их со стектрейсом.
 * Отображение в `extensions.code` происходит в format-graphql-error.ts.
 */
@Catch(DomainError)
export class DomainErrorFilter implements GqlExceptionFilter {
  catch(error: DomainError): DomainError {
    return error;
  }
}
