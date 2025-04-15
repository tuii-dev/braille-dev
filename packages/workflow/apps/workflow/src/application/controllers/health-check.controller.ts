/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get } from '@nestjs/common';
import { InjectPinoLogger } from 'nestjs-pino';
import { PinoLogger } from 'nestjs-pino';

@Controller('healthcheck')
export class HealthCheckController {
  constructor(
    @InjectPinoLogger(HealthCheckController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  async healthcheck() {
    console.log('Health check requested');
    this.logger.info('Health check endpoint called');
    return 'OK';
  }
}
