import { DomainException, type Id } from '@ocoda/event-sourcing';

export class RequiredArgsException extends DomainException {
  static because(cause: string, id?: Id): DomainException {
    return new RequiredArgsException(cause, id);
  }
}
