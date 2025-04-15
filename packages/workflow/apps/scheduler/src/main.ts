import { NestFactory } from '@nestjs/core';
import { SchedulerModule } from './scheduler.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  await import('./tracing');
  const configService = new ConfigService();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SchedulerModule,
    {
      transport: Transport.REDIS,
      options: {
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        retryAttempts: configService.get('REDIS_RETRY_ATTEMPTS', 5),
        retryDelay: configService.get('REDIS_RETRY_DELAY', 1000),
      },
    },
  );

  await app.listen();
  console.log('Job scheduler service is listening for events');
}
void bootstrap();
