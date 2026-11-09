import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { SkillModule } from './skill/skill.module';

/** Все бизнес-модули визитки. Новый раздел (например, «Образование») подключается здесь. */
@Module({
  imports: [ProfileModule, SkillModule],
})
export class ApiModule {}
