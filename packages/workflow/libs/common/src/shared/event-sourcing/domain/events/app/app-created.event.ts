import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('app-created')
export class AppCreatedEvent implements IEvent {
  constructor(
    public readonly appId: string,
    public readonly tenantId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly created?: Date,
  ) {}
}
