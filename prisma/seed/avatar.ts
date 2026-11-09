import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { PUBLIC_PREFIX } from '../../src/infra/storage/s3-storage';

/**
 * Публичные файлы адресуются по содержимому: новый аватар — новый ключ, а значит, и новый URL.
 * Поэтому объект можно кэшировать навсегда, и вопрос инвалидации кэша браузера/CDN не возникает.
 */
export const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

/** `public/avatars/<первые 16 hex sha256>.<расширение исходного файла>`. */
export function avatarObjectKey(body: Uint8Array, fileName: string): string {
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 16);
  return `${PUBLIC_PREFIX}avatars/${hash}${extname(fileName).toLowerCase()}`;
}
