/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkflowExecutionDto } from '@app/application/dtos/workflow-executions/workflow-execution.dto';
import { WorkflowExecutionRepository } from '@app/application/repositories/workflow-executions/workflow-execution.repository';
import { UtilsService } from '@app/common/services/utils/utils.service';
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class GetAllWorkflowExecutionsQuery implements IQuery {
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

@QueryHandler(GetAllWorkflowExecutionsQuery)
export class GetAllWorkflowExecutionsQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(GetAllWorkflowExecutionsQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    query: GetAllWorkflowExecutionsQuery,
  ): Promise<WorkflowExecutionDto[]> {
    this.logger.info(
      `Reading all workflow executions for tenant: ${query.tenantId}`,
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

    const executions = await this.workflowExecutionRepository.getAll(
      tenantId.value,
      query.workspaceId,
      query.appId,
    );

    this.logger.info(`Workflow executions found: ${executions.length}`);

    return executions.map((e) => e.toDto());
  }
}
