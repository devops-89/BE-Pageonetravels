import { Injectable } from '@nestjs/common';
import { UserStatsRepositoryService } from '../../../../../libs/database/src/repositories/user-stats.repository';
import { HotelStatsRepositoryService } from '../../../../../libs/database/src/repositories/hotel-stats.repository';
import { FlightStatsRepositoryService } from '../../../../../libs/database/src/repositories/flight-stats.repository';
import {SelfDriveStatsRepositoryService} from '../../../../../libs/database/src/repositories/selfdrive-stats.repository';
import { CabStatsRepositoryService } from '../../../../../libs/database/src/repositories/cab-stats.repository';
import {HelicopterStatsRepositoryService} from '../../../../../libs/database/src/repositories/helicopter-stats.repository';
import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';
import { IDashboardStats } from '../../../../../libs/interfaces/dashboard/dashboard.interface';
import { OrderRepositoryService } from '../../../../../libs/database/src';
import { PaginationDto } from '../../../../../libs/dtos/authentication/user.dto';
import {BookingFilterDto} from "../../../../../libs/dtos/common/bookingFilter.dto";

@Injectable()
export class UserStatsService {
    constructor(
        private readonly userStatsRepository: UserStatsRepositoryService,
        private readonly hotelStatsRepository: HotelStatsRepositoryService,
        private readonly flightStatsRepository: FlightStatsRepositoryService,
        private readonly selfDriveStatsRepository: SelfDriveStatsRepositoryService,
        private readonly cabStatsRepository: CabStatsRepositoryService,
        private readonly helicopterStatsRepository:HelicopterStatsRepositoryService,
        private readonly orderRepository: OrderRepositoryService
    ) {}

    async getUserStats(): Promise<ApiResponse.ApiOK> {
        try {
            const stats = await this.userStatsRepository.getUserStats();
            return {
                message: "User statistics fetched successfully",
                data: stats
            };
        } catch (error) {
            console.log('Error in user stats service:', error);
            throw { message: "Error fetching user statistics", statusCode: ERROR_CODES.NOT_FOUND };
        }
    }

    async getDashboardStats(): Promise<ApiResponse.ApiOK> {
        try {
            // Fetch all stats in parallel
            const [
                userStats,
                hotelStats,
                flightStats,
                selfDriveStats,
                helicopterStats,
                cabStats
            ] = await Promise.all([
                this.userStatsRepository.getUserStats(),
                this.hotelStatsRepository.getHotelStats(),
                this.flightStatsRepository.getFlightStats(),
                this.selfDriveStatsRepository.getSelfDriveStats(),
                 this.helicopterStatsRepository.getHelicopterStats(),
                this.cabStatsRepository.getCabStats()
            ]);

            const dashboardStats: IDashboardStats = {
                totalUsers: userStats.totalUsers,
                totalHotels: hotelStats.totalHotels,
                totalCancelHotels: hotelStats.totalCancelHotels,
                totalCancelFlights: flightStats.totalCancelFlights,
                totalSelfDrive: selfDriveStats.data.totalSelfDrive,
                totalCabs: cabStats.data.totalCabs,
                totalFlights: flightStats.totalFlights,
                totalHelicopters: helicopterStats.data.totalHelicopter,

            };

            return {
                message: "Dashboard statistics fetched successfully",
                data: dashboardStats
            };
        } catch (error) {
            console.log('Error in dashboard stats service:', error);
            throw { message: "Error fetching dashboard statistics", statusCode: ERROR_CODES.NOT_FOUND };
        }
    }



// get user Booking (filter applied on the basis of various factors)
        async getUserBookings(userId: string, pagination: PaginationDto, filter: BookingFilterDto): Promise<ApiResponse.ApiOK> {
        try {
          const bookingsList = await this.orderRepository.getUserBookingsWithFilters(userId, pagination, filter);
          return {
            message: 'Bookings fetched successfully',
            data: bookingsList,
          };
        } catch (error) {
          console.log('Error in getUserBookings service', error);
          throw error;
        }
      }

// get all booking based on order type
async getAllBookings(
  pagination: PaginationDto,
  filter: BookingFilterDto
): Promise<ApiResponse.ApiOK> {
  try {
    const bookingsList = await this.orderRepository.getBookingsWithFilters(pagination, filter);

    return {
      message: 'All bookings fetched successfully',
      data: bookingsList,
    };
  } catch (error) {
    console.error('Error in getAllBookings service:', error);
    throw error;
  }
}
}
