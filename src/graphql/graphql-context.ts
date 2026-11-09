import type { Request } from 'express';
import { LoaderRegistry } from '../common/dataloader/loader-registry';

export interface GraphQLContext {
  req: Request;
  loaders: LoaderRegistry;
}

export function createGraphQLContext({ req }: { req: Request }): GraphQLContext {
  return { req, loaders: new LoaderRegistry() };
}
