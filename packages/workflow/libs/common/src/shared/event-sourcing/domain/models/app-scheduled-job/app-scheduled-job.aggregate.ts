/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';
import { PinoLogger } from 'nestjs-pino';
import { AppScheduledJobId } from './app-scheduled-job-id';
import { ScheduledJobType } from '@app/common/shared/types/scheduled-job-type';
import { CronScheduleType } from '@app/common/shared/types/cron-schedule-type';
import { ScheduledJobStatusType } from '@app/common/shared/types/scheduled-job-status-type';
import {
  AppScheduledJobCompletedEvent,
  AppScheduledJobFailedEvent,
  AppScheduledJobStartedEvent,
} from '../../events';
import { AppScheduledJobDto } from '../../../application/dtos/app-scheduled-job/app-scheduled-job.dto';
import { ScheduledJobSchedulingType } from '@app/common/shared/types/scheduled-job-scheduling-type';

@Aggregate({ streamName: 'app-scheduled-job' })
export class AppScheduledJob extends AggregateRoot {
  private static logger: PinoLogger;

  public static setLogger(logger: PinoLogger) {
    AppScheduledJob.logger = logger;
  }

  public id: AppScheduledJobId;
  public tenantId: string;
  public workspaceId: string;
  public registrationId: string;
  public name: string;
  public type: ScheduledJobType;
  public schedulingType: ScheduledJobSchedulingType;
  public cronSchedule: CronScheduleType;
  public status: ScheduledJobStatusType;
  public metadata: string;
  public started?: number;
  public completed?: number;
  public failed?: number;
  public results?: string;
  public appId?: string;

  static start({
    id,
    tenantId,
    workspaceId,
    registrationId,
    name,
    type,
    schedulingType,
    cronSchedule,
    metadata,
    appId,
  }: {
    id: AppScheduledJobId;
    tenantId: string;
    workspaceId: string;
    registrationId: string;
    name: string;
    type: ScheduledJobType;
    schedulingType: ScheduledJobSchedulingType;
    cronSchedule: CronScheduleType;
    metadata: string;
    appId?: string;
  }): AppScheduledJob {
    const started = new Date().getTime();
    const aggregate = new AppScheduledJob();
    aggregate.id = id;
    aggregate.tenantId = tenantId;
    aggregate.workspaceId = workspaceId;
    aggregate.registrationId = registrationId;
    aggregate.name = name;
    aggregate.status = 'RUNNING';
    aggregate.type = type;
    aggregate.schedulingType = schedulingType;
    aggregate.cronSchedule = cronSchedule;
    aggregate.metadata = metadata;
    aggregate.started = started;
    aggregate.appId = appId;

    this.logger?.info(`Starting AppScheduledJob: ${id.value}`);
    aggregate.applyEvent(
      new AppScheduledJobStartedEvent(
        id.value,
        tenantId,
        workspaceId,
        registrationId,
        name,
        type,
        schedulingType,
        cronSchedule,
        'RUNNING',
        metadata,
        started,
        appId,
      ),
    );

    return aggregate;
  }

  complete({ results }: { results: string }) {
    this.results = results;
    this.completed = new Date().getTime();

    this.applyEvent(
      new AppScheduledJobCompletedEvent(
        this.id.value,
        this.tenantId,
        this.workspaceId,
        this.name,
        this.type,
        this.cronSchedule,
        'SUCCESSFUL',
        this.metadata,
        this.completed,
        results,
        this.appId,
      ),
    );

    return this;
  }

  fail({ results }: { results: string }) {
    this.results = results;
    this.failed = new Date().getTime();

    this.applyEvent(
      new AppScheduledJobFailedEvent(
        this.id.value,
        this.tenantId,
        this.workspaceId,
        this.name,
        this.type,
        this.cronSchedule,
        'FAILED',
        this.metadata,
        this.failed,
        results,
        this.appId,
      ),
    );

    return this;
  }

  toDto(): AppScheduledJobDto {
    const dto = new AppScheduledJobDto();
    dto.id = this.id.value;
    dto.tenantId = this.tenantId;
    dto.workspaceId = this.workspaceId;
    dto.appId = this.appId;
    dto.name = this.name;
    dto.type = this.type;
    dto.schedulingType = this.schedulingType;
    dto.cronSchedule = this.cronSchedule;
    dto.status = this.status;
    dto.metadata = this.metadata;
    dto.started = this.started;
    dto.completed = this.completed;
    dto.failed = this.failed;
    dto.results = this.results;
    return dto;
  }

  @EventHandler(AppScheduledJobStartedEvent)
  onAppScheduledJobStartedEvent(event: AppScheduledJobStartedEvent) {
    this.id = AppScheduledJobId.from(event.id);
    this.tenantId = event.tenantId;
    this.workspaceId = event.workspaceId;
    this.registrationId = event.registrationId;
    this.name = event.name;
    this.type = event.type;
    this.schedulingType = event.schedulingType;
    this.cronSchedule = event.cronSchedule;
    this.status = event.status;
    this.metadata = event.metadata;
    this.started = event.started;
    this.appId = event.appId;
  }

  @EventHandler(AppScheduledJobCompletedEvent)
  onAppScheduledJobCompletedEvent(event: AppScheduledJobCompletedEvent) {
    this.id = AppScheduledJobId.from(event.id);
    this.tenantId = event.tenantId ?? this.tenantId;
    this.workspaceId = event.workspaceId ?? this.workspaceId;
    this.name = event.name ?? this.name;
    this.type = event.type ?? this.type;
    this.cronSchedule = event.cronSchedule ?? this.cronSchedule;
    this.status = event.status ?? this.status;
    this.metadata = event.metadata ?? this.metadata;
    this.completed = event.completed;
    this.results = event.results;
    this.appId = event.appId ?? this.appId;
  }

  @EventHandler(AppScheduledJobFailedEvent)
  onAppScheduledJobFailedEvent(event: AppScheduledJobFailedEvent) {
    this.id = AppScheduledJobId.from(event.id);
    this.tenantId = event.tenantId ?? this.tenantId;
    this.workspaceId = event.workspaceId ?? this.workspaceId;
    this.name = event.name ?? this.name;
    this.type = event.type ?? this.type;
    this.cronSchedule = event.cronSchedule ?? this.cronSchedule;
    this.status = event.status ?? this.status;
    this.metadata = event.metadata ?? this.metadata;
    this.failed = event.failed;
    this.results = event.results;
    this.appId = event.appId ?? this.appId;
  }
}
