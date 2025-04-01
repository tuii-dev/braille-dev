import { DomainException } from '@ocoda/event-sourcing';
import { WorkflowExecutionStepId } from '../models/workflow-executions/workflow-execution-step-id';

export class WorkflowStepNotFoundException extends DomainException {
  static withId(
    id: WorkflowExecutionStepId,
    nodeId: string,
  ): WorkflowStepNotFoundException {
    return new WorkflowStepNotFoundException(
      `Workflow step ${nodeId} not found`,
      id,
    );
  }
}
