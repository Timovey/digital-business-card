import { Injectable } from '@nestjs/common';
import { groupByKeys } from '../../common/dataloader/group-by-keys';
import type { BatchLoadFn } from '../../common/dataloader/loader-registry';
import type { Experience } from '../../generated/prisma/client';
import { ExperienceService } from './experience.service';

@Injectable()
export class ExperienceLoaders {
  constructor(private readonly experiences: ExperienceService) {}

  readonly byProfileId: BatchLoadFn<number, Experience[]> = async (profileIds) =>
    groupByKeys(
      profileIds,
      await this.experiences.findByProfileIds(profileIds),
      (experience) => experience.profileId,
    );

  readonly byId: BatchLoadFn<number, Experience | null> = async (ids) => {
    const byId = new Map((await this.experiences.findByIds(ids)).map((e) => [e.id, e]));
    return ids.map((id) => byId.get(id) ?? null);
  };
}
