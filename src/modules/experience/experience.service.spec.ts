import { Clock } from '../../common/clock/clock';
import type { PrismaService } from '../../infra/prisma/prisma.service';
import { ExperienceService } from './experience.service';

class FixedClock extends Clock {
  constructor(private readonly fixed: Date) {
    super();
  }

  now(): Date {
    return this.fixed;
  }
}

describe('ExperienceService', () => {
  const service = new ExperienceService(
    {} as PrismaService,
    new FixedClock(new Date('2026-10-27T12:00:00Z')),
  );
  const current = { startDate: new Date('2025-03-01'), endDate: null };
  const finished = { startDate: new Date('2023-03-01'), endDate: new Date('2025-02-01') };

  it('detects the current position', () => {
    expect(service.isCurrent(current)).toBe(true);
    expect(service.isCurrent(finished)).toBe(false);
  });

  it('humanizes durations relative to the injected clock', () => {
    expect(service.getDuration(current)).toEqual({
      totalMonths: 20,
      years: 1,
      months: 8,
      text: '1 год 8 месяцев',
    });
    expect(service.getTotalDuration([current, finished]).text).toBe('3 года 8 месяцев');
  });
});
