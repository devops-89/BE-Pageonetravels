import { Injectable } from '@nestjs/common';
import { UserStatsRepositoryService } from '../../../../../libs/database/src/repositories/user-stats.repository';
import { HotelStatsRepositoryService } from '../../../../../libs/database/src/repositories/hotel-stats.repository';
import { FlightStatsRepositoryService } from '../../../../../libs/database/src/repositories/flight-stats.repository';
import { PackageStatsRepositoryService } from '../../../../../libs/database/src/repositories/package-stats.repository';
import { CabStatsRepositoryService } from '../../../../../libs/database/src/repositories/cab-stats.repository';
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
        private readonly packageStatsRepository: PackageStatsRepositoryService,
        private readonly cabStatsRepository: CabStatsRepositoryService,
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
                packageStats,
                cabStats
            ] = await Promise.all([
                this.userStatsRepository.getUserStats(),
                this.hotelStatsRepository.getHotelStats(),
                this.flightStatsRepository.getFlightStats(),
                this.packageStatsRepository.getPackageStats(),
                this.cabStatsRepository.getCabStats()
            ]);

            const dashboardStats: IDashboardStats = {
                totalUsers: userStats.totalUsers,
                totalHotels: hotelStats.totalHotels,
                totalCancelHotels: hotelStats.totalCancelHotels,
                totalCancelFlights: flightStats.totalCancelFlights,
                totalPackages: packageStats.totalPackages,
                totalCabs: cabStats.data.totalCabs,
                totalFlights: flightStats.totalFlights,
                totalHoteliers: hotelStats.totalHoteliers,

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

    async getAllBookings(userId?: string) {
          try {
            const orders = await this.orderRepository.find(userId);
            const parsedOrders = orders.map(order => ({
              ...order,
              order_request: order.order_request,
              order_response: order.order_response,
              order_request_second:order.order_request_second,
              order_response_second: order.order_response_second,
              ticket_details: order.ticket_details,
              contact_details: order.contact_details,
              success_response: order.success_response,
              fail_response: order.fail_response,
            }));
            return {
              message: 'Bookings retrieved successfully',
              data: parsedOrders,
            };
          } catch (error) {
            console.log('Error in getAllBookings:', error);
            throw error;
          }
        }
        private tryParse(data: string | null) {
          try {
            return data ? JSON.parse(data) : null;
          } catch {
            return data;
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
} 