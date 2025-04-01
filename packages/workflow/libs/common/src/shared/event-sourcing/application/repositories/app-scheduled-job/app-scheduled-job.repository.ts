import { Injectable } from '@nestjs/common';
import { EventStore, EventStream } from '@ocoda/event-sourcing';
import { AppScheduledJobSnapshotRepository } from '../../../domain/models/app-scheduled-job/app-scheduled-job.snapshot-repository';
import { AppScheduledJob } from '../../../domain/models/app-scheduled-job/app-scheduled-job.aggregate';
import { AppScheduledJobId } from '../../../domain/models/app-scheduled-job/app-scheduled-job-id';

@Injectable()
export class AppScheduledJobRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly appScheduledJobSnapshotRepository: AppScheduledJobSnapshotRepository,
  ) {}

  async getById(
    tenantId: string,
    appScheduledJobId: AppScheduledJobId,
    workspaceId?: string,
    appId?: string,
  ): Promise<AppScheduledJob | undefined> {
    const eventStream = EventStream.for<AppScheduledJob>(
      AppScheduledJob,
      appScheduledJobId,
    );

    // Load the workflow execution snapshot from the snapshot store.
    const job = await this.appScheduledJobSnapshotRepository.load(
      appScheduledJobId,
      // tenantId,
    );

    if (!job) {
      return undefined;
    }

    // Get the events from the event store starting from the next version of the loaded snapshot.
    // This will give us all the events that have occurred since the last snapshot was taken.
    const eventCursor = this.eventStore.getEvents(eventStream, {
      fromVersion: job.version + 1,
      // pool: tenantId,
    });

    await job.loadFromHistory(eventCursor);

    // If the execution version is less than 1, that means there are no events in the event store for this
    // execution. This can happen if the execution was just created and no events have been published yet.
    // In this case, we return undefined to indicate that the execution does not exist.
    if (job.version < 1) {
      return undefined;
    }

    if (workspaceId && workspaceId !== job.workspaceId) {
      return undefined;
    }

    if (appId && job.appId !== appId) {
      return undefined;
    }

    return job;
  }

  async getByIds(
    tenantId: string,
    appScheduledJobIds: AppScheduledJobId[],
    workspaceId?: string,
    appId?: string,
  ) {
    const jobs = await this.appScheduledJobSnapshotRepository.loadMany(
      appScheduledJobIds,
      // tenantId,
    );

    for (const job of jobs) {
      // Create an event stream for this workflow execution.
      //
      // The event stream is the stream of events that are associated with this workflow execution.
      // The event stream is used to load the events from the event store.
      const eventStream = EventStream.for<AppScheduledJob>(
        AppScheduledJob,
        job.id,
      );
      // Load the events from the event store starting from the next version of the loaded snapshot.
      //
      // The event stream is the stream of events that are associated with this workflow execution.
      // The event stream is used to load the events from the event store.
      //
      // The options for the getEvents method are:
      // - fromVersion: The starting version of the events to load. This is set to the next version of the loaded snapshot
      //   so that we can load the events that have occurred since the last snapshot was taken.
      // - pool: The pool to load the events from. This is set to the tenant ID so that we can load the events for the
      //   workflow execution for the given tenant.
      const eventCursor = this.eventStore.getEvents(eventStream, {
        fromVersion: job.version + 1,
        // pool: tenantId,
      });
      await job.loadFromHistory(eventCursor);

      if (job.version < 1) {
        continue;
      }

      if (workspaceId && workspaceId !== job.workspaceId) {
        continue;
      }

      if (appId && job.appId !== appId) {
        continue;
      }

      jobs.push(job);
    }

    return jobs;
  }

  /**
   * Retrieves all workflow executions from the event store.
   *
   * This function works by:
   * 1. Loading all the workflow execution snapshots from the snapshot store.
   * 2. Loading the events from the event store starting from the next version of the loaded snapshot.
   * 3. Loading the events into the workflow execution using the loadFromHistory method.
   *
   * @param executionId The execution ID for the workflow executions to load. If undefined, all workflow executions are loaded.
   * @param limit The maximum number of workflow executions to load. If undefined, all workflow executions are loaded.
   *
   * @returns The loaded workflow executions.
   */
  async getAll(
    tenantId: string,
    workspaceId?: string,
    appId?: string,
    appScheduledJobId?: AppScheduledJobId,
    limit?: number,
  ): Promise<AppScheduledJob[]> {
    const jobs: AppScheduledJob[] = [];
    // The for await loop is used to iterate over the workflow execution snapshots
    // in the snapshot store. The loop will iterate over the snapshots in the
    // order they were written to the snapshot store. The `envelopes` variable is
    // an array of objects that contain the metadata (version, aggregateId, tenantId)
    // and the payload (the snapshot data) for each snapshot. The `loadAll` method
    // of the snapshot repository will return an iterator that yields the envelopes
    // for each snapshot in the order they were written to the snapshot store.
    //
    // The `aggregateId` option is used to filter the snapshots by the execution ID.
    // If `aggregateId` is not provided, all workflow execution snapshots will be
    // loaded. The `limit` option is used to limit the number of snapshots that are
    // loaded. If `limit` is not provided, all workflow execution snapshots will be
    // loaded.
    for await (const envelopes of this.appScheduledJobSnapshotRepository.loadAll(
      {
        aggregateId: appScheduledJobId,
        limit,
        // pool: tenantId,
      },
    )) {
      for (const envelope of envelopes) {
        const { metadata, payload } = envelope;
        // metadata is an object that contains the version, aggregateId, and tenantId
        // of the snapshot.
        // payload is an object that contains the snapshot data for the workflow execution.
        const id = AppScheduledJobId.from(metadata.aggregateId);
        const eventStream = EventStream.for<AppScheduledJob>(
          AppScheduledJob,
          id,
        );
        // Deserialize the snapshot payload into a WorkflowExecution object.
        // This will give us the workflow execution with the latest snapshot data.
        const job = this.appScheduledJobSnapshotRepository.deserialize(payload);

        const eventCursor = this.eventStore.getEvents(eventStream, {
          fromVersion: metadata.version + 1,
          // pool: tenantId,
        });

        await job.loadFromHistory(eventCursor);

        if (workspaceId && job.workspaceId !== workspaceId) {
          continue;
        }

        if (appId && job.appId !== appId) {
          continue;
        }

        jobs.push(job);
      }
    }

    return jobs;
  }

  /**
   * Save the workflow execution to the event store and snapshot store.
   *
   * This function works by:
   * 1. Committing the events from the workflow execution. This will give us the events
   *    that have occurred on the workflow execution since the last snapshot was taken.
   * 2. Appending the events to the event store. This will store the events in the event
   *    store so that they can be loaded later.
   * 3. Saving the snapshot of the workflow execution to the snapshot store. This will
   *    store the latest snapshot of the workflow execution in the snapshot store.
   *
   * @param execution The workflow execution to save.
   */
  async save(tenantId: string, job: AppScheduledJob): Promise<void> {
    const events = job.commit();
    const stream = EventStream.for<AppScheduledJob>(AppScheduledJob, job.id);

    // The version of the workflow execution is used to determine the starting point for
    // appending the events to the event store. The version is the version of the
    // workflow execution that is being saved. The events that are passed to the
    // appendEvents method are the events that have occurred on the workflow
    // execution since the last snapshot was taken. The version is used to
    // determine the correct position in the event stream to append the events.
    await this.eventStore.appendEvents(stream, job.version, events); //, tenantId);
    await this.appScheduledJobSnapshotRepository.save(job.id, job); //, tenantId);
  }
}
