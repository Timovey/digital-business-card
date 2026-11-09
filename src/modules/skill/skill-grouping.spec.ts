import type { Skill } from '../../generated/prisma/client';
import { groupByCategory } from './skill-grouping';

let nextId = 1;
const skill = (name: string, category: Skill['category']): Skill => ({
  id: nextId++,
  profileId: 1,
  name,
  category,
  sortOrder: 0,
});

describe('groupByCategory', () => {
  it('orders groups by category declaration and keeps skill order inside a group', () => {
    const groups = groupByCategory([
      skill('Docker', 'DEVOPS'),
      skill('NestJS', 'BACKEND'),
      skill('TypeScript', 'LANGUAGE'),
      skill('Node.js', 'BACKEND'),
    ]);

    expect(groups.map((g) => [g.category, g.skills.map((s) => s.name)])).toEqual([
      ['LANGUAGE', ['TypeScript']],
      ['BACKEND', ['NestJS', 'Node.js']],
      ['DEVOPS', ['Docker']],
    ]);
  });

  it('omits empty categories', () => {
    expect(groupByCategory([])).toEqual([]);
  });
});
