import { DomainException } from '@ocoda/event-sourcing';
import type { WorkflowTemplateId } from '../models';

export class WorkflowTemplateNotFoundException extends DomainException {
  static withId(id: WorkflowTemplateId): WorkflowTemplateNotFoundException {
    return new WorkflowTemplateNotFoundException(
      'Workflow template not found',
      id,
    );
  }
}
