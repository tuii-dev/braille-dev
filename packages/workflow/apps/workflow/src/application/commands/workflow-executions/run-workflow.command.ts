/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { cloneDeep } from 'lodash';
import {
  CommandBus,
  CommandHandler,
  type ICommand,
  type ICommandHandler,
} from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Span } from '@amplication/opentelemetry-nestjs';
import {
  WorkflowExecutionRepository,
  WorkflowTemplateRepository,
} from '../../repositories';
import {
  WorkflowTemplateNotFoundException,
  SchemaValidationException,
} from 'apps/workflow/src/domain/exceptions';
import {
  WorkflowTemplateId,
  WorkflowExecutionId,
  WorkflowExecution,
} from 'apps/workflow/src/domain/models';
import {
  SchemaDependencyService,
  WorkflowMetricsService,
} from 'apps/workflow/src/services';
import { WorkflowCommandResponseDto } from '../../dtos/common/workflow-command-response.dto';
import { IWorkflowEmittedState } from '../../interfaces/workflow-emitted-state.interface';
import { IWorkflowTemplate } from '../../interfaces/workflow-template.interface';
import { NotifyWorkflowStepCompletedCommand } from './notify-workflow-step-completed.command';
import { UtilsService } from '@app/common/services';

export class RunWorkflowCommand implements ICommand {
  constructor({
    tenantId,
    templateId,
    workspaceId,
    appId,
    inputs,
    parentWorkflowExecutionId,
    parentWorkflowExecutionNodeId,
    callbackUrl,
    throwOnError,
    isRoot,
  }: {
    tenantId: string;
    templateId: string;
    workspaceId?: string;
    appId?: string;
    inputs?: any;
    parentWorkflowExecutionId?: string;
    parentWorkflowExecutionNodeId?: string;
    callbackUrl?: string;
    throwOnError?: boolean;
    isRoot?: boolean;
  }) {
    this.tenantId = tenantId;
    this.templateId = templateId;
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.inputs = inputs;
    this.parentWorkflowExecutionId = parentWorkflowExecutionId;
    this.parentWorkflowExecutionNodeId = parentWorkflowExecutionNodeId;
    this.callbackUrl = callbackUrl;
    this.throwOnError = throwOnError ?? false;
    this.isRoot = isRoot ?? false;
  }

  readonly tenantId: string;
  readonly templateId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
  readonly inputs?: any;
  readonly parentWorkflowExecutionId?: string;
  readonly parentWorkflowExecutionNodeId?: string;
  readonly callbackUrl?: string;
  readonly throwOnError?: boolean;
  readonly isRoot?: boolean;
}

@CommandHandler(RunWorkflowCommand)
@Span('Command:RunWorkflow')
export class RunWorkflowCommandHandler implements ICommandHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly utilsService: UtilsService,
    private readonly metricsService: WorkflowMetricsService,
    private readonly schemaDependencyService: SchemaDependencyService,
    private readonly workflowTemplateRepository: WorkflowTemplateRepository,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(RunWorkflowCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(
    command: RunWorkflowCommand,
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

    const templateId = WorkflowTemplateId.from(command.templateId);

    this.logger.info(
      `Running workflow with template id: ${command.templateId}`,
    );

    const workflowTemplate = await this.workflowTemplateRepository.getById(
      tenantId.value,
      templateId,
      command.workspaceId,
      command.appId,
    );

    let interrupt = false;
    if (!workflowTemplate) {
      throw WorkflowTemplateNotFoundException.withId(templateId);
    }

    const inputSchema = workflowTemplate.inputSchemaDependency;
    if (inputSchema) {
      this.logger.info('Schema dependency found', {
        schema: inputSchema,
      });

      if (!this.schemaDependencyService.validate(inputSchema, command.inputs)) {
        if (command.throwOnError) {
          throw SchemaValidationException.because(
            `Schema validation failed for workflow input.  Schema: ${inputSchema}.  Data: ${JSON.stringify(command.inputs)}`,
          );
        } else {
          if (
            command.parentWorkflowExecutionId &&
            command.parentWorkflowExecutionNodeId
          ) {
            interrupt = true;
            await this.commandBus.execute(
              new NotifyWorkflowStepCompletedCommand({
                result: 'FAILED',
                tenantId: command.tenantId,
                workspaceId: command.workspaceId,
                appId: command.appId,
                workflowExecutionId: command.parentWorkflowExecutionId,
                nodeId: command.parentWorkflowExecutionNodeId,
                outputs: {},
                failureMessage: `Schema validation failed for child workflow input.  Schema: ${inputSchema}.  Data: ${JSON.stringify(command.inputs)}`,
              }),
            );
          }
        }
      }
    }

    if (!interrupt) {
      const executionId = WorkflowExecutionId.generate();

      const template = cloneDeep(workflowTemplate.toDto()) as IWorkflowTemplate;

      template.nodes = template.nodes.map((node) => ({
        ...node,
        executionId: executionId.value,
        templateId: templateId.value,
        status: 'PENDING',
      }));

      template.nodes.forEach(
        (node) => (node.failActionType ||= 'ABORT_WORKFLOW'),
      );

      this.logger.info('Workflow execution ID generated', {
        executionId: executionId.value,
        template,
      });

      const execution = WorkflowExecution.start({
        workflowExecutionId: executionId,
        tenantId: tenantId.value,
        workspaceId: command.workspaceId,
        appId: command.appId,
        workflowTemplate: template,
        inputState: {
          type: 'WORKFLOW_INPUT_ARGS',
          id: 'WORKFLOW_TRIGGER',
          validationSchema: inputSchema ?? '',
          validationTimestamp: new Date().getTime(),
          data: command.inputs ?? {},
        } as IWorkflowEmittedState,
        callbackUrl: command.callbackUrl,
        parentWorkflowExecutionId: command.parentWorkflowExecutionId,
        parentWorkflowExecutionNodeId: command.parentWorkflowExecutionNodeId,
        isRoot: command.isRoot ?? false,
      });

      await this.workflowExecutionRepository.save(tenantId.value, execution);
      this.logger.info('Workflow execution started successfully', {
        executionId: executionId.value,
      });

      this.metricsService.incrementTotalWorkflowsStartedCounter();
      return new WorkflowCommandResponseDto(true, executionId.value, undefined);
    } else {
      return new WorkflowCommandResponseDto(false, undefined, 'INTERRUPTED');
    }
  }
}
