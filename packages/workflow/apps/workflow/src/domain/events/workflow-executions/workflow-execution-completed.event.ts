import { Event, type IEvent } from '@ocoda/event-sourcing';
import { WorkflowStatus } from '@app/common/shared/types/workflow-status';

@Event('workflow-execution-completed')
export class WorkflowExecutionCompletedEvent implements IEvent {
  constructor(
    public readonly tenantId: string,
    public readonly workflowExecutionId: string,
    public readonly status: WorkflowStatus,
    public readonly endDate: number,
    public readonly callbackUrl?: string,
    public readonly parentWorkflowExecutionId?: string,
    public readonly outputs?: any,
  ) {}
}
