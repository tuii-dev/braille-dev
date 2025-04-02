import { DomainException, type Id } from '@ocoda/event-sourcing';

export class InvalidWorkspaceException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new InvalidWorkspaceException(cause, id);
  }
}
