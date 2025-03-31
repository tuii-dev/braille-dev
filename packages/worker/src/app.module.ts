import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { OpenTelemetryModule } from '@amplication/opentelemetry-nestjs';

import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { WorkerModule } from './worker/worker.module';
import { RatelimiterModule } from './ratelimiter/ratelimiter.module';
import { OpenAIModule } from './openai/openai.module';
import { OpenAIService } from './openai/openai.service';
import { DataExtractionModule } from './data-extraction/data-extraction.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { VectorindexModule } from './vectorindex/vectorindex.module';
import { ApplicationsModule } from './applications/applications.module';
import { ExecutionsModule } from './executions/executions.module';

@Module({
  imports: [
    OpenTelemetryModule.forRoot(),
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST}:6379`,
      options: {
        reconnectOnError: (error) => {
          const targetErrors = [/READONLY/, /ETIMEDOUT/];
          return targetErrors.some((targetError) =>
            targetError.test(error.message),
          );
        },
        connectTimeout: 17000,
        maxRetriesPerRequest: 4,
        retryStrategy: (times) => Math.min(times * 30, 1000),
      },
    }),
    WorkerModule,
    HealthcheckModule,
    RatelimiterModule,
    OpenAIModule,
    DataExtractionModule,
    IngestionModule,
    VectorindexModule,
    ApplicationsModule,
    ExecutionsModule,
  ],
  providers: [OpenAIService],
})
export class AppModule {}
