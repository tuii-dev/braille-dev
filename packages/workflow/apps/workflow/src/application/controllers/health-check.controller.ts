/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get } from '@nestjs/common';

@Controller('healthcheck')
export class HealthCheckController {
  constructor() {}

  @Get()
  async healthcheck() {
    return 'OK';
  }
}
