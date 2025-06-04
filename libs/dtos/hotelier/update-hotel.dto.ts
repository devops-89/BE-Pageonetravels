import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

class AmenitiesDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  wifi?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  ac?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  restaurant?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  pool?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  gym?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  spa?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  bar?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  laundry?: boolean;
}

export class UpdateHotelDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  type?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  star_rating?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  address_line?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  state?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  country?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  postal_code?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_name?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  contact_email?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_phone?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  alternate_phone?: string;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_in_time must be in the format HH:mm:ss',
  })
  @Transform(({ value }) => value?.trim())
  check_in_time?: string;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_out_time must be in the format HH:mm:ss',
  })
  @Transform(({ value }) => value?.trim())
  check_out_time?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  cancellation_policy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  child_policy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  pet_policy?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  base_price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  tax_percentage?: number;

  // @IsOptional()
  // @IsString()
  // @Transform(({ value }) => value?.trim())
  // currency?: string;

  // ✅ Nested Amenities Object
  @IsOptional()
  @ValidateNested()
  @Type(() => AmenitiesDto)
  amenities?: AmenitiesDto;

  @IsOptional()
  main_image?: CustomFile;

  @IsOptional()
  gallery_images?: CustomFile[];
}
