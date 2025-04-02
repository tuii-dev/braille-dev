import { CronScheduleType } from '@app/common/shared/types/cron-schedule-type';
import { ScheduledJobSchedulingType } from '@app/common/shared/types/scheduled-job-scheduling-type';
import { ScheduledJobType } from '@app/common/shared/types/scheduled-job-type';
import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('app-scheduled-job-registration-created')
export class AppScheduledJobRegistrationCreatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly type: ScheduledJobType,
    public readonly schedulingType: ScheduledJobSchedulingType,
    public readonly cronSchedule: CronScheduleType,
    public readonly metadata: string,
    public readonly isActive: boolean,
    public readonly runImmediately: boolean,
    public readonly isPaused: boolean,
    public readonly isDeleted: boolean,
    public readonly created: number,
    public readonly appId?: string,
  ) {}
}
