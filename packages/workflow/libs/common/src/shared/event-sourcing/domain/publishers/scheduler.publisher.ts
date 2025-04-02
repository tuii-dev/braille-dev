/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  EventEnvelope,
  EventPublisher,
  type IEventPublisher,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger } from 'nestjs-pino/InjectPinoLogger';
import { PinoLogger } from 'nestjs-pino/PinoLogger';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AppScheduledJobCompletedEvent } from '../events/app-scheduled-job/app-scheduled-job-completed.event';

@EventPublisher()
export class SchedulerPublisher implements IEventPublisher {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: ClientProxy,
    @InjectPinoLogger(SchedulerPublisher.name)
    private readonly logger: PinoLogger,
  ) {}
  async publish(
    envelope: EventEnvelope<AppScheduledJobCompletedEvent>,
  ): Promise<boolean> {
    this.logger.info('Publishing Scheduler Event to Redis');
    this.logger.info(JSON.stringify(envelope));
    try {
      await lastValueFrom(this.client.emit(envelope.event, envelope.payload));
      return true;
    } catch (error) {
      this.logger.error(`Error emitting event ${envelope.event}:`, error);
      return false;
    }
  }
}
