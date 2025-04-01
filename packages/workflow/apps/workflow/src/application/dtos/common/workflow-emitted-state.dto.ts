/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  STATE_EMITTER_TYPE_VALUES,
  StateEmitterType,
} from '@app/common/shared/types/state-emitter-type';
import { IWorkflowEmittedState } from '../../interfaces/workflow-emitted-state.interface';

export class WorkflowEmittedStateDto {
  @IsIn(STATE_EMITTER_TYPE_VALUES)
  @Transform(({ value }) => value as StateEmitterType)
  type: StateEmitterType;

  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  validationSchema?: string;

  @IsOptional()
  @IsNumber()
  validationTimestamp?: number;

  @IsOptional()
  data?: any;

  static from(state: IWorkflowEmittedState) {
    const dto = new WorkflowEmittedStateDto();
    dto.type = state.type;
    dto.id = state.id;
    dto.validationSchema = state.validationSchema;
    dto.validationTimestamp = state.validationTimestamp;
    dto.data = state.data;
    return dto;
  }
}
