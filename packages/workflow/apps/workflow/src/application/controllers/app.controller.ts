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

import { CreateAppCommand, UpdateAppCommand } from '../commands';

import { GetAllAppsQuery, GetAppQueryById } from '../queries';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AppDto } from '../../../../../libs/common/src/shared/event-sourcing/application/dtos/app/app.dto';

@Controller('tenants/:tenantId/apps')
export class AppController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @InjectPinoLogger(AppController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getAllApps(@Param('tenantId') tenantId: string): Promise<AppDto[]> {
    return this.queryBus.execute(new GetAllAppsQuery(tenantId));
  }

  @Get(':appId')
  @Header('Content-Type', 'application/json')
  async getApp(
    @Param('tenantId') tenantId: string,
    @Param('appId') appId: string,
  ): Promise<AppDto> {
    return this.queryBus.execute(new GetAppQueryById(tenantId, appId));
  }

  @Post()
  async createApp(
    @Param('tenantId') tenantId: string,
    @Body()
    body: AppDto,
  ): Promise<AppDto> {
    const reqDto = { ...body, tenantId } as AppDto;
    const command = new CreateAppCommand(tenantId, reqDto);
    const dto: AppDto =
      await this.commandBus.execute<CreateAppCommand>(command);

    return dto;
  }

  @Put(':appId')
  async updateApp(
    @Param('tenantId') tenantId: string,
    @Param('appId') appId: string,
    @Body()
    body: AppDto,
  ): Promise<AppDto> {
    const reqDto = { ...body, id: appId, tenantId } as AppDto;
    const command = new UpdateAppCommand(tenantId, reqDto);
    const dto: AppDto =
      await this.commandBus.execute<UpdateAppCommand>(command);

    return dto;
  }
}
