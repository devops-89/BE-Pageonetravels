import { Injectable } from '@nestjs/common';
import { BookingRepositoryService } from '../../../../libs/database/src/repositories/booking.repository';

@Injectable()
export class FlightsService {
  constructor(private readonly BookingModel: BookingRepositoryService) { }

  async findAll() {
    try {
      const data =await this.BookingModel.getAllFlightBookings()
      return { message: "All booking details fetched.", data: data }
    } catch (error) {

    }
  }

  findOne(id: number) {
    return `This action returns a #${id} flight`;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} flight`;
  // }
}
