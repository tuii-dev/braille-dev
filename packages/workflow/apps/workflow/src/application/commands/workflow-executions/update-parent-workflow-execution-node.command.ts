/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowExecutionRepository } from '../../repositories';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowExecutionNotFoundException } from 'apps/workflow/src/domain/exceptions';
import { WorkflowExecutionId } from 'apps/workflow/src/domain/models';
import { UtilsService } from '@app/common/services';

export class UpdateParentWorkflowExecutionNodeCommand implements ICommand {
  constructor({
    tenantId,
    parentWorkflowExecutionId,
    parentWorkflowExecutionNodeId,
    childWorkflowExecutionId,
    workspaceId,
    appId,
  }: {
    tenantId: string;
    parentWorkflowExecutionId: string;
    parentWorkflowExecutionNodeId: string;
    childWorkflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
  }) {
    this.tenantId = tenantId;
    this.parentWorkflowExecutionId = parentWorkflowExecutionId;
    this.parentWorkflowExecutionNodeId = parentWorkflowExecutionNodeId;
    this.childWorkflowExecutionId = childWorkflowExecutionId;
    this.workspaceId = workspaceId;
    this.appId = appId;
  }

  readonly tenantId: string;
  readonly parentWorkflowExecutionId: string;
  readonly parentWorkflowExecutionNodeId: string;
  readonly childWorkflowExecutionId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
}

@CommandHandler(UpdateParentWorkflowExecutionNodeCommand)
export class UpdateParentWorkflowExecutionNodeCommandHandler
  implements ICommandHandler
{
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(UpdateParentWorkflowExecutionNodeCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  @OnEvent('update.parent.workflow.execution.node')
  handleUpdateParentWorkflowExecutionNode(payload: {
    tenantId: string;
    parentWorkflowExecutionId: string;
    parentWorkflowExecutionNodeId: string;
    childWorkflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
  }) {
    this.logger.info(
      `Received update.parent.workflow.execution.node event ${JSON.stringify(payload)}`,
    );
    this.handleUpdateParentWorkflowExecutionNodeTimeout(payload);
  }

  handleUpdateParentWorkflowExecutionNodeTimeout(payload: {
    tenantId: string;
    parentWorkflowExecutionId: string;
    parentWorkflowExecutionNodeId: string;
    childWorkflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
  }) {
    // setTimeout(() => {
    this.logger.info(
      `Running parent node update for parent worklow execution ${JSON.stringify(payload)}`,
      payload,
    );

    void this.execute(
      new UpdateParentWorkflowExecutionNodeCommand({
        tenantId: payload.tenantId,
        parentWorkflowExecutionId: payload.parentWorkflowExecutionId,
        parentWorkflowExecutionNodeId: payload.parentWorkflowExecutionNodeId,
        childWorkflowExecutionId: payload.childWorkflowExecutionId,
        workspaceId: payload.workspaceId,
        appId: payload.appId,
      }),
    );
    // }, 2000);
  }

  async execute(
    command: UpdateParentWorkflowExecutionNodeCommand,
  ): Promise<string> {
    this.logger.info(
      `Running parent node update for parent worklow execution ${command.parentWorkflowExecutionId}`,
      command,
    );

    const [tenantId, _] = await this.utilsService.validateTenant(
      command.tenantId,
    );

    if (command.workspaceId) {
      const [workspaceId, ___] = await this.utilsService.validateWorkspace(
        tenantId.value,
        command.workspaceId,
      );
    }

    if (command.appId) {
      const [appId, __] = await this.utilsService.validateApp(
        tenantId.value,
        command.appId,
      );
    }

    const executionId = WorkflowExecutionId.from(
      command.parentWorkflowExecutionId,
    );

    const execution = await this.workflowExecutionRepository.getById(
      command.tenantId,
      executionId,
      command.workspaceId,
      command.appId,
    );

    if (!execution) {
      throw WorkflowExecutionNotFoundException.withId(executionId);
    }

    this.logger.info(`Workflow execution found: ${executionId.value}`);

    execution.updateParentWorkflowExecutionNode(
      command.parentWorkflowExecutionNodeId,
      command.childWorkflowExecutionId,
    );

    await this.workflowExecutionRepository.save(command.tenantId, execution);
    this.logger.info(`Workflow execution updated: ${executionId.value}`);

    return executionId.value;
  }
}
