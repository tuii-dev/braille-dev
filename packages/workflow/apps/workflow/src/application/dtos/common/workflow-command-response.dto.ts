/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class WorkflowCommandResponseDto {
  @IsBoolean()
  success: boolean;

  @IsOptional()
  @IsString()
  executionId?: string;

  @IsOptional()
  @IsString()
  nodeId?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  constructor(
    success: boolean,
    executionId?: string,
    nodeId?: string,
    errorMessage?: string,
  ) {
    this.success = success;
    this.executionId = executionId;
    this.nodeId = nodeId;
    this.errorMessage = errorMessage;
  }
}
