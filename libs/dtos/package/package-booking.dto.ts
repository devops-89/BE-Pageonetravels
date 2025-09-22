import { IsArray, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { MealType, TitleType, BookingStatus } from '../../database/src/entities/package-booking.entity';
import { Type } from 'class-transformer';

export class PassengerDetailDto {
  @IsEnum(TitleType, { message: 'Title must be one of: Mr, Mrs, Miss, Master' })
  title: TitleType;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  DOB: string;

  @IsOptional()
  @IsString()
  passport_number?: string;

  @IsOptional()
  @IsString()
  passport_expiry?: string;

  @IsEnum(MealType, { message: 'MealType must be one of: veg, nonveg, vegan' })
  mealType: MealType;
}

export class CreatePackageBookingDto {
  @IsNotEmpty()
  @IsUUID()
  packageId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  specialRequest?: string;

  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Status must be one of: PENDING, CONFIRMED, CANCELLED' })
  status?: BookingStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDetailDto)
  passengerDetails: PassengerDetailDto[];
}


export class CancelPackageBookingDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  reason?: string;
}