import { StateEmitterType } from '@app/common/shared/types/state-emitter-type';

export interface IWorkflowEmittedState {
  type: StateEmitterType;
  id: string;
  validationSchema?: string;
  validationTimestamp?: number;
  data?: any;
}
