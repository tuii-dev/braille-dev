/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type ISnapshot,
  Snapshot,
  SnapshotRepository,
} from '@ocoda/event-sourcing';
import { Tenant } from './tenant.aggregate';
import { TenantId } from './tenant-id';

@Snapshot(Tenant, { name: 'tenant', interval: 5 })
export class TenantSnapshotRepository extends SnapshotRepository<Tenant> {
  serialize({
    id,
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
    created,
    updated,
  }: Tenant): ISnapshot<Tenant> {
    return {
      id: id.value,
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
      created: created ? created.toISOString() : undefined,
      updated: updated ? updated.toISOString() : undefined,
    };
  }
  deserialize({
    id,
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
    created,
    updated,
  }: ISnapshot<Tenant>): Tenant {
    const tenant = new Tenant();

    tenant.id = TenantId.from(id as string);
    tenant.name = name;
    tenant.address = address;
    tenant.city = city;
    tenant.state = state;
    tenant.country = country;
    tenant.postalCode = postalCode;
    tenant.contactPerson = contactPerson;
    tenant.phoneNumber = phoneNumber;
    tenant.email = email;
    tenant.operations = operations;
    tenant.created = created ? new Date(created as string) : new Date();
    tenant.updated = updated ? new Date(updated as string) : new Date();

    return tenant;
  }
}
