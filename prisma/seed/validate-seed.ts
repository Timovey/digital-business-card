import type { ProfileSeed } from './seed.types';

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => (seen.has(value) ? true : (seen.add(value), false)));
}

/** Проект по месту работы ссылается ровно на одно место работы из сида, остальные — ни на какое. */
function projectExperienceErrors(seed: ProfileSeed): string[] {
  const errors: string[] = [];
  for (const p of seed.projects) {
    if ((p.kind === 'WORK') !== (p.experience !== undefined)) {
      errors.push(`Project "${p.name}": only WORK projects reference an experience, and they must`);
    }
    if (p.experience === undefined) continue;
    const matches = seed.experience.filter((e) => e.company === p.experience).length;
    if (matches !== 1) {
      errors.push(
        `Project "${p.name}" must reference exactly one experience, found ${matches} for "${p.experience}"`,
      );
    }
  }
  return errors;
}

/**
 * Сразу падает на несогласованных данных сида, до любой записи,
 * чтобы опечатка не оставила базу обновлённой наполовину.
 */
export function validateSeed(seed: ProfileSeed): void {
  const errors: string[] = [];
  const skillNames = new Set(seed.skills.map((skill) => skill.name));

  const naturalKeys: Record<string, string[]> = {
    skills: seed.skills.map((s) => s.name),
    projects: seed.projects.map((p) => p.name),
    links: seed.links.map((l) => l.url),
    experience: seed.experience.map((e) => `${e.company}@${e.startDate}`),
  };
  for (const [label, values] of Object.entries(naturalKeys)) {
    const duplicates = findDuplicates(values);
    if (duplicates.length) errors.push(`Duplicate ${label}: ${duplicates.join(', ')}`);
  }

  const owners = [
    ...seed.experience.map((e) => ({
      owner: `experience "${e.company}"`,
      technologies: e.technologies,
    })),
    ...seed.projects.map((p) => ({ owner: `project "${p.name}"`, technologies: p.technologies })),
  ];
  for (const { owner, technologies } of owners) {
    const unknown = technologies.filter((name) => !skillNames.has(name));
    if (unknown.length) errors.push(`Unknown technologies in ${owner}: ${unknown.join(', ')}`);
  }

  for (const e of seed.experience) {
    if (e.endDate && e.endDate < e.startDate) {
      errors.push(`Experience "${e.company}" ends before it starts`);
    }
  }
  errors.push(...projectExperienceErrors(seed));

  if (errors.length) {
    throw new Error(`Invalid seed for profile "${seed.fullName}":\n- ${errors.join('\n- ')}`);
  }
}
