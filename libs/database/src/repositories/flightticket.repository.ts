import { Injectable } from '@nestjs/common';
import {  Order, Payment, User } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRepositoryService } from './order.repository';
import { PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';
import {RazorpayOrderData} from '../../../../libs/interfaces/commonTypes/payment.interface'

@Injectable()
export class FlightTicketRepositoryService { 
        constructor(
                @InjectRepository(Payment)
                private readonly paymentRepository: Repository<Payment>
            ){}
        

        async insertOrder(data: RazorpayOrderData, orderDetails: { order_id: string, user: string }) {
                try {
                        
                    const {order_id,user} =  orderDetails

                    const orderRef = new Order();
                    orderRef.order_id = order_id

                    const userRef = new User();
                    userRef.id = user
                    
                    console.log(10);
                    // Create the new payment order object
                    const newPaymentOrder = await this.paymentRepository.insert(this.paymentRepository.create({
                        gateway_order_response: JSON.stringify(data),
                        user: userRef,
                        order: orderRef,
                        razorpay_order_id: data.id,
                        payment_gateway: "Razorpay",
                        payment_status: data.status,
                        status: PAYMENT_STATUS.IN_PROGRESS, // Ensure PAYMENT_STATUS is defined elsewhere
                    }));
            
                    // Save the order to the database and return the saved entity
                    return newPaymentOrder;
            
                } catch (error) {
                    console.error("Error while saving the payment order:", error);
                    throw new Error("Failed to save payment order. Please try again later.");
                }
            }
            
        
}