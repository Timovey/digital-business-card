import type { Project } from '../../generated/prisma/client';
import { filterProjects } from './project-filter';

let nextId = 1;
const project = (kind: Project['kind'], featured: boolean): Project => ({
  id: nextId++,
  profileId: 1,
  experienceId: kind === 'WORK' ? 1 : null,
  name: `${kind}-${featured}`,
  description: '',
  kind,
  repositoryUrl: null,
  demoUrl: null,
  featured,
  sortOrder: 0,
});

describe('filterProjects', () => {
  const projects = [project('WORK', false), project('SIDE', true), project('SIDE', false)];

  it('returns everything without filters', () => {
    expect(filterProjects(projects, {})).toEqual(projects);
  });

  it('combines filters by kind and featured flag', () => {
    expect(filterProjects(projects, { kind: 'SIDE' }).map((p) => p.name)).toEqual([
      'SIDE-true',
      'SIDE-false',
    ]);
    expect(filterProjects(projects, { kind: 'SIDE', featured: false }).map((p) => p.name)).toEqual([
      'SIDE-false',
    ]);
  });
});
