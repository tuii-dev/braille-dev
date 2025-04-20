/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CommandBus,
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { WorkflowExecutionRepository } from '../../repositories';
import { WorkflowExecutionId } from '@app/domain/models/workflow-executions/workflow-execution-id';
import { WorkflowExecutionNotFoundException } from '@app/domain/exceptions';
import { SchemaDependencyService } from '@app/services';
import { OnEvent } from '@nestjs/event-emitter';
import { NotifyWorkflowStepCompletedCommand } from './notify-workflow-step-completed.command';
import { WorkflowExecutionResponse } from '@app/application/interfaces/workflow-execution-response.interface';
import { IWorkflowStepError } from '@app/application/interfaces/workflow-step-error.interface';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';
import { WorkflowResponseType } from '@app/common/shared/types/callback-result-type';
import { WorkflowExecution } from '@app/domain/models';
import { HttpService } from '@app/common/services/transport/http.service';
import { UtilsService } from '@app/common/services';

export class ManageWorkflowCompletionCommand implements ICommand {
  constructor({
    tenantId,
    workflowExecutionId,
    workspaceId,
    appId,
    stepFailed,
  }: {
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    stepFailed?: boolean;
  }) {
    this.tenantId = tenantId;
    this.workflowExecutionId = workflowExecutionId;
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.stepFailed = stepFailed ?? false;
  }

  readonly tenantId: string;
  readonly workflowExecutionId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
  readonly stepFailed?: boolean;
}

@CommandHandler(ManageWorkflowCompletionCommand)
export class ManageWorkflowCompletionCommandHandler implements ICommandHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly httpService: HttpService,
    private readonly utilsService: UtilsService,
    private readonly schemaDependencyService: SchemaDependencyService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(ManageWorkflowCompletionCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  @OnEvent('workflow.process.end')
  handleWorkflowStepSComplete(payload: {
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    stepFailed?: boolean;
  }) {
    this.logger.info(
      `Received workflow process end event ${JSON.stringify(payload)}`,
    );
    this.handleWorkflowCompleteTimeout(payload);
  }

  handleWorkflowCompleteTimeout(payload: {
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    stepFailed?: boolean;
  }) {
    // setTimeout(() => {
    this.logger.info(
      `Running workflow complete for worklow execution ${JSON.stringify(payload)}`,
      payload,
    );

    void this.execute(
      new ManageWorkflowCompletionCommand({
        tenantId: payload.tenantId,
        workflowExecutionId: payload.workflowExecutionId,
        workspaceId: payload.workspaceId,
        appId: payload.appId,
        stepFailed: payload.stepFailed ?? false,
      }),
    );
    // }, 2000);
  }

  async execute(command: ManageWorkflowCompletionCommand): Promise<string> {
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
      `Running workflow complete for worklow execution ${command.workflowExecutionId}`,
      command,
    );
    const executionId = WorkflowExecutionId.from(command.workflowExecutionId);

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

    const executionStatus = execution.status;
    let workflowFailed = executionStatus === 'FAILED';
    let schemaErrorOccurred = false;
    let errorMessage;
    this.logger.info(
      `Workflow execution ${executionId.value} failed: ${workflowFailed}`,
    );

    let data = {};

    if (
      !workflowFailed &&
      Array.isArray(execution.outputResolvers) &&
      execution.outputResolvers.length > 0
    ) {
      this.logger.info(
        `Workflow execution ${executionId.value} has output resolvers`,
      );
      data = await this.schemaDependencyService.resolveDependencies(
        execution.outputResolvers,
        execution.runtimeState ?? [],
      );

      this.logger.info(
        `Workflow execution ${executionId.value} output resolvers resolved to data: ${JSON.stringify(data)}`,
      );
    }

    // Check schema validation and fail workflow if not valid
    if (!workflowFailed && execution.outputSchemaDependency) {
      this.logger.info(
        `Workflow execution ${executionId.value} has output schema validation`,
      );
      if (
        !this.schemaDependencyService.validate(
          execution.outputSchemaDependency,
          data,
        )
      ) {
        this.logger.info(
          `Workflow execution ${executionId.value} failed due to output schema validation error.  Schema: ${execution.outputSchemaDependency}.  Data: ${JSON.stringify(data)}`,
        );
        workflowFailed = true;
        schemaErrorOccurred = true;
        errorMessage = `Workflow execution ${executionId.value} failed due to output schema validation error.  Schema: ${execution.outputSchemaDependency}.  Data: ${JSON.stringify(data)}`;
      } else {
        this.logger.info(
          `Workflow execution ${executionId.value} passed output schema validation.  Schema: ${execution.outputSchemaDependency}.  Data: ${JSON.stringify(data)}`,
        );
      }
    }

    if (!workflowFailed) {
      const hasErrors = execution.nodes!.some((n) => n.status === 'FAILED');
      const workflowResult = hasErrors ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';
      if (
        execution.nodes!.every(
          (n) => n.status === 'COMPLETED' || n.status === 'FAILED',
        )
      ) {
        execution.completeWorkflow(data);
        await this.workflowExecutionRepository.save(
          command.tenantId,
          execution,
        );
        this.logger.info('Workflow execution completed successfully', {
          executionId: executionId.value,
        });

        if (execution.callbackUrl) {
          this.logger.info(
            `Calling workflow execution callback url: ${execution.callbackUrl}, with outputs: ${JSON.stringify(
              data,
            )}`,
            {
              executionId: executionId.value,
            },
          );

          const payload = this.getPayload(
            workflowResult,
            execution,
            data,
            hasErrors,
          );

          try {
            const result = await this.postCallback<unknown>(
              execution.callbackUrl,
              payload,
            );

            this.logger.info(
              `Callback to workflow execution callback url: ${execution.callbackUrl} succeeded: ${JSON.stringify(result)}`,
            );
          } catch (error) {
            this.logger.error(
              `Callback to workflow execution callback url: ${execution.callbackUrl} failed: ${JSON.stringify(error)}`,
              error,
            );
          }
        } else if (
          execution.parentWorkflowExecutionId &&
          execution.parentWorkflowExecutionNodeId
        ) {
          this.logger.info(
            `Signaling to parent workflow execution ${execution.parentWorkflowExecutionId} that parent node ${execution.parentWorkflowExecutionNodeId} is complete`,
            execution,
          );

          await this.commandBus.execute(
            new NotifyWorkflowStepCompletedCommand({
              result: workflowResult,
              tenantId: command.tenantId,
              workflowExecutionId: execution.parentWorkflowExecutionId,
              workspaceId: command.workspaceId,
              appId: command.appId,
              nodeId: execution.parentWorkflowExecutionNodeId,
              outputs: data,
            }),
          );
        }
      }
    } else {
      // Workflow failed
      this.logger.info(`Workflow execution ${executionId.value} failed`);
      if (execution.callbackUrl) {
        this.logger.info(
          `Calling workflow execution callback url: ${execution.callbackUrl}, with outputs: ${JSON.stringify(
            data,
          )}`,
          {
            executionId: executionId.value,
          },
        );

        const payload = {
          outputs: {
            result: 'FAILED',
            tenantId: execution.tenantId,
            executionId: executionId.value,
            templateId: execution.templateId,
            timestamp: Date.now(),
            data,
            failedNodeAudit: this.getFailedNodeDirectives(
              execution.nodes ?? [],
            ),
            runtimeState: execution.runtimeState ?? [],
          } as unknown as WorkflowExecutionResponse,
        };

        if (errorMessage) {
          payload.outputs.errorMessage = errorMessage;
        }

        const result = await this.postCallback(execution.callbackUrl, payload);

        this.logger.info(
          `Callback to workflow execution callback url: ${execution.callbackUrl} succeeded: ${JSON.stringify(result)}`,
        );

        if (
          schemaErrorOccurred ||
          (executionStatus === 'FAILED' && command.stepFailed)
        ) {
          execution.failWorkflow(
            errorMessage ?? 'Output schema validation error',
          );

          await this.workflowExecutionRepository.save(
            command.tenantId,
            execution,
          );
        }
      } else if (
        execution.parentWorkflowExecutionId &&
        execution.parentWorkflowExecutionNodeId
      ) {
        this.logger.info(
          `Signaling to parent workflow execution ${execution.parentWorkflowExecutionId} that parent node ${execution.parentWorkflowExecutionNodeId} is FAILED`,
          execution,
        );

        const failNodes = this.getFailedNodeDirectives(execution.nodes ?? []);
        const failureMessage = errorMessage
          ? errorMessage
          : failNodes.length > 0
            ? failNodes[failNodes.length - 1].failureMessage
            : '';

        await this.commandBus.execute(
          new NotifyWorkflowStepCompletedCommand({
            result: 'FAILED',
            tenantId: command.tenantId,
            workflowExecutionId: execution.parentWorkflowExecutionId,
            workspaceId: command.workspaceId,
            appId: command.appId,
            nodeId: execution.parentWorkflowExecutionNodeId,
            outputs: data,
            failureMessage,
          }),
        );
      }
    }

    return executionId.value;
  }

  getFailedNodeDirectives(nodes: IWorkflowStep[]): IWorkflowStepError[] {
    return (
      nodes
        .filter((n) => n.status === 'FAILED')
        .map((n) => ({
          nodeId: n.nodeId,
          failureMessage: n.failureMessage,
        })) ?? []
    );
  }

  async postCallback<T>(callbackUrl: string, payload: unknown): Promise<T> {
    try {
      return await this.httpService.post<T>(callbackUrl, payload);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  getPayload(
    result: WorkflowResponseType,
    execution: WorkflowExecution,
    data: any,
    hasErrors: boolean,
  ) {
    const payload = {
      outputs: {
        result,
        tenantId: execution.tenantId,
        executionId: execution.executionId.value,
        templateId: execution.templateId,
        timestamp: Date.now(),
        data,
      } as unknown as WorkflowExecutionResponse,
    };

    if (hasErrors) {
      payload.outputs = {
        ...payload.outputs,
        failedNodes: this.getFailedNodeDirectives(execution.nodes ?? []),
        // runtimeState: execution.runtimeState ?? [],
      } as unknown as WorkflowExecutionResponse;
    }

    return payload;
  }
}
