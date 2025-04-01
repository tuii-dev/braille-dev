/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DomainException } from '@ocoda/event-sourcing';
import { AppScheduledJobRegistrationId } from '../models/app-scheduled-job-registration/app-scheduled-job-registration-id';

export class AppScheduledJobRegistrationNotFoundException extends DomainException {
  static withId(
    id: AppScheduledJobRegistrationId,
  ): AppScheduledJobRegistrationNotFoundException {
    return new AppScheduledJobRegistrationNotFoundException(
      'App scheduled job registration not found',
      id,
    );
  }
}
