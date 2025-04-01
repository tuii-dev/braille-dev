import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('app-scheduled-job-registration-resumed')
export class AppScheduledJobRegistrationResumedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly tenantId?: string,
    public readonly workspaceId?: string,
    public readonly appId?: string,
    public readonly isPaused?: boolean,
    public readonly updated?: number,
  ) {}
}
