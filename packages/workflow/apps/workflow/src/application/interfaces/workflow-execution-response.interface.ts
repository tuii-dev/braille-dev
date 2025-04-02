import { WorkflowResponseType } from '@app/common/shared/types/callback-result-type';
import { IWorkflowEmittedState } from './workflow-emitted-state.interface';
import { IWorkflowStepError } from './workflow-step-error.interface';

export interface WorkflowExecutionResponse {
  result: WorkflowResponseType;
  tenantId: string;
  executionId: string;
  templateId: string;
  status: string;
  timestamp: number;
  errorMessage?: string;
  data?: any;
  failedNodes?: IWorkflowStepError[];
  runtimeState?: IWorkflowEmittedState[];
}
