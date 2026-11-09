import { Field, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../../common/models/base.model';
import type { Experience } from '../../../generated/prisma/client';
import { LocalDateScalar } from '../../../graphql/scalars/local-date.scalar';

@ObjectType('Duration', { description: 'Length of a period in whole calendar months.' })
export class DurationModel {
  @Field(() => Int)
  totalMonths!: number;

  @Field(() => Int)
  years!: number;

  @Field(() => Int, { description: 'Months on top of full years (0–11).' })
  months!: number;

  @Field({ description: 'Human-readable form, e.g. "1 год 8 месяцев".' })
  text!: string;
}

@ObjectType('Experience', { description: 'Position held at a company.' })
export class ExperienceModel
  extends BaseModel
  implements
    Pick<
      Experience,
      'id' | 'company' | 'companyUrl' | 'location' | 'position' | 'startDate' | 'endDate'
    >
{
  @Field()
  company!: string;

  @Field(() => String, { nullable: true })
  companyUrl!: string | null;

  @Field(() => String, { nullable: true })
  location!: string | null;

  @Field()
  position!: string;

  @Field(() => LocalDateScalar)
  startDate!: Date;

  @Field(() => LocalDateScalar, { nullable: true, description: '`null` for the current position.' })
  endDate!: Date | null;
}
