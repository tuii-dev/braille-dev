import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ApplicationsModule } from '../applications/applications.module';
import { ExecutionsService } from './executions.service';

@Module({
  imports: [
    ApplicationsModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          consumers: [
            {
              name: 'ACTION_EXECUTION_QUEUE',
              queueUrl: configService.get('ACTION_EXECUTION_QUEUE')!,
              batchSize: 10,
            },
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}
