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


// class ImageDto {
//   @IsString()
//   @IsNotEmpty()
//   path: string;

//   @IsString()
//   @IsNotEmpty()
//   relativePath: string;

//   @IsString()
//   @IsNotEmpty()
//   preview: string;
// }

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
@IsUrl()
main_image?: string;

@IsArray()
@IsOptional()
@IsUrl({},{each: true})
gallery_image?: string[];


@IsOptional()
@IsUrl()
  banner_image: string;

  @IsString()
  package_slug: string;

  @IsString()
  package_day: string;

  

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

   
  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;
}


export class PkgId {
   @IsUUID('4')
   @IsNotEmpty()
   id: string;
}