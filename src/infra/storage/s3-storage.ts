import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import type { Env } from '../../config/env.schema';

/** Объекты под этим префиксом читаются анонимно (политика бакета); всё остальное — приватно. */
export const PUBLIC_PREFIX = 'public/';

export interface S3StorageOptions {
  /** Endpoint, к которому обращается бэкенд (например, `http://s3:9000` внутри Docker). */
  endpoint: string;
  /** Endpoint S3, доступный клиентам API (браузеру): из него строятся публичные ссылки. */
  publicEndpoint: string;
  /**
   * Готовый базовый адрес публичных объектов (CDN, домен Cloudflare R2 и т. п.).
   * Если задан, ссылка — `<publicUrl>/<key>`, без имени бакета.
   */
  publicUrl?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

type S3Env = Pick<Env, Extract<keyof Env, `S3_${string}`>>;

export function s3OptionsFromEnv(env: S3Env): S3StorageOptions {
  return {
    endpoint: env.S3_ENDPOINT,
    publicEndpoint: env.S3_PUBLIC_ENDPOINT,
    publicUrl: env.S3_PUBLIC_URL,
    region: env.S3_REGION,
    bucket: env.S3_BUCKET,
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  };
}

/** Ключ объекта → путь URL: каждый сегмент кодируется, разделители `/` сохраняются. */
const encodeKey = (key: string): string => key.split('/').map(encodeURIComponent).join('/');

/**
 * Независимый от фреймворка шлюз к S3, общий для Nest-приложения и скрипта сида.
 */
export class S3Storage {
  private readonly client: S3Client;

  constructor(private readonly options: S3StorageOptions) {
    this.client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      forcePathStyle: options.forcePathStyle,
      credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
      // Свежие SDK по умолчанию отправляют CRC-контрольные суммы; не все S3-совместимые бэкенды их принимают.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  get bucket(): string {
    return this.options.bucket;
  }

  /**
   * Постоянная ссылка на публичный объект. Чистое вычисление, без сетевых запросов и подписи:
   * ссылка не меняется от запроса к запросу, поэтому браузер и CDN её кэшируют.
   */
  publicUrl(key: string): string {
    if (!key.startsWith(PUBLIC_PREFIX)) {
      throw new Error(`Object "${key}" is not public: keys must start with "${PUBLIC_PREFIX}"`);
    }
    const path = encodeKey(key);
    if (this.options.publicUrl) return `${this.options.publicUrl.replace(/\/+$/, '')}/${path}`;

    const endpoint = new URL(this.options.publicEndpoint);
    const base = endpoint.pathname.replace(/\/+$/, '');
    return this.options.forcePathStyle
      ? `${endpoint.origin}${base}/${this.bucket}/${path}`
      : `${endpoint.protocol}//${this.bucket}.${endpoint.host}${base}/${path}`;
  }

  async ping(abortSignal?: AbortSignal): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }), { abortSignal });
  }

  async ensureBucket(): Promise<void> {
    try {
      await this.ping();
    } catch (error) {
      const notFound =
        error instanceof S3ServiceException && error.$metadata.httpStatusCode === 404;
      if (!notFound) throw error;
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
    }
  }

  /**
   * Разрешает анонимное чтение только объектов под {@link PUBLIC_PREFIX}. Идемпотентно.
   * На AWS S3 для этого у бакета должен быть снят Block Public Access.
   */
  async ensurePublicReadPrefix(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadForPublicPrefix',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/${PUBLIC_PREFIX}*`],
        },
      ],
    };
    await this.client.send(
      new PutBucketPolicyCommand({ Bucket: this.bucket, Policy: JSON.stringify(policy) }),
    );
  }

  async putObject(
    key: string,
    body: Uint8Array,
    contentType: string,
    cacheControl?: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: cacheControl,
      }),
    );
  }

  destroy(): void {
    this.client.destroy();
  }
}
