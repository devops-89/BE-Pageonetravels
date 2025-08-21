import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  IsNotEmptyObject,
  IsNotEmpty,
  IsUUID,
  Min,Max,
  IsUrl
} from 'class-validator';
import {Type,Transform} from "class-transformer";
import { AmenityDto } from './package-amenites.dto';



export class CreatePackageDto {
  @IsString()
  package_name: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsString()
  @IsOptional()
  description?: string;


@IsOptional()
@IsString()
main_image?: string;

@IsArray()
@IsOptional()
@IsString({each: true})
gallery_image?: string[];


@IsOptional()
@IsString()
  banner_image: string;

  @IsString()
  package_slug: string;

  @IsString()
  package_day: string;

  

  @IsNumber()
  @Type(() => Number)
  package_price: number;

  @IsNumber()
  @Type(() => Number)
  selling_price: number;

  @IsString()
  package_destination: string;

  @IsString()
//   @IsOptional()
  near_by_location: string;

  @IsString()
  address1: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  zip: string;

  @IsString()
  package_type: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean = true;

  @IsString()

  highlight: string;

  @IsArray()
  @IsOptional()
  categories?: string[];

@IsArray()
@ValidateNested({ each: true })
@Type(() => AmenityDto)
@Transform(({ value }) => {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return [];
  }
})
amenities: AmenityDto[];

   
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  rating?: number;
}


export class PkgId {
   @IsUUID('4')
   @IsNotEmpty()
   id: string;
}