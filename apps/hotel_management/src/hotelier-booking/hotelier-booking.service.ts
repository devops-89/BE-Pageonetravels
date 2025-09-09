// bookings/bookings.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsRepository } from '../../../../libs/database/src/repositories/hotelier-booking.repository';
import { HotelierInventoryRepositoryService } from '../../../../libs/database/src/repositories/hotelier-inventory.repository';
import { HotelierRoomTypesRepositoryService } from '../../../../libs/database/src/repositories/hotelier-room-types.repository';
import { CancelHotelBookingDto, CreateBookingDto } from '../../../../libs/dtos/hotelier/hotelier-booking.dto';
import { HotelierRepositoryService } from '../../../../libs/database/src/repositories/hotel.repository';
import { HotelierBooking } from '../../../../libs/database/src/entities/hotelier-booking.entity';
@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly inventoryRepository: HotelierInventoryRepositoryService,
    private readonly hotelsRepository: HotelierRepositoryService,   // :white_tick: service -> repo
    private readonly hotelRoomRepository: HotelierRoomTypesRepositoryService,
  ) {}
  async createBooking(dto: CreateBookingDto) {
    // :white_tick: ab repo se hotel fetch karenge
    const hotel = await this.hotelsRepository.findHotelierbyId(dto.hotelId);
    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }
    const roomType = await this.hotelRoomRepository.findById(dto.roomTypeId);
  if (!roomType || roomType.hotel.hotel_id !== hotel.hotel_id) { // ✅ use hotel_id
  throw new BadRequestException('Room type does not belong to hotel');
}
    // adjust inventory for the date range
    await this.inventoryRepository.adjustRangeWithLock(
      dto.roomTypeId,
      dto.checkIn,
      dto.checkOut,
      -dto.roomsBooked,
    );
    return this.bookingsRepository.createBooking({
      hotel,
      roomType,
      guest_name: dto.guestName,
      guest_email: dto.guestEmail,
      rooms_booked: dto.roomsBooked,
      check_in: dto.checkIn,
      check_out: dto.checkOut,
      status: 'CONFIRMED',
    });
  }
async cancelBooking(id: number, dto: CancelHotelBookingDto): Promise<HotelierBooking> {
    const booking = await this.bookingsRepository.findBookingById(id);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException(`Booking with id ${id} is already cancelled`);
    }
    // Update booking fields
    booking.status = 'CANCELLED';
    booking.cancellationReason = dto.reason || 'No reason provided';
    booking.cancelledAt = new Date();
    // Save and return updated booking
    return this.bookingsRepository.saveBooking(booking);
  }
}











