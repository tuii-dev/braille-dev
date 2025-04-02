import { Workspace } from '@app/common/shared/event-sourcing/domain/models/workspace/workspace.aggregate';
import { IsString, IsOptional } from 'class-validator';

// import { Exclude, Expose } from 'class-transformer';

export class WorkspaceDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  appId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  created?: string;

  @IsOptional()
  @IsString()
  updated?: string;

  static from(workspace: Workspace): WorkspaceDto {
    const dto = new WorkspaceDto();
    dto.id = workspace.id.value;
    dto.tenantId = workspace.tenantId;
    dto.appId = workspace.appId;
    dto.name = workspace.name;
    dto.description = workspace.description;
    dto.created = workspace.created?.toISOString();
    dto.updated = workspace.updated?.toISOString();
    return dto;
  }
}
