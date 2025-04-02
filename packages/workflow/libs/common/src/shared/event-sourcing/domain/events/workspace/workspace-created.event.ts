import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('workspace-created')
export class WorkspaceCreatedEvent implements IEvent {
  constructor(
    public readonly workspaceId: string,
    public readonly tenantId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly created?: Date,
  ) {}
}
