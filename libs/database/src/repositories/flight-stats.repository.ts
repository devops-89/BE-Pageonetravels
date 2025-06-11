import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities';
import { IFlightStats } from '../../../interfaces/dashboard/dashboard.interface';
import { BOOKING_STATUS } from '../../../../libs/constants/bookingContant';

@Injectable()
export class FlightStatsRepositoryService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>
    ) {}

    async getFlightStats(): Promise<IFlightStats> {
        try {
            // Get total flights booked
            const totalFlights = await this.bookingRepository.count({
                where: {
                    booking_type: 'flight'
                }
            });

            // Get total cancelled flights
            const totalCancelFlights = await this.bookingRepository.count({
                where: {
                    booking_type: 'flight',
                    booking_status: BOOKING_STATUS.CANCELLED
                }
            });

            return {
                totalFlights,
                totalCancelFlights
            };
        } catch (error) {
            console.log('Error in fetching flight stats:', error);
            throw error;
        }
    }
} 