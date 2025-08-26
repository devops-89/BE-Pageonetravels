import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { BookingsService } from './hotelier-booking.service';
import { CancelHotelBookingDto, CreateBookingDto } from '../../../../libs/dtos/hotelier/hotelier-booking.dto';
@Controller('bookings')
export class HotelierBookingController {
  constructor(private readonly bookingsService: BookingsService) {}
  @Post('/create-booking')
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(dto);
  }
   @Patch(':id/cancel')
  async cancelBooking(
    @Param('id') id: number,
    @Body() dto: CancelHotelBookingDto,
  ) {
    const booking = await this.bookingsService.cancelBooking(id, dto);
    return { message: 'Booking cancelled successfully', data: booking };
  }
}






