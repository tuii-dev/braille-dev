export type ControlType =
  | 'IF'
  | 'SWITCH'
  | 'FOR_EACH'
  | 'MAP'
  | 'REDUCE'
  | 'FILTER'
  | 'JOIN'
  | 'START_WORKFLOW'
  | 'END_WORKFLOW'
  | 'START_INGESTION'
  | 'END_INGESTION';

export const CONTROL_TYPE_VALUES: ControlType[] = [
  'IF',
  'SWITCH',
  'FOR_EACH',
  'MAP',
  'REDUCE',
  'FILTER',
  'JOIN',
  'START_WORKFLOW',
  'END_WORKFLOW',
  'START_INGESTION',
  'END_INGESTION',
];
