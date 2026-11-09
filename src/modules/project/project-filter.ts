/**
 * Чистые правила фильтрации проектов: без БД и фреймворка, тестируются без моков.
 */
import type { Project } from '../../generated/prisma/client';
import type { ProjectKind } from '../../generated/prisma/enums';

export interface ProjectFilter {
  featured?: boolean | null;
  kind?: ProjectKind | null;
}

/**
 * Фильтрация намеренно идёт в памяти: список загружается один раз за запрос
 * через DataLoader, поэтому выборки `projects` с разными фильтрами
 * в одном запросе используют один SQL-запрос.
 */
export function filterProjects(
  projects: readonly Project[],
  { featured, kind }: ProjectFilter,
): Project[] {
  return projects.filter(
    (p) => (featured == null || p.featured === featured) && (kind == null || p.kind === kind),
  );
}
