import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../common/dataloader/loaders.decorator';
import type { LoaderRegistry } from '../../common/dataloader/loader-registry';
import type { Experience, Profile } from '../../generated/prisma/client';
import { ProfileModel } from '../profile/models/profile.model';
import { ExperienceLoaders } from './experience.loaders';
import { type HumanizedDuration, ExperienceService } from './experience.service';
import { DurationModel, ExperienceModel } from './models/experience.model';

@Resolver(() => ProfileModel)
export class ProfileExperienceResolver {
  constructor(
    private readonly experienceService: ExperienceService,
    private readonly experienceLoaders: ExperienceLoaders,
  ) {}

  @ResolveField(() => [ExperienceModel], { description: 'Work history, most recent first.' })
  experience(
    @Parent() profile: Profile,
    @Loaders() loaders: LoaderRegistry,
  ): Promise<Experience[]> {
    return loaders.get(this.experienceLoaders.byProfileId).load(profile.id);
  }

  @ResolveField(() => DurationModel, {
    description: 'Total commercial experience; overlapping periods are counted once.',
  })
  async totalExperience(
    @Parent() profile: Profile,
    @Loaders() loaders: LoaderRegistry,
  ): Promise<HumanizedDuration> {
    const experience = await loaders.get(this.experienceLoaders.byProfileId).load(profile.id);
    return this.experienceService.getTotalDuration(experience);
  }
}
