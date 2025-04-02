/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsOptional,
  IsIn,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  WORKFLOW_STATUS_VALUES,
  WorkflowStatus,
} from '@app/common/shared/types/workflow-status';
import { IsValidJsonSchema } from '../common/is-valid-schema.decorator';
import { WorkflowStepDto } from '../common/worklow-step.dto';
import { WorkflowEmittedStateDto } from '../common/workflow-emitted-state.dto';
import { WorkflowDataResolverDto } from '../common/workflow-data-resolver.dto';
import { WorkflowExecution } from 'apps/workflow/src/domain/models/workflow-executions/workflow-execution.aggregate';

export class WorkflowExecutionDto {
  @IsOptional()
  @IsString()
  executionId: string;

  @IsOptional()
  @IsString()
  templateId: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  appId?: string;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    { toPlainOnly: true },
  )
  startDate?: number;

  @IsOptional()
  @Transform(
    ({ value }) => (value ? new Date(value).toISOString() : undefined),
    { toPlainOnly: true },
  )
  endDate?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  nodes: WorkflowStepDto[];

  @ValidateNested({ each: true })
  @Type(() => WorkflowEmittedStateDto)
  runtimeState: WorkflowEmittedStateDto[];

  @IsOptional()
  @IsIn(WORKFLOW_STATUS_VALUES)
  @Transform(({ value }) => value as WorkflowStatus)
  status?: WorkflowStatus;

  @IsOptional()
  @IsString()
  parentWorkflowExecutionId?: string;

  @IsOptional()
  @IsString()
  parentWorkflowExecutionNodeId?: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @IsOptional()
  @IsString()
  @IsValidJsonSchema()
  inputSchemaDependency?: string;

  @IsOptional()
  @IsString()
  @IsValidJsonSchema()
  outputSchemaDependency?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WorkflowDataResolverDto)
  outputResolvers?: WorkflowDataResolverDto[];

  @IsOptional()
  inputs?: any;

  @IsOptional()
  outputs?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  failedNodeIds?: string[];

  @IsOptional()
  @IsString()
  failureMessage?: string;

  @IsOptional()
  @IsBoolean()
  isRoot?: boolean;

  static from(execution: WorkflowExecution): WorkflowExecutionDto {
    const dto = new WorkflowExecutionDto();
    dto.executionId = execution.executionId.value;
    dto.tenantId = execution.tenantId;
    dto.templateId = execution.templateId;
    dto.appId = execution.appId;
    dto.workspaceId = execution.workspaceId;
    dto.startDate = execution.startDate;
    dto.endDate = execution.endDate;
    dto.name = execution.name;
    dto.description = execution.description;
    dto.nodes = execution.nodes?.map((n) => WorkflowStepDto.from(n)) ?? [];
    dto.runtimeState =
      execution.runtimeState?.map((n) => WorkflowEmittedStateDto.from(n)) ?? [];
    dto.status = execution.status;
    dto.parentWorkflowExecutionId = execution.parentWorkflowExecutionId;
    dto.parentWorkflowExecutionNodeId = execution.parentWorkflowExecutionNodeId;
    dto.callbackUrl = execution.callbackUrl;
    dto.inputSchemaDependency = execution.inputSchemaDependency;
    dto.outputSchemaDependency = execution.outputSchemaDependency;
    dto.outputResolvers =
      execution.outputResolvers?.map((n) => WorkflowDataResolverDto.from(n)) ??
      [];
    dto.inputs = execution.inputs;
    dto.outputs = execution.outputs;
    dto.failedNodeIds = execution.failedNodeIds ?? [];
    dto.failureMessage = execution.failureMessage;
    dto.isRoot = execution.isRoot ?? false;

    return dto;
  }
}
