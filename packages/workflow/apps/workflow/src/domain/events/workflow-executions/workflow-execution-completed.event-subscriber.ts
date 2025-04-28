/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowExecutionCompletedEvent } from './workflow-execution-completed.event';
import { WorkflowMetricsService } from '@app/services/obervability/metrics.service';

@EventSubscriber(WorkflowExecutionCompletedEvent)
export class WorkflowExecutionCompletedEventSubscriber
  implements IEventSubscriber
{
  constructor(
    private readonly metricsService: WorkflowMetricsService,
    @InjectPinoLogger(WorkflowExecutionCompletedEventSubscriber.name)
    private readonly logger: PinoLogger,
  ) {}

  handle({ payload }: EventEnvelope<WorkflowExecutionCompletedEvent>) {
    this.logger.info(
      `Running WorkflowExecutionCompletedEventSubscriber: ${JSON.stringify(
        payload,
      )}`,
    );

    const event = payload as WorkflowExecutionCompletedEvent;
    // Check if the completed node is the last node in the event

    void this.metricsService.recordWorkflowCompletionDuration(
      true,
      event.startDate,
      event.endDate,
    );
  }
}
