import { DomainException, type Id } from '@ocoda/event-sourcing';

export class InvalidAppException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new InvalidAppException(cause, id);
  }
}
