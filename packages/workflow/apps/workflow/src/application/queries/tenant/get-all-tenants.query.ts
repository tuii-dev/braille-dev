/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TenantDto } from '../../../../../../libs/common/src/shared/event-sourcing/application/dtos/tenant/tenant.dto';
import { TenantRepository } from '@app/common/shared/event-sourcing/application/repositories';

export class GetAllTenantsQuery implements IQuery {
  constructor() {}
}

@QueryHandler(GetAllTenantsQuery)
export class GetAllTenantsQueryHandler implements IQueryHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    @InjectPinoLogger(GetAllTenantsQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(_: GetAllTenantsQuery): Promise<TenantDto[]> {
    this.logger.info(`Reading all tenants`);
    const tenants = await this.tenantRepository.getAll();

    return tenants.map((tenant) => tenant.toDto());
  }
}
