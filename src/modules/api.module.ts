import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';

/** Все бизнес-модули визитки. Новый раздел (например, «Образование») подключается здесь. */
@Module({
  imports: [ProfileModule],
})
export class ApiModule {}
