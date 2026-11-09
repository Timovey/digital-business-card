import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../../common/models/base.model';
import type { Profile } from '../../../generated/prisma/client';

/** Поля строки `profiles`, которые входят в публичный контракт как есть. */
type PublicProfileFields = 'id' | 'fullName' | 'headline' | 'description' | 'location';

/**
 * Корневой агрегат визитки. Поля связанных сущностей
 * (навыки, опыт, проекты, ...) добавляют их собственные модули
 * через резолверы `@ResolveField` на этом типе.
 *
 * `implements Pick<...>` сверяет типы выставленных полей с Prisma, не заставляя выставлять
 * всё остальное: `avatarKey` (внутренний ключ S3) наружу отдаётся только как `avatarUrl`,
 * а служебные `createdAt`/`updatedAt` в контракт не входят.
 */
@ObjectType('Profile', { description: 'Professional profile of the business card owner.' })
export class ProfileModel extends BaseModel implements Pick<Profile, PublicProfileFields> {
  @Field()
  fullName!: string;

  @Field({ description: 'Current role or job title, e.g. "Lead Fullstack Developer".' })
  headline!: string;

  @Field({ description: 'Short professional summary.' })
  description!: string;

  @Field(() => String, { nullable: true })
  location!: string | null;
}
