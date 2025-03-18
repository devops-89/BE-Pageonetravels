import { Injectable } from '@nestjs/common';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';
import { FlightTicketRepositoryService, OrderRepositoryService, UserRepositoryService } from '../../../../libs/database/src/repositories';
import { LccTicketDto,VerifyDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';


@Injectable()
export class RazorpayService {
    constructor(    
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService,
        private readonly razorpayPaymentService: RazorpayPaymentService,
        private readonly flightTicketService:FlightTicketRepositoryService,
    ){}


    async createOrder(reference_id: string,body: LccTicketDto){
        try{
            const amountData = Math.round(parseFloat(body.amount) * 100);
            const { currency, custom_order_id } = body;
            const amount = amountData;
            const orderdetails = await this.orderRepository.findOne(custom_order_id);
            const checkOrder = await this.flightTicketService.findOne(orderdetails.order_id);
            if(checkOrder){
                throw { message: "Payment record already exists for this order. Please initiate the process again.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            console.log(checkOrder);
            const orderAmount =  Math.round(parseFloat(orderdetails.amount) * 100);
            if(amount !==  orderAmount){
                throw { message: "Amount not matched", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            const paymentInput = { amount, currency, custom_order_id };
            const data = await this.razorpayPaymentService.createPayment(paymentInput);
            const orderSave  = await this.flightTicketService.insertOrder(data, {order_id: orderdetails.order_id , user :reference_id});
            return { message: "Order Created successfully", data: orderSave };
        }catch(error){
            console.error("Error ", error);
            throw error;
        }
    }

    async paymentVerify(reference_id: string,body:VerifyDto){
        try{
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    
            if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
                throw new Error("Missing required Razorpay details.");
            }
            
            const verifyResponse = await this.razorpayPaymentService.verifyOrder(razorpay_order_id,razorpay_payment_id,razorpay_signature);
            
            return { message: "Payment verified successfully", data: verifyResponse };
        }catch(error){
            console.error("Error ", error);
            throw error;
        }
    }

}
