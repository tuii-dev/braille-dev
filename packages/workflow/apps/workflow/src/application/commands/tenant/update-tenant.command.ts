import { TenantDto } from '@app/common/shared/event-sourcing/application/dtos/tenant/tenant.dto';
import { TenantRepository } from '@app/common/shared/event-sourcing/application/repositories';
import { TenantId } from '@app/common/shared/event-sourcing/domain/models';
import { TenantNotFoundException } from '@app/domain/exceptions';
import { Injectable } from '@nestjs/common';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class UpdateTenantCommand implements ICommand {
  constructor(public readonly tenantDto: TenantDto) {}
}

@Injectable()
@CommandHandler(UpdateTenantCommand)
export class UpdateTenantCommandHandler implements ICommandHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    @InjectPinoLogger(UpdateTenantCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: UpdateTenantCommand): Promise<TenantDto> {
    this.logger.info(`Creating tenant ID: ${command.tenantDto.id}`);

    const tenantId = TenantId.from(command.tenantDto.id);
    const tenant = await this.tenantRepository.getById(tenantId);

    if (!tenant) {
      throw TenantNotFoundException.withId(tenantId);
    }

    tenant.update({
      name: command.tenantDto.name,
      address: command.tenantDto.address,
      city: command.tenantDto.city,
      state: command.tenantDto.state,
      country: command.tenantDto.country,
      postalCode: command.tenantDto.postalCode,
      contactPerson: command.tenantDto.contactPerson,
      phoneNumber: command.tenantDto.phoneNumber,
      email: command.tenantDto.email,
      operations: command.tenantDto.operations,
    });

    await this.tenantRepository.save(tenant);

    return tenant.toDto();
  }
}
