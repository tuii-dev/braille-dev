/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkflowExecutionDto } from '@app/application/dtos/workflow-executions/workflow-execution.dto';
import { WorkflowExecutionRepository } from '@app/application/repositories/workflow-executions/workflow-execution.repository';
import { WorkflowExecutionNotFoundException } from '@app/domain/exceptions';
import { WorkflowExecutionId } from '@app/domain/models/workflow-executions/workflow-execution-id';
import { UtilsService } from '@app/common/services/utils.service';
import {
  QueryHandler,
  type IQuery,
  type IQueryHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export class GetWorkflowExecutionByIdQuery implements IQuery {
  constructor({
    tenantId,
    executionId,
    workspaceId,
    appId,
  }: {
    tenantId: string;
    executionId: string;
    workspaceId?: string;
    appId?: string;
  }) {
    this.tenantId = tenantId;
    this.executionId = executionId;
    this.workspaceId = workspaceId;
    this.appId = appId;
  }

  readonly executionId: string;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
}

@QueryHandler(GetWorkflowExecutionByIdQuery)
export class GetWorkflowExecutionByIdQueryHandler implements IQueryHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(GetWorkflowExecutionByIdQueryHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    query: GetWorkflowExecutionByIdQuery,
  ): Promise<WorkflowExecutionDto> {
    const executionId = WorkflowExecutionId.from(query.executionId);
    this.logger.info(
      `Reading workflow execution ID: ${executionId.value} for tenant: ${query.tenantId}`,
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

    const execution = await this.workflowExecutionRepository.getById(
      tenantId.value,
      executionId,
      query.workspaceId,
      query.appId,
    );

    if (!execution) {
      throw WorkflowExecutionNotFoundException.withId(executionId);
    }

    this.logger.info(`Workflow execution found: ${executionId.value} ok`);

    return execution.toDto();
  }
}
