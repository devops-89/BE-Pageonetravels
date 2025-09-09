import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageBooking } from "../entities/package-booking.entity";
import { Repository } from "typeorm";
import { BookingStatus } from "../entities/package-booking.entity";

@Injectable()
export class PackageBookingRepositoryService {
  constructor(
    @InjectRepository(PackageBooking)
    private readonly bookingRepo: Repository<PackageBooking>,
  ) {}

  async createPackageBooking(
    data: Partial<PackageBooking>,
  ): Promise<PackageBooking> {
    const newBooking = this.bookingRepo.create(data as PackageBooking);
    return await this.bookingRepo.save(newBooking);
  }

  async findPackageBookingById(id: string): Promise<PackageBooking | null> {
    return this.bookingRepo.findOne({
      where: { id },
      relations: ["package", "user"], // <-- added user relation
    });
  }

  async savePackageBooking(
    booking: PackageBooking,
  ): Promise<PackageBooking> {
    return await this.bookingRepo.save(booking);
  }

  async findBookingsByUser(userId: string): Promise<PackageBooking[]> {
    return this.bookingRepo.find({
      where: { userId: userId },
      relations: ["package", "user"], // <-- preload both relations
    });
  }

  async cancelBooking(
    id: string,
    reason: string,
  ): Promise<PackageBooking | null> {
    const booking = await this.findPackageBookingById(id);
    if (!booking) return null;

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();

    return await this.bookingRepo.save(booking);
  }
}
