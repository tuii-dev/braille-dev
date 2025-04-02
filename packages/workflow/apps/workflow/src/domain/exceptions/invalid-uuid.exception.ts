import { DomainException, type Id } from '@ocoda/event-sourcing';

export class InvalidUuidException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new InvalidUuidException(cause, id);
  }
}
