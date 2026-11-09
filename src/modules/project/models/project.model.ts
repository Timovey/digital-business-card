import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseModel } from '../../../common/models/base.model';
import type { Project } from '../../../generated/prisma/client';
import { ProjectKind } from '../../../generated/prisma/enums';

registerEnumType(ProjectKind, {
  name: 'ProjectKind',
  valuesMap: {
    WORK: { description: 'Done at a job; `experience` points to it.' },
    SIDE: { description: 'Own semi-commercial project with real users or a customer.' },
    PET: { description: 'Pet project.' },
  },
});

@ObjectType('Project', { description: 'Work, side or pet project.' })
export class ProjectModel
  extends BaseModel
  implements
    Pick<Project, 'id' | 'name' | 'description' | 'kind' | 'repositoryUrl' | 'demoUrl' | 'featured'>
{
  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field(() => ProjectKind)
  kind!: ProjectKind;

  @Field(() => String, { nullable: true, description: 'Null for private repositories.' })
  repositoryUrl!: string | null;

  @Field(() => String, { nullable: true, description: 'Live demo, if deployed.' })
  demoUrl!: string | null;

  @Field({ description: 'Highlighted on the business card.' })
  featured!: boolean;
}
