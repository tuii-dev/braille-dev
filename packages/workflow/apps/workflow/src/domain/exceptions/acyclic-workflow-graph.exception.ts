import { DomainException, type Id } from '@ocoda/event-sourcing';

export class AcyclicWorkflowGraphException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new AcyclicWorkflowGraphException(cause, id);
  }
}
