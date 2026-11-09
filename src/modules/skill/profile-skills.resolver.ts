import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../common/dataloader/loaders.decorator';
import type { LoaderRegistry } from '../../common/dataloader/loader-registry';
import type { Profile, Skill } from '../../generated/prisma/client';
import { ProfileModel } from '../profile/models/profile.model';
import { SkillGroupModel, SkillModel } from './models/skill.model';
import { SkillLoaders } from './skill.loaders';
import type { SkillGroup } from './skill-grouping';
import { SkillService } from './skill.service';

@Resolver(() => ProfileModel)
export class ProfileSkillsResolver {
  constructor(
    private readonly skillService: SkillService,
    private readonly skillLoaders: SkillLoaders,
  ) {}

  @ResolveField(() => [SkillModel], { description: 'Flat list of skills in presentation order.' })
  skills(@Parent() profile: Profile, @Loaders() loaders: LoaderRegistry): Promise<Skill[]> {
    return loaders.get(this.skillLoaders.byProfileId).load(profile.id);
  }

  @ResolveField(() => [SkillGroupModel], {
    description: 'Skills grouped by category. Shares the batch with `skills`: no extra query.',
  })
  async skillGroups(
    @Parent() profile: Profile,
    @Loaders() loaders: LoaderRegistry,
  ): Promise<SkillGroup[]> {
    const skills = await loaders.get(this.skillLoaders.byProfileId).load(profile.id);
    return this.skillService.groupByCategory(skills);
  }
}
