import { Injectable } from '@nestjs/common';
import type { Skill } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { type SkillGroup, groupByCategory } from './skill-grouping';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: readonly number[]): Promise<Skill[]> {
    return this.prisma.skill.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findByProjectIds(projectIds: readonly number[]): Promise<{ projectId: number; skill: Skill }[]> {
    return this.prisma.projectTechnology.findMany({
      where: { projectId: { in: [...projectIds] } },
      orderBy: [{ sortOrder: 'asc' }, { skillId: 'asc' }],
      select: { projectId: true, skill: true },
    });
  }

  findByExperienceIds(
    experienceIds: readonly number[],
  ): Promise<{ experienceId: number; skill: Skill }[]> {
    return this.prisma.experienceTechnology.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: [{ sortOrder: 'asc' }, { skillId: 'asc' }],
      select: { experienceId: true, skill: true },
    });
  }

  /** Правило живёт в skill-grouping.ts; сервис — точка входа для резолверов. */
  groupByCategory(skills: readonly Skill[]): SkillGroup[] {
    return groupByCategory(skills);
  }
}
