/* eslint-disable @typescript-eslint/require-await */
import { Controller, Get, Header, HttpCode } from '@nestjs/common';
import { InjectPinoLogger } from 'nestjs-pino';
import { PinoLogger } from 'nestjs-pino';

@Controller('healthcheck')
export class HealthCheckController {
  constructor(
    @InjectPinoLogger(HealthCheckController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @HttpCode(200)
  @Header('Content-Type', 'text/plain')
  async healthcheck() {
    return 'OK';
  }
}
