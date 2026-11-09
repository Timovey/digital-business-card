import { Injectable } from '@nestjs/common';
import { groupByKeys } from '../../common/dataloader/group-by-keys';
import type { BatchLoadFn } from '../../common/dataloader/loader-registry';
import type { Skill } from '../../generated/prisma/client';
import { SkillService } from './skill.service';

/**
 * Batch-функции для всех связей, ведущих к навыкам. Экспортируются, чтобы
 * модули проектов и опыта могли получать свои стеки технологий.
 */
@Injectable()
export class SkillLoaders {
  constructor(private readonly skills: SkillService) {}

  readonly byProfileId: BatchLoadFn<number, Skill[]> = async (profileIds) =>
    groupByKeys(profileIds, await this.skills.findByProfileIds(profileIds), (s) => s.profileId);

  readonly byProjectId: BatchLoadFn<number, Skill[]> = async (projectIds) => {
    const rows = await this.skills.findByProjectIds(projectIds);
    return groupByKeys(projectIds, rows, (row) => row.projectId).map((group) =>
      group.map((row) => row.skill),
    );
  };

  readonly byExperienceId: BatchLoadFn<number, Skill[]> = async (experienceIds) => {
    const rows = await this.skills.findByExperienceIds(experienceIds);
    return groupByKeys(experienceIds, rows, (row) => row.experienceId).map((group) =>
      group.map((row) => row.skill),
    );
  };
}
