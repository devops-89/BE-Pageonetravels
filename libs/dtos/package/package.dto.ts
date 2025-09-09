import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class PackageFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

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
  packageDay?: string;

  @IsOptional()
  @IsString()
  packageType?: string;
}