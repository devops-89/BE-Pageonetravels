import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel, Booking, User } from '../entities';
import { IHotelStats } from '../../../interfaces/dashboard/dashboard.interface';
import { USER_TYPE, USER_VERIFY_STATUS } from '../../../constants/autenticationConstants/userContants';
import { BOOKING_STATUS } from 'libs/constants/bookingContant';

@Injectable()
export class HotelStatsRepositoryService {
    constructor(
        @InjectRepository(Hotel)
        private readonly hotelRepository: Repository<Hotel>,
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async getHotelStats(): Promise<IHotelStats> {
        try {
            // Get total hotels
            const totalHotels = await this.hotelRepository.count();

            // Get total cancelled hotels from bookings
            const totalCancelHotels = await this.bookingRepository.count({
                where: {
                    //is_cancel: true,
                    booking_status: BOOKING_STATUS.CANCELLED,
                    booking_type: 'hotel',
                    
                }
            });

            // Get total hoteliers
            const totalHoteliers = await this.userRepository.count({
                where: {
                    user_type: USER_TYPE.HOTEL,
                    verify_status: USER_VERIFY_STATUS.VERIFIED
                }
            });

            return {
                totalHotels,
                totalCancelHotels,
                totalHoteliers
            };
        } catch (error) {
            console.log('Error in fetching hotel stats:', error);
            throw error;
        }
    }
} 