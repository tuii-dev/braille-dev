import { CronScheduleType } from '@app/common/shared/types/cron-schedule-type';
import { CRON_SCHEDULE_TYPE_VALUES } from '../../../../../../libs/common/src/shared/types/cron-schedule-type';
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  SCHEDULED_JOB_TYPE_VALUES,
  ScheduledJobType,
} from '@app/common/shared/types/scheduled-job-type';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { AppScheduledJobRegistration } from '../../../domain/models/app-scheduled-job-registration/app-scheduled-job-registration.aggregate';
import {
  SCHEDULED_JOB_SCHEDULING_TYPE_VALUES,
  ScheduledJobSchedulingType,
} from '@app/common/shared/types/scheduled-job-scheduling-type';

export class AppScheduledJobRegistrationDto {
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
  name?: string;

  @IsIn(SCHEDULED_JOB_TYPE_VALUES)
  @Transform(({ value }) => value as ScheduledJobType)
  type?: ScheduledJobType;

  @IsIn(SCHEDULED_JOB_SCHEDULING_TYPE_VALUES)
  @Transform(({ value }) => value as ScheduledJobSchedulingType)
  schedulingType?: ScheduledJobSchedulingType;

  @IsIn(CRON_SCHEDULE_TYPE_VALUES)
  @Transform(({ value }) => value as CronScheduleType)
  cronSchedule?: CronScheduleType;

  @IsOptional()
  @IsString()
  metadata?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  runImmediately?: boolean;

  @IsOptional()
  @IsBoolean()
  isPaused?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    {
      toPlainOnly: true,
    },
  )
  created?: number;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    {
      toPlainOnly: true,
    },
  )
  updated?: number;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    {
      toPlainOnly: true,
    },
  )
  deleted?: number;

  static from(
    appScheduledJobRegistration: AppScheduledJobRegistration,
  ): AppScheduledJobRegistrationDto {
    const dto = new AppScheduledJobRegistrationDto();
    dto.id = appScheduledJobRegistration.id.value;
    dto.tenantId = appScheduledJobRegistration.tenantId;
    dto.workspaceId = appScheduledJobRegistration.workspaceId;
    dto.appId = appScheduledJobRegistration.appId;
    dto.name = appScheduledJobRegistration.name;
    dto.type = appScheduledJobRegistration.type;
    dto.schedulingType = appScheduledJobRegistration.schedulingType;
    dto.cronSchedule = appScheduledJobRegistration.cronSchedule;
    dto.metadata = appScheduledJobRegistration.metadata;
    dto.isActive = appScheduledJobRegistration.isActive;
    dto.runImmediately = appScheduledJobRegistration.runImmediately;
    dto.isPaused = appScheduledJobRegistration.isPaused;
    dto.isDeleted = appScheduledJobRegistration.isDeleted;

    dto.created = appScheduledJobRegistration.created;
    dto.updated = appScheduledJobRegistration.updated;
    dto.deleted = appScheduledJobRegistration.deleted;

    return dto;
  }
}
