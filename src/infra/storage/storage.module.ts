import { Global, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../config/env.schema';
import { S3Storage, s3OptionsFromEnv } from './s3-storage';

@Global()
@Module({
  providers: [
    {
      provide: S3Storage,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new S3Storage(
          s3OptionsFromEnv({
            S3_ENDPOINT: config.get('S3_ENDPOINT', { infer: true }),
            S3_PUBLIC_ENDPOINT: config.get('S3_PUBLIC_ENDPOINT', { infer: true }),
            S3_PUBLIC_URL: config.get('S3_PUBLIC_URL', { infer: true }),
            S3_REGION: config.get('S3_REGION', { infer: true }),
            S3_BUCKET: config.get('S3_BUCKET', { infer: true }),
            S3_ACCESS_KEY: config.get('S3_ACCESS_KEY', { infer: true }),
            S3_SECRET_KEY: config.get('S3_SECRET_KEY', { infer: true }),
            S3_FORCE_PATH_STYLE: config.get('S3_FORCE_PATH_STYLE', { infer: true }),
          }),
        ),
    },
  ],
  exports: [S3Storage],
})
export class StorageModule implements OnApplicationShutdown {
  constructor(private readonly storage: S3Storage) {}

  onApplicationShutdown(): void {
    this.storage.destroy();
  }
}
