/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Header,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@ocoda/event-sourcing';

import { CreateTenantCommand, UpdateTenantCommand } from '../commands';
import { GetTenantByIdQuery, GetAllTenantsQuery } from '../queries';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { TenantDto } from '../../../../../libs/common/src/shared/event-sourcing/application/dtos/tenant/tenant.dto';

@Controller('tenants')
export class TenantController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(TenantController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getAllTenants(): Promise<TenantDto[]> {
    return this.queryBus.execute(new GetAllTenantsQuery());
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  async getTenant(@Param('id') id: string): Promise<TenantDto> {
    return this.queryBus.execute(new GetTenantByIdQuery(id));
  }

  @Post()
  async createTenant(
    @Body()
    body: TenantDto,
  ): Promise<TenantDto> {
    body.operations = body.operations || 5000; // Temporary operations
    const command = new CreateTenantCommand(body);
    const dto: TenantDto =
      await this.commandBus.execute<CreateTenantCommand>(command);

    return dto;
  }

  @Put(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body()
    body: TenantDto,
  ): Promise<TenantDto> {
    const reqDto = { ...body, id: id } as TenantDto;
    const command = new UpdateTenantCommand(
      reqDto, // Temporary operations
    );
    const dto: TenantDto =
      await this.commandBus.execute<UpdateTenantCommand>(command);

    return dto;
  }
}
