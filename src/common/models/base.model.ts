import { Field, ID, ObjectType } from '@nestjs/graphql';

/**
 * Общий предок GraphQL-моделей: целочисленный первичный ключ наружу отдаётся как `ID`.
 * Абстрактный: в схеме отдельного типа не появляется, поле копируется в наследников.
 * Служебные метки (`createdAt`/`updatedAt`) сюда не входят: они есть не у всех таблиц
 * и не являются частью публичного контракта визитки.
 */
@ObjectType({ isAbstract: true })
export abstract class BaseModel {
  @Field(() => ID)
  id!: number;
}
