/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ISnapshot,
  Snapshot,
  SnapshotRepository,
} from '@ocoda/event-sourcing';
import { WorkspaceId } from './workspace-id';
import { Workspace } from './workspace.aggregate';

@Snapshot(Workspace, { name: 'workspace', interval: 5 })
export class WorkspaceSnapshotRepository extends SnapshotRepository<Workspace> {
  serialize({
    id,
    tenantId,
    appId,
    name,
    description,
    created,
    updated,
  }: Workspace): ISnapshot<Workspace> {
    return {
      id: id.value,
      tenantId,
      appId,
      name,
      description,
      created: created ? created.toISOString() : undefined,
      updated: updated ? updated.toISOString() : undefined,
    };
  }
  deserialize({
    id,
    tenantId,
    appId,
    name,
    description,
    created,
    updated,
  }: ISnapshot<Workspace>): Workspace {
    const app = new Workspace();

    app.id = WorkspaceId.from(id as string);
    app.tenantId = tenantId;
    app.appId = appId;
    app.name = name;
    app.description = description;
    app.created = created ? new Date(created as string) : new Date();
    app.updated = updated ? new Date(updated as string) : new Date();

    return app;
  }
}
