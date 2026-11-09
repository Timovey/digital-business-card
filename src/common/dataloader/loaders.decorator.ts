import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphQLContext } from '../../graphql/graphql-context';
import type { LoaderRegistry } from './loader-registry';

/** Внедряет {@link LoaderRegistry} текущего запроса в метод резолвера. */
export const Loaders = createParamDecorator(
  (_data: unknown, context: ExecutionContext): LoaderRegistry =>
    GqlExecutionContext.create(context).getContext<GraphQLContext>().loaders,
);
