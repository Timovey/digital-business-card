import { NotFoundError } from '../../common/errors/domain.error';
import type { Profile } from '../../generated/prisma/client';
import type { PrismaService } from '../../infra/prisma/prisma.service';
import type { S3Storage } from '../../infra/storage/s3-storage';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  const profile = { id: 1, avatarKey: 'public/avatars/3f2a.jpg' } as Profile;
  // Мокаем только те делегаты Prisma, которые использует сервис.
  const prisma = { profile: { findUnique: jest.fn(), findFirst: jest.fn() } };
  const storage = { publicUrl: jest.fn() };
  const service = new ProfileService(
    prisma as unknown as PrismaService,
    storage as unknown as S3Storage,
  );

  beforeEach(() => jest.resetAllMocks());

  it('returns the owner when no id is given', async () => {
    prisma.profile.findFirst.mockResolvedValue(profile);
    await expect(service.get()).resolves.toBe(profile);
    expect(prisma.profile.findUnique).not.toHaveBeenCalled();
  });

  it('looks a profile up by id', async () => {
    prisma.profile.findUnique.mockResolvedValue(profile);
    await expect(service.get(1)).resolves.toBe(profile);
    expect(prisma.profile.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('throws a domain NotFoundError for an unknown id', async () => {
    prisma.profile.findUnique.mockResolvedValue(null);
    await expect(service.get(999)).rejects.toThrow(NotFoundError);
  });

  it('throws NotFoundError when there is no owner yet (empty database)', async () => {
    prisma.profile.findFirst.mockResolvedValue(null);
    await expect(service.get()).rejects.toThrow(NotFoundError);
  });

  it('returns a public avatar URL only when the profile has an avatar', () => {
    storage.publicUrl.mockReturnValue('https://s3/business-card/public/avatars/3f2a.jpg');
    expect(service.getAvatarUrl(profile)).toBe('https://s3/business-card/public/avatars/3f2a.jpg');
    expect(service.getAvatarUrl({ ...profile, avatarKey: null })).toBeNull();
    expect(storage.publicUrl).toHaveBeenCalledTimes(1);
  });
});
