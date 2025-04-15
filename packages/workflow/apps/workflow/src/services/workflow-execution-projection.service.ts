/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { setTimeout } from 'timers/promises';
import { PrismaService } from '@app/common/database/services/prisma.service';
import {
  WorkflowExecutionCompletedEvent,
  WorkflowExecutionFailedEvent,
  WorkflowExecutionParentNodeUpdatedEvent,
  WorkflowExecutionStepCompletedEvent,
  WorkflowExecutionStepFailedEvent,
  WorkflowExecutionStepStartedEvent,
  WorkflowTemplateCreatedEvent,
  WorkflowTemplateDeletedEvent,
  WorkflowTemplateUpdatedEvent,
} from '@app/domain/events';
import { WorkflowExecutionStartedEvent } from '@app/domain/events/workflow-executions/workflow-execution-started.event';
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorkflowExecutionProjectionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    @InjectPinoLogger(WorkflowExecutionProjectionService.name)
    private readonly logger: PinoLogger,
  ) {}

  // Workflow Template
  async createWorkflowTemplateProjection(
    event: WorkflowTemplateCreatedEvent,
  ): Promise<boolean> {
    this.logger.info('Creating header projection for workflow template');
    try {
      // Map nodes to WorkflowExecutionStep objects
      const steps = event.nodes.map((node) => ({
        nodeId: node.nodeId,
        type: node.type,
        tenantId: event.tenantId,
        name: node.name,
        description: node.description,
        actionType: node.actionType,
        controlType: node.controlType,
        sandboxedJsCode: node.sandboxedJsCode,
        edges: node.edges ?? [],
        failActionType: node.failActionType,
        inputResolvers: node.inputResolvers ?? {},
        inputSchemaDependency: node.inputSchemaDependency,
        outputSchemaDependency: node.outputSchemaDependency,
        stepFailureType: node.stepFailureType,
      }));

      const workflowTemplateData = {
        tenantId: event.tenantId,
        templateId: event.templateId,
        workspaceId: event.workspaceId,
        appId: event.appId,
        name: event.name,
        description: event.description,
        inputSchemaDependency: event.inputSchemaDependency,
        outputSchemaDependency: event.outputSchemaDependency,
        outputResolvers: event.outputResolvers ?? {},
        steps,
        created: event.created ? new Date(event.created) : null,
      };

      this.logger.info(
        `Creating workflow template with steps: ${steps.length}`,
      );
      // Create WorkflowExecution with steps
      await this.prismaService.workflowTemplate.create({
        data: {
          ...workflowTemplateData,
          steps: {
            create: steps,
          },
        },
        include: {
          steps: true,
        },
      });

      this.logger.info('Workflow template created successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async updateWorkflowTemplateProjection(
    event: WorkflowTemplateUpdatedEvent,
  ): Promise<boolean> {
    this.logger.info('Updating header projection for workflow template');
    try {
      // Map nodes to WorkflowExecutionStep objects
      const steps = event.nodes.map((node) => ({
        nodeId: node.nodeId,
        type: node.type,
        tenantId: event.tenantId,
        name: node.name,
        description: node.description,
        actionType: node.actionType,
        controlType: node.controlType,
        sandboxedJsCode: node.sandboxedJsCode,
        edges: node.edges ?? [],
        failActionType: node.failActionType,
        inputResolvers: node.inputResolvers ?? {},
        inputSchemaDependency: node.inputSchemaDependency,
        outputSchemaDependency: node.outputSchemaDependency,
        stepFailureType: node.stepFailureType,
      }));

      const workflowTemplateData = {
        tenantId: event.tenantId,
        templateId: event.templateId,
        workspaceId: event.workspaceId,
        appId: event.appId,
        name: event.name,
        description: event.description,
        inputSchemaDependency: event.inputSchemaDependency,
        outputSchemaDependency: event.outputSchemaDependency,
        outputResolvers: event.outputResolvers ?? {},
        steps,
        updated: event.updated ? new Date(event.updated) : null,
      };

      this.logger.info(
        `Updating workflow template with steps: ${steps.length}`,
      );
      // Create WorkflowExecution with steps
      await this.prismaService.workflowTemplate.update({
        where: {
          templateId: event.templateId,
        },
        data: {
          ...workflowTemplateData,
          steps: {
            deleteMany: {},
            create: steps,
          },
        },
        include: {
          steps: true,
        },
      });

      this.logger.info('Workflow template created successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async deleteWorkflowTemplateProjection(
    event: WorkflowTemplateDeletedEvent,
  ): Promise<boolean> {
    this.logger.info('Deleting header projection for workflow template');
    try {
      // Map nodes to WorkflowExecutionStep objects
      const workflowTemplateData = {
        tenantId: event.tenantId,
        templateId: event.templateId,
        deleted: true,
        deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
      };

      this.logger.info(`Deleting workflow template`);
      // Create WorkflowExecution with steps
      await this.prismaService.workflowTemplate.update({
        where: {
          templateId: event.templateId,
        },
        data: {
          ...workflowTemplateData,
        },
      });

      this.logger.info('Workflow template deleted successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  // Workflow Execution Projection
  async createWorkflowExecutionProjection(
    event: WorkflowExecutionStartedEvent,
  ): Promise<boolean> {
    this.logger.info('Creating header projection for workflow execution');
    try {
      // Map nodes to WorkflowExecutionStep objects
      const steps = event.nodes.map((node) => ({
        nodeId: node.nodeId,
        type: node.type,
        tenantId: event.tenantId,
        templateId: event.templateId,
        startDate: node.startDate ? new Date(node.startDate) : null,
        endDate: node.endDate ? new Date(node.endDate) : null,
        name: node.name,
        description: node.description,
        status: node.status,
        actionType: node.actionType,
        childWorkflowTemplateId: node.childWorkflowTemplateId,
        childWorkflowExecutionId: node.childWorkflowExecutionId,
        parentWorkflowExecutionId: node.parentWorkflowExecutionId,
        parentWorkflowExecutionNodeId: node.parentWorkflowExecutionNodeId,
        controlType: node.controlType,
        sandboxedJsCode: node.sandboxedJsCode,
        edges: node.edges ?? [],
        failActionType: node.failActionType,
        inputResolvers: node.inputResolvers ?? {},
        inputSchemaDependency: node.inputSchemaDependency,
        outputSchemaDependency: node.outputSchemaDependency,
        inputs:
          typeof node.inputs === 'string'
            ? JSON.parse(node.inputs)
            : (node.inputs ?? {}),
        outputs:
          typeof node.outputs === 'string'
            ? JSON.parse(node.outputs)
            : (node.outputs ?? {}),
        stepFailureType: node.stepFailureType,
        failureMessage: node.failureMessage,
        operationsConsumed: 0,
      }));

      const workflowExecutionData = {
        executionId: event.executionId,
        tenantId: event.tenantId,
        templateId: event.templateId,
        workspaceId: event.workspaceId,
        appId: event.appId,
        startDate: new Date(event.startDate),
        name: event.name,
        description: event.description,
        status: event.status,
        parentWorkflowExecutionId: event.parentWorkflowExecutionId,
        parentWorkflowExecutionNodeId: event.parentWorkflowExecutionNodeId,
        callbackUrl: event.callbackUrl,
        inputSchemaDependency: event.inputSchemaDependency,
        outputSchemaDependency: event.outputSchemaDependency,
        inputs: event.inputs ?? {},
        outputResolvers: event.outputResolvers ?? {},
        isRoot: event.isRoot ?? false,
        operationsConsumed: 0,
        failedNodeIds: [], // Adding this as it's in the schema
        outputs: {}, // Adding this as it's in the schema
        runtimeState: {}, // Adding this as it's in the schema
        steps,
      };

      this.logger.info(
        `Creating workflow execution with steps: ${steps.length}`,
      );
      // Create WorkflowExecution with steps
      await this.prismaService.workflowExecution.create({
        data: {
          ...workflowExecutionData,
          steps: {
            create: steps,
          },
        },
        include: {
          steps: true,
        },
      });

      this.logger.info('Workflow execution created successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async completeWorkflowExecutionProjection(
    event: WorkflowExecutionCompletedEvent,
  ) {
    this.logger.info('Completing workflow execution projection');
    try {
      // Update WorkflowExecution
      await this.prismaService.workflowExecution.update({
        where: {
          executionId: event.workflowExecutionId,
        },
        data: {
          status: event.status,
          endDate: event.endDate ? new Date(event.endDate) : null,
          outputs:
            typeof event.outputs === 'string'
              ? JSON.parse(event.outputs)
              : (event.outputs ?? {}),
          parentWorkflowExecutionId: event.parentWorkflowExecutionId,
        },
      });

      this.logger.info('Workflow execution completed successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async failWorkflowExecutionProjection(event: WorkflowExecutionFailedEvent) {
    this.logger.info('Failing workflow execution projection');
    try {
      // Update WorkflowExecution
      await this.prismaService.workflowExecution.update({
        where: {
          executionId: event.executionId,
        },
        data: {
          status: event.status,
          failureMessage: event.errorMessage,
          endDate: event.endDate ? new Date(event.endDate) : null,
        },
      });

      this.logger.info('Workflow execution failed successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async updateStepForFailedProjection(event: WorkflowExecutionStepFailedEvent) {
    this.logger.info('Updating step failed projection for workflow execution');
    try {
      // Map nodes to WorkflowExecutionStep objects
      const node = event.nodes.find((n) => n.nodeId === event.nodeId);
      const step = {
        endDate: node!.endDate ? new Date(node!.endDate) : null,
        status: node!.status,
        outputs:
          typeof node!.outputs === 'string'
            ? JSON.parse(node!.outputs)
            : (node!.outputs ?? {}),
        stepFailureType: node!.stepFailureType,
        failureMessage: node!.failureMessage,
      };

      // Update WorkflowExecutionStep
      await this.prismaService.workflowExecutionStep.update({
        where: {
          executionId_nodeId: {
            executionId: event.workflowExecutionId,
            nodeId: event.nodeId,
          },
        },
        data: step,
      });

      this.logger.info('Step projection updated successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async updateStepForStartProjectionDelayed(
    event: WorkflowExecutionStepStartedEvent,
  ): Promise<boolean> {
    // Introduce a delay to mitigate intermittent "record not found" errors.
    // This issue arises because events are processed faster than records are created in Prisma/Postgres.
    // Specifically, the parent workflow execution record may not exist yet when attempting to create related step records.
    this.logger.info(
      `Updating step start projection for workflow execution with delay ${event.executionId} ${event.nodeId}`,
    );
    const timeout = 2500;
    this.logger.info(`Timeout set to ${timeout}ms`);

    await setTimeout(timeout);
    this.logger.info('***** TIMEOUT COMPLETE *****');
    return await this.updateStepForStartProjection(event);
  }

  async updateStepForStartProjection(
    event: WorkflowExecutionStepStartedEvent,
  ): Promise<boolean> {
    this.logger.info(
      `Updating step start projection for workflow execution ${event.executionId} ${event.nodeId}`,
    );
    try {
      // Map nodes to WorkflowExecutionStep objects
      const node = event.nodes.find((n) => n.nodeId === event.nodeId);
      const step = {
        startDate: node!.startDate ? new Date(node!.startDate) : null,
        status: node!.status,
        inputs:
          typeof node!.inputs === 'string'
            ? JSON.parse(node!.inputs)
            : (node!.inputs ?? {}),
      };

      // Update WorkflowExecutionStep
      await this.prismaService.workflowExecutionStep.update({
        where: {
          executionId_nodeId: {
            executionId: event.executionId,
            nodeId: event.nodeId,
          },
        },
        data: step,
      });

      this.logger.info('Step projection updated successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async updateParentNodeProjection(
    event: WorkflowExecutionParentNodeUpdatedEvent,
  ): Promise<boolean> {
    this.logger.info('Updating parent node projection for workflow execution');
    try {
      // Map nodes to WorkflowExecutionStep objects
      const node = event.nodes.find((n) => n.nodeId === event.nodeId);
      const step = {
        childWorkflowExecutionId: node!.childWorkflowExecutionId,
      };

      // Update WorkflowExecutionStep
      await this.prismaService.workflowExecutionStep.update({
        where: {
          executionId_nodeId: {
            executionId: node!.executionId!,
            nodeId: event.nodeId,
          },
        },
        data: step,
      });

      this.logger.info('Step projection updated successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  async updateStepForCompletionProjection(
    event: WorkflowExecutionStepCompletedEvent,
  ): Promise<boolean> {
    this.logger.info(
      'Updating step completion projection for workflow execution',
    );
    try {
      const node = event.nodes.find((n) => n.nodeId === event.completedNodeId);
      const step = {
        endDate: node!.endDate ? new Date(node!.endDate) : null,
        status: node!.status,
        outputs:
          typeof node!.outputs === 'string'
            ? JSON.parse(node!.outputs)
            : (node!.outputs ?? {}),
      };

      await this.prismaService.$transaction([
        this.prismaService.workflowExecution.update({
          where: { executionId: event.workflowExecutionId },
          data: {
            executionId: event.workflowExecutionId,
            status: event.status,
            runtimeState: event.runtimeState as any,
          },
        }),
        this.prismaService.workflowExecutionStep.update({
          where: {
            executionId_nodeId: {
              executionId: event.workflowExecutionId,
              nodeId: event.completedNodeId,
            },
          },
          data: step,
        }),
      ]);

      this.logger.info('Step projection updated successfully');
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
