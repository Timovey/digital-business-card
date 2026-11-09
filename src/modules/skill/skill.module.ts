import { Module } from '@nestjs/common';
import { ProfileSkillsResolver } from './profile-skills.resolver';
import { SkillLoaders } from './skill.loaders';
import { SkillService } from './skill.service';

@Module({
  providers: [SkillService, SkillLoaders, ProfileSkillsResolver],
  exports: [SkillLoaders],
})
export class SkillModule {}
