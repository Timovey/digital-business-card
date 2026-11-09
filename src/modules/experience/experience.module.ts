import { Module } from '@nestjs/common';
import { SkillModule } from '../skill/skill.module';
import { ExperienceLoaders } from './experience.loaders';
import { ExperienceResolver } from './experience.resolver';
import { ExperienceService } from './experience.service';
import { ProfileExperienceResolver } from './profile-experience.resolver';

@Module({
  imports: [SkillModule],
  providers: [ExperienceService, ExperienceLoaders, ExperienceResolver, ProfileExperienceResolver],
  exports: [ExperienceLoaders],
})
export class ExperienceModule {}
