import { Args, ID, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Loaders } from '../../common/dataloader/loaders.decorator';
import type { LoaderRegistry } from '../../common/dataloader/loader-registry';
import type { Profile, SocialLink } from '../../generated/prisma/client';
import { ParseIdPipe } from '../../graphql/pipes/parse-id.pipe';
import { ProfileModel } from './models/profile.model';
import { SocialLinkModel } from './models/social-link.model';
import { ProfileLoaders } from './profile.loaders';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly profileLoaders: ProfileLoaders,
  ) {}

  @Query(() => ProfileModel, {
    description: 'Profile by id. Without arguments returns the business card owner.',
  })
  profile(
    @Args('id', { type: () => ID, nullable: true }, ParseIdPipe) id: number | null,
  ): Promise<Profile> {
    return this.profileService.get(id);
  }

  @ResolveField(() => String, {
    nullable: true,
    description: 'Permanent public URL of the avatar; changes only when the image changes.',
  })
  avatarUrl(@Parent() profile: Profile): string | null {
    return this.profileService.getAvatarUrl(profile);
  }

  @ResolveField(() => [SocialLinkModel], { description: 'GitHub, Telegram, e-mail, etc.' })
  links(@Parent() profile: Profile, @Loaders() loaders: LoaderRegistry): Promise<SocialLink[]> {
    return loaders.get(this.profileLoaders.linksByProfileId).load(profile.id);
  }
}
