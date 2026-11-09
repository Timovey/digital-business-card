import type { Prisma } from '../../src/generated/prisma/client';
import type { ProfileSeed } from './seed.types';

type Tx = Prisma.TransactionClient;

const toDate = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

/**
 * Приводит профиль владельца визитки в базе в точное соответствие с сидом.
 *
 * Профиль в базе один, поэтому он обновляется на месте (лишние удаляются). Остальные сущности
 * upsert-ятся по естественному ключу (url, name, company + дата начала),
 * поэтому первичные ключи не меняются между запусками, а строки, которых нет в сиде, удаляются.
 * Сколько раз ни запускай сид, результат один и тот же.
 */
export async function syncProfile(
  tx: Tx,
  seed: ProfileSeed,
  avatarKey: string | null,
): Promise<void> {
  const profileData = {
    fullName: seed.fullName,
    headline: seed.headline,
    description: seed.description,
    location: seed.location ?? null,
    avatarKey,
  };
  const existing = await tx.profile.findFirst({ orderBy: { id: 'asc' }, select: { id: true } });
  const { id: profileId } = existing
    ? await tx.profile.update({
        where: { id: existing.id },
        data: profileData,
        select: { id: true },
      })
    : await tx.profile.create({ data: profileData, select: { id: true } });
  await tx.profile.deleteMany({ where: { id: { not: profileId } } });

  await syncLinks(tx, profileId, seed.links);
  const skillIds = await syncSkills(tx, profileId, seed.skills);
  const experienceIds = await syncExperience(tx, profileId, seed.experience, skillIds);
  await syncProjects(tx, profileId, seed.projects, skillIds, experienceIds);
}

async function syncLinks(tx: Tx, profileId: number, links: ProfileSeed['links']): Promise<void> {
  await tx.socialLink.deleteMany({
    where: { profileId, url: { notIn: links.map((link) => link.url) } },
  });
  for (const [sortOrder, link] of links.entries()) {
    const data = { kind: link.kind, label: link.label, sortOrder };
    await tx.socialLink.upsert({
      where: { profileId_url: { profileId, url: link.url } },
      create: { profileId, url: link.url, ...data },
      update: data,
    });
  }
}

async function syncSkills(
  tx: Tx,
  profileId: number,
  skills: ProfileSeed['skills'],
): Promise<Map<string, number>> {
  await tx.skill.deleteMany({
    where: { profileId, name: { notIn: skills.map((skill) => skill.name) } },
  });
  const ids = new Map<string, number>();
  for (const [sortOrder, skill] of skills.entries()) {
    const { id } = await tx.skill.upsert({
      where: { profileId_name: { profileId, name: skill.name } },
      create: { profileId, name: skill.name, category: skill.category, sortOrder },
      update: { category: skill.category, sortOrder },
      select: { id: true },
    });
    ids.set(skill.name, id);
  }
  return ids;
}

async function syncExperience(
  tx: Tx,
  profileId: number,
  experience: ProfileSeed['experience'],
  skillIds: Map<string, number>,
): Promise<Map<string, number>> {
  await tx.experience.deleteMany({
    where: {
      profileId,
      NOT: { OR: experience.map((e) => ({ company: e.company, startDate: toDate(e.startDate) })) },
    },
  });

  const ids = new Map<string, number>();
  for (const item of experience) {
    const startDate = toDate(item.startDate);
    const data = {
      companyUrl: item.companyUrl ?? null,
      location: item.location ?? null,
      position: item.position,
      endDate: item.endDate ? toDate(item.endDate) : null,
    };
    const { id: experienceId } = await tx.experience.upsert({
      where: { profileId_company_startDate: { profileId, company: item.company, startDate } },
      create: { profileId, company: item.company, startDate, ...data },
      update: data,
      select: { id: true },
    });
    ids.set(item.company, experienceId);

    // У стека нет естественного ключа: заменяем его целиком.
    await tx.experienceTechnology.deleteMany({ where: { experienceId } });
    await tx.experienceTechnology.createMany({
      data: item.technologies.map((name, sortOrder) => ({
        experienceId,
        skillId: requireSkillId(skillIds, name),
        sortOrder,
      })),
    });
  }
  return ids;
}

async function syncProjects(
  tx: Tx,
  profileId: number,
  projects: ProfileSeed['projects'],
  skillIds: Map<string, number>,
  experienceIds: Map<string, number>,
): Promise<void> {
  await tx.project.deleteMany({
    where: { profileId, name: { notIn: projects.map((project) => project.name) } },
  });

  for (const [sortOrder, project] of projects.entries()) {
    const data = {
      description: project.description,
      kind: project.kind,
      experienceId: project.experience
        ? requireExperienceId(experienceIds, project.experience)
        : null,
      repositoryUrl: project.repositoryUrl ?? null,
      demoUrl: project.demoUrl ?? null,
      featured: project.featured ?? false,
      sortOrder,
    };
    const { id: projectId } = await tx.project.upsert({
      where: { profileId_name: { profileId, name: project.name } },
      create: { profileId, name: project.name, ...data },
      update: data,
      select: { id: true },
    });

    // Достижения — по позиции (projectId, sortOrder): правка текста сохраняет id,
    // лишние позиции в конце удаляются.
    await tx.achievement.deleteMany({
      where: { projectId, sortOrder: { gte: project.achievements.length } },
    });
    for (const [sortOrder, text] of project.achievements.entries()) {
      await tx.achievement.upsert({
        where: { projectId_sortOrder: { projectId, sortOrder } },
        create: { projectId, sortOrder, text },
        update: { text },
      });
    }

    // У стека нет естественного ключа в пределах проекта: связи заменяются целиком
    // (наружу у них нет id, так что это незаметно для клиентов).
    await tx.projectTechnology.deleteMany({ where: { projectId } });
    await tx.projectTechnology.createMany({
      data: project.technologies.map((name, techOrder) => ({
        projectId,
        skillId: requireSkillId(skillIds, name),
        sortOrder: techOrder,
      })),
    });
  }
}

function requireSkillId(skillIds: Map<string, number>, name: string): number {
  const id = skillIds.get(name);
  if (!id) throw new Error(`Skill "${name}" is not declared in the seed`);
  return id;
}

function requireExperienceId(experienceIds: Map<string, number>, company: string): number {
  const id = experienceIds.get(company);
  if (!id) throw new Error(`Experience "${company}" is not declared in the seed`);
  return id;
}
