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

