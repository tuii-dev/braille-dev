export type WorkflowResponseType =
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED';

// USED IN DTOs
export const WORKFLOW_RESPONSE_TYPE_VALUES: WorkflowResponseType[] = [
  'COMPLETED',
  'COMPLETED_WITH_ERRORS',
  'FAILED',
];
