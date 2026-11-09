import { GraphQLError } from 'graphql';
import { NotFoundError } from '../common/errors/domain.error';
import { createErrorFormatter } from './format-graphql-error';

/** Apollo оборачивает ошибки резолверов в GraphQLError с `originalError` и `path`. */
const resolverError = (original: Error) =>
  new GraphQLError(original.message, { path: ['profile'], originalError: original });

describe('createErrorFormatter', () => {
  const internal = { message: 'boom', extensions: { code: 'INTERNAL_SERVER_ERROR' } };

  it('maps domain errors to their code', () => {
    const format = createErrorFormatter(false);
    const error = new NotFoundError('Profile', 'slug "x"');
    expect(format({ message: error.message, path: ['profile'] }, resolverError(error))).toEqual({
      message: 'Profile not found: slug "x"',
      path: ['profile'],
      locations: undefined,
      extensions: { code: 'NOT_FOUND' },
    });
  });

  it('masks unexpected errors in production', () => {
    const format = createErrorFormatter(false);
    expect(format(internal, resolverError(new Error('SQL details')))).toMatchObject({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('keeps unexpected errors visible in development', () => {
    const format = createErrorFormatter(true);
    expect(format(internal, resolverError(new Error('boom')))).toBe(internal);
  });

  it('passes client errors (validation, parsing) through untouched', () => {
    const format = createErrorFormatter(false);
    const validation = {
      message: 'Cannot query field',
      extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
    };
    expect(format(validation, new GraphQLError('Cannot query field'))).toBe(validation);
  });
});
