import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';

import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    ApplicationsModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        consumers: [
          {
            name: 'INGESTION_SPAWNER_QUEUE',
            queueUrl: configService.get('INGESTION_SPAWNER_QUEUE')!,
          },
          {
            name: 'INGESTION_TASK_QUEUE',
            queueUrl: configService.get('INGESTION_TASK_QUEUE')!,
            batchSize: 10,
          },
        ],
        producers: [
          {
            name: 'INGESTION_TASK_QUEUE',
            queueUrl: configService.get('INGESTION_TASK_QUEUE')!,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [IngestionService],
  controllers: [IngestionController],
})
export class IngestionModule {}
