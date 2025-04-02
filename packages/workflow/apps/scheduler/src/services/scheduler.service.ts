/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { StartAppScheduledJobCommand } from '@app/common/shared/event-sourcing/application/commands';
import { AppScheduledJobRegistrationCreatedEvent } from '@app/common/shared/event-sourcing/domain/events';
import { CronScheduleType } from '@app/common/shared/types/cron-schedule-type';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CommandBus } from '@ocoda/event-sourcing';
import { Message } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import {
  // SqsConsumerEventHandler,
  SqsMessageHandler,
  // SqsService,
} from '@ssut/nestjs-sqs';
import { CronJob } from 'cron';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { SqsClientService } from '@app/common/services/sqs-client.service';
import { ConfigService } from '@nestjs/config';
import { MessageDeduplicationService } from '@app/common/services';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sqsClientService: SqsClientService,
    private readonly deduplicationService: MessageDeduplicationService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(SchedulerService.name)
    private readonly logger: PinoLogger,
  ) {}

  @SqsMessageHandler('JOB1_QUEUE_CONSUMER', false)
  public async handleSqsMessage(message: Message) {
    this.logger.info(`Received message: ${JSON.stringify(message)}`);
    this.logger.info(`Message ID: ${message.MessageId}`);

    if (!message.MessageId) {
      this.logger.error('No message ID');
      return;
    }

    if (!message.Body) {
      this.logger.error('No message body');
      return;
    }

    if (await this.deduplicationService.isMessageDuplicate(message.MessageId)) {
      this.logger.info(`Message ${message.MessageId} is a duplicate`);
      return;
    }

    await this.deduplicationService.markMessageAsProcessed(
      message.MessageId,
      60,
    );

    const event = JSON.parse(
      message.Body,
    ) as AppScheduledJobRegistrationCreatedEvent;

    this.logger.info(`Processing message: ${JSON.stringify(event)}`);

    // this.addJob(event);

    this.logger.info(
      `Message processed.  Attempting to delete: ${message.ReceiptHandle}`,
    );

    if (message.ReceiptHandle) {
      await this.sqsClientService.delete(
        message.ReceiptHandle,
        this.configService.get('AWS_JOB1_QUEUE_URL')!,
      );
    } else {
      this.logger.error('No receipt handle');
    }

    await this.deduplicationService.markMessageAsProcessed(
      message.MessageId,
      60,
    );
  }
  public addJob(event: AppScheduledJobRegistrationCreatedEvent) {
    this.logger.info(`Scheduling job: ${JSON.stringify(event)}`);
    const cronExpression = this.getCronString(event.cronSchedule);
    this.logger.info(`Cron expression: ${cronExpression}`);

    const existing = this.schedulerRegistry.getCronJob(event.id);
    if (existing) {
      this.schedulerRegistry.deleteCronJob(event.id);
    }

    const job = new CronJob(cronExpression, async () => {
      await this.commandBus.execute<StartAppScheduledJobCommand>(
        new StartAppScheduledJobCommand(event),
      );
    });

    this.schedulerRegistry.addCronJob(event.id, job);
  }

  public pauseJob() {}

  public resumeJob() {}

  public deleteJob() {}

  private getCronString(cronSchedule: CronScheduleType) {
    switch (cronSchedule) {
      case 'EVERY_MINUTE': {
        const second = this.generateRandomNumber(60);
        return `${second.toString()} * * * * *`;
      }
      case 'EVERY_5_MINUTES': {
        const seconds = this.generateRandomNumber(60);
        return `${seconds.toString()} */5 * * * *`;
      }
      case 'EVERY_30_MINUTES': {
        const seconds = this.generateRandomNumber(60);
        return `${seconds.toString()} */30 * * * *`;
      }
      case 'EVERY_HOUR': {
        const minutes = this.generateRandomNumber(60);
        return `0 ${minutes.toString()} * * * *`;
      }
      case 'EVERY_3_HOURS': {
        const seconds = this.generateRandomNumber(60);
        const minutes = this.generateRandomNumber(60);
        return `${seconds.toString()} ${minutes.toString()} */3 * * *`;
      }
      case 'EVERY_6_HOURS': {
        const seconds = this.generateRandomNumber(60);
        const minutes = this.generateRandomNumber(60);
        return `${seconds.toString()} ${minutes.toString()} */6 * * *`;
      }
      case 'EVERY_12_HOURS': {
        const seconds = this.generateRandomNumber(60);
        const minutes = this.generateRandomNumber(60);
        return `${seconds.toString()} ${minutes.toString()} */12 * * *`;
      }
      default: {
        const seconds = this.generateRandomNumber(60);
        const minutes = this.generateRandomNumber(60);
        return `${seconds.toString()} ${minutes.toString()} * * * *`;
      }
    }
  }

  private generateRandomNumber(max: number) {
    return Math.floor(Math.random() * (max + 1));
  }
}
