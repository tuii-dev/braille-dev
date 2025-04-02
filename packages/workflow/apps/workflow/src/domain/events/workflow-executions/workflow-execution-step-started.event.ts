import { Event, type IEvent } from '@ocoda/event-sourcing';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';

@Event('workflow-execution-step-started')
export class WorkflowExecutionStepStartedEvent implements IEvent {
  constructor(
    public readonly nodeId: string,
    public readonly executionId: string,
    public readonly nodes: IWorkflowStep[],
    public readonly isFirstNode?: boolean,
  ) {}
}
