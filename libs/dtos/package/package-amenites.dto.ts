import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';
import { IsUUID } from 'class-validator';

export class AmeniteIdParams {
   @IsUUID('4')
  @IsNotEmpty()
  amenite_id: string;
}
 
export class CreatePackageAmeniteDto {
    @IsNotEmpty()
    @IsString()
    amenite_name: string;

    @IsOptional()
    @IsString()
    amenite_image?: string;
}

export class UpdatePackageAmeniteDto {
    @IsOptional()
    @IsString()
    amenite_name?: string;

    @IsOptional()
    @IsString()
    amenite_image?: string;
}

//  this DTO for use in CreatePackageDto
export class AmenityDto {
  @IsString()
  amenite_id: string;

  @IsString()
  amenite_name: string;

  @IsString()
  @IsOptional()
  amenite_image?: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;
}

