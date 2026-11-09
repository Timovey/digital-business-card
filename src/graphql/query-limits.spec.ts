import { buildSchema, getIntrospectionQuery, parse, validate } from 'graphql';
import { createQueryLimitRules } from './query-limits';

/** Минимальная схема с тем же циклом, что и в API: Project.experience ↔ Experience.projects. */
const schema = buildSchema(/* GraphQL */ `
  type Query {
    profile: Profile
  }
  type Profile {
    name: String
    projects: [Project!]!
  }
  type Project {
    name: String
    experience: Experience
  }
  type Experience {
    company: String
    projects: [Project!]!
  }
`);

const rules = createQueryLimitRules({ maxDepth: 6, maxAliases: 3, maxCost: 1000 });
const check = (query: string) => validate(schema, parse(query), rules).map((e) => e.message);

/** `{ profile { projects { experience { projects { ... name } } } } }` с заданным числом витков цикла. */
const cyclicQuery = (turns: number): string => {
  let selection = 'name';
  for (let i = 0; i < turns; i++) selection = `experience { projects { ${selection} } }`;
  return `{ profile { projects { ${selection} } } }`;
};

describe('createQueryLimitRules', () => {
  it('accepts a regular query', () => {
    expect(check('{ profile { name projects { name experience { company } } } }')).toEqual([]);
  });

  it('rejects a query deeper than the limit without throwing', () => {
    // Ошибка должна вернуться из validate(), а не вылететь исключением: иначе Apollo
    // посчитал бы её внутренней (INTERNAL_SERVER_ERROR) вместо ошибки валидации.
    expect(() => check(cyclicQuery(40))).not.toThrow();
    expect(check(cyclicQuery(40))).toEqual(
      expect.arrayContaining([expect.stringMatching(/Query depth limit of 6 exceeded/)]),
    );
  });

  it('counts leaf fields as a level and allows the cycle exactly up to the limit', () => {
    // profile(1) projects(2) experience(3) projects(4) experience(5) company(6) — ровно лимит.
    expect(
      check('{ profile { projects { experience { projects { experience { company } } } } } }'),
    ).toEqual([]);
    // profile(1) projects(2) experience(3) projects(4) name(5)
    expect(check(cyclicQuery(1))).toEqual([]);
    // … experience(5) projects(6) name(7) — на один уровень больше лимита.
    expect(check(cyclicQuery(2))).toEqual([
      expect.stringMatching(/depth limit of 6 exceeded, found 7/),
    ]);
  });

  it('does not count fragments as extra depth levels', () => {
    const viaFragment = /* GraphQL */ `
      fragment P on Project {
        name
        experience {
          company
        }
      }
      {
        profile {
          projects {
            ...P
          }
        }
      }
    `;
    expect(check(viaFragment)).toEqual([]);
  });

  it('rejects too many aliases', () => {
    const aliases = Array.from({ length: 4 }, (_, i) => `p${i}: profile { name }`).join(' ');
    expect(check(`{ ${aliases} }`)).toEqual([
      expect.stringMatching(/Aliases limit of 3 exceeded, found 4/),
    ]);
  });

  it('rejects an expensive query even when depth and aliases are within limits', () => {
    const wide = createQueryLimitRules({ maxDepth: 100, maxAliases: 100, maxCost: 50 });
    const errors = validate(schema, parse(cyclicQuery(3)), wide).map((e) => e.message);
    expect(errors).toEqual([expect.stringMatching(/Query Cost limit of 50 exceeded/)]);
  });

  it('lets the standard introspection query through (GraphiQL, codegen)', () => {
    expect(check(getIntrospectionQuery())).toEqual([]);
  });
});
