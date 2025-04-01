import { DomainException, type Id } from '@ocoda/event-sourcing';

export class SchemaValidationException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new SchemaValidationException(cause, id);
  }
}
