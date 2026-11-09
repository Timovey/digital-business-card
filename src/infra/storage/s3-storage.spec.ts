import { S3Storage, type S3StorageOptions } from './s3-storage';

const options: S3StorageOptions = {
  endpoint: 'http://s3:9000',
  publicEndpoint: 'http://localhost:9000',
  region: 'us-east-1',
  bucket: 'business-card',
  accessKeyId: 'key',
  secretAccessKey: 'secret',
  forcePathStyle: true,
};

describe('S3Storage.publicUrl', () => {
  const key = 'public/avatars/3f2a.jpg';

  it('builds a path-style URL from the public endpoint (RustFS, MinIO)', () => {
    expect(new S3Storage(options).publicUrl(key)).toBe(
      'http://localhost:9000/business-card/public/avatars/3f2a.jpg',
    );
  });

  it('builds a virtual-hosted URL when path style is off (AWS S3, Yandex Object Storage)', () => {
    const storage = new S3Storage({
      ...options,
      publicEndpoint: 'https://storage.yandexcloud.net',
      forcePathStyle: false,
    });
    expect(storage.publicUrl(key)).toBe(
      'https://business-card.storage.yandexcloud.net/public/avatars/3f2a.jpg',
    );
  });

  it('prefers an explicit public base URL (CDN, Cloudflare R2 domain) without the bucket name', () => {
    const storage = new S3Storage({ ...options, publicUrl: 'https://cdn.example.com/card/' });
    expect(storage.publicUrl(key)).toBe('https://cdn.example.com/card/public/avatars/3f2a.jpg');
  });

  it('encodes key segments but keeps slashes', () => {
    expect(new S3Storage(options).publicUrl('public/a b/ф.jpg')).toBe(
      'http://localhost:9000/business-card/public/a%20b/%D1%84.jpg',
    );
  });

  it('refuses to build a public URL for a private object', () => {
    expect(() => new S3Storage(options).publicUrl('private/cv.pdf')).toThrow(/not public/);
  });
});
