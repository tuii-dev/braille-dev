import { DomainException, type Id } from '@ocoda/event-sourcing';

export class InvalidWorkflowExecutionStepProgressionException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new InvalidWorkflowExecutionStepProgressionException(cause, id);
  }
}
