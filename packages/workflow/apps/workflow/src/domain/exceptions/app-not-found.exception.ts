import { DomainException } from '@ocoda/event-sourcing';
import { AppId } from '../../../../../libs/common/src/shared/event-sourcing/domain/models/app/app-id';

export class AppNotFoundException extends DomainException {
  static withId(id: AppId): AppNotFoundException {
    return new AppNotFoundException('App not found', id);
  }
}
