import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('app-updated')
export class AppUpdatedEvent implements IEvent {
  constructor(
    public readonly name?: string,
    public readonly description?: string,
    public readonly updated?: Date,
  ) {}
}
