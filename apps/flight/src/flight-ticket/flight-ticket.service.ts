import { Injectable } from '@nestjs/common';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FlightTicketRepositoryService, OrderRepositoryService, UserRepositoryService } from '../../../../libs/database/src/repositories';
import { RazorpayService } from '../../../../libs/paymentgateway/razorpay.service';
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { LccTicketDto, VerifyDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';

@Injectable()
export class FlightTicketService {
    
    constructor(
        private readonly httptboapiservice: HTTPSTboAPIService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService,
        private readonly razorpayservice: RazorpayService,
        private readonly flightTicketService:FlightTicketRepositoryService,
    ){}


    async directTicket(reference_id,input: LccTicketDto){
        try{
            const amountData = Math.round(parseFloat(input.amount) * 100);
            const { currency, custom_order_id } = input;
            const amount = amountData;
            const orderdetails = await this.orderRepository.findOne(custom_order_id);
            const orderAmount =  Math.round(parseFloat(orderdetails.amount) * 100);
            if(amount !==  orderAmount){
                throw { message: "Amount not matched", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            const paymentInput = { amount, currency, custom_order_id };
            const data = await this.razorpayservice.createPayment(paymentInput);
            console.log(">>>>>>dddd",data);
            const orderSave  = await this.flightTicketService.insertOrder(data, {order_id: orderdetails.order_id , user :reference_id});
            return { message: "Order Created successfully", data: orderSave };
        }catch(error){
            console.log(">>>>>>>>>> >>> >",error); 
            throw error; 
        }
    }

    async verifyTicket(data: VerifyDto) {
        try {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;
    
            if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
                throw new Error("Missing required Razorpay details.");
            }
            
            const verifyResponse = await this.razorpayservice.verifyOrder(razorpay_order_id,razorpay_payment_id,razorpay_signature);
            
            return { message: "Payment verified successfully", data: verifyResponse };
        } catch (error) {
            console.error("Error verifying ticket:", error);
            throw error;
        }
    }
    

}