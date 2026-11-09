import { Injectable } from '@nestjs/common';
import { groupByKeys } from '../../common/dataloader/group-by-keys';
import type { BatchLoadFn } from '../../common/dataloader/loader-registry';
import type { SocialLink } from '../../generated/prisma/client';
import { ProfileService } from './profile.service';

@Injectable()
export class ProfileLoaders {
  constructor(private readonly profiles: ProfileService) {}

  readonly linksByProfileId: BatchLoadFn<number, SocialLink[]> = async (profileIds) =>
    groupByKeys(
      profileIds,
      await this.profiles.findLinksByProfileIds(profileIds),
      (link) => link.profileId,
    );
}
