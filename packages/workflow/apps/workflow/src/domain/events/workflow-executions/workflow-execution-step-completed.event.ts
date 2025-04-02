import { Event, type IEvent } from '@ocoda/event-sourcing';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';
import { WorkflowStatus } from '@app/common/shared/types/workflow-status';
import { IWorkflowEmittedState } from '@app/application/interfaces/workflow-emitted-state.interface';

@Event('workflow-execution-step-completed')
export class WorkflowExecutionStepCompletedEvent implements IEvent {
  constructor(
    public readonly tenantId: string,
    public readonly workflowExecutionId: string,
    public readonly completedNodeId: string,
    public readonly nodes: IWorkflowStep[],
    public readonly status: WorkflowStatus,
    public readonly runtimeState: IWorkflowEmittedState[],
    public readonly workspaceId?: string,
    public readonly appId?: string,
    public readonly parentWorkflowExecutionId?: string,
    public readonly callbackUrl?: string,
  ) {}
}
