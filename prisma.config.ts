import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed/seed.ts',
  },
  datasource: {
    // `generate` не обращается к базе, поэтому URL обязателен только для migrate/seed.
    url: process.env.DATABASE_URL ?? '',
  },
});
