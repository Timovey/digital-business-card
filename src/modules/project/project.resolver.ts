import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../common/dataloader/loaders.decorator';
import type { LoaderRegistry } from '../../common/dataloader/loader-registry';
import type { Achievement, Experience, Project, Skill } from '../../generated/prisma/client';
import { ExperienceLoaders } from '../experience/experience.loaders';
import { ExperienceModel } from '../experience/models/experience.model';
import { SkillModel } from '../skill/models/skill.model';
import { SkillLoaders } from '../skill/skill.loaders';
import { AchievementModel } from './models/achievement.model';
import { ProjectModel } from './models/project.model';
import { ProjectLoaders } from './project.loaders';

@Resolver(() => ProjectModel)
export class ProjectResolver {
  constructor(
    private readonly projectLoaders: ProjectLoaders,
    private readonly skillLoaders: SkillLoaders,
    private readonly experienceLoaders: ExperienceLoaders,
  ) {}

  @ResolveField(() => [AchievementModel], {
    description: 'Achievements and responsibilities, in presentation order.',
  })
  achievements(
    @Parent() project: Project,
    @Loaders() loaders: LoaderRegistry,
  ): Promise<Achievement[]> {
    return loaders.get(this.projectLoaders.achievementsByProjectId).load(project.id);
  }

  @ResolveField(() => [SkillModel], { description: 'Technology stack of the project.' })
  technologies(@Parent() project: Project, @Loaders() loaders: LoaderRegistry): Promise<Skill[]> {
    return loaders.get(this.skillLoaders.byProjectId).load(project.id);
  }

  @ResolveField(() => ExperienceModel, {
    nullable: true,
    description: 'Job the project was done at; null for side and pet projects.',
  })
  async experience(
    @Parent() project: Project,
    @Loaders() loaders: LoaderRegistry,
  ): Promise<Experience | null> {
    if (project.experienceId === null) return null;
    return loaders.get(this.experienceLoaders.byId).load(project.experienceId);
  }
}
