import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../common/dataloader/loaders.decorator';
import type { LoaderRegistry } from '../../common/dataloader/loader-registry';
import type { Experience, Project } from '../../generated/prisma/client';
import { ExperienceModel } from '../experience/models/experience.model';
import { ProjectModel } from './models/project.model';
import { ProjectLoaders } from './project.loaders';

@Resolver(() => ExperienceModel)
export class ExperienceProjectsResolver {
  constructor(private readonly projectLoaders: ProjectLoaders) {}

  @ResolveField(() => [ProjectModel], { description: 'Projects done at this job.' })
  projects(
    @Parent() experience: Experience,
    @Loaders() loaders: LoaderRegistry,
  ): Promise<Project[]> {
    return loaders.get(this.projectLoaders.byExperienceId).load(experience.id);
  }
}
