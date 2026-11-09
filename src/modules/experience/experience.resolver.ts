import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../common/dataloader/loaders.decorator';
import type { LoaderRegistry } from '../../common/dataloader/loader-registry';
import type { Experience, Skill } from '../../generated/prisma/client';
import { SkillModel } from '../skill/models/skill.model';
import { SkillLoaders } from '../skill/skill.loaders';
import { type HumanizedDuration, ExperienceService } from './experience.service';
import { DurationModel, ExperienceModel } from './models/experience.model';

@Resolver(() => ExperienceModel)
export class ExperienceResolver {
  constructor(
    private readonly experienceService: ExperienceService,
    private readonly skillLoaders: SkillLoaders,
  ) {}

  @ResolveField(() => [SkillModel], { description: 'Technology stack used in this position.' })
  technologies(
    @Parent() experience: Experience,
    @Loaders() loaders: LoaderRegistry,
  ): Promise<Skill[]> {
    return loaders.get(this.skillLoaders.byExperienceId).load(experience.id);
  }

  @ResolveField(() => Boolean)
  isCurrent(@Parent() experience: Experience): boolean {
    return this.experienceService.isCurrent(experience);
  }

  @ResolveField(() => DurationModel)
  duration(@Parent() experience: Experience): HumanizedDuration {
    return this.experienceService.getDuration(experience);
  }

  @ResolveField(() => String, { description: 'E.g. "Март 2025 — настоящее время".' })
  period(@Parent() experience: Experience): string {
    return this.experienceService.getPeriodLabel(experience);
  }
}
