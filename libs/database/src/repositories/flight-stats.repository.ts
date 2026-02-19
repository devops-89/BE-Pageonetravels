import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities';
import { IFlightStats } from '../../../interfaces/dashboard/dashboard.interface';

import { ORDER_TYPE } from '../../../constants/orderConstant';
import { ORDER_STATUS } from '../../../constants/bookingContant';
@Injectable()
export class FlightStatsRepositoryService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) {}

    async getFlightStats(): Promise<IFlightStats> {
        try {
            // Get total flights booked
            const totalFlights = await this.orderRepository.count({
                where:{
                    order_type: ORDER_TYPE.FLIGHT,
                    status: ORDER_STATUS.COMPLETED
                }
            });

            // Get total cancelled flights
            const totalCancelFlights = await this.orderRepository.count({
                where:{
                    order_type: ORDER_TYPE.FLIGHT,
                    status: ORDER_STATUS.CANCELLED
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
