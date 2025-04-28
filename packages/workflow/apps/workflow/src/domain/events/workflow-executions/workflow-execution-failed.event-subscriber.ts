/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowMetricsService } from '@app/services/obervability/metrics.service';
import { WorkflowExecutionFailedEvent } from './workflow-execution-failed.event';

@EventSubscriber(WorkflowExecutionFailedEvent)
export class WorkflowExecutionFailedEventSubscriber
  implements IEventSubscriber
{
  constructor(
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

    this.logger.info(`Failed workflow: ${event.executionId}`);
    void this.metricsService.incrementTotalWorkflowsFailedCounter(
      event.executionId,
    );
  }
}
