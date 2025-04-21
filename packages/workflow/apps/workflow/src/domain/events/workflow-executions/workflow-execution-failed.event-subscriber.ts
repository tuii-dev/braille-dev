/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowMetricsService } from '@app/services/obervability/metrics.service';
import { WorkflowExecutionFailedEvent } from './workflow-execution-failed.event';

@EventSubscriber(WorkflowExecutionFailedEvent)
export class WorkflowExecutionFailedEventSubscriber
  implements IEventSubscriber
{
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly metricsService: WorkflowMetricsService,
    @InjectPinoLogger(WorkflowExecutionFailedEventSubscriber.name)
    private readonly logger: PinoLogger,
  ) {}

  handle({ payload }: EventEnvelope<WorkflowExecutionFailedEvent>) {
    this.logger.info(
      `Running WorkflowExecutionFailedEvent: ${JSON.stringify(payload)}`,
    );

    const event = payload as WorkflowExecutionFailedEvent;
    // Check if the completed node is the last node in the event

    this.metricsService.incrementTotalWorkflowsFailedCounter();
  }
}
