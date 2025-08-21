import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsInt,
  IsArray,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

class AmenitiesDto {
  @IsBoolean()
  @Type(() => Boolean)
  wifi: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  parking: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  ac: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  restaurant: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  pool: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  gym: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  spa: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  bar: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  laundry: boolean;
}

export class CreateHotelDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  type: string;

  @IsInt()
  @Type(() => Number)
  star_rating: number;

  @IsString()
  @Transform(({ value }) => value?.trim())
  address_line: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  city: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  state: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  country: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  postal_code: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_name: string;

  @IsEmail()
  @Transform(({ value }) => value?.trim())
  contact_email: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  contact_phone: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  alternate_phone?: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_in_time must be in the format HH:mm:ss',
  })
  @Transform(({ value }) => value?.trim())
  check_in_time: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_out_time must be in the format HH:mm:ss',
  })
  @Transform(({ value }) => value?.trim())
  check_out_time: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  cancellation_policy: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  child_policy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  pet_policy?: string;

  @IsNumber()
  @Type(() => Number)
  base_price: number;

  @IsNumber()
  @Type(() => Number)
  tax_percentage: number;

  @IsString()
  @Transform(({ value }) => value?.trim())
  currency: string;

  // Nested amenities object
   // ✅ Fixed amenities transformation for FormData
  @ValidateNested()
  @Type(() => AmenitiesDto)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  amenities: AmenitiesDto;

  // File upload fields
  @IsOptional()
  @IsString()
  main_image: string;

  @IsArray()
  @IsOptional()
  @IsString({each: true})
  gallery_images?: string[];
}
