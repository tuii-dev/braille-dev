export type WorkflowStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

// USED IN DTOs
export const WORKFLOW_STATUS_VALUES: WorkflowStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
];
