import { Controller, Get, Header } from '@nestjs/common';
import { InjectPinoLogger } from 'nestjs-pino';
import { PinoLogger } from 'nestjs-pino';
import { HealthCheckDto } from '../dtos/common/health-check.dto';

@Controller('healthcheck')
export class HealthCheckController {
  constructor(
    @InjectPinoLogger(HealthCheckController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @Header('Content-Type', 'application/json')
  healthCheck(): HealthCheckDto {
    return {
      status: 'ok',
      timestamp: new Date().getTime(),
    } as HealthCheckDto;
  }
}
