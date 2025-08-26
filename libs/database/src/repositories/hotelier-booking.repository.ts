// bookings/bookings.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelierBooking } from '../entities/hotelier-booking.entity';
import { Repository } from 'typeorm';
@Injectable()
export class BookingsRepository {
  constructor(@InjectRepository(HotelierBooking) private readonly bookingRepo: Repository<HotelierBooking>) {}
  async createBooking(data: Partial<HotelierBooking>): Promise<HotelierBooking> {
    const newBooking = this.bookingRepo.create(data);
    return this.bookingRepo.save(newBooking);
  }
  async findBookingById(id: number): Promise<HotelierBooking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['hotel', 'roomType'],
    });
  }
  async updateBookingStatus(id: number, status: 'CONFIRMED' | 'CANCELLED'): Promise<void> {
    await this.bookingRepo.update({ id }, { status });
  }
  async saveBooking(booking: HotelierBooking): Promise<HotelierBooking> {
  return this.bookingRepo.save(booking);
}
}












