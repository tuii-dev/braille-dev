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
import { context, trace } from '@opentelemetry/api';

@Module({
  imports: [
    OpenTelemetryModule.forRoot(),
    EventEmitterModule.forRoot(),
    getEventSourcingModule(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        name: 'workflows',
        formatters: {
          level: (label) => ({ level: label }),
        },
        mixin() {
          const span = trace.getSpan(context.active());
          if (!span) return {};
          const spanContext = span.spanContext();
          return {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          };
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

function getEventSourcingModule() {
  return EventSourcingModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const region = configService.get<string>('AWS_REGION', 'us-east-1');
      const env = configService.get<string>('NODE_ENV');
      console.log(`Environment: ${env}`);
      console.log(`Region: ${region}`);
      if (env === 'dev') {
        console.log('Development Config', {
          env,
          region,
        });
        return {
          events: [...Events],
        };
      } else {
        console.log('DynamoDB Config:', {
          region,
        });
        const eventStoreConfig: DynamoDBEventStoreConfig = {
          driver: DynamoDBEventStore,
          region,
          useDefaultPool: false,
        };

        const snapshotStoreConfig: DynamoDBSnapshotStoreConfig = {
          driver: DynamoDBSnapshotStore,
          region,
          useDefaultPool: false,
        };

        return {
          events: [...Events],
          eventStore: eventStoreConfig,
          snapshotStore: snapshotStoreConfig,
        };
      }
    },
  });
}
