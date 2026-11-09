import { Injectable } from '@nestjs/common';
import { groupByKeys } from '../../common/dataloader/group-by-keys';
import type { BatchLoadFn } from '../../common/dataloader/loader-registry';
import type { Achievement, Project } from '../../generated/prisma/client';
import { ProjectService } from './project.service';

@Injectable()
export class ProjectLoaders {
  constructor(private readonly projects: ProjectService) {}

  readonly byProfileId: BatchLoadFn<number, Project[]> = async (profileIds) =>
    groupByKeys(profileIds, await this.projects.findByProfileIds(profileIds), (p) => p.profileId);

  readonly byExperienceId: BatchLoadFn<number, Project[]> = async (experienceIds) =>
    groupByKeys(
      experienceIds,
      await this.projects.findByExperienceIds(experienceIds),
      (p) => p.experienceId,
    );

  readonly achievementsByProjectId: BatchLoadFn<number, Achievement[]> = async (projectIds) =>
    groupByKeys(
      projectIds,
      await this.projects.findAchievementsByProjectIds(projectIds),
      (achievement) => achievement.projectId,
    );
}
