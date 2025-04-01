/* eslint-disable @typescript-eslint/no-unsafe-call */
import { AppScheduledJobRegistrationCreatedEvent } from '@app/common/shared/event-sourcing/domain/events/app-scheduled-job-registration/app-scheduled-job-registration-created.event';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CommandBus } from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { StartAppScheduledJobCommand } from '../commands/start-app-scheduled-job.command';

@Controller()
export class AppScheduledJobRegistrationEventBridgeController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(AppScheduledJobRegistrationEventBridgeController.name)
    private readonly logger: PinoLogger,
  ) {}

  @EventPattern('app-scheduled-job-registration-created') // Listen for events with this pattern
  async onAppScheduledJobRegistrationCreatedEvent(
    event: AppScheduledJobRegistrationCreatedEvent,
  ) {
    this.logger.info(`Received event: ${JSON.stringify(event)}`);
    if (event.runImmediately) {
      await this.commandBus.execute<StartAppScheduledJobCommand>(
        new StartAppScheduledJobCommand(event),
      );
    }
  }
}
