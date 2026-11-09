import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../common/dataloader/loaders.decorator';
import type { LoaderRegistry } from '../../common/dataloader/loader-registry';
import type { Profile, Project } from '../../generated/prisma/client';
import { ProjectKind } from '../../generated/prisma/enums';
import { ProfileModel } from '../profile/models/profile.model';
import { ProjectModel } from './models/project.model';
import { ProjectLoaders } from './project.loaders';
import { ProjectService } from './project.service';

@Resolver(() => ProfileModel)
export class ProfileProjectsResolver {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectLoaders: ProjectLoaders,
  ) {}

  @ResolveField(() => [ProjectModel])
  async projects(
    @Parent() profile: Profile,
    @Loaders() loaders: LoaderRegistry,
    @Args('featured', {
      type: () => Boolean,
      nullable: true,
      description: 'Only featured (`true`) or only non-featured (`false`) projects.',
    })
    featured?: boolean | null,
    @Args('kind', {
      type: () => ProjectKind,
      nullable: true,
      description: 'Only projects of this kind.',
    })
    kind?: ProjectKind | null,
  ): Promise<Project[]> {
    const projects = await loaders.get(this.projectLoaders.byProfileId).load(profile.id);
    return this.projectService.filter(projects, { featured, kind });
  }
}
