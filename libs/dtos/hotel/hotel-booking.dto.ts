import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class HotelPassengerDto {
  @IsString()
  Title: string;

  @IsString()
  FirstName: string;

  @IsOptional()
  @IsString()
  MiddleName?: string;

  @IsString()
  LastName: string;

  @IsOptional()
  @IsString()
  Email?: string;

  @IsNumber()
  PaxType: number;

  @IsBoolean()
  LeadPassenger: boolean;

  @IsNumber()
  Age: number;

  @IsOptional()
  @IsString()
  PassportNo?: string;

  @IsOptional()
  @IsString()
  PassportIssueDate?: string;

  @IsOptional()
  @IsString()
  PassportExpDate?: string;

  @IsOptional()
  @IsString()
  Phoneno?: string;

  @IsNumber()
  PaxId: number;

  @IsOptional()
  @IsString()
  GSTCompanyAddress?: string;

  @IsOptional()
  @IsString()
  GSTCompanyContactNumber?: string;

  @IsOptional()
  @IsString()
  GSTCompanyName?: string;

  @IsOptional()
  @IsString()
  GSTNumber?: string;

  @IsOptional()
  @IsString()
  GSTCompanyEmail?: string;

  @IsOptional()
  @IsString()
  PAN?: string;
}

export class HotelRoomDetailDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotelPassengerDto)
  HotelPassenger: HotelPassengerDto[];
}

export class CreateHotelBookingDto {
  @IsString()
  BookingCode: string;

  @IsBoolean()
  IsVoucherBooking: boolean;

  @IsString()
  GuestNationality: string;

  @IsString()
  EndUserIp: string;

  @IsNumber()
  RequestedBookingMode: number;

  @IsNumber()
  NetAmount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotelRoomDetailDto)
  HotelRoomsDetails: HotelRoomDetailDto[];
}


export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  BookingId: string;

  @IsNotEmpty()
  EndUserIp: string;

  @IsNotEmpty()
  @IsString()
  TokenId: string;
}

