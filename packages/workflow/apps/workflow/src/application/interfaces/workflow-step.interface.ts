import { ActionType } from '@app/common/shared/types/action-type';
import { ControlType } from '@app/common/shared/types/control-type';
import { StepFailureType } from '@app/common/shared/types/step-failure-type';
import { WorkflowStepFailActionType } from '@app/common/shared/types/workflow-step-fail-action-type';
import { WorkflowStepType } from '@app/common/shared/types/workflow-step-type';
import { IWorkflowDataResolver } from './workflow-data-resolver.interface';
import { IWorkflowNode } from './workflow-node.interface';

export interface IWorkflowStep extends IWorkflowNode {
  nodeId: string;
  type: WorkflowStepType;
  // Bottom two maintained by the system
  templateId?: string;
  executionId?: string;

  startDate?: number;
  endDate?: number;

  actionType?: ActionType;
  // if actionType is WORKFLOW then
  // this will be the child workflow
  // templateId to run
  childWorkflowTemplateId?: string;
  // if actionType is WORKFLOW then
  // this will be the child workflow
  // executionId that is running
  // Set by the system
  childWorkflowExecutionId?: string;
  // if actionType is WORKFLOW then
  // this will be workflowExecutionId
  // of the parent workflow
  // Set by the system
  parentWorkflowExecutionId?: string;
  // if actionType is WORKFLOW then
  // this will be workflowExecution
  // nodeId in the parent workflow
  // Set by the system
  parentWorkflowExecutionNodeId?: string;
  controlType?: ControlType;
  sandboxedJsCode?: string;
  edges?: string[];
  // What to do if the step fails
  failActionType?: WorkflowStepFailActionType;
  inputResolvers?: IWorkflowDataResolver[];
  // The type of step failure
  stepFailureType?: StepFailureType;
  // The failure message
  failureMessage?: string;
}
