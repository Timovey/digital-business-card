import { type ExecutionContext, Injectable } from '@nestjs/common';
import { type GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard, type ThrottlerLimitDetail } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { GraphQLError } from 'graphql';
import type { GraphQLContext } from './graphql-context';

export const TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS';

/**
 * ThrottlerGuard для GraphQL. Стандартный guard берёт запрос из HTTP-контекста, а у GraphQL
 * он лежит в контексте Apollo. Guard срабатывает на корневых полях (`fieldResolverEnhancers`
 * по умолчанию пуст), поэтому каждый алиас корневого поля — отдельное обращение к лимиту.
 * IP клиента — `req.ip`: за обратным прокси его даёт `trust proxy` (env `TRUST_PROXY`).
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected override getRequestResponse(context: ExecutionContext): {
    req: Request;
    res: Response;
  } {
    if (context.getType<GqlContextType>() !== 'graphql') {
      return {
        req: context.switchToHttp().getRequest<Request>(),
        res: context.switchToHttp().getResponse<Response>(),
      };
    }
    const { req } = GqlExecutionContext.create(context).getContext<GraphQLContext>();
    if (!req.res) throw new Error('GraphQL context has no HTTP response');
    return { req, res: req.res };
  }

  /**
   * Стандартный ThrottlerException — это HttpException 429, а @nestjs/apollo знает коды только
   * для 400/401/403: остальное становится INTERNAL_SERVER_ERROR и в production маскируется.
   * Для GraphQL бросаем понятную клиенту ошибку с кодом TOO_MANY_REQUESTS. HTTP-статус остаётся 200:
   * @nestjs/apollo намеренно сбрасывает его для ошибок выполнения, чтобы GraphQL-клиенты разбирали
   * ответ `{ data, errors }` как обычно (nestjs/graphql#2940, GraphQL-over-HTTP для application/json).
   * Сигнал для клиента — код ошибки и заголовок Retry-After, который guard уже выставил на ответ.
   */
  protected override async throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    if (context.getType<GqlContextType>() !== 'graphql') {
      return super.throwThrottlingException(context, detail);
    }
    throw new GraphQLError(`Too many requests, retry in ${detail.timeToBlockExpire} s`, {
      extensions: { code: TOO_MANY_REQUESTS },
    });
  }
}
