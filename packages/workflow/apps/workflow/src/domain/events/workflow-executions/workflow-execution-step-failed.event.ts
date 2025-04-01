import { Event, type IEvent } from '@ocoda/event-sourcing';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';
import { WorkflowStatus } from '@app/common/shared/types/workflow-status';

@Event('workflow-execution-step-failed')
export class WorkflowExecutionStepFailedEvent implements IEvent {
  constructor(
    public readonly tenantId: string,
    public readonly workflowExecutionId: string,
    public readonly nodeId: string,
    public readonly failedNodeIds: string[],
    public readonly status: WorkflowStatus,
    public readonly nodes: IWorkflowStep[],
    public readonly workspaceId?: string,
    public readonly appId?: string,
    public readonly parentWorkflowExecutionId?: string,
    public readonly parentWorkflowExecutionNodeId?: string,
    public readonly callbackUrl?: string,
  ) {}
}
