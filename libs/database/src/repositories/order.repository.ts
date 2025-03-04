import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities';
import { ORDER_STATUS } from '../../../../libs/constants/bookingContant';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';

@Injectable()
export class OrderRepositoryService {
    
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ){}

    async insertBooking(reference_id,payload,amount):Promise<Order | null>{
        try{
            
            // Create order instance
            const newOrder = this.orderRepository.create({
                trace_id:payload.TraceId,
                order_request: payload,
                user: { id: reference_id },  // Correct way to assign a relation
                amount: amount,
                status: ORDER_STATUS.INIT
            });

            // Save the order to the database and get the inserted ID
            const savedOrder = await this.orderRepository.save(newOrder);

            // Fetch the saved order with its relations (e.g., related user)
            let order = await this.orderRepository.findOne({
                where: { order_id: savedOrder.order_id },
                select: ["order_id","amount"], // Select only relevant fields
            });
            
            return order;
        }catch(error){
            console.log("save Booking API Database into database...error",error);
            throw error;
        }
    }

    async findOne(receipt){
        try{
            const data = await this.orderRepository.findOne({
                where: {
                  order_id: receipt,
                },
                loadRelationIds:true,
              });

            if(!data){
                throw { message: "Order details not Found", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            return data;
        }catch(error){
            console.log(">>>>>>>>>>>>>",error.message);
            throw error;
        }
    }

}