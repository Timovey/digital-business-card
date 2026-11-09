import { Module } from '@nestjs/common';
import { ProfileLoaders } from './profile.loaders';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';

@Module({
  providers: [ProfileService, ProfileLoaders, ProfileResolver],
})
export class ProfileModule {}
