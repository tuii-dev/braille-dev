/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ISnapshot,
  Snapshot,
  SnapshotRepository,
} from '@ocoda/event-sourcing';
import { AppScheduledJob } from './app-scheduled-job.aggregate';
import { AppScheduledJobId } from './app-scheduled-job-id';

@Snapshot(AppScheduledJob, {
  name: 'appScheduledJob',
  interval: 5,
})
export class AppScheduledJobSnapshotRepository extends SnapshotRepository<AppScheduledJob> {
  serialize({
    id,
    tenantId,
    workspaceId,
    registrationId,
    name,
    type,
    schedulingType,
    cronSchedule,
    status,
    metadata,
    started,
    completed,
    failed,
    results,
    appId,
  }: AppScheduledJob): ISnapshot<AppScheduledJob> {
    return {
      id: id.value,
      tenantId,
      workspaceId,
      registrationId,
      name,
      type,
      schedulingType,
      cronSchedule,
      status,
      metadata,
      started,
      completed,
      failed,
      results,
      appId,
    };
  }
  deserialize({
    id,
    tenantId,
    workspaceId,
    registrationId,
    name,
    type,
    schedulingType,
    cronSchedule,
    status,
    metadata,
    started,
    completed,
    failed,
    results,
    appId,
  }: ISnapshot<AppScheduledJob>): AppScheduledJob {
    const registration = new AppScheduledJob();
    registration.id = AppScheduledJobId.from(id);
    registration.tenantId = tenantId;
    registration.workspaceId = workspaceId;
    registration.registrationId = registrationId;
    registration.name = name;
    registration.type = type;
    registration.schedulingType = schedulingType;
    registration.cronSchedule = cronSchedule;
    registration.status = status;
    registration.metadata = metadata;
    registration.started = started;
    registration.completed = completed;
    registration.failed = failed;
    registration.results = results;
    registration.appId = appId;
    return registration;
  }
}
