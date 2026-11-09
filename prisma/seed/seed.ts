import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { envSchema, parseEnv } from '../../src/config/env.schema';
import { PrismaClient } from '../../src/generated/prisma/client';
import { S3Storage, s3OptionsFromEnv } from '../../src/infra/storage/s3-storage';
import { IMMUTABLE_CACHE_CONTROL, avatarObjectKey } from './avatar';
import { profileSeed } from './data/profile';
import { syncProfile } from './sync-profile';
import { validateSeed } from './validate-seed';

const ASSETS_DIR = join(__dirname, 'assets');

const seedEnvSchema = envSchema.pick({
  DATABASE_URL: true,
  S3_ENDPOINT: true,
  S3_PUBLIC_ENDPOINT: true,
  S3_PUBLIC_URL: true,
  S3_REGION: true,
  S3_BUCKET: true,
  S3_ACCESS_KEY: true,
  S3_SECRET_KEY: true,
  S3_FORCE_PATH_STYLE: true,
});

/**
 * Объектное хранилище не транзакционно, поэтому файлы загружаются до транзакции.
 * Ключ зависит от содержимого: повторный запуск перезапишет тот же объект тем же файлом.
 */
async function uploadAvatar(storage: S3Storage, seed: typeof profileSeed): Promise<string | null> {
  if (!seed.avatar) return null;
  const body = await readFile(join(ASSETS_DIR, seed.avatar.file));
  const key = avatarObjectKey(body, seed.avatar.file);
  await storage.putObject(key, body, seed.avatar.contentType, IMMUTABLE_CACHE_CONTROL);
  return key;
}

async function main(): Promise<void> {
  const env = parseEnv(seedEnvSchema, process.env);
  validateSeed(profileSeed);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });
  const storage = new S3Storage(s3OptionsFromEnv(env));

  try {
    await storage.ensureBucket();
    await storage.ensurePublicReadPrefix();
    const avatarKey = await uploadAvatar(storage, profileSeed);
    await prisma.$transaction((tx) => syncProfile(tx, profileSeed, avatarKey), { timeout: 30_000 });
    console.log(`Seeded profile "${profileSeed.fullName}"`);
  } finally {
    storage.destroy();
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
