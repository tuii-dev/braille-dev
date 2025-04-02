/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { WorkflowResponseType } from '@app/common/shared/types/callback-result-type';
import {
  CommandBus,
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';
import {
  WorkflowExecutionNotFoundException,
  SchemaValidationException,
} from 'apps/workflow/src/domain/exceptions';
import { InvalidWorkflowExecutionStepCompletionException } from 'apps/workflow/src/domain/exceptions/invalid-workflow-execution-step-completion.exception';
import { InvalidWorkflowExecutionStepProgressionException } from 'apps/workflow/src/domain/exceptions/invalid-workflow-execution-step-progression.exception';
import { WorkflowStepNotFoundException } from 'apps/workflow/src/domain/exceptions/workflow-step-not-found.exception';
import { WorkflowExecutionId } from 'apps/workflow/src/domain/models';
import { WorkflowExecutionStepId } from 'apps/workflow/src/domain/models/workflow-executions/workflow-execution-step-id';
import { SchemaDependencyService } from 'apps/workflow/src/services';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowCommandResponseDto } from '../../dtos/common/workflow-command-response.dto';
import { IWorkflowEmittedState } from '../../interfaces/workflow-emitted-state.interface';
import { WorkflowExecutionRepository } from '../../repositories';
import { NotifyWorkflowStepFailedCommand } from './notify-workflow-step-failed.command';
import { UtilsService } from '@app/common/services';

export class NotifyWorkflowStepCompletedCommand implements ICommand {
  constructor({
    result,
    tenantId,
    workflowExecutionId,
    workspaceId,
    appId,
    nodeId,
    outputs,
    failureMessage,
    throwOnError,
    interruptOnSchemaError,
    isRoot,
  }: {
    result: WorkflowResponseType;
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    nodeId: string;
    outputs?: any;
    failureMessage?: string;
    throwOnError?: boolean;
    interruptOnSchemaError?: boolean;
    isRoot?: boolean;
  }) {
    this.result = result;
    this.tenantId = tenantId;
    this.workflowExecutionId = workflowExecutionId;
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.nodeId = nodeId;
    this.outputs = outputs;
    this.failureMessage = failureMessage;
    this.throwOnError = throwOnError ?? false;
    this.interruptOnSchemaError = interruptOnSchemaError ?? false;
    this.isRoot = isRoot ?? false;
  }

  readonly result: WorkflowResponseType;
  readonly tenantId: string;
  readonly workflowExecutionId: string;
  readonly nodeId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
  readonly outputs?: any;
  readonly failureMessage?: string;
  readonly throwOnError?: boolean;
  readonly interruptOnSchemaError?: boolean;
  readonly isRoot?: boolean;
}

@CommandHandler(NotifyWorkflowStepCompletedCommand)
export class NotifyWorkflowStepCompletedCommandHandler
  implements ICommandHandler
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly utilsService: UtilsService,
    private readonly schemaDependencyService: SchemaDependencyService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(NotifyWorkflowStepCompletedCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: NotifyWorkflowStepCompletedCommand,
  ): Promise<WorkflowCommandResponseDto | undefined> {
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
      `Notifying workflow step success for worklow execution ${command.workflowExecutionId} for node ${command.nodeId}`,
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

    if (!node.status || node.status !== 'IN_PROGRESS') {
      throw InvalidWorkflowExecutionStepProgressionException.because(
        `Workflow step ${node.nodeId} is not in progress`,
        executionId,
      );
    } else if (command.isRoot === true && node.type !== 'ACTION') {
      throw InvalidWorkflowExecutionStepCompletionException.because(
        `Invalid workflow step completion attempt.   Workflow step ${node.nodeId} is not an action.`,
        executionId,
      );
    }

    const nodeId = node.nodeId;
    let interrupt = false;
    const stepFailureCommands = [] as NotifyWorkflowStepFailedCommand[];
    if (command.result === 'FAILED') {
      this.logger.info(`Child workflow called back with failed status`, {
        executionId: executionId.value,
        nodeId,
      });
      // Callback from child workflow
      execution.failWorkflowStep(
        command.nodeId,
        'CHILD_WORKFLOW',
        command.failureMessage,
        command.outputs,
        'ABORT_WORKFLOW',
      );

      await this.workflowExecutionRepository.save(command.tenantId, execution);
      this.logger.info('Child workflow execution step failed', {
        executionId: executionId.value,
      });
    } else {
      const outputs = command.outputs;
      const outputSchema = node.outputSchemaDependency;
      if (outputSchema) {
        this.logger.info('Output schema dependency found', {
          schema: outputSchema,
        });

        if (!this.schemaDependencyService.validate(outputSchema, outputs)) {
          const failureActionType = node.failActionType ?? 'ABORT_WORKFLOW';

          this.logger.error(
            `Schema validation failed for workflow step ${nodeId} input.  Schema: ${outputSchema}.  interruptOnSchemaError: ${command.interruptOnSchemaError}`,
          );

          if (command.interruptOnSchemaError === true) {
            interrupt = true;
          } else {
            stepFailureCommands.push(
              new NotifyWorkflowStepFailedCommand({
                tenantId: execution.tenantId,
                workflowExecutionId: executionId.value,
                workspaceId: command.workspaceId,
                appId: command.appId,
                nodeId,
                stepFailureType: 'OUTPUT_VALIDATION',
                failureMessage: `Schema validation failed for workflow step ${nodeId} with output schema contract ${outputSchema}.`,
                outputs,
              }),
            );

            if (failureActionType === 'ABORT_WORKFLOW') {
              this.logger.info(
                'Aborting workflow execution given schema validation failure',
              );
              interrupt = true;
            } else {
              this.logger.info(
                'Continuing workflow execution despite schema validation failure',
              );
            }
          }
        }
      }

      if (!interrupt) {
        const state = {
          type: 'STEP',
          id: nodeId,
          validationSchema: node.outputSchemaDependency ?? {},
          validationTimestamp: new Date().getTime(),
          data: outputs ?? {},
        } as IWorkflowEmittedState;

        this.logger.info(
          `Completing workflow step with emitted output state: ${JSON.stringify(state)}`,
        );
        execution.completeWorkflowStep(nodeId, state, outputs);
        await this.workflowExecutionRepository.save(
          command.tenantId,
          execution,
        );
        this.logger.info('Workflow execution step completed successfully', {
          executionId: executionId.value,
        });
      }

      if (stepFailureCommands.length > 0) {
        this.logger.info(
          `Running ${stepFailureCommands.length} workflow step failure command(s)`,
          stepFailureCommands,
        );
        await Promise.all(
          stepFailureCommands.map((command) =>
            this.commandBus.execute(command),
          ),
        );
      }

      if (interrupt) {
        if (command.throwOnError) {
          throw SchemaValidationException.because(
            `Schema validation failed for workflow step ${nodeId} with output schema contract ${outputSchema}.`,
          );
        }
      }
    }

    return new WorkflowCommandResponseDto(
      true,
      executionId.value,
      command.nodeId,
    );
  }
}
