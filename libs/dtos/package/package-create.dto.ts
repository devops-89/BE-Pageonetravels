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
} from 'class-validator';
import { Type } from 'class-transformer';

class ImageDto {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  relativePath: string;

  @IsString()
  @IsNotEmpty()
  preview: string;
}

export class CreatePackageDto {
  @IsString()
  package_name: string;

  @IsString()
  @IsOptional()
  short_description?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
//   @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  main_image: ImageDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  gallery_image?: ImageDto[];

  @IsArray()
//   @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  banner_image: ImageDto[];

  @IsString()
  package_slug: string;

  @IsString()
  package_day: string;

  @IsNumber()
  package_no_of_person: number;

  @IsNumber()
  package_price: number;

  @IsNumber()
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
  monthYear: string;

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
  @IsOptional()
  amenities?: string[];
}


export class PkgId {
   @IsUUID('4')
   @IsNotEmpty()
   id: string;
}