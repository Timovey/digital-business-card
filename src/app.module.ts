import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.schema';

/** Корневой модуль: инфраструктура и транспорт. */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv })],
})
export class AppModule {}
