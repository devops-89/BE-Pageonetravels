import { 
  IsArray, 
  IsBoolean, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUUID, 
  IsNumber,
  IsPositive,
  IsNumberString
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHotelRoomDto {
  @IsUUID()
  @IsNotEmpty()
  hotel_id: string;

  @IsString()
  @IsNotEmpty()
  room_type: string;

  @IsString()
  @IsNotEmpty()
  room_title: string;

  @IsString()
  @IsOptional()
  room_description?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  max_adults?: number = 2;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  max_children?: number = 0;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  base_price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Type(() => Number)
  tax_percentage?: number = 0;

  @IsString()
  @IsOptional()
  currency?: string = 'INR';

  @IsString()
  @IsOptional()
  main_image?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gallery_images?: string[];

  // Amenities
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  wifi?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  ac?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  tv?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  balcony?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  attached_bathroom?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  room_service?: boolean = false;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  breakfast_included?: boolean = false;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  number_of_rooms?: number = 1;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  available_rooms?: number = 1;
}