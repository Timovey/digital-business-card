/**
 * Чистая арифметика дат для периодов работы. Без кода фреймворка, чтобы её было
 * легко покрыть unit-тестами; сервис только передаёт «сейчас».
 *
 * Периоды считаются в целых календарных месяцах, включая оба граничных месяца, —
 * так опыт показывают в резюме (и на hh.ru): «март 2025 – октябрь 2026» = 20 месяцев.
 */

export interface WorkPeriod {
  startDate: Date;
  /** `null` для текущего места работы. */
  endDate: Date | null;
}

export interface Duration {
  totalMonths: number;
  years: number;
  months: number;
}

const monthIndex = (date: Date): number => date.getUTCFullYear() * 12 + date.getUTCMonth();

function toMonthRange(period: WorkPeriod, now: Date): [start: number, end: number] {
  return [monthIndex(period.startDate), monthIndex(period.endDate ?? now)];
}

export function toDuration(totalMonths: number): Duration {
  return { totalMonths, years: Math.floor(totalMonths / 12), months: totalMonths % 12 };
}

export function periodDuration(period: WorkPeriod, now: Date): Duration {
  const [start, end] = toMonthRange(period, now);
  return toDuration(Math.max(0, end - start + 1));
}

/**
 * Общий опыт по всем периодам. Пересекающиеся месяцы (например, уход с одной работы
 * и выход на другую в том же месяце) считаются один раз, чтобы итог не завышался.
 */
export function totalDuration(periods: readonly WorkPeriod[], now: Date): Duration {
  const ranges = periods
    .map((period) => toMonthRange(period, now))
    .filter(([start, end]) => end >= start)
    .sort(([a], [b]) => a - b);

  let total = 0;
  let current: [number, number] | undefined;
  for (const [start, end] of ranges) {
    if (current && start <= current[1]) {
      current[1] = Math.max(current[1], end);
    } else {
      if (current) total += current[1] - current[0] + 1;
      current = [start, end];
    }
  }
  if (current) total += current[1] - current[0] + 1;

  return toDuration(total);
}

const pluralRules = new Intl.PluralRules('ru-RU');
const YEAR_FORMS = { one: 'год', few: 'года', many: 'лет' } as const;
const MONTH_FORMS = { one: 'месяц', few: 'месяца', many: 'месяцев' } as const;

function pluralize(count: number, forms: Record<'one' | 'few' | 'many', string>): string {
  const rule = pluralRules.select(count);
  const form = rule === 'one' || rule === 'few' ? forms[rule] : forms.many;
  return `${count} ${form}`;
}

/** "1 год 8 месяцев", "2 года", "5 месяцев". */
export function formatDuration({ years, months }: Duration): string {
  const parts = [
    years > 0 ? pluralize(years, YEAR_FORMS) : null,
    months > 0 || years === 0 ? pluralize(months, MONTH_FORMS) : null,
  ];
  return parts.filter(Boolean).join(' ');
}

const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', timeZone: 'UTC' });

function formatMonth(date: Date): string {
  const month = monthFormatter.format(date);
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getUTCFullYear()}`;
}

/** "Март 2025 — настоящее время". */
export function formatPeriod(period: WorkPeriod): string {
  const end = period.endDate ? formatMonth(period.endDate) : 'настоящее время';
  return `${formatMonth(period.startDate)} — ${end}`;
}
