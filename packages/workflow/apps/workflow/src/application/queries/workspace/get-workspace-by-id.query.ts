/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkspaceDto } from '@app/common/shared/event-sourcing/application/dtos/workspace/workspace.dto';
import { WorkspaceRepository } from '@app/common/shared/event-sourcing/application/repositories/workspaces/workspace.repository';
import { WorkspaceNotFoundException } from '@app/domain/exceptions/workspace-not-found.exception';
import { WorkspaceId } from '@app/common/shared/event-sourcing/domain/models/workspace/workspace-id';
import { UtilsService } from '@app/common/services/utils/utils.service';
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class GetWorkspaceByIdQuery implements IQuery {
  constructor(
    public readonly tenantId: string,
    public readonly workspaceId: string,
    public readonly appId?: string,
  ) {}
}

@QueryHandler(GetWorkspaceByIdQuery)
export class GetWorkspaceByIdQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workspaceRepository: WorkspaceRepository,
    @InjectPinoLogger(GetWorkspaceByIdQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetWorkspaceByIdQuery): Promise<WorkspaceDto> {
    const workspaceId = WorkspaceId.from(query.workspaceId);
    this.logger.info(`Reading workspace ID: ${workspaceId.value}`);

    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    const workspace = await this.workspaceRepository.getById(
      tenantId.value,
      workspaceId,
    );

    if (!workspace) {
      throw WorkspaceNotFoundException.withId(workspaceId);
    }

    return workspace.toDto();
  }
}
