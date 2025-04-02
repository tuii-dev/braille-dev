import { CronScheduleType } from '@app/common/shared/types/cron-schedule-type';
import { ScheduledJobStatusType } from '@app/common/shared/types/scheduled-job-status-type';
import { ScheduledJobType } from '@app/common/shared/types/scheduled-job-type';
import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('app-scheduled-job-failed')
export class AppScheduledJobFailedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly type: ScheduledJobType,
    public readonly cronSchedule: CronScheduleType,
    public readonly status: ScheduledJobStatusType,
    public readonly metadata: string,
    public readonly failed?: number,
    public readonly results?: string,
    public readonly appId?: string,
  ) {}
}
