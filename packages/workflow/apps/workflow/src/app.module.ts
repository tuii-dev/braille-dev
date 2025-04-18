/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';

import {
  AggregateRepositories,
  CommandHandlers,
  Controllers,
  // EventPublishers,
  EventSubscribers,
  Events,
  // QueryHandlers,
  SnapshotRepositories,
  Services,
  QueryHandlers,
  EventPublishers,
} from './app.providers';

import {
  DynamoDBEventStore,
  type DynamoDBEventStoreConfig,
  DynamoDBSnapshotStore,
  type DynamoDBSnapshotStoreConfig,
} from '@ocoda/event-sourcing-dynamodb';

import { EventSourcingModule } from '@ocoda/event-sourcing';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { WorkflowTemplate, WorkflowExecution } from './domain/models';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@app/common/config/config.module';

import { DatabaseModule } from '@app/common/database/database.module';
import { ZodValidationProvider } from '@app/common/shared/pipes/zod-validation.pipe';
import { ConfigService } from '@nestjs/config';
import { AppScheduledJobRegistration } from '@app/domain/models/app-scheduled-job-registration/app-scheduled-job-registration.aggregate';
import {
  Tenant,
  App,
  Workspace,
} from '@app/common/shared/event-sourcing/domain/models';
import { OpenTelemetryModule } from '@amplication/opentelemetry-nestjs';

@Module({
  imports: [
    OpenTelemetryModule.forRoot(),
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
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        name: 'workflows',
        formatters: {
          level: (label) => ({ level: label }),
        },
      },
    }),
    ClientsModule.registerAsync([
      {
        name: 'REDIS_CLIENT',
        imports: [ConfigModule], // Import ConfigModule to access ConfigService
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('REDIS_HOST'), // Dynamically get host
            port: 6379,
            retryAttempts: 5,
            retryDelay: 1000,
          },
        }),
        inject: [ConfigService], // Inject ConfigService into the factory
      },
    ]),
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [...Controllers],
  providers: [
    ...CommandHandlers,
    {
      provide: 'WORKFLOW_EXECUTION_LOGGER',
      useFactory: (logger: PinoLogger) => {
        WorkflowTemplate.setLogger(logger);
        WorkflowExecution.setLogger(logger);
        Tenant.setLogger(logger);
        App.setLogger(logger);
        Workspace.setLogger(logger);
        AppScheduledJobRegistration.setLogger(logger);
        return logger;
      },
      inject: [PinoLogger],
    },
    ...QueryHandlers,
    ...EventSubscribers,
    ...EventPublishers,
    ...AggregateRepositories,
    ...SnapshotRepositories,

    ...Services,
    ZodValidationProvider,
  ],
})
export class AppModule {}
