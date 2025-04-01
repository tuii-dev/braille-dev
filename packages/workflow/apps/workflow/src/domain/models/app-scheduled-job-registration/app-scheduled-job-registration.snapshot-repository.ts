/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ISnapshot,
  Snapshot,
  SnapshotRepository,
} from '@ocoda/event-sourcing';
import { AppScheduledJobRegistration } from './app-scheduled-job-registration.aggregate';
import { AppScheduledJobRegistrationId } from './app-scheduled-job-registration-id';

@Snapshot(AppScheduledJobRegistration, {
  name: 'appScheduledJobRegistration',
  interval: 5,
})
export class AppScheduledJobRegistrationSnapshotRepository extends SnapshotRepository<AppScheduledJobRegistration> {
  serialize({
    id,
    tenantId,
    workspaceId,
    name,
    type,
    schedulingType,
    cronSchedule,
    metadata,
    isActive,
    runImmediately,
    isPaused,
    isDeleted,
    created,
    updated,
    deleted,
    appId,
  }: AppScheduledJobRegistration): ISnapshot<AppScheduledJobRegistration> {
    return {
      id: id.value,
      tenantId,
      workspaceId,
      name,
      type,
      schedulingType,
      cronSchedule,
      metadata,
      isActive,
      runImmediately,
      isPaused,
      isDeleted,
      created,
      updated,
      deleted,
      appId,
    };
  }
  deserialize({
    id,
    tenantId,
    workspaceId,
    name,
    type,
    schedulingType,
    cronSchedule,
    metadata,
    isActive,
    runImmediately,
    isPaused,
    isDeleted,
    created,
    updated,
    deleted,
    appId,
  }: ISnapshot<AppScheduledJobRegistration>): AppScheduledJobRegistration {
    const registration = new AppScheduledJobRegistration();
    registration.id = AppScheduledJobRegistrationId.from(id);
    registration.tenantId = tenantId;
    registration.workspaceId = workspaceId;
    registration.name = name;
    registration.type = type;
    registration.schedulingType = schedulingType;
    registration.cronSchedule = cronSchedule;
    registration.metadata = metadata;
    registration.isActive = isActive;
    registration.runImmediately = runImmediately;
    registration.isPaused = isPaused;
    registration.isDeleted = isDeleted;
    registration.created = created;
    registration.updated = updated;
    registration.deleted = deleted;
    registration.appId = appId;
    return registration;
  }
}
