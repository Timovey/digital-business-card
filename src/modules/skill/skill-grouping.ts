/**
 * Чистые правила группировки навыков: без БД и фреймворка, тестируются без моков.
 */
import type { Skill } from '../../generated/prisma/client';
import { SkillCategory } from '../../generated/prisma/enums';

export interface SkillGroup {
  category: SkillCategory;
  skills: Skill[];
}

/** Порядок отображения категорий совпадает с порядком объявления в enum. */
const CATEGORY_ORDER = Object.values(SkillCategory);

/** Группирует навыки по категориям; пустые категории пропускаются, порядок навыков сохраняется. */
export function groupByCategory(skills: readonly Skill[]): SkillGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    skills: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.skills.length > 0);
}
