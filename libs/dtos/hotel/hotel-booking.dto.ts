import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional,ValidateIf, IsString,IsDateString, ValidateNested } from 'class-validator';
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

  @ValidateIf((o) => o.Email !== null)
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
  
 @ValidateIf((o) => o.Phoneno !== null)
  @IsOptional()
  @IsString()
  Phoneno?: string | null;

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

// used for Real Payload Sending to TBO API
export class HotelRoomDetailDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HotelPassengerDto)
  HotelPassenger: HotelPassengerDto[];
}

// Used for Email Response Sending
export class ExtraInformationDto {
  @IsString()
  hotelName: string;

  @IsString()
  hotelAddress: string;

  @IsString()
  roomType: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber()
  rooms: number;

  @IsNumber()
  stayDuration: number;

  @IsNumber()
  basePrice: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  serviceFees: number;

  @IsString()
  checkIn: string;  

  @IsString()
  checkOut: string;
}

// Main hotel booking dto
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

  @ValidateNested()
  @IsOptional()
  @Type(() => ExtraInformationDto)
  extraInfo: ExtraInformationDto;
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

export class CancelHotelBookingDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}