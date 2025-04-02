import { App } from '@app/common/shared/event-sourcing/domain/models/app/app.aggregate';
import { IsString, IsOptional } from 'class-validator';

// import { Exclude, Expose } from 'class-transformer';

export class AppDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  tenantId: string;

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

  static from(app: App): AppDto {
    const dto = new AppDto();
    dto.id = app.id.value;
    dto.tenantId = app.tenantId;
    dto.name = app.name;
    dto.description = app.description;
    dto.created = app.created?.toISOString();
    dto.updated = app.updated?.toISOString();
    return dto;
  }
}
