import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';

import { PinoLogger } from 'nestjs-pino';
import { TenantId } from './tenant-id';
import { TenantDto } from '@app/common/shared/event-sourcing/application/dtos/tenant/tenant.dto';
import { TenantCreatedEvent, TenantUpdatedEvent } from '../../events';

@Aggregate({ streamName: 'tenant' })
export class Tenant extends AggregateRoot {
  private static logger: PinoLogger;

  public static setLogger(logger: PinoLogger) {
    Tenant.logger = logger;
  }

  public id: TenantId;
  public name?: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public country?: string;
  public postalCode?: string;
  public contactPerson?: string;
  public phoneNumber?: string;
  public email?: string;
  public created?: Date;
  public updated?: Date;
  public operations?: number;

  public static create({
    tenantId,
    name,
    address,
    city,
    state,
    country,
    postalCode,
    contactPerson,
    phoneNumber,
    email,
    operations,
  }: {
    tenantId: TenantId;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    operations?: number;
  }): Tenant {
    Tenant.logger.info(
      `Creating tenant with id: ${tenantId.value}, name: ${name}`,
    );
    const tenant = new Tenant();

    tenant.applyEvent(
      new TenantCreatedEvent(
        tenantId.value,
        name,
        address,
        city,
        state,
        country,
        postalCode,
        contactPerson,
        phoneNumber,
        email,
        operations,
        new Date(),
      ),
    );
    return tenant;
  }

  public update({
    name,
    address,
    city,
    state,
    country,
    postalCode,
    contactPerson,
    phoneNumber,
    email,
    operations,
  }: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    operations?: number;
  }): Tenant {
    Tenant.logger.info(`Updating tenant with name: ${name}`);

    this.applyEvent(
      new TenantUpdatedEvent(
        name,
        address,
        city,
        state,
        country,
        postalCode,
        contactPerson,
        phoneNumber,
        email,
        operations,
        new Date(),
      ),
    );

    return this;
  }

  toDto(): TenantDto {
    return TenantDto.from(this);
  }

  @EventHandler(TenantCreatedEvent)
  private onTenantCreated(event: TenantCreatedEvent) {
    this.id = TenantId.from(event.tenantId);
    this.name = event.name;
    this.address = event.address;
    this.city = event.city;
    this.state = event.state;
    this.country = event.country;
    this.postalCode = event.postalCode;
    this.contactPerson = event.contactPerson;
    this.phoneNumber = event.phoneNumber;
    this.email = event.email;
    this.operations = event.operations ?? 0;
    this.created = event.created ?? new Date();
  }

  @EventHandler(TenantUpdatedEvent)
  private onTenantUpdated(event: TenantUpdatedEvent) {
    this.name = event.name ?? this.name;
    this.address = event.address ?? this.address;
    this.city = event.city ?? this.city;
    this.state = event.state ?? this.state;
    this.country = event.country ?? this.country;
    this.postalCode = event.postalCode ?? this.postalCode;
    this.contactPerson = event.contactPerson ?? this.contactPerson;
    this.phoneNumber = event.phoneNumber ?? this.phoneNumber;
    this.email = event.email ?? this.email;
    this.operations = event.operations ?? this.operations;
    this.updated = event.updated ?? this.updated;
  }
}
