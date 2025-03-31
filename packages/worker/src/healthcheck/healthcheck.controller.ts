import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export class HealthcheckContainer {
  constructor() {}

  @Get()
  async healthcheck() {
    return 'OK';
  }
}
