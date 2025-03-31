import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';

import { OpenAIModule } from '../openai/openai.module';
import { OpenAIService } from '../openai/openai.service';
import { DataExtractionModule } from '../data-extraction/data-extraction.module';

import { WorkerService } from './worker.service';
import { Queue } from './jobs';

@Module({
  imports: [
    DataExtractionModule,
    SqsModule.registerAsync({
      imports: [ConfigModule, OpenAIModule],
      useFactory: async (
        configService: ConfigService,
        openAIService: OpenAIService,
      ) => {
        return {
          consumers: [
            {
              name: 'HANDLE_S3_PDF_QUEUE',
              queueUrl: configService.get(Queue.WORKER_SQS_QUEUE)!,
            },
            {
              name: 'PDFCO_RETRIEVE_QUEUE',
              queueUrl: configService.get('RECEIVE_PDFCO_SQS_QUEUE')!,
            },
            {
              name: Queue.STRUCTURED_DATA_JOB_SPAWNER_QUEUE,
              queueUrl: configService.get(
                Queue.STRUCTURED_DATA_JOB_SPAWNER_QUEUE,
              )!,
            },
            {
              name: Queue.STRUCTURED_DATA_JOB_QUEUE,
              queueUrl: configService.get<string>(
                Queue.STRUCTURED_DATA_JOB_QUEUE,
              )!,
              batchSize: 3,
              preReceiveMessageCallback: async () => {
                await Promise.all([
                  openAIService.waitForUsageLimits('gpt-4o'),
                  openAIService.waitForUsageLimits('gpt-4-vision-preview'),
                  openAIService.waitForUsageLimits('gpt-3.5-turbo-1106'),
                ]);
              },
            },
            {
              name: Queue.ENTITY_EMBEDDINGS_QUEUE,
              queueUrl: configService.get(Queue.ENTITY_EMBEDDINGS_QUEUE)!,
              batchSize: 5,
            },
          ],
          producers: [
            {
              name: Queue.STRUCTURED_DATA_JOB_QUEUE,
              queueUrl: configService.get<string>(
                Queue.STRUCTURED_DATA_JOB_QUEUE,
              )!,
            },
          ],
        };
      },
      inject: [ConfigService, OpenAIService],
    }),
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
