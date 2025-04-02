import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('tenant-updated')
export class TenantUpdatedEvent implements IEvent {
  constructor(
    public readonly name?: string,
    public readonly address?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,
    public readonly postalCode?: string,
    public readonly contactPerson?: string,
    public readonly phoneNumber?: string,
    public readonly email?: string,
    public readonly operations?: number,
    public readonly updated?: Date,
  ) {}
}
