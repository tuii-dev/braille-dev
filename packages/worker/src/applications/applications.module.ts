import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { OAuthService } from './oauth.service';

@Module({
  providers: [ApplicationsService, OAuthService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
