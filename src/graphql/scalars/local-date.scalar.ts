import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseLocalDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  // Проверка туда-обратно отсекает даты, которые JS молча перенёс бы дальше (например, 2025-02-30).
  const isValid =
    LOCAL_DATE_PATTERN.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().startsWith(value);
  if (!isValid) {
    throw new GraphQLError(`LocalDate must be a valid date in YYYY-MM-DD format, got "${value}"`);
  }
  return date;
}

/**
 * Календарная дата без часового пояса (`YYYY-MM-DD`), как `DATE` в PostgreSQL.
 * `DateTime` отдавал бы клиентам бессмысленную метку полуночи по UTC.
 */
export const LocalDateScalar = new GraphQLScalarType<Date, string>({
  name: 'LocalDate',
  description: 'Calendar date without time zone, ISO 8601 `YYYY-MM-DD`.',
  serialize(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new GraphQLError('LocalDate can only serialize valid Date instances');
    }
    return value.toISOString().slice(0, 10);
  },
  parseValue(value) {
    if (typeof value !== 'string') throw new GraphQLError('LocalDate must be a string');
    return parseLocalDate(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) throw new GraphQLError('LocalDate must be a string');
    return parseLocalDate(ast.value);
  },
});
