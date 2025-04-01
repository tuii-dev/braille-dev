/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkspaceDto } from '@app/common/shared/event-sourcing/application/dtos/workspace/workspace.dto';
import { WorkspaceRepository } from '@app/common/shared/event-sourcing/application/repositories/workspaces/workspace.repository';
import { UtilsService } from '@app/common/services/utils.service';
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class GetAllWorkspacesQuery implements IQuery {
  constructor(public readonly tenantId: string) {}
}

@QueryHandler(GetAllWorkspacesQuery)
export class GetAllWorkspacesQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workspaceRepository: WorkspaceRepository,
    @InjectPinoLogger(GetAllWorkspacesQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(query: GetAllWorkspacesQuery): Promise<WorkspaceDto[]> {
    this.logger.info(`Reading all workspaces for tenant: ${query.tenantId}`);
    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    const workspaces = await this.workspaceRepository.getAll(tenantId.value);

    return workspaces.map((workspace) => workspace.toDto());
  }
}
