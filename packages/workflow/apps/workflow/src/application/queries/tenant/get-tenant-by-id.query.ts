import { TenantDto } from '@app/common/shared/event-sourcing/application/dtos/tenant/tenant.dto';
import { TenantRepository } from '@app/common/shared/event-sourcing/application/repositories';
import { TenantId } from '@app/common/shared/event-sourcing/domain/models';
import { TenantNotFoundException } from '@app/domain/exceptions';
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class GetTenantByIdQuery implements IQuery {
  constructor(public readonly tenantId: string) {}
}

@QueryHandler(GetTenantByIdQuery)
export class GetTenantByIdQueryHandler implements IQueryHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    @InjectPinoLogger(GetTenantByIdQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: GetTenantByIdQuery): Promise<TenantDto> {
    const tenantId = TenantId.from(command.tenantId);
    this.logger.info(`Reading tenant ID: ${tenantId.value} for tenant`);

    const tenant = await this.tenantRepository.getById(tenantId);

    if (!tenant) {
      throw TenantNotFoundException.withId(tenantId);
    }

    return tenant.toDto();
  }
}
