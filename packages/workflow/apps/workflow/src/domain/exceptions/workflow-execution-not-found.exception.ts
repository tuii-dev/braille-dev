import { DomainException } from '@ocoda/event-sourcing';
import type { WorkflowExecutionId } from '../models';

export class WorkflowExecutionNotFoundException extends DomainException {
  static withId(id: WorkflowExecutionId): WorkflowExecutionNotFoundException {
    return new WorkflowExecutionNotFoundException(
      'Workflow execution not found',
      id,
    );
  }
}
