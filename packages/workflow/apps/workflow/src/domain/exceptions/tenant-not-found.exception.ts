import { TenantId } from '@app/common/shared/event-sourcing/domain/models';
import { DomainException } from '@ocoda/event-sourcing';

export class TenantNotFoundException extends DomainException {
  static withId(id: TenantId): TenantNotFoundException {
    return new TenantNotFoundException('Tenant not found', id);
  }
}
