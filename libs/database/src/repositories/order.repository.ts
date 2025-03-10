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

    async insertBooking(reference_id,payload,amount,is_LCC,journey,journey_type,commtype,commpercentage):Promise<Order | null>{
        try{
            
            // Create order instance
            var orderId = `${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 999)}-${Math.floor(1000 + Math.random() * 9000)}`;
            
            const newOrder = this.orderRepository.create({
                custom_order_id : orderId, 
                commission_type: commtype,
                commission: commpercentage,
                journey_type : journey_type,
                journey: journey,
                isLCC: is_LCC,
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
                where: { custom_order_id: savedOrder.custom_order_id },
                select: ["custom_order_id","amount"], // Select only relevant fields
            });
            
            return order;
        }catch(error){
            console.log("save Booking API Database into database...error",error);
            throw error;
        }
    }


    // insert- Booking for round trip flight 
    async roundinsertBooking(reference_id,payload,amount,is_LCC,journey,journey_type,commtype,commpercentage,payloadSecond,secondType):Promise<Order | null>{
        try{
            
            // Create order instance
            var orderId = `${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 999)}-${Math.floor(1000 + Math.random() * 9000)}`;
            
            const newOrder = this.orderRepository.create({
                custom_order_id : orderId, 
                commission_type: commtype,
                commission: commpercentage,
                journey_type : journey_type,
                journey: journey,
                isLCC: is_LCC,
                is_LCC_round:secondType,
                trace_id:payload.TraceId,
                order_request: payload,
                user: { id: reference_id },  // Correct way to assign a relation
                amount: amount,
                order_request_second:payloadSecond,
                status: ORDER_STATUS.INIT
            });

            // Save the order to the database and get the inserted ID
            const savedOrder = await this.orderRepository.save(newOrder);

            // Fetch the saved order with its relations (e.g., related user)
            let order = await this.orderRepository.findOne({
                where: { custom_order_id: savedOrder.custom_order_id },
                select: ["custom_order_id","amount"], // Select only relevant fields
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
                    custom_order_id: receipt,
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