/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Aggregate, AggregateRoot, EventHandler } from '@ocoda/event-sourcing';

import {
  WorkflowExecutionStartedEvent,
  WorkflowExecutionStepFailedEvent,
} from '../../events';
import { PinoLogger } from 'nestjs-pino';
import { IWorkflowTemplate } from '@app/application/interfaces/workflow-template.interface';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';
import { WorkflowStatus } from '@app/common/shared/types/workflow-status';
import { WorkflowExecutionId } from './workflow-execution-id';
import { WorkflowStepNotFoundException } from '@app/domain/exceptions/workflow-step-not-found.exception';
import { WorkflowExecutionStepId } from './workflow-execution-step-id';
import { WorkflowExecutionStepStartedEvent } from '@app/domain/events/workflow-executions/workflow-execution-step-started.event';
import { WorkflowExecutionStepCompletedEvent } from '@app/domain/events/workflow-executions/workflow-execution-step-completed.event';
import { WorkflowExecutionCompletedEvent } from '@app/domain/events/workflow-executions/workflow-execution-completed.event';
import { WorkflowStepFailActionType } from '@app/common/shared/types/workflow-step-fail-action-type';
import { WorkflowExecutionParentNodeUpdatedEvent } from '@app/domain/events/workflow-executions/workflow-execution-parent-node-updated.event';
import { WorkflowExecutionDto } from '@app/application/dtos/workflow-executions/workflow-execution.dto';
import { IWorkflowEmittedState } from '@app/application/interfaces/workflow-emitted-state.interface';
import { StepFailureType } from '@app/common/shared/types/step-failure-type';
import { IWorkflowDataResolver } from '@app/application/interfaces/workflow-data-resolver.interface';
import { WorkflowExecutionFailedEvent } from '@app/domain/events/workflow-executions/workflow-execution-failed.event';

@Aggregate({ streamName: 'workflow-execution' })
export class WorkflowExecution extends AggregateRoot {
  private static logger: PinoLogger;

  public static setLogger(logger: PinoLogger) {
    WorkflowExecution.logger = logger;
  }

  public executionId: WorkflowExecutionId;
  public templateId: string;
  public tenantId: string;
  public workspaceId?: string;
  public appId?: string;
  public startDate?: number;
  public endDate?: number;
  public name?: string;
  public description?: string;
  public nodes?: IWorkflowStep[];
  public runtimeState?: IWorkflowEmittedState[];
  public status?: WorkflowStatus;
  public parentWorkflowExecutionId?: string;
  public parentWorkflowExecutionNodeId?: string;
  public callbackUrl?: string;
  public inputSchemaDependency?: string;
  public outputSchemaDependency?: string;
  public outputResolvers?: IWorkflowDataResolver[];
  public inputs?: any;
  public outputs?: any;
  public failedNodeIds?: string[];
  public failureMessage?: string;
  public isRoot?: boolean;

  public static start({
    workflowExecutionId,
    tenantId,
    workspaceId,
    appId,
    workflowTemplate,
    inputState,
    callbackUrl,
    parentWorkflowExecutionId,
    parentWorkflowExecutionNodeId,
    isRoot,
  }: {
    workflowExecutionId: WorkflowExecutionId;
    tenantId: string;
    workspaceId?: string;
    appId?: string;
    workflowTemplate: IWorkflowTemplate;
    inputState: IWorkflowEmittedState;
    callbackUrl?: string;
    parentWorkflowExecutionId?: string;
    parentWorkflowExecutionNodeId?: string;
    isRoot?: boolean;
  }) {
    const startDate = new Date().getTime();
    WorkflowExecution.logger?.info('Starting workflow execution', {
      workflowExecutionId: workflowExecutionId.value,
    });

    const workflowExecution = new WorkflowExecution();
    workflowExecution.applyEvent(
      new WorkflowExecutionStartedEvent(
        workflowExecutionId.value,
        tenantId,
        workflowTemplate.templateId,
        startDate,
        workflowTemplate.nodes ?? [],
        [inputState],
        'IN_PROGRESS',
        workspaceId,
        appId,
        workflowTemplate.name,
        workflowTemplate.description,
        callbackUrl,
        parentWorkflowExecutionId,
        parentWorkflowExecutionNodeId,
        workflowTemplate.inputSchemaDependency,
        workflowTemplate.outputSchemaDependency,
        workflowTemplate.outputResolvers,
        inputState.data,
        isRoot ?? false,
      ),
    );
    return workflowExecution;
  }

  startWorkflowStep(
    nodeId: string,
    inputs?: any,
    isFirstNode: boolean = false,
  ) {
    WorkflowExecution.logger?.info(`Starting workflow step: ${nodeId}`);

    const node = this.nodes!.find((n) => n.nodeId === nodeId);

    if (!node) {
      throw WorkflowStepNotFoundException.withId(
        WorkflowExecutionStepId.generate(),
        nodeId,
      );
    }
    const nodes = this.nodes!.map((n) => {
      if (n.nodeId === nodeId) {
        return {
          ...node,
          status: 'IN_PROGRESS',
          inputs,
          startDate: new Date().getTime(),
        };
      }
      return n;
    });

    WorkflowExecution.logger?.info(
      `Workflow step started: ${nodeId}.  Updated nodes: ${JSON.stringify(nodes)}`,
    );

    this.applyEvent(
      new WorkflowExecutionStepStartedEvent(
        nodeId,
        this.executionId.value,
        nodes as IWorkflowStep[],
        isFirstNode ?? false,
      ),
    );
  }
  completeWorkflowStep(
    nodeId: string,
    state: IWorkflowEmittedState,
    outputs?: any,
  ) {
    WorkflowExecution.logger?.info(`Completing workflow step: ${nodeId}`);

    const node = this.nodes!.find((n) => n.nodeId === nodeId);

    if (!node) {
      throw WorkflowStepNotFoundException.withId(
        WorkflowExecutionStepId.generate(),
        nodeId,
      );
    }
    const nodes = this.nodes!.map((n) => {
      if (n.nodeId === nodeId) {
        return {
          ...node,
          status: 'COMPLETED',
          outputs,
          endDate: new Date().getTime(),
        };
      }
      return n;
    });

    WorkflowExecution.logger?.info(
      `Workflow step completed: ${nodeId}.  Updated nodes: ${JSON.stringify(nodes)}`,
    );

    const newRuntimeState = [...(this.runtimeState ?? []), state];

    this.applyEvent(
      new WorkflowExecutionStepCompletedEvent(
        this.tenantId,
        this.executionId.value,
        nodeId,
        nodes as IWorkflowStep[],
        this.status ?? 'IN_PROGRESS',
        newRuntimeState,
        this.workspaceId,
        this.appId,
      ),
    );
  }

  failWorkflowStep(
    nodeId: string,
    stepFailureType: StepFailureType,
    failureMessage?: string,
    outputs?: any,
    failActionType?: WorkflowStepFailActionType,
  ) {
    WorkflowExecution.logger?.info(`Failing workflow step: ${nodeId}`);

    const node = this.nodes!.find((n) => n.nodeId === nodeId);

    if (!node) {
      throw WorkflowStepNotFoundException.withId(
        WorkflowExecutionStepId.generate(),
        nodeId,
      );
    }
    const nodes = this.nodes!.map((n) => {
      if (n.nodeId === nodeId) {
        return {
          ...node,
          status: 'FAILED',
          outputs,
          endDate: new Date().getTime(),
          stepFailureType,
          failureMessage,
        };
      }
      return n;
    });

    WorkflowExecution.logger?.info(
      `Workflow step FAILED: ${nodeId}.   Step fail action type: ${failActionType}. Updated nodes: ${JSON.stringify(nodes)}`,
    );

    const workflowStatus =
      failActionType === 'CONTINUE' ? this.status : 'FAILED';

    const failedNodeIds = [...(this.failedNodeIds ?? []), nodeId];

    this.applyEvent(
      new WorkflowExecutionStepFailedEvent(
        this.tenantId,
        this.executionId.value,
        nodeId,
        failedNodeIds,
        workflowStatus!,
        nodes as IWorkflowStep[],
        this.workspaceId,
        this.appId,
        this.parentWorkflowExecutionId,
        this.parentWorkflowExecutionNodeId,
        this.callbackUrl,
      ),
    );
  }

  updateParentWorkflowExecutionNode(
    parentWorkflowExecutionNodeId: string,
    childWorkflowExecutionId: string,
  ) {
    WorkflowExecution.logger?.info(
      `Parent execution node update: ${this.executionId.value}. Updating parent workflow execution node: ${parentWorkflowExecutionNodeId} with child workflow execution id: ${childWorkflowExecutionId}`,
    );

    const nodeIndex = this.nodes!.findIndex(
      (n) => n.nodeId === parentWorkflowExecutionNodeId,
    );

    if (nodeIndex === -1) {
      WorkflowExecution.logger?.error(
        `Parent execution node not found: ${parentWorkflowExecutionNodeId}`,
      );
      throw WorkflowStepNotFoundException.withId(
        WorkflowExecutionStepId.generate(),
        parentWorkflowExecutionNodeId,
      );
    } else {
      const nodes = this.nodes!.map((n) => {
        if (n.nodeId === parentWorkflowExecutionNodeId) {
          return {
            ...n,
            childWorkflowExecutionId,
          };
        }
        return n;
      });

      WorkflowExecution.logger?.info(
        'Firing WorkflowExecutionParentNodeUpdatedEvent',
        {
          executionId: this.executionId,
          nodes: nodes,
        },
      );
      this.applyEvent(
        new WorkflowExecutionParentNodeUpdatedEvent(
          parentWorkflowExecutionNodeId,
          nodes,
        ),
      );
    }
  }
  completeWorkflow(outputs: any) {
    WorkflowExecution.logger?.info(
      `Completing workflow: ${this.executionId.value}`,
    );

    const now = new Date().getTime();
    this.applyEvent(
      new WorkflowExecutionCompletedEvent(
        this.tenantId,
        this.executionId.value,
        'COMPLETED',
        this.startDate ?? now,
        now,
        this.callbackUrl,
        this.parentWorkflowExecutionId,
        outputs,
      ),
    );
  }

  failWorkflow(errorMessage: string) {
    WorkflowExecution.logger?.info(
      `Failing workflow: ${this.executionId.value}`,
    );

    this.applyEvent(
      new WorkflowExecutionFailedEvent(
        this.executionId.value,
        'FAILED',
        errorMessage,
        new Date().getTime(),
      ),
    );
  }

  public toDto(): WorkflowExecutionDto {
    return WorkflowExecutionDto.from(this);
  }

  @EventHandler(WorkflowExecutionStartedEvent)
  onWorkflowExecutionStartedEvent(event: WorkflowExecutionStartedEvent) {
    WorkflowExecution.logger?.info(
      'Processing WorkflowExecutionStartedEvent in WorkflowExecution aggregate',
      {
        executionId: event.executionId,
      },
    );
    this.executionId = WorkflowExecutionId.from(event.executionId);
    this.tenantId = event.tenantId;
    this.templateId = event.templateId;
    this.startDate = event.startDate;
    this.name = event.name;
    this.description = event.description;
    this.nodes = event.nodes;
    this.runtimeState = event.inputState;
    this.status = event.status;
    this.workspaceId = event.workspaceId;
    this.appId = event.appId;
    this.callbackUrl = event.callbackUrl;
    this.parentWorkflowExecutionId = event.parentWorkflowExecutionId;
    this.parentWorkflowExecutionNodeId = event.parentWorkflowExecutionNodeId;
    this.inputSchemaDependency = event.inputSchemaDependency;
    this.outputSchemaDependency = event.outputSchemaDependency;
    this.outputResolvers = event.outputResolvers;
    this.inputs = event.inputs;
    this.isRoot = event.isRoot;
  }

  @EventHandler(WorkflowExecutionStepStartedEvent)
  onWorkflowExecutionStepStartedEvent(
    event: WorkflowExecutionStepStartedEvent,
  ) {
    WorkflowExecution.logger?.info(
      'Processing WorkflowExecutionStepStartedEvent in WorkflowExecution aggregate',
      {
        executionId: this.executionId,
        event: event,
      },
    );
    this.nodes = event.nodes;
  }

  @EventHandler(WorkflowExecutionStepCompletedEvent)
  onWorkflowExecutionStepCompletedEvent(
    event: WorkflowExecutionStepCompletedEvent,
  ) {
    WorkflowExecution.logger?.info(
      'Processing onWorkflowExecutionStepCompletedEvent in WorkflowExecution aggregate',
      {
        executionId: this.executionId,
        event: event,
      },
    );
    this.nodes = event.nodes;
    this.runtimeState = event.runtimeState;
  }

  @EventHandler(WorkflowExecutionStepFailedEvent)
  onWorkflowExecutionStepFailedEvent(event: WorkflowExecutionStepFailedEvent) {
    WorkflowExecution.logger?.info(
      'Processing onWorkflowExecutionStepFailedEvent in WorkflowExecution aggregate',
      {
        executionId: this.executionId,
        event: event,
      },
    );
    this.nodes = event.nodes;
    this.status = event.status;
    this.failedNodeIds = event.failedNodeIds;
  }

  @EventHandler(WorkflowExecutionCompletedEvent)
  onWorkflowExecutionCompletedEvent(event: WorkflowExecutionCompletedEvent) {
    WorkflowExecution.logger?.info(
      'Processing onWorkflowExecutionCompletedEvent in WorkflowExecution aggregate',
      {
        executionId: this.executionId,
        event: event,
      },
    );
    this.status = event.status;
    this.endDate = event.endDate;
    this.outputs = event.outputs;
  }

  @EventHandler(WorkflowExecutionFailedEvent)
  onWorkflowExecutionFailedEvent(event: WorkflowExecutionFailedEvent) {
    WorkflowExecution.logger?.info(
      'Processing onWorkflowExecutionFailedEvent in WorkflowExecution aggregate',
      {
        executionId: this.executionId,
        event: event,
      },
    );
    this.status = 'FAILED';
    this.failureMessage = event.errorMessage;
  }

  @EventHandler(WorkflowExecutionParentNodeUpdatedEvent)
  onWorkflowExecutionParentNodeUpdatedEvent(
    event: WorkflowExecutionParentNodeUpdatedEvent,
  ) {
    WorkflowExecution.logger?.info(
      'Processing ParentWorkflowExecutionNodeUpdatedEvent in WorkflowExecution aggregate',
      {
        executionId: this.executionId,
        event: event,
      },
    );
    this.nodes = event.nodes;
  }
}
