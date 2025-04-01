import { WorkspaceId } from '@app/common/shared/event-sourcing/domain/models/workspace/workspace-id';
import { Workspace } from '@app/common/shared/event-sourcing/domain/models/workspace/workspace.aggregate';
import { WorkspaceSnapshotRepository } from '@app/common/shared/event-sourcing/domain/models/workspace/workspace.snapshot-repository';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: DI
import { EventStore, EventStream } from '@ocoda/event-sourcing';
// biome-ignore lint/style/useImportType: DI

@Injectable()
export class WorkspaceRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly workspaceSnapshotRepository: WorkspaceSnapshotRepository,
  ) {}

  async getById(
    tenantId: string,
    workspaceId: WorkspaceId,
  ): Promise<Workspace | undefined> {
    const eventStream = EventStream.for<Workspace>(Workspace, workspaceId);

    // Load the workflow execution snapshot from the snapshot store.
    const workspace = await this.workspaceSnapshotRepository.load(
      workspaceId,
      // tenantId,
    );

    if (!workspace) {
      return undefined;
    }

    // Get the events from the event store starting from the next version of the loaded snapshot.
    // This will give us all the events that have occurred since the last snapshot was taken.
    const eventCursor = this.eventStore.getEvents(eventStream, {
      fromVersion: workspace.version + 1,
      // pool: tenantId,
    });

    await workspace.loadFromHistory(eventCursor);

    // If the execution version is less than 1, that means there are no events in the event store for this
    // execution. This can happen if the execution was just created and no events have been published yet.
    // In this case, we return undefined to indicate that the execution does not exist.
    if (workspace.version < 1) {
      return undefined;
    }

    return workspace;
  }

  async getByIds(tenantId: string, workspaceIds: WorkspaceId[]) {
    const workspaces = await this.workspaceSnapshotRepository.loadMany(
      workspaceIds,
      // tenantId,
    );

    for (const workspace of workspaces) {
      // Create an event stream for this workflow execution.
      //
      // The event stream is the stream of events that are associated with this workflow execution.
      // The event stream is used to load the events from the event store.
      const eventStream = EventStream.for<Workspace>(workspace, workspace.id);
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
        fromVersion: workspace.version + 1,
        // pool: tenantId,
      });
      await workspace.loadFromHistory(eventCursor);

      if (workspace.version < 1) {
        continue;
      }

      workspaces.push(workspace);
    }

    return workspaces;
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
    workspaceId?: WorkspaceId,
    limit?: number,
  ): Promise<Workspace[]> {
    const workspaces: Workspace[] = [];
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
    for await (const envelopes of this.workspaceSnapshotRepository.loadAll({
      aggregateId: workspaceId,
      limit,
      // pool: tenantId,
    })) {
      for (const envelope of envelopes) {
        const { metadata, payload } = envelope;
        // metadata is an object that contains the version, aggregateId, and tenantId
        // of the snapshot.
        // payload is an object that contains the snapshot data for the workflow execution.
        const id = WorkspaceId.from(metadata.aggregateId);
        const eventStream = EventStream.for<Workspace>(Workspace, id);
        // Deserialize the snapshot payload into a WorkflowExecution object.
        // This will give us the workflow execution with the latest snapshot data.
        const workspace = this.workspaceSnapshotRepository.deserialize(payload);

        const eventCursor = this.eventStore.getEvents(eventStream, {
          fromVersion: metadata.version + 1,
          // pool: tenantId,
        });

        await workspace.loadFromHistory(eventCursor);

        workspaces.push(workspace);
      }
    }

    return workspaces;
  }

  async save(tenantId: string, workspace: Workspace): Promise<void> {
    const events = workspace.commit();
    const workspaceId = workspace.id;
    const stream = EventStream.for<Workspace>(Workspace, workspaceId);

    // The version of the workflow execution is used to determine the starting point for
    // appending the events to the event store. The version is the version of the
    // workflow execution that is being saved. The events that are passed to the
    // appendEvents method are the events that have occurred on the workflow
    // execution since the last snapshot was taken. The version is used to
    // determine the correct position in the event stream to append the events.
    await this.eventStore.appendEvents(
      stream,
      workspace.version,
      events,
      // tenantId,
    );
    await this.workspaceSnapshotRepository.save(
      workspaceId,
      workspace,
      // tenantId,
    );
  }
}
