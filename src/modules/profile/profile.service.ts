import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../../common/errors/domain.error';
import type { Profile, SocialLink } from '../../generated/prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { S3Storage } from '../../infra/storage/s3-storage';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3Storage,
  ) {}

  /**
   * Возвращает профиль по id или владельца визитки, если id не передан.
   * Формат id уже проверен на границе транспорта (ParseIdPipe), сюда приходит число.
   */
  async get(id?: number | null): Promise<Profile> {
    if (id == null) {
      // Владелец визитки — единственный профиль в базе (его заводит сид).
      const owner = await this.prisma.profile.findFirst({ orderBy: { id: 'asc' } });
      if (!owner) throw new NotFoundError('Profile', 'owner');
      return owner;
    }
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundError('Profile', `id "${id}"`);
    return profile;
  }

  /** Аватар — публичный объект в S3 с ключом по содержимому: ссылка постоянная и кэшируется. */
  getAvatarUrl(profile: Profile): string | null {
    return profile.avatarKey ? this.storage.publicUrl(profile.avatarKey) : null;
  }

  findLinksByProfileIds(profileIds: readonly number[]): Promise<SocialLink[]> {
    return this.prisma.socialLink.findMany({
      where: { profileId: { in: [...profileIds] } },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
