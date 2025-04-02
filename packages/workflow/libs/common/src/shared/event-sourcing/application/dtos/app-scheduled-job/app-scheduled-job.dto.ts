import {
  CronScheduleType,
  CRON_SCHEDULE_TYPE_VALUES,
} from '@app/common/shared/types/cron-schedule-type';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  SCHEDULED_JOB_TYPE_VALUES,
  ScheduledJobType,
} from '@app/common/shared/types/scheduled-job-type';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsIn } from 'class-validator';
import {
  SCHEDULED_JOB_STATUS_TYPE_VALUES,
  ScheduledJobStatusType,
} from '@app/common/shared/types/scheduled-job-status-type';
import { AppScheduledJob } from '../../../domain/models/app-scheduled-job/app-scheduled-job.aggregate';
import { ScheduledJobSchedulingType } from '@app/common/shared/types/scheduled-job-scheduling-type';

export class AppScheduledJobDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  workspaceId: string;

  @IsOptional()
  @IsString()
  appId?: string;

  @IsOptional()
  @IsString()
  registrationId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsIn(SCHEDULED_JOB_TYPE_VALUES)
  @Transform(({ value }) => value as ScheduledJobType)
  type?: ScheduledJobType;

  @IsIn(SCHEDULED_JOB_TYPE_VALUES)
  @Transform(({ value }) => value as ScheduledJobSchedulingType)
  schedulingType?: ScheduledJobSchedulingType;

  @IsIn(CRON_SCHEDULE_TYPE_VALUES)
  @Transform(({ value }) => value as CronScheduleType)
  cronSchedule?: CronScheduleType;

  @IsIn(SCHEDULED_JOB_STATUS_TYPE_VALUES)
  @Transform(({ value }) => value as ScheduledJobStatusType)
  status?: ScheduledJobStatusType;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsString()
  results?: string;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    {
      toPlainOnly: true,
    },
  )
  started?: number;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    {
      toPlainOnly: true,
    },
  )
  completed?: number;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    {
      toPlainOnly: true,
    },
  )
  failed?: number;

  static from(appScheduledJob: AppScheduledJob): AppScheduledJobDto {
    const dto = new AppScheduledJobDto();
    dto.id = appScheduledJob.id.value;
    dto.tenantId = appScheduledJob.tenantId;
    dto.workspaceId = appScheduledJob.workspaceId;
    dto.appId = appScheduledJob.appId;
    dto.registrationId = appScheduledJob.registrationId;
    dto.name = appScheduledJob.name;
    dto.type = appScheduledJob.type;
    dto.schedulingType = appScheduledJob.schedulingType;
    dto.cronSchedule = appScheduledJob.cronSchedule;
    dto.status = appScheduledJob.status;
    dto.metadata = appScheduledJob.metadata;
    dto.started = appScheduledJob.started;
    dto.completed = appScheduledJob.completed;
    dto.failed = appScheduledJob.failed;

    dto.results = appScheduledJob.results;

    return dto;
  }
}
