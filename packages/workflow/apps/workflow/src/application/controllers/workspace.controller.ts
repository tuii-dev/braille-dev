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

import { CreateWorkspaceCommand, UpdateWorkspaceCommand } from '../commands';
import { GetAllWorkspacesQuery, GetWorkspaceByIdQuery } from '../queries';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkspaceDto } from '../../../../../libs/common/src/shared/event-sourcing/application/dtos/workspace/workspace.dto';

@Controller()
export class WorkspaceController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(WorkspaceController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get(['tenants/:tenantId/workspaces/'])
  @Header('Content-Type', 'application/json')
  async getAllWorkspaces(
    @Param('tenantId') tenantId: string,
  ): Promise<WorkspaceDto[]> {
    return this.queryBus.execute(new GetAllWorkspacesQuery(tenantId));
  }

  @Get(['tenants/:tenantId/workspaces/:workspaceId'])
  @Header('Content-Type', 'application/json')
  async getWorkspace(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
  ): Promise<WorkspaceDto> {
    return this.queryBus.execute(
      new GetWorkspaceByIdQuery(tenantId, workspaceId),
    );
  }

  @Post('tenants/:tenantId/workspaces')
  async createApp(
    @Param('tenantId') tenantId: string,
    @Body()
    body: WorkspaceDto,
  ): Promise<WorkspaceDto> {
    const reqDto = { ...body, tenantId } as WorkspaceDto;
    const command = new CreateWorkspaceCommand(tenantId, reqDto);
    const dto: WorkspaceDto =
      await this.commandBus.execute<CreateWorkspaceCommand>(command);

    return dto;
  }

  @Put('tenants/:tenantId/workspaces/:workspaceId')
  async updateApp(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId: string,
    @Body()
    body: WorkspaceDto,
  ): Promise<WorkspaceDto> {
    const reqDto = {
      ...body,
      id: workspaceId,
      tenantId,
    } as WorkspaceDto;
    const command = new UpdateWorkspaceCommand(tenantId, workspaceId, reqDto);
    const dto: WorkspaceDto =
      await this.commandBus.execute<UpdateWorkspaceCommand>(command);

    return dto;
  }
}
