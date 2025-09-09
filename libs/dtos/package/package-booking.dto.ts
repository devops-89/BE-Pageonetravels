import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { MealType, TitleType, BookingStatus } from '../../database/src/entities/package-booking.entity';

export class CreatePackageBookingDto {
  @IsNotEmpty()
  @IsUUID()
  packageId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

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

  @IsEmail()
  email: string;

  @IsEnum(MealType, { message: 'MealType must be one of: veg, nonveg, vegan' })
  mealType: MealType;

  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Status must be one of: PENDING, CONFIRMED, CANCELLED' })
  status?: BookingStatus;
}

export class CancelPackageBookingDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}