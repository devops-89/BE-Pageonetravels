import { Injectable } from '@nestjs/common';
import {  Order, Payment, User, PackageBooking } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRepositoryService } from './order.repository';
import { PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';
// import {RazorpayOrderData} from '../../../../libs/interfaces/commonTypes/payment.interface'
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';

@Injectable()
export class HotelPaymentRepositoryService { 
        constructor(
                @InjectRepository(Payment)
                private readonly paymentRepository: Repository<Payment>
            ){}
        

        async insertOrder(data: any, orderDetails: { order_id: string, user: string }) {
                try {
                        
                    const {order_id,user} =  orderDetails

                    const orderRef = new Order();
                    orderRef.order_id = order_id

                    const userRef = new User();
                    userRef.id = user
                    
                    console.log(10);
                    // Create the new payment order object
                    
                    const newPaymentOrder = await this.paymentRepository.insert(this.paymentRepository.create({
                        razorpay_link_response: JSON.stringify(data),
                        user: userRef,
                        order: orderRef,
                        // razorpay_order_id: data.id,
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


            async findOne(order_id:string){
                try{
                    const orderRef = new Order();
                    orderRef.order_id = order_id

                    const data = await this.paymentRepository.findOne({
                        where: {
                            order: orderRef,
                        },
                        // loadRelationIds:true,
                      });
                    
        
                    return data;
                    
                }catch(error){
                    console.log(">>>>>>>>>>>>>",error.message);
                    throw error;
                }
            }
            

        // Update order
        async findAndUpdate(modifyOrder:string,body:any){
            try{
                const orderRef = new Order();
                orderRef.order_id = modifyOrder

                const updatedOrder = await this.paymentRepository.findOne({
                    where: { order: orderRef },
                    loadRelationIds: true,
                });

                if (!updatedOrder) { 
                    throw { 
                        message: `Payment with order_id ${modifyOrder} not found.`, 
                        statusCode: ERROR_CODES.BAD_REQUEST 
                    };
                }
        
                updatedOrder.razorpay_webhook_response = body;
                updatedOrder.status = PAYMENT_STATUS.SUCCESS;
                updatedOrder.payment_mode = "razorpay";
                updatedOrder.currency = "INR";
                updatedOrder.transaction_id = body.payload.payment.entity.id;
                updatedOrder.razorpay_order_id = body.payload.payment.entity.order_id;
                updatedOrder.amount = body.payload.payment.entity.amount;
                
                // Save the updated order to the database 
                await this.paymentRepository.save(updatedOrder);

                return updatedOrder;
            }catch(error){
                console.log(">>>>>>>>>>>>>",error.message);
                throw error;
            }
        }

         async findAndUpdatePackageBooking(packageBookingId:string,body:any){
            try{
                const packageBookingRef = new PackageBooking();
                packageBookingRef.id = packageBookingId;

                const updatedPackageBooking = await this.paymentRepository.findOne({
                    where: {  packageBooking: packageBookingRef },
                    loadRelationIds: true,
                });

                if (!updatedPackageBooking) { 
                    throw { 
                        message: `Payment with order_id ${packageBookingId} not found.`, 
                        statusCode: ERROR_CODES.BAD_REQUEST 
                    };
                }
        
                updatedPackageBooking.razorpay_webhook_response = body;
                updatedPackageBooking.status = PAYMENT_STATUS.SUCCESS;
                updatedPackageBooking.payment_mode = "razorpay";
                updatedPackageBooking.currency = "INR";
                updatedPackageBooking.transaction_id = body.payload.payment.entity.id;
                updatedPackageBooking.razorpay_order_id = body.payload.payment.entity.order_id;
                updatedPackageBooking.amount = body.payload.payment.entity.amount;
                
                // Save the updated order to the database 
                await this.paymentRepository.save(updatedPackageBooking);

                return updatedPackageBooking;
            }catch(error){
                console.log(">>>>>>>>>>>>>",error.message);
                throw error;
            }
        }
}