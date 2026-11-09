import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseModel } from '../../../common/models/base.model';
import type { Skill } from '../../../generated/prisma/client';
import { SkillCategory } from '../../../generated/prisma/enums';

registerEnumType(SkillCategory, { name: 'SkillCategory' });

@ObjectType('Skill', { description: 'Technology, tool or professional practice.' })
export class SkillModel extends BaseModel implements Pick<Skill, 'id' | 'name' | 'category'> {
  @Field()
  name!: string;

  @Field(() => SkillCategory)
  category!: SkillCategory;
}

@ObjectType('SkillGroup', { description: 'Skills of one category, in presentation order.' })
export class SkillGroupModel {
  @Field(() => SkillCategory)
  category!: SkillCategory;

  @Field(() => [SkillModel])
  skills!: SkillModel[];
}
