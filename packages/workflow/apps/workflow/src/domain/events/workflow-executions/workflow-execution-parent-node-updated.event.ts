import { Event, type IEvent } from '@ocoda/event-sourcing';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';

@Event('workflow-execution-parent-node-updated')
export class WorkflowExecutionParentNodeUpdatedEvent implements IEvent {
  constructor(
    public readonly nodeId: string,
    public readonly nodes: IWorkflowStep[],
  ) {}
}
