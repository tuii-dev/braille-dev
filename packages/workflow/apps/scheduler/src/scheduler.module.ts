/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';

import {
  AggregateRepositories,
  Controllers,
  // CommandHandlers,
  // EventPublishers,
  EventSubscribers,
  Events,
  EventPublishers,
  Services,
  // QueryHandlers,
  SnapshotRepositories,
  CommandHandlers,
  // Services,
  // QueryHandlers,
} from './scheduler.providers';

import {
  DynamoDBEventStore,
  type DynamoDBEventStoreConfig,
  DynamoDBSnapshotStore,
  type DynamoDBSnapshotStoreConfig,
} from '@ocoda/event-sourcing-dynamodb';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { SqsModule } from '@ssut/nestjs-sqs';
import { EventSourcingModule } from '@ocoda/event-sourcing';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { ConfigModule } from '@app/common/config/config.module';
import { DatabaseModule } from '@app/common/database/database.module';
import { ZodValidationProvider } from '@app/common/shared/pipes/zod-validation.pipe';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppScheduledJob } from '@app/common/shared/event-sourcing/domain/models/app-scheduled-job/app-scheduled-job.aggregate';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    EventSourcingModule.forRootAsync<
      DynamoDBEventStoreConfig,
      DynamoDBSnapshotStoreConfig
    >({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService,
      ): {
        events: any[];
        eventStore: DynamoDBEventStoreConfig;
        snapshotStore: DynamoDBSnapshotStoreConfig;
      } => ({
        events: [...Events],
        eventStore: {
          driver: DynamoDBEventStore,
          region: configService.get<string>('AWS_REGION'),
          useDefaultPool: false,
        },
        snapshotStore: {
          driver: DynamoDBSnapshotStore,
          region: configService.get<string>('AWS_REGION'),
          useDefaultPool: false,
        },
      }),
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          transport: {
            targets: [
              {
                target: 'pino-pretty',
                level: 'info',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              },
              // {
              //   target: 'pino/file',
              //   level: 'info',
              //   options: {
              //     destination: './logs/scheduler.log',
              //     mkdir: true,
              //   },
              // },
              // {
              //   target: 'pino-mongodb',
              //   level: 'info', // Set log level (e.g., 'info', 'error')
              //   options: {
              //     uri: configService.get<string>('MONGODB_URI'), // MongoDB connection URI
              //     database: 'logs', // Database name
              //     collection: 'scheduler', // Collection name for logs
              //   },
              // },
            ],
          },
          name: 'scheduler',
        },
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'REDIS_CLIENT',
        imports: [ConfigModule], // Import ConfigModule to access ConfigService
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('REDIS_HOST'), // Dynamically get host
            port: configService.get<number>('REDIS_PORT'), // Dynamically get port
            retryAttempts: configService.get<number>('REDIS_RETRY_ATTEMPTS'), // Dynamically get retry attempts
            retryDelay: configService.get<number>('REDIS_RETRY_DELAY'), // Dynamically get retry delay
          },
        }),
        inject: [ConfigService], // Inject ConfigService into the factory
      },
    ]),
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          name: 'SQS_CLIENT',
          region: configService.get('AWS_REGION'),
          consumers: [
            {
              name: 'JOB1_QUEUE_CONSUMER',
              queueUrl: configService.get('AWS_JOB1_QUEUE_URL')!,
            },
          ],
          // producers: [
          //   {
          //     name: Queue.STRUCTURED_DATA_JOB_QUEUE,
          //     queueUrl: configService.get<string>(
          //       Queue.STRUCTURED_DATA_JOB_QUEUE,
          //     )!,
          //   },
          // ],
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [...Controllers],
  providers: [
    {
      provide: 'WORKFLOW_EXECUTION_LOGGER',
      useFactory: (logger: PinoLogger) => {
        AppScheduledJob.setLogger(logger);
        return logger;
      },
      inject: [PinoLogger],
    },
    ...EventSubscribers,
    ...EventPublishers,
    ...AggregateRepositories,
    ...SnapshotRepositories,
    ...CommandHandlers,
    ...Services,
    ZodValidationProvider,
  ],
})
export class SchedulerModule {}
