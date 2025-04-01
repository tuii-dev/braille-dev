/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DomainException } from '@ocoda/event-sourcing';
import { AppScheduledJobId } from '../models/app-scheduled-job/app-scheduled-job-id';

export class AppScheduledJobNotFoundException extends DomainException {
  static withId(id: AppScheduledJobId): AppScheduledJobNotFoundException {
    return new AppScheduledJobNotFoundException(
      'App scheduled job not found',
      id,
    );
  }
}
