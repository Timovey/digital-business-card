import { Injectable } from '@nestjs/common';
import { Clock } from '../../common/clock/clock';
import type { Experience } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import {
  type Duration,
  type WorkPeriod,
  formatDuration,
  formatPeriod,
  periodDuration,
  totalDuration,
} from './experience-period';

export interface HumanizedDuration extends Duration {
  text: string;
}

@Injectable()
export class ExperienceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: Clock,
  ) {}

  /** Сначала самые свежие места работы, как в резюме. */
  findByProfileIds(profileIds: readonly number[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: [{ startDate: 'desc' }, { id: 'asc' }],
    });
  }

  findByIds(ids: readonly number[]): Promise<Experience[]> {
    return this.prisma.experience.findMany({
      where: { id: { in: [...ids] } },
      orderBy: { id: 'asc' },
    });
  }

  isCurrent(period: WorkPeriod): boolean {
    return period.endDate === null || period.endDate > this.clock.now();
  }

  getDuration(period: WorkPeriod): HumanizedDuration {
    return humanize(periodDuration(period, this.clock.now()));
  }

  getTotalDuration(periods: readonly WorkPeriod[]): HumanizedDuration {
    return humanize(totalDuration(periods, this.clock.now()));
  }

  getPeriodLabel(period: WorkPeriod): string {
    return formatPeriod(period);
  }
}

function humanize(duration: Duration): HumanizedDuration {
  return { ...duration, text: formatDuration(duration) };
}
