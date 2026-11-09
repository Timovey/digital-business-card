import { profileSeed } from './data/profile';
import type { ProfileSeed } from './seed.types';
import { validateSeed } from './validate-seed';

const base: ProfileSeed = {
  fullName: 'Test',
  headline: 'Dev',
  description: 'About',
  links: [],
  skills: [{ name: 'TypeScript', category: 'LANGUAGE' }],
  experience: [],
  projects: [],
};

const acme: ProfileSeed['experience'][number] = {
  company: 'Acme',
  position: 'Dev',
  startDate: '2024-01-01',
  technologies: [],
};

describe('validateSeed', () => {
  it('accepts the real profile data', () => {
    expect(() => validateSeed(profileSeed)).not.toThrow();
  });

  it('rejects technologies that are not declared as skills', () => {
    const seed: ProfileSeed = {
      ...base,
      projects: [
        {
          name: 'X',
          description: 'x',
          kind: 'PET',
          achievements: [],
          technologies: ['TypeScript', 'Rust'],
        },
      ],
    };
    expect(() => validateSeed(seed)).toThrow('Unknown technologies in project "X": Rust');
  });

  it('requires WORK projects, and only them, to reference an experience', () => {
    const work: ProfileSeed = {
      ...base,
      projects: [{ name: 'W', description: 'w', kind: 'WORK', achievements: [], technologies: [] }],
    };
    const pet: ProfileSeed = {
      ...base,
      experience: [acme],
      projects: [
        {
          name: 'P',
          description: 'p',
          kind: 'PET',
          experience: 'Acme',
          achievements: [],
          technologies: [],
        },
      ],
    };
    expect(() => validateSeed(work)).toThrow(
      'Project "W": only WORK projects reference an experience',
    );
    expect(() => validateSeed(pet)).toThrow(
      'Project "P": only WORK projects reference an experience',
    );
  });

  it('rejects projects that reference an unknown experience', () => {
    const seed: ProfileSeed = {
      ...base,
      experience: [acme],
      projects: [
        {
          name: 'W',
          description: 'w',
          kind: 'WORK',
          experience: 'Initech',
          achievements: [],
          technologies: [],
        },
      ],
    };
    expect(() => validateSeed(seed)).toThrow(
      'Project "W" must reference exactly one experience, found 0 for "Initech"',
    );
  });

  it('rejects duplicate natural keys', () => {
    const seed: ProfileSeed = { ...base, skills: [...base.skills, ...base.skills] };
    expect(() => validateSeed(seed)).toThrow('Duplicate skills: TypeScript');
  });

  it('rejects periods that end before they start', () => {
    const seed: ProfileSeed = {
      ...base,
      experience: [
        {
          company: 'Acme',
          position: 'Dev',
          startDate: '2024-05-01',
          endDate: '2023-01-01',
          technologies: [],
        },
      ],
    };
    expect(() => validateSeed(seed)).toThrow('Experience "Acme" ends before it starts');
  });
});
