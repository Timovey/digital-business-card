/**
 * Абстракция над текущим временем, чтобы зависящие от времени бизнес-правила
 * (например, «текущее место работы», длительность опыта) были детерминированы в тестах.
 */
export abstract class Clock {
  abstract now(): Date;
}

export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
