import { Module } from '@nestjs/common';

import { HealthcheckContainer } from './healthcheck.controller';

@Module({
  imports: [],
  controllers: [HealthcheckContainer],
  exports: [],
})
export class HealthcheckModule {}
