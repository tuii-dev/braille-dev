/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ISnapshot,
  Snapshot,
  SnapshotRepository,
} from '@ocoda/event-sourcing';
import { App } from './app.aggregate';
import { AppId } from './app-id';

@Snapshot(App, { name: 'app', interval: 5 })
export class AppSnapshotRepository extends SnapshotRepository<App> {
  serialize({
    id,
    tenantId,
    name,
    description,
    created,
    updated,
  }: App): ISnapshot<App> {
    return {
      id: id.value,
      tenantId,
      name,
      description,
      created: created ? created.toISOString() : undefined,
      updated: updated ? updated.toISOString() : undefined,
    };
  }
  deserialize({
    id,
    tenantId,
    name,
    description,
    created,
    updated,
  }: ISnapshot<App>): App {
    const app = new App();

    app.id = AppId.from(id as string);
    app.tenantId = tenantId;
    app.name = name;
    app.description = description;
    app.created = created ? new Date(created as string) : new Date();
    app.updated = updated ? new Date(updated as string) : new Date();

    return app;
  }
}
