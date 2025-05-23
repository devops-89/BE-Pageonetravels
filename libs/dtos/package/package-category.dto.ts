import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

export class CreatePackageCategoryDto {
  @IsNotEmpty()
  @IsString()
  category_name: string;

  @IsNotEmpty()
  category_image: CustomFile;
}


export class UpdatePackageCategoryDto {
  @IsOptional()
  @IsString()
  category_name: string;

  @IsOptional()
  category_image: CustomFile;
}