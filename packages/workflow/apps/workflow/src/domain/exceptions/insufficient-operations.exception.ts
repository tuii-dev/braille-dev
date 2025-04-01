import { DomainException, type Id } from '@ocoda/event-sourcing';

export class InsufficientOperationsException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new InsufficientOperationsException(cause, id);
  }
}
