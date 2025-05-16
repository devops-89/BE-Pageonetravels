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
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

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
  @IsInt()
  max_adults?: number = 2;

  @IsOptional()
  @IsInt()
  max_children?: number = 0;

  @IsNumber()
  base_price: number;

  @IsOptional()
  @IsNumber()
  tax_percentage?: number = 0;

  @IsOptional()
  @IsString()
  currency?: string = 'INR';

 
  
  main_image: CustomFile;

  @IsOptional()
  gallery_images?: CustomFile[];

  @IsObject()
  @ValidateNested()
  @Type(() => RoomAmenitiesDto)
  amenities: RoomAmenitiesDto;

  @IsOptional()
  @IsInt()
  number_of_rooms?: number = 1;

  @IsOptional()
  @IsInt()
  available_rooms?: number = 1;
}

