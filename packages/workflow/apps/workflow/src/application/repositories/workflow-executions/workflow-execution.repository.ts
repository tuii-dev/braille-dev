import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: DI
import { EventStore, EventStream } from '@ocoda/event-sourcing';
// biome-ignore lint/style/useImportType: DI

import { WorkflowExecutionId } from '@app/domain/models/workflow-executions/workflow-execution-id';
import { WorkflowExecution } from '@app/domain/models/workflow-executions/workflow-execution.aggregate';
import { WorkflowExecutionSnapshotRepository } from '@app/domain/models/workflow-executions/workflow-execution.snapshot-repository';

@Injectable()
export class WorkflowExecutionRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly workflowExecutionSnapshotRepository: WorkflowExecutionSnapshotRepository,
  ) {}

  /**
   * Retrieve a workflow execution from the event store.
   *
   * @param tenantId The tenant ID for the workflow execution.
   * @param executionId The execution ID for the workflow execution.
   *
   * @returns The loaded workflow execution or undefined if not found.
   */
  async getById(
    tenantId: string,
    executionId: WorkflowExecutionId,
    workspaceId?: string,
    appId?: string,
  ): Promise<WorkflowExecution | undefined> {
    const eventStream = EventStream.for<WorkflowExecution>(
      WorkflowExecution,
      executionId,
    );

    // Load the workflow execution snapshot from the snapshot store.
    const execution = await this.workflowExecutionSnapshotRepository.load(
      executionId,
      // tenantId,
    );

    if (!execution) {
      return undefined;
    }

    // Get the events from the event store starting from the next version of the loaded snapshot.
    // This will give us all the events that have occurred since the last snapshot was taken.
    const eventCursor = this.eventStore.getEvents(eventStream, {
      fromVersion: execution.version + 1,
      // pool: tenantId,
    });

    await execution.loadFromHistory(eventCursor);

    // If the execution version is less than 1, that means there are no events in the event store for this
    // execution. This can happen if the execution was just created and no events have been published yet.
    // In this case, we return undefined to indicate that the execution does not exist.
    if (execution.version < 1) {
      return undefined;
    }

    if (workspaceId && workspaceId !== execution.workspaceId) {
      return undefined;
    }

    if (appId && appId !== execution.appId) {
      return undefined;
    }

    return execution;
  }

  /**
   * Retrieves multiple workflow executions from the event store.
   *
   * This function works by:
   * 1. Loading the workflow execution snapshots from the snapshot store.
   * 2. Loading the events from the event store starting from the next version of the loaded snapshot.
   * 3. Loading the events into the workflow execution using the loadFromHistory method.
   *
   * @param tenantId The tenant ID for the workflow executions.
   * @param workflowExecutionIds The execution IDs for the workflow executions.
   *
   * @returns The loaded workflow executions.
   */
  async getByIds(
    tenantId: string,
    workflowExecutionIds: WorkflowExecutionId[],
  ) {
    const executions = await this.workflowExecutionSnapshotRepository.loadMany(
      workflowExecutionIds,
      // tenantId,
    );

    for (const execution of executions) {
      // Create an event stream for this workflow execution.
      //
      // The event stream is the stream of events that are associated with this workflow execution.
      // The event stream is used to load the events from the event store.
      const eventStream = EventStream.for<WorkflowExecution>(
        WorkflowExecution,
        execution.executionId,
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
        fromVersion: execution.version + 1,
        // pool: tenantId,
      });
      await execution.loadFromHistory(eventCursor);

      if (execution.version < 1) {
        continue;
      }

      executions.push(execution);
    }

    return executions;
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
    executionId?: WorkflowExecutionId,
    limit?: number,
  ): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];
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
    for await (const envelopes of this.workflowExecutionSnapshotRepository.loadAll(
      {
        aggregateId: executionId,
        limit,
        // pool: tenantId,
      },
    )) {
      for (const envelope of envelopes) {
        const { metadata, payload } = envelope;
        // metadata is an object that contains the version, aggregateId, and tenantId
        // of the snapshot.
        // payload is an object that contains the snapshot data for the workflow execution.
        const id = WorkflowExecutionId.from(metadata.aggregateId);
        const eventStream = EventStream.for<WorkflowExecution>(
          WorkflowExecution,
          id,
        );
        // Deserialize the snapshot payload into a WorkflowExecution object.
        // This will give us the workflow execution with the latest snapshot data.
        const execution =
          this.workflowExecutionSnapshotRepository.deserialize(payload);

        const eventCursor = this.eventStore.getEvents(eventStream, {
          fromVersion: metadata.version + 1,
          // pool: tenantId,
        });

        await execution.loadFromHistory(eventCursor);

        if (workspaceId && execution.workspaceId !== workspaceId) {
          continue;
        }

        if (appId && execution.appId !== appId) {
          continue;
        }

        executions.push(execution);
      }
    }

    return executions;
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
  async save(tenantId: string, execution: WorkflowExecution): Promise<void> {
    const events = execution.commit();
    const stream = EventStream.for<WorkflowExecution>(
      WorkflowExecution,
      execution.executionId,
    );

    // The version of the workflow execution is used to determine the starting point for
    // appending the events to the event store. The version is the version of the
    // workflow execution that is being saved. The events that are passed to the
    // appendEvents method are the events that have occurred on the workflow
    // execution since the last snapshot was taken. The version is used to
    // determine the correct position in the event stream to append the events.
    await this.eventStore.appendEvents(
      stream,
      execution.version,
      events,
      // tenantId,
    );
    await this.workflowExecutionSnapshotRepository.save(
      execution.executionId,
      execution,
      // tenantId,
    );
  }
}
