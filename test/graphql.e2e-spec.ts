/**
 * E2E-тесты на реальной базе (с миграциями и сидом) и S3:
 *   docker compose up -d postgres s3 && npm run db:setup && npm run test:e2e
 */
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getIntrospectionQuery } from 'graphql';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import type { Env } from '../src/config/env.schema';
import { PrismaService } from '../src/infra/prisma/prisma.service';

interface GraphQLResponse<T = Record<string, unknown>> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
}

/** Все связи схемы с вложенностью в три уровня. */
const FULL_PROFILE_QUERY = /* GraphQL */ `
  query FullProfile {
    profile {
      fullName
      avatarUrl
      links {
        kind
        url
      }
      skills {
        name
      }
      skillGroups {
        category
        skills {
          name
        }
      }
      totalExperience {
        years
        months
        text
      }
      experience {
        company
        period
        technologies {
          name
        }
      }
      projects {
        name
        achievements {
          text
        }
        technologies {
          name
        }
      }
    }
  }
`;

/**
 * Запрос ровно заданной глубины по циклу Project.experience ↔ Experience.projects.
 * Глубина в терминах лимита: каждое поле, включая листовое, — уровень.
 * depth = 6 → `{ profile { projects { experience { projects { experience { company } } } } } }`.
 */
const cyclicQuery = (depth: number): string => {
  const path = ['profile', 'projects'];
  while (path.length < depth - 1) path.push(path.at(-1) === 'projects' ? 'experience' : 'projects');
  const leaf = path.at(-1) === 'projects' ? 'name' : 'company';
  return `{ ${path.reduceRight((inner, field) => `${field} { ${inner} }`, leaf)} }`;
};

describe('GraphQL API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let config: ConfigService<Env, true>;

  /** Отправляет операцию и проверяет HTTP-статус: 200 — выполнена, 400 — отклонена до выполнения. */
  const post = async <T>(
    query: string,
    variables?: object,
    status = 200,
  ): Promise<GraphQLResponse<T>> => {
    const response = await request(app.getHttpServer() as App)
      .post('/graphql')
      .send({ query, variables })
      .expect(status);
    return response.body as GraphQLResponse<T>;
  };
  const graphql = <T>(query: string, variables?: object) => post<T>(query, variables);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    config = app.get(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers the query from the assignment', async () => {
    const { data, errors } = await graphql<{
      profile: {
        fullName: string;
        description: string;
        skills: { name: string }[];
        experience: { company: string; position: string }[];
        projects: { name: string }[];
      };
    }>(`
      query {
        profile {
          fullName
          description
          skills {
            name
          }
          experience {
            company
            position
          }
          projects {
            name
          }
        }
      }
    `);

    expect(errors).toBeUndefined();
    expect(data?.profile.fullName).toBe('Кочетков Тимофей Сергеевич');
    expect(data?.profile.skills.map((s) => s.name)).toContain('NestJS');
    expect(data?.profile.experience[0]).toEqual({
      company: 'WONE IT',
      position: 'Fullstack-разработчик / Feature Lead',
    });
    expect(data?.profile.projects.length).toBeGreaterThan(0);
  });

  it('resolves all nested relations with a constant number of SQL queries (no N+1)', async () => {
    const queries: string[] = [];
    const unsubscribe = prisma.onQuery((event) => queries.push(event.query));

    const { data, errors } = await graphql<{
      profile: { experience: unknown[]; projects: unknown[] };
    }>(FULL_PROFILE_QUERY);
    unsubscribe();

    expect(errors).toBeUndefined();
    expect(data?.profile.experience.length).toBeGreaterThan(1);
    expect(data?.profile.projects.length).toBeGreaterThan(1);
    // profile, social_links, skills (общий для `skills` и `skillGroups`), experiences,
    // experience_technologies + их навыки, projects, achievements, project_technologies
    // + их навыки. Каждый — один батч `WHERE … IN (…)`, сколько бы строк ни было.
    expect(queries).toHaveLength(10);
  });

  it('computes total experience with overlapping months counted once', async () => {
    const { data } = await graphql<{ profile: { totalExperience: { text: string } } }>(
      '{ profile { totalExperience { text } } }',
    );
    expect(data?.profile.totalExperience.text).toMatch(/^\d+ (год|года|лет)/);
  });

  it('returns a permanent public avatar URL that is readable anonymously and cacheable', async () => {
    const avatarUrl = async () =>
      (await graphql<{ profile: { avatarUrl: string } }>('{ profile { avatarUrl } }')).data?.profile
        .avatarUrl;
    const url = await avatarUrl();
    expect(url).toMatch(/\/public\/avatars\/[0-9a-f]{16}\.jpg$/);
    expect(await avatarUrl()).toBe(url); // ссылка не меняется между запросами

    // Без учётных данных: доступ даёт политика бакета на префикс public/.
    const image = await fetch(url!);
    expect(image.status).toBe(200);
    expect(image.headers.get('content-type')).toBe('image/jpeg');
    expect(image.headers.get('cache-control')).toContain('immutable');
  });

  it('keeps the rest of the bucket private', async () => {
    const privateUrl = (
      await graphql<{ profile: { avatarUrl: string } }>('{ profile { avatarUrl } }')
    ).data!.profile.avatarUrl.replace('/public/', '/private/');
    expect((await fetch(privateUrl)).status).toBe(403);
  });

  it('filters projects by the featured flag', async () => {
    const { data } = await graphql<{
      profile: { all: unknown[]; featured: { featured: boolean }[] };
    }>('{ profile { all: projects { name } featured: projects(featured: true) { featured } } }');
    expect(data?.profile.featured.length).toBeGreaterThan(0);
    expect(data?.profile.featured.every((p) => p.featured)).toBe(true);
    expect(data?.profile.featured.length).toBeLessThan(data?.profile.all.length ?? 0);
  });

  it('links work projects to the job they were done at, in both directions', async () => {
    const { data, errors } = await graphql<{
      profile: {
        work: { name: string; experience: { company: string } | null }[];
        side: { experience: unknown }[];
        experience: { company: string; projects: { name: string; kind: string }[] }[];
      };
    }>(`
      {
        profile {
          work: projects(kind: WORK) {
            name
            experience {
              company
            }
          }
          side: projects(kind: SIDE) {
            experience {
              company
            }
          }
          experience {
            company
            projects {
              name
              kind
            }
          }
        }
      }
    `);

    expect(errors).toBeUndefined();
    const profile = data!.profile;
    expect(profile.work.length).toBeGreaterThan(0);
    expect(profile.side.length).toBeGreaterThan(0);
    expect(profile.side.every((p) => p.experience === null)).toBe(true);
    for (const project of profile.work) {
      const job = profile.experience.find((e) => e.company === project.experience?.company);
      expect(job?.projects).toContainEqual({ name: project.name, kind: 'WORK' });
    }
  });

  it('maps a missing profile to a NOT_FOUND error', async () => {
    const { data, errors } = await graphql('query ($id: ID) { profile(id: $id) { fullName } }', {
      id: '999999',
    });
    expect(data).toBeNull();
    expect(errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
  });

  it.each(['abc', '0', '99999999999'])(
    'rejects a malformed or out-of-range id %p as BAD_USER_INPUT, not an internal error',
    async (id) => {
      const { data, errors } = await graphql('query ($id: ID) { profile(id: $id) { id } }', {
        id,
      });
      expect(data).toBeNull();
      expect(errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    },
  );

  describe('query complexity limits (docs/graphql-query-limits.md)', () => {
    it('serves the cycle Project.experience ↔ Experience.projects up to the depth limit', async () => {
      const maxDepth = config.get('GRAPHQL_MAX_DEPTH', { infer: true });
      const { errors } = await graphql(cyclicQuery(maxDepth));
      expect(errors).toBeUndefined();
    });

    it('rejects a deeper query with 400 before executing it', async () => {
      const maxDepth = config.get('GRAPHQL_MAX_DEPTH', { infer: true });
      const queries: string[] = [];
      const unsubscribe = prisma.onQuery((event) => queries.push(event.query));

      // Без лимита такой запрос (~1 КБ) раздул бы ответ экспоненциально и уронил процесс по памяти.
      const { data, errors } = await post(cyclicQuery(80), undefined, 400);
      unsubscribe();

      expect(data).toBeUndefined();
      expect(errors?.[0]?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED');
      expect(errors?.[0]?.message).toContain(`Query depth limit of ${maxDepth} exceeded`);
      expect(queries).toHaveLength(0);
    });

    it('rejects a batch of aliases', async () => {
      const maxAliases = config.get('GRAPHQL_MAX_ALIASES', { infer: true });
      const aliases = Array.from({ length: maxAliases + 1 }, (_, i) => `p${i}: profile { id }`);
      const { errors } = await post(`{ ${aliases.join(' ')} }`, undefined, 400);
      expect(errors?.[0]?.extensions?.code).toBe('GRAPHQL_VALIDATION_FAILED');
      expect(errors?.[0]?.message).toContain(`Aliases limit of ${maxAliases} exceeded`);
    });

    it('does not limit the introspection query used by GraphiQL and codegen', async () => {
      const { errors } = await graphql(getIntrospectionQuery());
      expect(errors).toBeUndefined();
    });
  });

  it('serves GraphiQL on GET /graphql for testing queries (also in production, there is no frontend)', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200)
      .expect('Content-Type', /text\/html/);
    expect(response.text).toContain('<title>GraphiQL</title>');
  });

  it('reports database and storage health', async () => {
    const response = await request(app.getHttpServer() as App)
      .get('/health')
      .expect(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      info: { database: { status: 'up' }, storage: { status: 'up' } },
    });
  });
});
