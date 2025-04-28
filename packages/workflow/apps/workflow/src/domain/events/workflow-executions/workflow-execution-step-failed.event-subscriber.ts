/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowStepNotFoundException } from '@app/domain/exceptions/workflow-step-not-found.exception';
import { WorkflowExecutionStepId } from '@app/domain/models/workflow-executions/workflow-execution-step-id';
import { WorkflowExecutionStepFailedEvent } from './workflow-execution-step-failed.event';
import { WorkflowExecutionId } from '@app/domain/models/workflow-executions/workflow-execution-id';
import { WorkflowExecutionRepository } from '@app/application/repositories/workflow-executions/workflow-execution.repository';
import { WorkflowExecutionNotFoundException } from '@app/domain/exceptions/workflow-execution-not-found.exception';
import { GraphService } from '@app/services/graph.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowMetricsService } from '@app/services/obervability/metrics.service';

@EventSubscriber(WorkflowExecutionStepFailedEvent)
export class WorkflowExecutionStepFailedEventSubscriber
  implements IEventSubscriber
{
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly metricsService: WorkflowMetricsService,
    private readonly graphService: GraphService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(WorkflowExecutionStepFailedEventSubscriber.name)
    private readonly logger: PinoLogger,
  ) {}

  async handle({ payload }: EventEnvelope<WorkflowExecutionStepFailedEvent>) {
    this.logger.info(
      `Running WorkflowExecutionStepFailedEventSubscriber: ${JSON.stringify(
        payload,
      )}`,
    );

    const event = payload as WorkflowExecutionStepFailedEvent;
    // Check if the completed node is the last node in the event
    // Or has a sibling
    const lastFailedNodeId = event.nodes[event.nodes.length - 1].nodeId;
    const failedNode = event.nodes.find((n) => n.nodeId === lastFailedNodeId);

    if (!failedNode) {
      throw WorkflowStepNotFoundException.withId(
        WorkflowExecutionStepId.generate(),
        lastFailedNodeId,
      );
    }

    const executionId = WorkflowExecutionId.from(payload.workflowExecutionId);

    const execution = await this.workflowExecutionRepository.getById(
      payload.tenantId,
      executionId,
    );

    if (!execution) {
      throw WorkflowExecutionNotFoundException.withId(executionId);
    }

    this.logger.info(`Workflow execution found: ${executionId.value}`);

    const workflowStatus = event.status;
    if (workflowStatus === 'FAILED') {
      // Workflow failed, callbackUrl or parentWorkflowExecutionId is required
      this.eventEmitter.emit('workflow.process.end', {
        tenantId: event.tenantId,
        workflowExecutionId: event.workflowExecutionId,
        workspaceId: event.workspaceId,
        appId: event.appId,
        stepFailed: true,
      });
    } else {
      // Run sibling or callback url / recursion back to parent workflow
      const hasSibling = this.graphService.hasSibling(
        event.nodeId,
        execution.nodes!,
      );
      if (hasSibling) {
        this.eventEmitter.emit('workflow.step.start', {
          tenantId: event.tenantId,
          workflowExecutionId: event.workflowExecutionId,
          workspaceId: event.workspaceId,
          appId: event.appId,
          previousNodeId: event.nodeId,
        });
      } else {
        this.eventEmitter.emit('workflow.process.end', {
          tenantId: event.tenantId,
          workflowExecutionId: event.workflowExecutionId,
          workspaceId: event.workspaceId,
          appId: event.appId,
        });
      }
    }

    const failedNodeId = event.nodeId;
    const node = execution.nodes?.find((n) => n.nodeId === failedNodeId);
    const actionType = node?.actionType ?? 'UNDEFINED';

    void this.metricsService.incrementTotalWorkflowStepFailedCounter(
      actionType,
      event.workflowExecutionId,
      failedNodeId,
    );

    // if (workflowStatus === 'FAILED') {
    //   void this.metricsService.incrementTotalWorkflowsFailedCounter();
    // }
  }
}
