/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@ocoda/event-sourcing';

import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import {
  NotifyWorkflowStepFailedCommand,
  RunWorkflowCommand,
} from '../commands';

import {
  GetWorkflowExecutionByIdQuery,
  GetAllWorkflowExecutionsQuery,
} from '../queries';
import { NotifyWorkflowStepCompletedCommand } from '../commands/workflow-executions/notify-workflow-step-completed.command';
import { WorkflowExecutionDto } from '../dtos/workflow-executions/workflow-execution.dto';
import { RequiredArgsException } from '../../domain/exceptions/required-args.exception';

@Controller()
export class WorkflowExecutionController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @InjectPinoLogger(WorkflowExecutionController.name)
    private readonly logger: PinoLogger,
  ) {}

  @Get([
    'tenants/:tenantId/executions',
    'tenants/:tenantId/workspaces/:workspaceId/executions',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/executions',
  ])
  async getAllWorkflowExecutions(
    @Param('tenantId') tenantId: string,
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowExecutionDto[]> {
    return this.queryBus.execute(
      new GetAllWorkflowExecutionsQuery({ tenantId, workspaceId, appId }),
    );
  }

  @Get([
    'tenants/:tenantId/executions/:executionId',
    'tenants/:tenantId/workspaces/:workspaceId/executions/:executionId',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/executions/:executionId',
  ])
  async getWorkflowExecution(
    @Param('tenantId') tenantId: string,
    @Param('executionId') executionId: string,
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowExecutionDto> {
    return this.queryBus.execute(
      new GetWorkflowExecutionByIdQuery({
        tenantId,
        executionId,
        workspaceId,
        appId,
      }),
    );
  }

  @Post([
    'tenants/:tenantId/executions/start/:templateId',
    'tenants/:tenantId/workspaces/:workspaceId/executions/start/:templateId',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/executions/start/:templateId',
  ])
  async createWorkflowExecution(
    @Param('tenantId') tenantId: string,
    @Param('templateId') templateId: string,
    @Body()
    body: {
      inputs?: any;
      callbackUrl?: string;
    },
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowExecutionDto | undefined> {
    if (body.callbackUrl) {
      return this.commandBus.execute(
        new RunWorkflowCommand({
          tenantId,
          templateId,
          workspaceId,
          appId,
          inputs: body.inputs,
          callbackUrl: body.callbackUrl,
          throwOnError: true,
          isRoot: true,
        }),
      );
    } else {
      throw RequiredArgsException.because('Callback URL is required');
    }
  }

  @Post([
    'tenants/:tenantId/executions/:executionId/:nodeId/complete',
    'tenants/:tenantId/workspaces/:workspaceId/executions/:executionId/:nodeId/complete',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/executions/:executionId/:nodeId/complete',
  ])
  async notifyWorkflowStepCompleted(
    @Param('tenantId') tenantId: string,
    @Param('executionId') executionId: string,
    @Param('nodeId') nodeId: string,
    @Body()
    body: {
      outputs?: any;
    },
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowExecutionDto> {
    return this.commandBus.execute(
      new NotifyWorkflowStepCompletedCommand({
        result: 'COMPLETED',
        tenantId,
        workflowExecutionId: executionId,
        workspaceId,
        appId,
        nodeId,
        outputs: body.outputs,
        throwOnError: true,
        interruptOnSchemaError: true,
        isRoot: true,
      }),
    );
  }

  @Post([
    'tenants/:tenantId/executions/:executionId/:nodeId/fail',
    'tenants/:tenantId/workspaces/:workspaceId/executions/:executionId/:nodeId/fail',
    'tenants/:tenantId/workspaces/:workspaceId/apps/:appId/executions/:executionId/:nodeId/fail',
  ])
  async notifyWorkflowStepFailed(
    @Param('tenantId') tenantId: string,
    @Param('executionId') executionId: string,
    @Param('nodeId') nodeId: string,
    @Body()
    body: {
      outputs?: any;
      message?: string;
    },
    @Param('workspaceId') workspaceId?: string,
    @Param('appId') appId?: string,
  ): Promise<WorkflowExecutionDto> {
    return this.commandBus.execute(
      new NotifyWorkflowStepFailedCommand({
        tenantId,
        workflowExecutionId: executionId,
        workspaceId,
        appId,
        nodeId,
        stepFailureType: 'ACTION_ERROR',
        failureMessage: body.message,
        outputs: body.outputs,
      }),
    );
  }
}
