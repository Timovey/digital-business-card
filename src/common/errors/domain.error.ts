/**
 * Базовый класс ожидаемых бизнес-ошибок. Они не зависят от транспорта:
 * слой GraphQL отображает `code` в `extensions.code` (см. format-graphql-error.ts).
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Аргумент синтаксически допустим для GraphQL, но не имеет смысла для домена (например, ID "abc"). */
export class BadInputError extends DomainError {
  readonly code = 'BAD_USER_INPUT';
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(entity: string, criteria: string) {
    super(`${entity} not found: ${criteria}`);
  }
}
