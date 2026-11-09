import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/prisma'],
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  // Сгенерированный Prisma client импортирует соседние файлы как `./x.js`; направляем их на TS-исходники.
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  collectCoverageFrom: [
    'src/**/*.ts',
    'prisma/seed/**/*.ts',
    '!src/generated/**',
    '!**/*.module.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
