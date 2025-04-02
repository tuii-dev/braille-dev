/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';
import { PinoLogger } from 'nestjs-pino';
import { AppScheduledJobRegistrationId } from './app-scheduled-job-registration-id';
import { ScheduledJobType } from '@app/common/shared/types/scheduled-job-type';
import { AppScheduledJobRegistrationDto } from '../../../application/dtos/app-scheduled-job-registration/app-scheduled-job-registration.dto';
import { AppScheduledJobRegistrationCreatedEvent } from '../../../../../../libs/common/src/shared/event-sourcing/domain/events/app-scheduled-job-registration/app-scheduled-job-registration-created.event';
import { CronScheduleType } from '@app/common/shared/types/cron-schedule-type';
import { AppScheduledJobRegistrationUpdatedEvent } from '../../../../../../libs/common/src/shared/event-sourcing/domain/events/app-scheduled-job-registration/app-scheduled-job-registration-updated.event';
import { AppScheduledJobRegistrationDeletedEvent } from '../../../../../../libs/common/src/shared/event-sourcing/domain/events/app-scheduled-job-registration/app-scheduled-job-registration-deleted.event';
import { AppScheduledJobRegistrationPausedEvent } from '../../../../../../libs/common/src/shared/event-sourcing/domain/events/app-scheduled-job-registration/app-scheduled-job-registration-paused.event';
import { AppScheduledJobRegistrationResumedEvent } from '../../../../../../libs/common/src/shared/event-sourcing/domain/events/app-scheduled-job-registration/app-scheduled-job-registration-resumed.event';
import { ScheduledJobSchedulingType } from '@app/common/shared/types/scheduled-job-scheduling-type';

@Aggregate({ streamName: 'app-scheduled-job-registration' })
export class AppScheduledJobRegistration extends AggregateRoot {
  private static logger: PinoLogger;

  public static setLogger(logger: PinoLogger) {
    AppScheduledJobRegistration.logger = logger;
  }

  public id: AppScheduledJobRegistrationId;
  public tenantId: string;
  public workspaceId: string;
  public name: string;
  public type: ScheduledJobType;
  public schedulingType: ScheduledJobSchedulingType;
  public cronSchedule: CronScheduleType;
  public metadata: string;
  public isActive: boolean;
  public runImmediately: boolean;
  public isPaused: boolean;
  public isDeleted: boolean;
  public appId?: string;
  public created?: number;
  public updated?: number;
  public deleted?: number;

  static create({
    id,
    tenantId,
    workspaceId,
    name,
    type,
    schedulingType,
    cronSchedule,
    metadata,
    runImmediately,
    appId,
  }: {
    id: AppScheduledJobRegistrationId;
    tenantId: string;
    workspaceId: string;
    name: string;
    type: ScheduledJobType;
    schedulingType: ScheduledJobSchedulingType;
    cronSchedule: CronScheduleType;
    metadata: string;
    runImmediately: boolean;
    appId?: string;
  }): AppScheduledJobRegistration {
    const created = new Date().getTime();
    const aggregate = new AppScheduledJobRegistration();
    aggregate.id = id;
    aggregate.tenantId = tenantId;
    aggregate.workspaceId = workspaceId;
    aggregate.name = name;
    aggregate.type = type;
    aggregate.schedulingType = schedulingType;
    aggregate.cronSchedule = cronSchedule;
    aggregate.metadata = metadata;
    aggregate.runImmediately = runImmediately ?? false;
    aggregate.isActive = true;
    aggregate.isPaused = false;
    aggregate.isDeleted = false;
    aggregate.created = created;
    aggregate.appId = appId;

    aggregate.applyEvent(
      new AppScheduledJobRegistrationCreatedEvent(
        id.value,
        tenantId,
        workspaceId,
        name,
        type,
        schedulingType,
        cronSchedule,
        metadata,
        true,
        runImmediately ?? false,
        false,
        false,
        created,
        appId,
      ),
    );

    return aggregate;
  }

  update({
    name,
    type,
    schedulingType,
    cronSchedule,
    metadata,
    workspaceId,
    appId,
  }: {
    name?: string;
    type?: ScheduledJobType;
    schedulingType?: ScheduledJobSchedulingType;
    cronSchedule?: CronScheduleType;
    metadata?: string;
    workspaceId?: string;
    appId?: string;
  }) {
    this.applyEvent(
      new AppScheduledJobRegistrationUpdatedEvent(
        this.id.value,
        this.tenantId,
        workspaceId ?? this.workspaceId,
        appId ?? this.appId,
        name,
        type,
        schedulingType,
        cronSchedule,
        metadata,
        new Date().getTime(),
      ),
    );

    return this;
  }

  pause() {
    this.isPaused = true;
    this.updated = new Date().getTime();

    this.applyEvent(
      new AppScheduledJobRegistrationPausedEvent(
        this.id.value,
        this.tenantId,
        this.workspaceId,
        this.appId,
        true,
        new Date().getTime(),
      ),
    );

    return this;
  }
  resume() {
    this.isPaused = false;
    this.updated = new Date().getTime();

    this.applyEvent(
      new AppScheduledJobRegistrationResumedEvent(
        this.id.value,
        this.tenantId,
        this.workspaceId,
        this.appId,
        false,
        new Date().getTime(),
      ),
    );

    return this;
  }

  delete() {
    this.isDeleted = true;
    this.updated = new Date().getTime();

    this.applyEvent(
      new AppScheduledJobRegistrationDeletedEvent(
        this.id.value,
        this.tenantId,
        this.workspaceId,
        this.appId,
        true,
        new Date().getTime(),
      ),
    );

    return this;
  }

  toDto(): AppScheduledJobRegistrationDto {
    const dto = new AppScheduledJobRegistrationDto();
    dto.id = this.id.value;
    dto.tenantId = this.tenantId;
    dto.workspaceId = this.workspaceId;
    dto.appId = this.appId;
    dto.name = this.name;
    dto.type = this.type;
    dto.schedulingType = this.schedulingType;
    dto.cronSchedule = this.cronSchedule;
    dto.metadata = this.metadata;
    dto.isActive = this.isActive;
    dto.runImmediately = this.runImmediately;
    dto.isPaused = this.isPaused;
    dto.isDeleted = this.isDeleted;
    dto.created = this.created;
    dto.updated = this.updated;
    dto.deleted = this.deleted;
    return dto;
  }

  @EventHandler(AppScheduledJobRegistrationCreatedEvent)
  onAppScheduledJobRegistrationCreatedEvent(
    event: AppScheduledJobRegistrationCreatedEvent,
  ) {
    this.id = AppScheduledJobRegistrationId.from(event.id);
    this.tenantId = event.tenantId;
    this.workspaceId = event.workspaceId;
    this.appId = event.appId;
    this.name = event.name;
    this.type = event.type;
    this.schedulingType = event.schedulingType;
    this.cronSchedule = event.cronSchedule;
    this.metadata = event.metadata;
    this.isActive = event.isActive;
    this.isPaused = event.isPaused;
    this.isDeleted = event.isDeleted;
    this.created = event.created;
  }

  @EventHandler(AppScheduledJobRegistrationUpdatedEvent)
  onAppScheduledJobRegistrationUpdatedEvent(
    event: AppScheduledJobRegistrationUpdatedEvent,
  ) {
    this.id = AppScheduledJobRegistrationId.from(event.id);
    this.workspaceId = event.workspaceId ?? this.workspaceId;
    this.appId = event.appId ?? this.appId;
    this.name = event.name ?? this.name;
    this.type = event.type ?? this.type;
    this.schedulingType = event.schedulingType ?? this.schedulingType;
    this.cronSchedule = event.cronSchedule ?? this.cronSchedule;
    this.metadata = event.metadata ?? this.metadata;
    this.updated = event.updated;
  }

  @EventHandler(AppScheduledJobRegistrationPausedEvent)
  onAppScheduledJobRegistrationPausedEvent(
    event: AppScheduledJobRegistrationPausedEvent,
  ) {
    this.isPaused = event.isPaused ?? true;
    this.updated = event.updated;
  }

  @EventHandler(AppScheduledJobRegistrationResumedEvent)
  onAppScheduledJobRegistrationResumedEvent(
    event: AppScheduledJobRegistrationResumedEvent,
  ) {
    this.isPaused = event.isPaused ?? false;
    this.updated = event.updated;
  }

  @EventHandler(AppScheduledJobRegistrationDeletedEvent)
  onAppScheduledJobRegistrationDeletedEvent(
    event: AppScheduledJobRegistrationDeletedEvent,
  ) {
    this.isDeleted = event.isDeleted ?? true;
    this.deleted = event.deleted;
  }
}
