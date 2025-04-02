import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: DI
import { EventStore, EventStream } from '@ocoda/event-sourcing';
import {
  TenantId,
  TenantSnapshotRepository,
  Tenant,
} from '../../../domain/models';
// biome-ignore lint/style/useImportType: DI

@Injectable()
export class TenantRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly tenantSnapshotRepository: TenantSnapshotRepository,
  ) {}

  async getById(tenantId: TenantId): Promise<Tenant | undefined> {
    const eventStream = EventStream.for<Tenant>(Tenant, tenantId);

    // Load the workflow execution snapshot from the snapshot store.
    const tenant = await this.tenantSnapshotRepository.load(tenantId);

    if (!tenant) {
      return undefined;
    }

    // Get the events from the event store starting from the next version of the loaded snapshot.
    // This will give us all the events that have occurred since the last snapshot was taken.
    const eventCursor = this.eventStore.getEvents(eventStream, {
      fromVersion: tenant.version + 1,
    });

    await tenant.loadFromHistory(eventCursor);

    // If the execution version is less than 1, that means there are no events in the event store for this
    // execution. This can happen if the execution was just created and no events have been published yet.
    // In this case, we return undefined to indicate that the execution does not exist.
    if (tenant.version < 1) {
      return undefined;
    }

    return tenant;
  }

  async getByIds(tenantId: TenantId, tenantIds: TenantId[]) {
    const tenants = await this.tenantSnapshotRepository.loadMany(tenantIds);

    for (const tenant of tenants) {
      // Create an event stream for this workflow execution.
      //
      // The event stream is the stream of events that are associated with this workflow execution.
      // The event stream is used to load the events from the event store.
      const eventStream = EventStream.for<Tenant>(tenant, tenantId);
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
        fromVersion: tenant.version + 1,
      });
      await tenant.loadFromHistory(eventCursor);
    }

    return tenants;
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
  async getAll(tenantId?: TenantId, limit?: number): Promise<Tenant[]> {
    const tenants: Tenant[] = [];
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
    for await (const envelopes of this.tenantSnapshotRepository.loadAll({
      aggregateId: tenantId,
      limit,
    })) {
      for (const envelope of envelopes) {
        const { metadata, payload } = envelope;
        // metadata is an object that contains the version, aggregateId, and tenantId
        // of the snapshot.
        // payload is an object that contains the snapshot data for the workflow execution.
        const id = TenantId.from(metadata.aggregateId);
        const eventStream = EventStream.for<Tenant>(Tenant, id);
        // Deserialize the snapshot payload into a WorkflowExecution object.
        // This will give us the workflow execution with the latest snapshot data.
        const tenant = this.tenantSnapshotRepository.deserialize(payload);

        const eventCursor = this.eventStore.getEvents(eventStream, {
          fromVersion: metadata.version + 1,
        });

        await tenant.loadFromHistory(eventCursor);

        tenants.push(tenant);
      }
    }

    return tenants;
  }

  async save(tenant: Tenant): Promise<void> {
    const events = tenant.commit();
    const tenantId = tenant.id;
    const stream = EventStream.for<Tenant>(Tenant, tenantId);

    // The version of the workflow execution is used to determine the starting point for
    // appending the events to the event store. The version is the version of the
    // workflow execution that is being saved. The events that are passed to the
    // appendEvents method are the events that have occurred on the workflow
    // execution since the last snapshot was taken. The version is used to
    // determine the correct position in the event stream to append the events.
    await this.eventStore.appendEvents(stream, tenant.version, events);
    await this.tenantSnapshotRepository.save(tenantId, tenant);
  }
}
