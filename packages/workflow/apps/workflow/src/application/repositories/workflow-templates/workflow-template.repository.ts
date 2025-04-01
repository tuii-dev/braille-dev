import { WorkflowTemplateId } from '@app/domain/models/workflow-templates/workflow-template-id';
import { WorkflowTemplate } from '@app/domain/models/workflow-templates/workflow-template.aggregate';
import { WorkflowTemplateSnapshotRepository } from '@app/domain/models/workflow-templates/workflow-template.snapshot-repository';
import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: DI
import { EventStore, EventStream } from '@ocoda/event-sourcing';

@Injectable()
export class WorkflowTemplateRepository {
  constructor(
    private readonly eventStore: EventStore,
    private readonly workflowTemplateSnapshotRepository: WorkflowTemplateSnapshotRepository,
  ) {}

  async getById(
    tenantId: string,
    templateId: WorkflowTemplateId,
    workspaceId?: string,
    appId?: string,
  ): Promise<WorkflowTemplate | undefined> {
    const eventStream = EventStream.for<WorkflowTemplate>(
      WorkflowTemplate,
      templateId,
    );

    // Load the workflow execution snapshot from the snapshot store.
    const template = await this.workflowTemplateSnapshotRepository.load(
      templateId,
      // tenantId,
    );

    if (!template) {
      return undefined;
    }

    // Get the events from the event store starting from the next version of the loaded snapshot.
    // This will give us all the events that have occurred since the last snapshot was taken.
    const eventCursor = this.eventStore.getEvents(eventStream, {
      fromVersion: template.version + 1,
      // pool: tenantId,
    });

    await template.loadFromHistory(eventCursor);

    // If the execution version is less than 1, that means there are no events in the event store for this
    // execution. This can happen if the execution was just created and no events have been published yet.
    // In this case, we return undefined to indicate that the execution does not exist.
    if (template.version < 1) {
      return undefined;
    }

    if (workspaceId && workspaceId !== template.workspaceId) {
      return undefined;
    }

    if (appId && appId !== template.appId) {
      return undefined;
    }

    return template;
  }

  async getByIds(tenantId: string, workflowTemplateIds: WorkflowTemplateId[]) {
    const templates = await this.workflowTemplateSnapshotRepository.loadMany(
      workflowTemplateIds,
      // tenantId,
    );

    for (const template of templates) {
      // Create an event stream for this workflow execution.
      //
      // The event stream is the stream of events that are associated with this workflow execution.
      // The event stream is used to load the events from the event store.
      const eventStream = EventStream.for<WorkflowTemplate>(
        WorkflowTemplate,
        template.templateId,
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
        fromVersion: template.version + 1,
        // pool: tenantId,
      });
      await template.loadFromHistory(eventCursor);

      if (template.version < 1) {
        continue;
      }

      templates.push(template);
    }

    return templates;
  }

  async getAll(
    tenantId: string,
    workspaceId?: string,
    appId?: string,
    workflowTemplateId?: WorkflowTemplateId,
    limit?: number,
  ): Promise<WorkflowTemplate[]> {
    const templates: WorkflowTemplate[] = [];
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
    for await (const envelopes of this.workflowTemplateSnapshotRepository.loadAll(
      {
        aggregateId: workflowTemplateId,
        limit,
        // pool: tenantId,
      },
    )) {
      for (const envelope of envelopes) {
        const { metadata, payload } = envelope;
        // metadata is an object that contains the version, aggregateId, and tenantId
        // of the snapshot.
        // payload is an object that contains the snapshot data for the workflow execution.
        const id = WorkflowTemplateId.from(metadata.aggregateId);
        const eventStream = EventStream.for<WorkflowTemplate>(
          WorkflowTemplate,
          id,
        );
        // Deserialize the snapshot payload into a WorkflowExecution object.
        // This will give us the workflow execution with the latest snapshot data.
        const template =
          this.workflowTemplateSnapshotRepository.deserialize(payload);

        const eventCursor = this.eventStore.getEvents(eventStream, {
          fromVersion: metadata.version + 1,
          // pool: tenantId,
        });

        await template.loadFromHistory(eventCursor);

        if (appId && template.appId !== appId) {
          continue;
        }

        if (workspaceId && template.workspaceId !== workspaceId) {
          continue;
        }

        templates.push(template);
      }
    }

    return templates;
  }

  async save(tenantId: string, template: WorkflowTemplate): Promise<void> {
    const events = template.commit();
    const stream = EventStream.for<WorkflowTemplate>(
      WorkflowTemplate,
      template.templateId,
    );

    // The version of the workflow execution is used to determine the starting point for
    // appending the events to the event store. The version is the version of the
    // workflow execution that is being saved. The events that are passed to the
    // appendEvents method are the events that have occurred on the workflow
    // execution since the last snapshot was taken. The version is used to
    // determine the correct position in the event stream to append the events.
    await this.eventStore.appendEvents(
      stream,
      template.version,
      events,
      // tenantId,
    );
    await this.workflowTemplateSnapshotRepository.save(
      template.templateId,
      template,
      // tenantId,
    );
  }
}
