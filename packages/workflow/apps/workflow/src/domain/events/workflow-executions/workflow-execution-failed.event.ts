import { WorkflowStatus } from '@app/common/shared/types/workflow-status';
import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('workflow-execution-failed')
export class WorkflowExecutionFailedEvent implements IEvent {
  constructor(
    public readonly executionId: string,
    public readonly status: WorkflowStatus,
    public readonly errorMessage?: string,
    public readonly endDate?: number,
  ) {}
}
