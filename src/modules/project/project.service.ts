import { Injectable } from '@nestjs/common';
import type { Achievement, Project } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { type ProjectFilter, filterProjects } from './project-filter';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  findByProfileIds(profileIds: readonly number[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findByExperienceIds(experienceIds: readonly number[]): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { experienceId: { in: [...experienceIds] } },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  findAchievementsByProjectIds(projectIds: readonly number[]): Promise<Achievement[]> {
    return this.prisma.achievement.findMany({
      where: { projectId: { in: [...projectIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /** Правило живёт в project-filter.ts; сервис — точка входа для резолверов. */
  filter(projects: readonly Project[], filter: ProjectFilter): Project[] {
    return filterProjects(projects, filter);
  }
}
