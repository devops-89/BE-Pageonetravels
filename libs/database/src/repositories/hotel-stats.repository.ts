import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, User } from '../entities';
import { IHotelStats } from '../../../interfaces/dashboard/dashboard.interface';
import { USER_TYPE, USER_VERIFY_STATUS } from '../../../constants/autenticationConstants/userContants';
import { ORDER_TYPE } from '../../../constants/orderConstant';
import { ORDER_STATUS } from '../../../constants/bookingContant';


@Injectable()
export class HotelStatsRepositoryService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async getHotelStats(): Promise<IHotelStats> {
        try {
            // Get total hotels
            const totalHotels = await this.orderRepository.count({
                    where:{
                        order_type: ORDER_TYPE.HOTEL,
                        status: ORDER_STATUS.COMPLETED
                    }
            }
            );

            // Get total cancelled hotels from bookings
            const totalCancelHotels = await this.orderRepository.count({
                where: {
                    //is_cancel: true,
                    order_type: ORDER_TYPE.HOTEL,
                    status: ORDER_STATUS.CANCELLED

                }
            });



            return {
                totalHotels,
                totalCancelHotels,

            };
        } catch (error) {
            console.log('Error in fetching hotel stats:', error);
            throw error;
        }
    }
}
