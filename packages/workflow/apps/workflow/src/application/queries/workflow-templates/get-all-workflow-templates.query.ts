/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkflowTemplateDto } from '@app/application/dtos/workflow-template/workflow-template.dto';
import { WorkflowTemplateRepository } from '@app/application/repositories/workflow-templates/workflow-template.repository';
import { UtilsService } from '@app/common/services/utils.service';
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class GetAllWorkflowTemplatesQuery implements IQuery {
  constructor({
    tenantId,
    workspaceId,
    appId,
  }: {
    tenantId: string;
    workspaceId?: string;
    appId?: string;
  }) {
    this.tenantId = tenantId;
    this.workspaceId = workspaceId;
    this.appId = appId;
  }

  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
}

@QueryHandler(GetAllWorkflowTemplatesQuery)
export class GetAllWorkflowTemplatesQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowTemplateRepository: WorkflowTemplateRepository,
    @InjectPinoLogger(GetAllWorkflowTemplatesQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    query: GetAllWorkflowTemplatesQuery,
  ): Promise<WorkflowTemplateDto[]> {
    const [tenantId, _] = await this.utilsService.validateTenant(
      query.tenantId,
    );

    if (query.workspaceId) {
      const [workspaceId, ___] = await this.utilsService.validateWorkspace(
        tenantId.value,
        query.workspaceId,
      );
    }

    if (query.appId) {
      const [appId, __] = await this.utilsService.validateApp(
        tenantId.value,
        query.appId,
      );
    }

    const templates = await this.workflowTemplateRepository.getAll(
      query.tenantId,
      query.workspaceId,
      query.appId,
    );

    return templates.map((template) => template.toDto());
  }
}
