/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkflowTemplateDto } from '@app/application/dtos/workflow-template/workflow-template.dto';
import { WorkflowTemplateRepository } from '@app/application/repositories/workflow-templates/workflow-template.repository';
import { WorkflowTemplateNotFoundException } from '@app/domain/exceptions';
import { WorkflowTemplateId } from '@app/domain/models/workflow-templates/workflow-template-id';
import { UtilsService } from '@app/common/services/utils.service';
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class GetWorkflowTemplateByIdQuery implements IQuery {
  constructor({
    tenantId,
    templateId,
    workspaceId,
    appId,
  }: {
    tenantId: string;
    templateId: string;
    workspaceId?: string;
    appId?: string;
  }) {
    this.tenantId = tenantId;
    this.templateId = templateId;
    this.workspaceId = workspaceId;
    this.appId = appId;
  }

  readonly tenantId: string;
  readonly templateId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
}

@QueryHandler(GetWorkflowTemplateByIdQuery)
export class GetWorkflowTemplateByIdQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowTemplateRepository: WorkflowTemplateRepository,
    @InjectPinoLogger(GetWorkflowTemplateByIdQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    query: GetWorkflowTemplateByIdQuery,
  ): Promise<WorkflowTemplateDto> {
    const templateId = WorkflowTemplateId.from(query.templateId);
    this.logger.info(
      `Reading workflow template ID: ${templateId.value} for tenant: ${query.tenantId}`,
    );

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

    const template = await this.workflowTemplateRepository.getById(
      tenantId.value,
      templateId,
      query.workspaceId,
      query.appId,
    );

    if (!template) {
      throw WorkflowTemplateNotFoundException.withId(templateId);
    }

    return template.toDto();
  }
}
