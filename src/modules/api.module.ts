import { Module } from '@nestjs/common';
import { ExperienceModule } from './experience/experience.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectModule } from './project/project.module';
import { SkillModule } from './skill/skill.module';

/** Все бизнес-модули визитки. Новый раздел (например, «Образование») подключается здесь. */
@Module({
  imports: [ProfileModule, SkillModule, ExperienceModule, ProjectModule],
})
export class ApiModule {}
