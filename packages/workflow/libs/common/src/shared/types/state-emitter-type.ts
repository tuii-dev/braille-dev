export type StateEmitterType =
  | 'WORKFLOW_INPUT_ARGS'
  | 'STEP'
  | 'WORKFLOW_RETURN_VALUE';

// USED IN DTOs
export const STATE_EMITTER_TYPE_VALUES: StateEmitterType[] = [
  'WORKFLOW_INPUT_ARGS',
  'STEP',
  'WORKFLOW_RETURN_VALUE',
];
