import { IWorkflowDataResolver } from '@app/application/interfaces/workflow-data-resolver.interface';
import { IWorkflowEmittedState } from '@app/application/interfaces/workflow-emitted-state.interface';
import { IWorkflowStep } from '@app/application/interfaces/workflow-step.interface';
import { WorkflowStatus } from '@app/common/shared/types/workflow-status';
import { Event, type IEvent } from '@ocoda/event-sourcing';

@Event('workflow-execution-started')
export class WorkflowExecutionStartedEvent implements IEvent {
  constructor(
    public readonly executionId: string,
    public readonly tenantId: string,
    public readonly templateId: string,
    public readonly startDate: number,
    public readonly nodes: IWorkflowStep[],
    public readonly inputState: IWorkflowEmittedState[],
    public readonly status: WorkflowStatus,
    public readonly workspaceId?: string,
    public readonly appId?: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly callbackUrl?: string,
    public readonly parentWorkflowExecutionId?: string,
    public readonly parentWorkflowExecutionNodeId?: string,
    public readonly inputSchemaDependency?: string,
    public readonly outputSchemaDependency?: string,
    public readonly outputResolvers?: IWorkflowDataResolver[],
    public readonly inputs?: any,
    public readonly isRoot?: boolean,
  ) {}
}
