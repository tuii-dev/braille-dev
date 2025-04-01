/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IsString, IsOptional, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  DATA_RESOLVER_TYPE_VALUES,
  DataResolverType,
} from '@app/common/shared/types/data-resolver-type';
import { IWorkflowDataResolver } from '../../interfaces/workflow-data-resolver.interface';

export class WorkflowDataResolverDto {
  @IsString()
  key: string;

  @IsIn(DATA_RESOLVER_TYPE_VALUES)
  @Transform(({ value }) => value as DataResolverType)
  type: DataResolverType;

  @IsOptional()
  @IsString()
  mapping?: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  static from(state: IWorkflowDataResolver) {
    const dto = new WorkflowDataResolverDto();
    dto.key = state.key;
    dto.type = state.type;
    dto.mapping = state.mapping;
    dto.prompt = state.prompt;
    return dto;
  }
}
