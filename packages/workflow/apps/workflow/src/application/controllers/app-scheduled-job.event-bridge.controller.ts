import { AppScheduledJobStartedEvent } from '@app/common/shared/event-sourcing/domain/events';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Controller()
export class AppScheduledJobEventBridgeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectPinoLogger(AppScheduledJobEventBridgeController.name)
    private readonly logger: PinoLogger,
  ) {}

  @EventPattern('app-scheduled-job-started') // Listen for events with this pattern
  onAppScheduledJobStartedEvent(data: AppScheduledJobStartedEvent) {
    this.logger.info(`Received event: ${JSON.stringify(data)}`);
    // Process the event here...
  }
}
