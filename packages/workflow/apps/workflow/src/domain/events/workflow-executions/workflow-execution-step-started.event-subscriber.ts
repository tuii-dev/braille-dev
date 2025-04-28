/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowExecutionStepStartedEvent } from './workflow-execution-step-started.event';
import { WorkflowMetricsService } from '@app/services/obervability/metrics.service';

@EventSubscriber(WorkflowExecutionStepStartedEvent)
export class WorkflowExecutionStepStartedEventSubscriber
  implements IEventSubscriber
{
  constructor(
    private readonly metricsService: WorkflowMetricsService,
    @InjectPinoLogger(WorkflowExecutionStepStartedEventSubscriber.name)
    private readonly logger: PinoLogger,
  ) {}

  handle({ payload }: EventEnvelope<WorkflowExecutionStepStartedEvent>) {
    this.logger.info(
      `Running WorkflowExecutionStepStartedEventSubscriber: ${JSON.stringify(
        payload,
      )}`,
    );

    const event = payload as WorkflowExecutionStepStartedEvent;
    const nodeId = event.nodeId;
    const node = event.nodes?.find((n) => n.nodeId === nodeId);
    const actionType = node?.actionType ?? 'UNDEFINED';

    void this.metricsService.incrementTotalWorkflowStepStartedCounter(
      actionType,
    );
  }
}
