import { DomainException, type Id } from '@ocoda/event-sourcing';

export class InvalidWorkflowExecutionStepCompletionException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new InvalidWorkflowExecutionStepCompletionException(cause, id);
  }
}
