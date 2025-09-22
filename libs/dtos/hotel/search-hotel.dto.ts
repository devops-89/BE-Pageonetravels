import { IsArray, IsBoolean, IsDateString, IsInt, IsIP, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PaxRoomDto {
  @IsNumber()
  @IsNotEmpty()
  Adults: number;

  @IsNumber()
  @IsNotEmpty()
  Children: number;

  @IsArray()
  @IsOptional()
  ChildrenAges?: number[] | null; // Made optional and can be null
}

class FiltersDto {
  @IsBoolean()
  @IsNotEmpty()
  Refundable: boolean;

  @IsNumber()
  @IsNotEmpty()
  NoOfRooms: number;

  @IsNumber()
  @IsNotEmpty()
  MealType: number;

  @IsNumber()
  @IsNotEmpty()
  OrderBy: number;

  @IsNumber()
  @IsNotEmpty()
  StarRating: number;

  @IsString()
  @IsOptional() // Made optional since it can be null
  HotelName?: string | null;
}

export class HotelSearchRequestDto {
  @IsDateString()
  @IsNotEmpty()
  CheckIn: string;

  @IsDateString()
  @IsNotEmpty()
  CheckOut: string;

  @IsString()
  @IsNotEmpty()
  CityCodes: string;

  @IsString()
  @IsNotEmpty()
  GuestNationality: string;

  @IsIP()
  @IsNotEmpty()
  EndUserIp: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaxRoomDto)
  PaxRooms: PaxRoomDto[];

  @IsNumber()
  @IsOptional() // Made optional since it's not marked as required in your example
  ResponseTime?: number;

  @IsBoolean()
  @IsNotEmpty()
  IsDetailedResponse: boolean;

  @ValidateNested()
  @Type(() => FiltersDto)
  Filters: FiltersDto;
}


export class BookingDto {
  @IsNotEmpty()
  @IsString()
  BookingCode: string;
}

export class HotelDetailDto{
  @IsString()
  @IsNotEmpty()
  Hotelcodes: string;

  @IsString()
  @IsNotEmpty()
  Language: string;
}