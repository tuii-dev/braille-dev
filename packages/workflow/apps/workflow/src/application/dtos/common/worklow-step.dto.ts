/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  WORKFLOW_STATUS_VALUES,
  WorkflowStatus,
} from '@app/common/shared/types/workflow-status';
import { IsValidJsonSchema } from '../common/is-valid-schema.decorator';
import {
  WORKFLOW_STEP_TYPE_VALUES,
  WorkflowStepType,
} from '@app/common/shared/types/workflow-step-type';
import {
  ACTION_TYPE_VALUES,
  ActionType,
} from '@app/common/shared/types/action-type';
import {
  CONTROL_TYPE_VALUES,
  ControlType,
} from '@app/common/shared/types/control-type';
import {
  WORKFLOW_STEP_FAIL_ACTION_TYPE_VALUES,
  WorkflowStepFailActionType,
} from '@app/common/shared/types/workflow-step-fail-action-type';
import { WorkflowDataResolverDto } from './workflow-data-resolver.dto';
import {
  STEP_FAILURE_TYPE_VALUES,
  StepFailureType,
} from '@app/common/shared/types/step-failure-type';
import { IWorkflowStep } from '../../interfaces/workflow-step.interface';

export class WorkflowStepDto {
  @IsString()
  nodeId: string;

  @IsIn(WORKFLOW_STEP_TYPE_VALUES)
  @Transform(({ value }) => value as WorkflowStepType)
  type: WorkflowStepType;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  executionId?: string;

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

  @IsOptional()
  @IsIn(WORKFLOW_STATUS_VALUES)
  @Transform(({ value }) => value as WorkflowStatus)
  status?: WorkflowStatus;

  @IsOptional()
  @IsIn(ACTION_TYPE_VALUES)
  @Transform(({ value }) => value as ActionType)
  actionType?: ActionType;

  @IsOptional()
  @IsString()
  childWorkflowTemplateId?: string;

  @IsOptional()
  @IsString()
  childWorkflowExecutionId?: string;

  @IsOptional()
  @IsString()
  parentWorkflowExecutionId?: string;

  @IsOptional()
  @IsString()
  parentWorkflowExecutionNodeId?: string;

  @IsOptional()
  @IsIn(CONTROL_TYPE_VALUES)
  @Transform(({ value }) => value as ControlType)
  controlType?: ControlType;

  @IsOptional()
  @IsString()
  sandboxedJsCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  edges?: string[];

  @IsOptional()
  @IsIn(WORKFLOW_STEP_FAIL_ACTION_TYPE_VALUES)
  @Transform(({ value }) => value as WorkflowStepFailActionType)
  failActionType?: WorkflowStepFailActionType;

  @ValidateNested({ each: true })
  @Type(() => WorkflowDataResolverDto)
  inputResolvers?: WorkflowDataResolverDto[];

  @IsOptional()
  @IsString()
  @IsValidJsonSchema()
  inputSchemaDependency?: string;

  @IsOptional()
  @IsString()
  @IsValidJsonSchema()
  outputSchemaDependency?: string;

  @IsOptional()
  inputs?: any;

  @IsOptional()
  outputs?: any;

  @IsOptional()
  @IsIn(STEP_FAILURE_TYPE_VALUES)
  @Transform(({ value }) => value as StepFailureType)
  stepFailureType?: StepFailureType;

  @IsOptional()
  @IsString()
  failureMessage?: string;

  static from(node: IWorkflowStep) {
    const dto = new WorkflowStepDto();
    dto.nodeId = node.nodeId;
    dto.type = node.type;
    dto.templateId = node.templateId;
    dto.executionId = node.executionId;
    dto.startDate = node.startDate;
    dto.endDate = node.endDate;
    dto.name = node.name;
    dto.description = node.description;
    dto.status = node.status;
    dto.actionType = node.actionType;
    dto.childWorkflowTemplateId = node.childWorkflowTemplateId;
    dto.childWorkflowExecutionId = node.childWorkflowExecutionId;
    dto.parentWorkflowExecutionId = node.parentWorkflowExecutionId;
    dto.parentWorkflowExecutionNodeId = node.parentWorkflowExecutionNodeId;
    dto.controlType = node.controlType;
    dto.sandboxedJsCode = node.sandboxedJsCode;
    dto.edges = node.edges;
    dto.failActionType = node.failActionType ?? 'ABORT_WORKFLOW';
    dto.inputResolvers = node.inputResolvers;
    dto.inputSchemaDependency = node.inputSchemaDependency;
    dto.outputSchemaDependency = node.outputSchemaDependency;
    dto.inputs = node.inputs;
    dto.outputs = node.outputs;
    dto.stepFailureType = node.stepFailureType;
    dto.failureMessage = node.failureMessage;
    return dto;
  }
}
