import type { ProjectKind, SkillCategory, SocialLinkKind } from '../../src/generated/prisma/enums';

/** Календарная дата ISO, `YYYY-MM-DD`. Периоды работы точны до месяца, поэтому день — `01`. */
type IsoDate = `${number}-${number}-${number}`;

/**
 * Декларативное описание профиля владельца визитки. Сид приводит базу в точное соответствие с ним:
 * недостающие строки создаются, изменённые обновляются, устаревшие удаляются.
 */
export interface ProfileSeed {
  fullName: string;
  headline: string;
  description: string;
  location?: string;
  /** Файл из `prisma/seed/assets`; ключ в S3 вычисляется по содержимому (см. avatar.ts). */
  avatar?: { file: string; contentType: string };
  links: { kind: SocialLinkKind; label: string; url: string }[];
  skills: { name: string; category: SkillCategory }[];
  experience: {
    company: string;
    companyUrl?: string;
    location?: string;
    position: string;
    startDate: IsoDate;
    endDate?: IsoDate;
    /** Названия навыков; должны быть объявлены в `skills`. */
    technologies: string[];
  }[];
  projects: {
    name: string;
    description: string;
    kind: ProjectKind;
    /** `company` места работы из `experience`; обязателен для `WORK`, запрещён для остальных. */
    experience?: string;
    /** Только для открытых репозиториев. */
    repositoryUrl?: string;
    demoUrl?: string;
    featured?: boolean;
    /** Достижения и обязанности на проекте, в порядке показа. */
    achievements: string[];
    /** Названия навыков; должны быть объявлены в `skills`. */
    technologies: string[];
  }[];
}
