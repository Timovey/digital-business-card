import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Env } from '../../config/env.schema';
import { type Prisma, PrismaClient } from '../../generated/prisma/client';

type QueryListener = (event: Prisma.QueryEvent) => void;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly queryListeners = new Set<QueryListener>();

  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaPg({ connectionString: config.get('DATABASE_URL', { infer: true }) }),
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    // Обобщённый тип логов конструктора не передаётся через `extends`, отсюда приведение типа.
    (this as unknown as PrismaClient<'query'>).$on('query', (event) => {
      this.queryListeners.forEach((listener) => listener(event));
    });

    if (config.get('PRISMA_LOG_QUERIES', { infer: true })) {
      this.onQuery((event) => this.logger.debug(`${event.query} (${event.duration}ms)`));
    }
  }

  /** Подписывается на каждый SQL-запрос к базе; возвращает функцию отписки. */
  onQuery(listener: QueryListener): () => void {
    this.queryListeners.add(listener);
    return () => this.queryListeners.delete(listener);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
