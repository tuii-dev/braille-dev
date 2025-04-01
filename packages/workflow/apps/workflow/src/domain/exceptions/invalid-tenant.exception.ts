import { DomainException, type Id } from '@ocoda/event-sourcing';

export class InvalidTenantException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new InvalidTenantException(cause, id);
  }
}
