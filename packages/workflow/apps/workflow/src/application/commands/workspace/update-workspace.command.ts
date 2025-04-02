/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';
import { WorkspaceNotFoundException } from 'apps/workflow/src/domain/exceptions/workspace-not-found.exception';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { UtilsService } from '@app/common/services';
import { WorkspaceRepository } from '@app/common/shared/event-sourcing/application/repositories';
import { WorkspaceId } from '@app/common/shared/event-sourcing/domain/models';
import { WorkspaceDto } from '@app/common/shared/event-sourcing/application/dtos/workspace/workspace.dto';

export class UpdateWorkspaceCommand implements ICommand {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly workspaceDto: WorkspaceDto,
  ) {}
}

@Injectable()
@CommandHandler(UpdateWorkspaceCommand)
export class UpdateWorkspaceCommandHandler implements ICommandHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workspaceRepository: WorkspaceRepository,
    @InjectPinoLogger(UpdateWorkspaceCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: UpdateWorkspaceCommand): Promise<WorkspaceDto> {
    this.logger.info(`Creating workspace ID: ${command.workspaceDto.id}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    const workspaceId = WorkspaceId.from(command.workspaceDto.id);

    const workspace = await this.workspaceRepository.getById(
      tenantId.value,
      workspaceId,
    );

    if (!workspace) {
      throw WorkspaceNotFoundException.withId(workspaceId);
    }

    workspace.update({
      name: command.workspaceDto.name,
      description: command.workspaceDto.description,
    });

    await this.workspaceRepository.save(tenantId.value, workspace);

    return workspace.toDto();
  }
}
