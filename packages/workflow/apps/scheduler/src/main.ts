/* eslint-disable @typescript-eslint/no-require-imports */
import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './scheduler.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  require('./tracing');
  const configService = new ConfigService();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SchedulerModule,
    {
      transport: Transport.REDIS,
      options: {
        host: configService.get('REDIS_HOST', 'localhost'),
        port: 6379,
        retryAttempts: 5,
        retryDelay: 1000,
      },
    },
  );

  await app.listen();
  console.log('Job scheduler service is listening for events');
}
void bootstrap();
