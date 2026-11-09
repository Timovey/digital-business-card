import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../../common/models/base.model';
import type { Achievement } from '../../../generated/prisma/client';

@ObjectType('Achievement', { description: 'Achievement or responsibility on a project.' })
export class AchievementModel extends BaseModel implements Pick<Achievement, 'id' | 'text'> {
  @Field()
  text!: string;
}
