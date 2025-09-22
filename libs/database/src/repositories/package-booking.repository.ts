import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PackageBooking, BookingStatus } from '../entities/package-booking.entity';
import { Repository } from 'typeorm';
import { PAYMENT_STATUS } from 'libs/constants/bookingContant';
import { ERROR_CODES } from 'libs/constants/commonConstants';
import {CancelPackageBookingDto} from "libs/dtos/package/package-booking.dto";


@Injectable()
export class PackageBookingRepositoryService {
  constructor(
    @InjectRepository(PackageBooking)
    private readonly bookingRepo: Repository<PackageBooking>,
  ) {}

  async createPackageBooking(data: Partial<PackageBooking>): Promise<PackageBooking> {
    const newBooking = this.bookingRepo.create({
      ...data,
      user: data.user || ({ id: (data.user as any)?.id } as any),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });

    return await this.bookingRepo.save(newBooking);
  }

  async findPackageBookingById(id: string): Promise<PackageBooking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ['package', 'user'],
    });
  }

  async savePackageBooking(booking: PackageBooking): Promise<PackageBooking> {
    return await this.bookingRepo.save(booking);
  }

  async hasActiveBooking(
    packageId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    // Use proper DB column names (snake_case) when necessary
    const existingBooking = await this.bookingRepo
      .createQueryBuilder('booking')
      .innerJoin('booking.user', 'user')
      .where('booking.packageId = :packageId', { packageId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      })
      .andWhere('(booking.start_date, booking.end_date) OVERLAPS (:start, :end)', {
        start: startDate,
        end: endDate,
      })
      .getOne();

    return !!existingBooking;
  }

  async findBookingsByUser(userId: string): Promise<PackageBooking[]> {
    return this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.user', 'user')
      .where('user.id = :userId', { userId }) // works via relation alias
      .getMany();
  }

  async cancelPackageBooking(body:CancelPackageBookingDto): Promise<PackageBooking | null> {
    const booking = await this.findPackageBookingById(body.id);
    if (!booking) return null;

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = body.reason;
    booking.cancelledAt = new Date();

    return await this.bookingRepo.save(booking);
  }

   // for updating the payment status success or failed
  async updatePaymentStatus(orderId: string, status: PAYMENT_STATUS): Promise<string> {
  try {
    const result = await this.bookingRepo.update(
      { id: orderId },
      { payment_status: status }  
    );

    console.log("package booking updated:",result);

    if (result.affected === 0) {
      throw {
        message: `Booking with order_id: ${orderId} not found.`,
        statusCode: ERROR_CODES.BAD_REQUEST,
      };
    }

    return status;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}


          // update Package Booking 
         async updatePackageBooking(bookingId: string) {
  try {
    // Load the full booking including packageId
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      select: ["id", "status", "packageId"], // ✅ make sure packageId is included
    });

    if (!booking) {
      throw {
        message: `Booking with Booking Id ${bookingId} not found.`,
        statusCode: ERROR_CODES.BAD_REQUEST,
      };
    }

    // Just update status, do NOT overwrite packageId
    booking.status = BookingStatus.BOOKED;

    await this.bookingRepo.save(booking);

    console.log("Order updated:", booking.id);
    return booking.id;
  } catch (error) {
    console.error("updatePackageBooking error:", error.message);
    throw error;
  }
}

}
