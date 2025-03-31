import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  require('./tracing');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['debug'],
  });
  await app.listen(9000);
}
bootstrap();
