/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsOptional,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IsValidJsonSchema } from '../common/is-valid-schema.decorator';
import { WorkflowStepDto } from '../common/worklow-step.dto';
import { WorkflowDataResolverDto } from '../common/workflow-data-resolver.dto';
import { WorkflowTemplate } from 'apps/workflow/src/domain/models/workflow-templates/workflow-template.aggregate';

export class WorkflowTemplateDto {
  @IsOptional()
  @IsString()
  templateId: string;

  @IsOptional()
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  appId?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  nodes: WorkflowStepDto[];

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
  @Transform(
    ({ value }) =>
      value && typeof value === 'number'
        ? new Date(value).toISOString()
        : undefined,
    {
      toPlainOnly: true,
    },
  )
  created?: number;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value && typeof value === 'number'
        ? new Date(value).toISOString()
        : undefined,
    {
      toPlainOnly: true,
    },
  )
  updated?: number;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value && typeof value === 'number'
        ? new Date(value).toISOString()
        : undefined,
    {
      toPlainOnly: true,
    },
  )
  deletedAt?: number;

  static from(template: WorkflowTemplate): WorkflowTemplateDto {
    const dto = new WorkflowTemplateDto();
    dto.templateId = template.templateId.value;
    dto.tenantId = template.tenantId;
    dto.appId = template.appId;
    dto.workspaceId = template.workspaceId;
    dto.name = template.name;
    dto.description = template.description;
    dto.callbackUrl = template.callbackUrl;
    dto.nodes = template.nodes?.map((n) => WorkflowStepDto.from(n)) ?? [];
    dto.inputSchemaDependency = template.inputSchemaDependency;
    dto.outputSchemaDependency = template.outputSchemaDependency;
    dto.outputResolvers =
      template.outputResolvers?.map((n) => WorkflowDataResolverDto.from(n)) ??
      [];
    dto.created = template.created;
    dto.updated = template.updated;
    dto.deleted = template.deleted;
    dto.deletedAt = template.deletedAt;
    return dto;
  }
}
