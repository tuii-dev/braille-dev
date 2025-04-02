/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type EventEnvelope,
  EventSubscriber,
  type IEventSubscriber,
} from '@ocoda/event-sourcing';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WorkflowExecutionStartedEvent } from './workflow-execution-started.event';

@EventSubscriber(WorkflowExecutionStartedEvent)
export class WorkflowExecutionStartedEventSubscriber
  implements IEventSubscriber
{
  constructor(
    private eventEmitter: EventEmitter2,
    @InjectPinoLogger(WorkflowExecutionStartedEventSubscriber.name)
    private readonly logger: PinoLogger,
  ) {}

  handle({ payload }: EventEnvelope<WorkflowExecutionStartedEvent>) {
    this.logger.info(
      `Running WorkflowExecutionStartedEventSubscriber: ${JSON.stringify(payload)}`,
    );

    const event = payload as WorkflowExecutionStartedEvent;

    this.eventEmitter.emit('workflow.step.start', {
      tenantId: event.tenantId,
      workflowExecutionId: event.executionId,
      workspaceId: event.workspaceId,
      appId: event.appId,
      inputs: event.inputs,
      isFirstNode: true,
    });

    if (event.parentWorkflowExecutionId) {
      this.eventEmitter.emit('update.parent.workflow.execution.node', {
        tenantId: event.tenantId,
        parentWorkflowExecutionId: event.parentWorkflowExecutionId,
        parentWorkflowExecutionNodeId: event.parentWorkflowExecutionNodeId,
        childWorkflowExecutionId: event.executionId,
        workspaceId: event.workspaceId,
        appId: event.appId,
      });
    }
  }
}
