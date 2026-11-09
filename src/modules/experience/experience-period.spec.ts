import {
  formatDuration,
  formatPeriod,
  periodDuration,
  toDuration,
  totalDuration,
  type WorkPeriod,
} from './experience-period';

const date = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const period = (start: string, end: string | null): WorkPeriod => ({
  startDate: date(start),
  endDate: end ? date(end) : null,
});
const NOW = date('2026-10-27');

describe('experience-period', () => {
  describe('periodDuration', () => {
    it('counts both boundary months', () => {
      expect(periodDuration(period('2023-03-01', '2025-02-01'), NOW).totalMonths).toBe(24);
      expect(periodDuration(period('2022-02-01', '2023-03-01'), NOW).totalMonths).toBe(14);
    });

    it('uses "now" for the current position', () => {
      expect(periodDuration(period('2025-03-01', null), NOW)).toEqual({
        totalMonths: 20,
        years: 1,
        months: 8,
      });
    });

    it('treats a single month as one month', () => {
      expect(periodDuration(period('2024-05-01', '2024-05-31'), NOW).totalMonths).toBe(1);
    });

    it('never returns a negative duration', () => {
      expect(periodDuration(period('2030-01-01', null), NOW).totalMonths).toBe(0);
    });
  });

  describe('totalDuration', () => {
    it('counts a month shared by two jobs once', () => {
      const periods = [
        period('2025-03-01', null),
        period('2023-03-01', '2025-02-01'),
        period('2022-02-01', '2023-03-01'), // пересекается со следующей работой по марту 2023
      ];
      // Та же цифра, что в резюме на hh.ru: 4 года 9 месяцев, а не 4 года 10 месяцев.
      expect(totalDuration(periods, NOW)).toEqual({ totalMonths: 57, years: 4, months: 9 });
    });

    it('merges nested periods and keeps gaps out of the total', () => {
      const periods = [
        period('2020-01-01', '2020-12-01'),
        period('2020-03-01', '2020-04-01'), // вложен в первый
        period('2022-01-01', '2022-06-01'), // после перерыва
      ];
      expect(totalDuration(periods, NOW).totalMonths).toBe(12 + 6);
    });

    it('returns zero for no periods', () => {
      expect(totalDuration([], NOW)).toEqual(toDuration(0));
    });
  });

  describe('formatDuration', () => {
    it.each([
      [0, '0 месяцев'],
      [1, '1 месяц'],
      [3, '3 месяца'],
      [5, '5 месяцев'],
      [12, '1 год'],
      [14, '1 год 2 месяца'],
      [20, '1 год 8 месяцев'],
      [24, '2 года'],
      [57, '4 года 9 месяцев'],
      [60, '5 лет'],
      [11 * 12 + 1, '11 лет 1 месяц'],
      [21 * 12, '21 год'],
    ])('%i months → "%s"', (months, expected) => {
      expect(formatDuration(toDuration(months))).toBe(expected);
    });
  });

  describe('formatPeriod', () => {
    it('formats a finished period', () => {
      expect(formatPeriod(period('2023-03-01', '2025-02-01'))).toBe('Март 2023 — Февраль 2025');
    });

    it('formats the current position', () => {
      expect(formatPeriod(period('2025-03-01', null))).toBe('Март 2025 — настоящее время');
    });
  });
});
