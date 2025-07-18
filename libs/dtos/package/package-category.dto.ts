import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

export class CreatePackageCategoryDto {
  @IsNotEmpty()
  @IsString()
  category_name: string;

 @IsOptional()
 @IsString()
  category_image?: string;
}

export class UpdatePackageCategoryDto {
  @IsNotEmpty()
  @IsString()
  category_name: string;

  @IsOptional()
  @IsString()
  category_image?: string; 
}