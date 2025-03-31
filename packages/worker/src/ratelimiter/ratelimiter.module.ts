import { Module } from '@nestjs/common';
import { RatelimiterService } from './ratelimiter.service';

@Module({
  providers: [RatelimiterService],
})
export class RatelimiterModule {}
