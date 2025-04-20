/* eslint-disable @typescript-eslint/no-require-imports */
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DomainExceptionsFilter } from './application/exceptions';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  require('./tracing');
  const app = await NestFactory.create(AppModule); //, { bufferLogs: true });
  // This gets the underlying HTTP adapter (e.g. Express) and assigns it to the DomainExceptionsFilter.
  // This allows the filter to use the HTTP adapter to determine the response to send when an exception is caught.
  const { httpAdapter } = app.get(HttpAdapterHost);
  // This sets up a global filter that will catch any exceptions that are thrown by the application
  // and use the HTTP adapter to send the appropriate response.
  app.useGlobalFilters(new DomainExceptionsFilter(httpAdapter));
  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Get the ConfigService to access configuration values
  const configService = app.get(ConfigService);

  // Create the Redis microservice asynchronously
  // Create and attach Redis microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: 6379,
      retryAttempts: 5,
      retryDelay: 1000,
    },
  });

  // Start both the HTTP server and the Redis microservice
  await app.startAllMicroservices();
  await app.listen(9001);
}
void bootstrap();
