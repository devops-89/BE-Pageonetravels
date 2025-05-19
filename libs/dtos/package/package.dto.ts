import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDecimal,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  package_name: string;

  @IsString()
  @IsNotEmpty()
  short_description?: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  image?: string;

  @IsString()
  @IsNotEmpty()
  package_slug: string;

  @Type(() => Number)
  @IsNumber()
  package_day: number;

  @Type(() => Number)
  @IsNumber()
  package_no_of_person: number;

//   @Type(() => Number)
//   @IsNumber({ maxDecimalPlaces: 2 })
//   customize_day_price: number;

//   @Type(() => Number)
//   @IsNumber({ maxDecimalPlaces: 2 })
//   customize_person_price: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  package_price: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  selling_price: number;

  @IsString()
  @IsNotEmpty()
  package_destination: string;

  @IsString()
  @IsNotEmpty()
  near_by_location?: string;

  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsOptional()
  zip: string;

  @IsString()
  @IsOptional()
  monthYear: string;

  @IsString()
  @IsNotEmpty()
  package_type: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsString()
  @IsNotEmpty()
  highlight?: string;
}
