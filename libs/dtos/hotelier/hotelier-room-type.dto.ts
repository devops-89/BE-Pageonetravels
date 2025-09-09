import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsInt,

  IsDecimal,
  IsPositive,
  IsArray,
  IsEnum,
  IsObject,
  ValidateNested,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type,plainToInstance,Transform } from 'class-transformer';
import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';
import { Room } from 'twilio/lib/twiml/VoiceResponse';
export class RoomAmenitiesDto {
  @IsBoolean()
  wifi: boolean;
  @IsBoolean()
  ac: boolean;
  @IsBoolean()
  tv: boolean;
  @IsBoolean()
  balcony: boolean;
  @IsBoolean()
  attached_bathroom: boolean;
  @IsBoolean()
  room_service: boolean;
  @IsBoolean()
  breakfast_included: boolean;
}

export class CreateHotelRoomDto {
  @IsUUID()
  hotel_id: string;

  @IsString()
  room_type: string;

  @IsString()
  room_title: string;

  @IsOptional()
  @IsString()
  room_description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  max_adults?: number = 2;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  max_children?: number = 0;

  @Type(() => Number)
  @IsNumber()
  base_price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tax_percentage?: number = 0;

  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @IsOptional()
  @IsString()
  main_image: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  gallery_images?: string[];

 
  // Nested amenities object
@ValidateNested()
@Type(() => RoomAmenitiesDto)
@Transform(({ value }) => {
   console.log('Raw amenities value:', value);

  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return plainToInstance(RoomAmenitiesDto, JSON.parse(value));
    } catch {
      return {};
    }
  }
  if (typeof value === 'object') {
    return plainToInstance(RoomAmenitiesDto, value);
  }
  return {};
})
amenities: RoomAmenitiesDto;


  @IsOptional()
  @Type(() => Number)
  @IsInt()
  number_of_rooms?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  available_rooms?: number = 1;

  // @Type(() => Number)
  // @IsInt()
  // @Min(1)
  // max_guests: number;
}
