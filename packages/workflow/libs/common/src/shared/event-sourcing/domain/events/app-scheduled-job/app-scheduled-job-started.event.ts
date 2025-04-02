import { CronScheduleType } from '@app/common/shared/types/cron-schedule-type';
import { ScheduledJobSchedulingType } from '@app/common/shared/types/scheduled-job-scheduling-type';
import { ScheduledJobStatusType } from '@app/common/shared/types/scheduled-job-status-type';
import { ScheduledJobType } from '@app/common/shared/types/scheduled-job-type';
import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('app-scheduled-job-started')
export class AppScheduledJobStartedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly registrationId: string,
    public readonly name: string,
    public readonly type: ScheduledJobType,
    public readonly schedulingType: ScheduledJobSchedulingType,
    public readonly cronSchedule: CronScheduleType,
    public readonly status: ScheduledJobStatusType,
    public readonly metadata: string,
    public readonly started: number,
    public readonly appId?: string,
  ) {}
}
