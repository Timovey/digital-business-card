import { Injectable, type PipeTransform } from '@nestjs/common';
import { BadInputError } from '../../common/errors/domain.error';

/** Верхняя граница PostgreSQL `integer` (int4), в котором хранятся первичные ключи. */
const MAX_INT4 = 2_147_483_647;
const POSITIVE_INT = /^[1-9]\d*$/;

/**
 * Превращает GraphQL `ID` (по спецификации — строка) в числовой первичный ключ.
 *
 * Скаляр `ID` намеренно непрозрачен для клиента, поэтому проверка формата — дело сервера, и делать
 * её нужно на границе транспорта, а не в сервисе: сервис получает уже `number`.
 * Без верхней границы ID вроде "99999999999" дошёл бы до Prisma, упал бы на переполнении int4
 * и превратился бы в `INTERNAL_SERVER_ERROR`, хотя это ошибка клиента.
 *
 * `null`/`undefined` пропускаются: обязательность аргумента описывает схема (`ID` vs `ID!`).
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string | null | undefined, number | null> {
  transform(value: string | null | undefined): number | null {
    if (value == null) return null;
    const id = POSITIVE_INT.test(value) ? Number(value) : Number.NaN;
    if (!(id <= MAX_INT4)) throw new BadInputError(`Invalid ID "${value}"`);
    return id;
  }
}
