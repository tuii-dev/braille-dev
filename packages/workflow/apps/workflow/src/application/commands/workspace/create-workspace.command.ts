/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkspaceDto } from '../../../../../../libs/common/src/shared/event-sourcing/application/dtos/workspace/workspace.dto';
import { UtilsService } from '@app/common/services';
import { WorkspaceRepository } from '@app/common/shared/event-sourcing/application/repositories';
import {
  Workspace,
  WorkspaceId,
} from '@app/common/shared/event-sourcing/domain/models';

export class CreateWorkspaceCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceDto: WorkspaceDto,
  ) {}
}

@Injectable()
@CommandHandler(CreateWorkspaceCommand)
export class CreateWorkspaceCommandHandler implements ICommandHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workspaceRepository: WorkspaceRepository,
    @InjectPinoLogger(CreateWorkspaceCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: CreateWorkspaceCommand): Promise<WorkspaceDto> {
    this.logger.info(`Creating workspace: ${command.workspaceDto.name}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    const workspaceId = WorkspaceId.generate();

    const workspace = Workspace.create({
      workspaceId,
      tenantId: command.tenantId,
      name: command.workspaceDto.name,
      description: command.workspaceDto.description,
    });

    await this.workspaceRepository.save(tenantId.value, workspace);

    return workspace.toDto();
  }
}
