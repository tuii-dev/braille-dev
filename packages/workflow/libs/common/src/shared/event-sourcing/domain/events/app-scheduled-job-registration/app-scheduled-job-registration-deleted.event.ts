import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('app-scheduled-job-registration-deleted')
export class AppScheduledJobRegistrationDeletedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly tenantId?: string,
    public readonly workspaceId?: string,
    public readonly appId?: string,
    public readonly isDeleted?: boolean,
    public readonly deleted?: number,
  ) {}
}
