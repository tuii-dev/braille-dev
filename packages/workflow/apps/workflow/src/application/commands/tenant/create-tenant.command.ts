import { TenantDto } from '@app/common/shared/event-sourcing/application/dtos/tenant/tenant.dto';
import { TenantRepository } from '@app/common/shared/event-sourcing/application/repositories';
import {
  Tenant,
  TenantId,
} from '@app/common/shared/event-sourcing/domain/models';
import { Injectable } from '@nestjs/common';
// import {
//   DynamoDBEventStore,
//   DynamoDBSnapshotStore,
// } from '@ocoda/event-sourcing-dynamodb';
// import { EventStore, SnapshotStore } from '@ocoda/event-sourcing';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class CreateTenantCommand implements ICommand {
  constructor(public readonly tenantDto: TenantDto) {}
}

@Injectable()
@CommandHandler(CreateTenantCommand)
export class CreateTenantCommandHandler implements ICommandHandler {
  constructor(
    private readonly tenantRepository: TenantRepository,
    // @Inject(EventStore)
    // private readonly eventStore: EventStore,
    // @Inject(SnapshotStore)
    // private readonly snapshotStore: SnapshotStore,
    @InjectPinoLogger(CreateTenantCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreateTenantCommand): Promise<TenantDto> {
    this.logger.info(`Creating tenant: ${command.tenantDto.name}`);

    const tenantId = TenantId.generate();

    const tenant = Tenant.create({
      tenantId,
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

    // const id = tenant.id.value;
    // await (this.eventStore as DynamoDBEventStore).ensureCollection(id, {
    //   BillingMode: 'PAY_PER_REQUEST',
    //   ProvisionedThroughput: {
    //     ReadCapacityUnits: 1,
    //     WriteCapacityUnits: 1,
    //   },
    // });
    // await (this.snapshotStore as DynamoDBSnapshotStore).ensureCollection(id, {
    //   BillingMode: 'PAY_PER_REQUEST',
    //   ProvisionedThroughput: {
    //     ReadCapacityUnits: 1,
    //     WriteCapacityUnits: 1,
    //   },
    // });

    await this.tenantRepository.save(tenant);

    return tenant.toDto();
  }
}
