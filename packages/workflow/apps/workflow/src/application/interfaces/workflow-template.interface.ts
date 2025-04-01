import { IWorkflowDataResolver } from './workflow-data-resolver.interface';
import { IWorkflowNode } from './workflow-node.interface';
import { IWorkflowStep } from './workflow-step.interface';
import { WorkflowExecutionId } from '@app/domain/models/workflow-executions/workflow-execution-id';

export interface IWorkflowTemplate extends IWorkflowNode {
  tenantId: string;
  appId: string;
  workspaceId: string;
  nodes: IWorkflowStep[];
  templateId: string;
  executionId?: WorkflowExecutionId;
  startDate?: Date;
  endDate?: Date;
  callbackUrl?: string;
  outputResolvers?: IWorkflowDataResolver[];
}
