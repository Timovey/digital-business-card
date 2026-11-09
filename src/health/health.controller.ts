import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../infra/prisma/prisma.service';
import { S3Storage } from '../infra/storage/s3-storage';

const CHECK_TIMEOUT_MS = 2000;

/** Проверка готовности для healthcheck в Docker: API готов, когда отвечают БД и S3. */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicators: HealthIndicatorService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly prisma: PrismaService,
    private readonly storage: S3Storage,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database', this.prisma).withTimeout(CHECK_TIMEOUT_MS),
      () =>
        this.indicators
          .check('storage')
          .attempt(({ signal }) => this.storage.ping(signal))
          .withTimeout(CHECK_TIMEOUT_MS),
    ]);
  }
}
