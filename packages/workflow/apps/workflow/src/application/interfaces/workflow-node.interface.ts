import { WorkflowStatus } from '@app/common/shared/types/workflow-status';
import { IWorkflowSchemaDependence } from './workflow-schema.interface';

export interface IWorkflowNode extends IWorkflowSchemaDependence {
  name?: string;
  description?: string;
  status?: WorkflowStatus;
}
