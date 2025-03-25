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
                throw { message: "", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            return data;
        }catch(error){
            console.log(">>>>>>>>>>>>>",error.message);
            throw error;
        }
    }

    // update order 
    async updateOrder(orderId:string,body:any){
       try{
           
        // Optionally, fetch the updated record and return
        const updatedOrder = await this.orderRepository.findOne({
            where: { custom_order_id: orderId },
            loadRelationIds: true,
        });
            
        // Check if the order exists
        if (!updatedOrder) {
            throw { 
                message: `Order with custom_order_id ${orderId} not found.`,
                statusCode: ERROR_CODES.BAD_REQUEST 
            };
        }

        // Update the payment response
        updatedOrder.payment_response = body;
        updatedOrder.status = ORDER_STATUS.COMPLETED;

        // Save the updated order to the database 
        await this.orderRepository.save(updatedOrder);

        console.log('Order updated:', updatedOrder.order_id);
            return updatedOrder.order_id;
        }catch(error){
            console.log(">>>>>>>>>>>>>",error.message);
            throw error;
        }
    }


    // update payment 
    async updatePaymentFail(order_id,flightresposne){
        try{
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: order_id },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw { 
                    message: `Order with order_id : ${order_id} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST 
                };
            } 
    
            updatedOrder.fail_response = flightresposne;

            // Save the updated order to the database 
            await this.orderRepository.save(updatedOrder);

            return updatedOrder.fail_response;
        }catch(error){
            console.log(error);
        }
    }

    async updatePaymentSuccess(order_id,flightresposne){
        try{
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: order_id },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw { 
                    message: `Order with order_id : ${order_id} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST 
                };
            } 
    
            updatedOrder.success_response = flightresposne;

            // Save the updated order to the database 
            await this.orderRepository.save(updatedOrder);

            return updatedOrder.success_response;
        }catch(error){
            console.log(error);
        }
    }

    // save success booking
    async updatePaymentBooking(order_id,flightresposne){
        try{
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: order_id },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw { 
                    message: `Order with order_id : ${order_id} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST 
                };
            } 
    
            updatedOrder.order_response = flightresposne;

            // Save the updated order to the database 
            await this.orderRepository.save(updatedOrder);

            return updatedOrder.order_response;
        }catch(error){
            console.log(error);
        }
    }

}