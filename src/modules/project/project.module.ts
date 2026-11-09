import { Module } from '@nestjs/common';
import { ExperienceModule } from '../experience/experience.module';
import { SkillModule } from '../skill/skill.module';
import { ExperienceProjectsResolver } from './experience-projects.resolver';
import { ProfileProjectsResolver } from './profile-projects.resolver';
import { ProjectLoaders } from './project.loaders';
import { ProjectResolver } from './project.resolver';
import { ProjectService } from './project.service';

@Module({
  imports: [SkillModule, ExperienceModule],
  providers: [
    ProjectService,
    ProjectLoaders,
    ProjectResolver,
    ProfileProjectsResolver,
    ExperienceProjectsResolver,
  ],
})
export class ProjectModule {}
