/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowExecutionStepCompletedEvent } from './workflow-execution-step-completed.event';
import { WorkflowStepNotFoundException } from '@app/domain/exceptions/workflow-step-not-found.exception';
import { WorkflowExecutionStepId } from '@app/domain/models/workflow-executions/workflow-execution-step-id';
import { WorkflowMetricsService } from '@app/services';

@EventSubscriber(WorkflowExecutionStepCompletedEvent)
export class WorkflowExecutionStepCompletedEventSubscriber
  implements IEventSubscriber
{
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly metricsService: WorkflowMetricsService,
    @InjectPinoLogger(WorkflowExecutionStepCompletedEventSubscriber.name)
    private readonly logger: PinoLogger,
  ) {}

  handle({ payload }: EventEnvelope<WorkflowExecutionStepCompletedEvent>) {
    this.logger.info(
      `Running WorkflowExecutionStepCompletedEventSubscriber: ${JSON.stringify(
        payload,
      )}`,
    );

    const event = payload as WorkflowExecutionStepCompletedEvent;
    // Check if the completed node is the last node in the event
    // Or has a sibling
    const node = event.nodes.find((n) => n.nodeId === event.completedNodeId);

    if (!node) {
      throw WorkflowStepNotFoundException.withId(
        WorkflowExecutionStepId.generate(),
        event.completedNodeId,
      );
    }

    const workflowStatus = event.status;
    if (workflowStatus !== 'FAILED') {
      if (Array.isArray(node.edges) && node.edges.length > 0) {
        this.eventEmitter.emit('workflow.step.start', {
          tenantId: event.tenantId,
          workflowExecutionId: event.workflowExecutionId,
          workspaceId: event.workspaceId,
          appId: event.appId,
          previousNodeId: event.completedNodeId,
        });
      } else {
        this.logger.info(
          `Node ${event.completedNodeId} has no siblings.  Processed to tentatively end the workflow.`,
        );
        // No more steps, end the workflow
        this.eventEmitter.emit('workflow.process.end', {
          tenantId: event.tenantId,
          workflowExecutionId: event.workflowExecutionId,
          workspaceId: event.workspaceId,
          appId: event.appId,
        });
      }

      const startDate = node.startDate;
      const endDate = node.endDate;
      const actionType = node.actionType ?? 'UNDEFINED';

      this.metricsService.recordWorkflowStepCompletionDuration(
        actionType,
        startDate,
        endDate,
      );
    } else {
      this.logger.info(
        `Node ${event.completedNodeId} failed.  Skipping next step processing.`,
      );
    }
  }
}
