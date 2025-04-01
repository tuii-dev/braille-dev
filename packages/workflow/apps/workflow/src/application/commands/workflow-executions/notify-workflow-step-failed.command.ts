/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { StepFailureType } from '@app/common/shared/types/step-failure-type';
import {
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';
import { WorkflowExecutionNotFoundException } from 'apps/workflow/src/domain/exceptions';
import { WorkflowStepNotFoundException } from 'apps/workflow/src/domain/exceptions/workflow-step-not-found.exception';
import { WorkflowExecutionId } from 'apps/workflow/src/domain/models';
import { WorkflowExecutionStepId } from 'apps/workflow/src/domain/models/workflow-executions/workflow-execution-step-id';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowCommandResponseDto } from '../../dtos/common/workflow-command-response.dto';
import { WorkflowExecutionRepository } from '../../repositories';
import { UtilsService } from '@app/common/services';

export class NotifyWorkflowStepFailedCommand implements ICommand {
  constructor({
    tenantId,
    workflowExecutionId,
    workspaceId,
    appId,
    nodeId,
    stepFailureType,
    failureMessage,
    outputs,
  }: {
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    nodeId: string;
    stepFailureType: StepFailureType;
    failureMessage?: string;
    outputs?: any;
  }) {
    this.tenantId = tenantId;
    this.workflowExecutionId = workflowExecutionId;
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.nodeId = nodeId;
    this.stepFailureType = stepFailureType;
    this.failureMessage = failureMessage;
    this.outputs = outputs;
  }

  readonly tenantId: string;
  readonly workflowExecutionId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
  readonly nodeId: string;
  readonly stepFailureType: StepFailureType;
  readonly failureMessage?: string;
  readonly outputs?: any;
}

@CommandHandler(NotifyWorkflowStepFailedCommand)
export class NotifyWorkflowStepFailedCommandHandler implements ICommandHandler {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(NotifyWorkflowStepFailedCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: NotifyWorkflowStepFailedCommand,
  ): Promise<WorkflowCommandResponseDto> {
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

    this.logger.info(
      `Notifying workflow step failed for worklow execution ${command.workflowExecutionId} for node ${command.nodeId}`,
      command,
    );
    const executionId = WorkflowExecutionId.from(command.workflowExecutionId);

    this.logger.info(
      `Running workflow step for worklow execution ${executionId.value}`,
    );

    const execution = await this.workflowExecutionRepository.getById(
      command.tenantId,
      executionId,
      command.workspaceId,
      command.appId,
    );

    this.logger.info(`Workflow execution found: ${executionId.value}`);

    if (!execution) {
      throw WorkflowExecutionNotFoundException.withId(executionId);
    }

    const node = execution.nodes!.find((n) => n.nodeId === command.nodeId);

    if (!node) {
      throw WorkflowStepNotFoundException.withId(
        WorkflowExecutionStepId.generate(),
        command.nodeId,
      );
    }

    // if (
    //   !node.status ||
    //   (node.status !== 'IN_PROGRESS' && node.status !== 'PENDING')
    // ) {
    //   throw InvalidWorkflowExecutionStepProgressionException.because(
    //     `Workflow step ${node.nodeId} is not in progress`,
    //     executionId,
    //   );
    // }

    const failActionType = node.failActionType ?? 'ABORT_WORKFLOW';

    execution.failWorkflowStep(
      command.nodeId,
      command.stepFailureType,
      command.failureMessage,
      command.outputs,
      failActionType,
    );
    await this.workflowExecutionRepository.save(command.tenantId, execution);
    this.logger.info('Workflow execution step failed successfully', {
      executionId: executionId.value,
    });

    return new WorkflowCommandResponseDto(
      true,
      executionId.value,
      command.nodeId,
    );
  }
}
