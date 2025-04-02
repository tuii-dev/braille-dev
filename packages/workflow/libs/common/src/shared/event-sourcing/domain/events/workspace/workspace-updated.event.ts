import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('workspace-updated')
export class WorkspaceUpdatedEvent implements IEvent {
  constructor(
    public readonly name?: string,
    public readonly description?: string,
    public readonly updated?: Date,
  ) {}
}
