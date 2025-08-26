// bookings/dto/create-booking.dto.ts
import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';
export class CreateBookingDto {
    @IsUUID('4')
  hotelId:string;
    @IsUUID('4')
  roomTypeId: string;
  @IsString()
  @IsNotEmpty()
  guestName: string;
  @IsEmail()
  guestEmail: string;
  @IsInt()
  @Min(1)
  roomsBooked: number;
  @IsDateString()
  checkIn: string;
  @IsDateString()
  checkOut: string; // exclusive
}
export class CancelHotelBookingDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}









