import {
  IsNumber,
  IsString,
  IsPositive,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
} from 'class-validator';
import { Tenant } from '../../../domain/models';

// import { Exclude, Expose } from 'class-transformer';

export class TenantDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  operations?: number;

  @IsOptional()
  @IsString()
  created?: string;

  @IsOptional()
  @IsString()
  updated?: string;

  static from(tenant: Tenant): TenantDto {
    const dto = new TenantDto();
    dto.id = tenant.id.value;
    dto.name = tenant.name;
    dto.address = tenant.address;
    dto.city = tenant.city;
    dto.state = tenant.state;
    dto.country = tenant.country;
    dto.postalCode = tenant.postalCode;
    dto.contactPerson = tenant.contactPerson;
    dto.phoneNumber = tenant.phoneNumber;
    dto.email = tenant.email;
    dto.operations = tenant.operations;
    dto.created = tenant.created?.toISOString();
    dto.updated = tenant.updated?.toISOString();

    return dto;
  }
}
