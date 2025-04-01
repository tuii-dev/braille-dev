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

import { NotifyWorkflowStepFailedCommand } from './notify-workflow-step-failed.command';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkflowExecutionNotFoundException } from 'apps/workflow/src/domain/exceptions';
import { WorkflowExecutionId } from 'apps/workflow/src/domain/models';
import {
  GraphService,
  SchemaDependencyService,
} from 'apps/workflow/src/services';
import { WorkflowExecutionDto } from '../../dtos/workflow-executions/workflow-execution.dto';
import { IWorkflowStep } from '../../interfaces/workflow-step.interface';
import { RunWorkflowCommand } from './run-workflow.command';
import { UtilsService } from '@app/common/services';

export class RunWorkflowStepCommand implements ICommand {
  constructor({
    tenantId,
    workflowExecutionId,
    workspaceId,
    appId,
    previousNodeId,
    inputs,
    isFirstNode,
  }: {
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    previousNodeId?: string;
    inputs?: any;
    isFirstNode?: boolean;
  }) {
    this.tenantId = tenantId;
    this.workflowExecutionId = workflowExecutionId;
    this.workspaceId = workspaceId;
    this.appId = appId;
    this.previousNodeId = previousNodeId;
    this.inputs = inputs;
    this.isFirstNode = isFirstNode ?? false;
  }

  readonly tenantId: string;
  readonly workflowExecutionId: string;
  readonly workspaceId?: string;
  readonly appId?: string;
  readonly previousNodeId?: string;
  readonly inputs?: any;
  readonly isFirstNode: boolean;
}

@CommandHandler(RunWorkflowStepCommand)
export class RunWorkflowStepCommandHandler implements ICommandHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly utilsService: UtilsService,
    private readonly graphService: GraphService,
    private readonly schemaDependencyService: SchemaDependencyService,
    private readonly workflowExecutionRepository: WorkflowExecutionRepository,
    @InjectPinoLogger(RunWorkflowStepCommandHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  @OnEvent('workflow.step.start')
  handleWorkflowStepStart(payload: {
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    previousNodeId?: string;
    inputs?: any;
  }) {
    this.handleWorkflowStepTimeout(payload);
  }

  handleWorkflowStepTimeout(payload: {
    tenantId: string;
    workflowExecutionId: string;
    workspaceId?: string;
    appId?: string;
    previousNodeId?: string;
    inputs?: any;
    isFirstNode?: boolean;
  }) {
    // setTimeout(() => {
    this.logger.info(
      `Running workflow step for worklow execution ${JSON.stringify(payload)}`,
      payload,
    );

    void this.execute(
      new RunWorkflowStepCommand({
        tenantId: payload.tenantId,
        workflowExecutionId: payload.workflowExecutionId,
        workspaceId: payload.workspaceId,
        appId: payload.appId,
        previousNodeId: payload.previousNodeId,
        inputs: payload.inputs,
        isFirstNode: payload.isFirstNode ?? false,
      }),
    );
    // }, 2000);
  }

  async execute(
    command: RunWorkflowStepCommand,
  ): Promise<WorkflowExecutionDto> {
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
      `Running workflow step for worklow execution ${command.workflowExecutionId} for node ${command.previousNodeId}`,
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

    const runNodes = [] as IWorkflowStep[];
    if (!command.previousNodeId) {
      const graph = this.graphService.getDirectedGraph(execution.nodes!);
      runNodes.push(...this.graphService.getNodesWithNoIncomingEdges(graph));
    } else {
      runNodes.push(
        ...this.graphService.getNextStep(
          command.previousNodeId,
          execution.nodes!,
        ),
      );
    }

    this.logger.info(
      `Running workflow ${runNodes.length} steps for worklow execution ${executionId.value}`,
    );

    const workflowRunCommands = [] as RunWorkflowCommand[];
    const stepFailureCommands = [] as NotifyWorkflowStepFailedCommand[];

    const runtimeState = execution.runtimeState ?? [];

    let interrupt = false;
    let runSave = false;
    for (const step of runNodes) {
      const nodeId = step.nodeId;
      const nodeType = step.type;
      this.logger.info(`Running workflow step ${nodeId} type ${nodeType}`);

      this.logger.info(`Resolving inputs for workflow step ${nodeId}`, {
        inputResolvers: step.inputResolvers,
        runtimeState,
      });

      const inputs = await this.schemaDependencyService.resolveDependencies(
        step.inputResolvers ?? [],
        runtimeState,
      );

      this.logger.info(
        `Resolved inputs for workflow step ${nodeId}.  Inputs: ${JSON.stringify(inputs)}`,
        {
          inputs,
        },
      );

      const inputSchema = step.inputSchemaDependency;
      if (inputSchema) {
        this.logger.info('Input schema dependency found', {
          schema: inputSchema,
        });

        if (!this.schemaDependencyService.validate(inputSchema, inputs)) {
          this.logger.info('**** Schema validation FAILED ****');
          const failureActionType = step.failActionType ?? 'ABORT_WORKFLOW';

          this.logger.error(
            `Schema validation failed for workflow step ${nodeId} input.  Schema: ${inputSchema}.  Input resolvers: ${JSON.stringify(step.inputResolvers)}`,
          );

          stepFailureCommands.push(
            new NotifyWorkflowStepFailedCommand({
              tenantId: execution.tenantId,
              workflowExecutionId: executionId.value,
              workspaceId: command.workspaceId,
              appId: command.appId,
              nodeId,
              stepFailureType: 'INPUT_VALIDATION',
              failureMessage: `Schema validation failed for workflow step ${nodeId} with input schema contract ${inputSchema}.`,
              outputs: {},
            }),
          );

          if (failureActionType === 'ABORT_WORKFLOW') {
            this.logger.info(
              'Aborting workflow execution given schema validation failure',
            );
            interrupt = true;
            break;
          } else {
            this.logger.info(
              'Continuing workflow execution despite schema validation failure',
            );
            continue;
          }
        } else {
          this.logger.info('**** Schema validation PASSED ****');
        }
      } else {
        this.logger.info('No schema dependency found');
      }

      execution.startWorkflowStep(nodeId, inputs, command.isFirstNode ?? false);
      runSave = true;

      if (nodeType === 'WORKFLOW') {
        const childWorkflowTemplateId = step.childWorkflowTemplateId;
        if (childWorkflowTemplateId) {
          workflowRunCommands.push(
            new RunWorkflowCommand({
              tenantId: command.tenantId,
              templateId: childWorkflowTemplateId,
              workspaceId: command.workspaceId,
              appId: command.appId,
              inputs,
              parentWorkflowExecutionId: executionId.value,
              parentWorkflowExecutionNodeId: nodeId,
            }),
          );
        }
      }
    }

    this.logger.info(`Workflow execution was interrupted: ${interrupt}`);

    if (runSave) {
      await this.workflowExecutionRepository.save(command.tenantId, execution);
      this.logger.info('Workflow execution step(s) started successfully', {
        executionId: executionId.value,
      });
    }

    if (!interrupt) {
      if (workflowRunCommands.length > 0) {
        this.logger.info(
          `Running ${workflowRunCommands.length} workflow(s)`,
          workflowRunCommands,
        );
        await Promise.all(
          workflowRunCommands.map((command) =>
            this.commandBus.execute(command),
          ),
        );
      }
    }

    if (stepFailureCommands.length > 0) {
      this.logger.info(
        `Running ${stepFailureCommands.length} workflow step failure command(s)`,
        stepFailureCommands,
      );
      await Promise.all(
        stepFailureCommands.map((command) => this.commandBus.execute(command)),
      );
    }

    return execution.toDto();
  }
}
