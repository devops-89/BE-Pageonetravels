import { Injectable } from '@nestjs/common';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';
import { FlightTicketRepositoryService, OrderRepositoryService, UserRepositoryService } from '../../../../libs/database/src/repositories';
import { LccTicketDto} from '../../../../libs/dtos/flight/flight-ticket.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import * as crypto from 'crypto';
import { ConfigService } from '../../../../libs/config/config.service'; 


@Injectable()
export class RazorpayService {
    constructor(    
        private readonly configService: ConfigService,
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService,
        private readonly razorpayPaymentService: RazorpayPaymentService,
        private readonly flightTicketService:FlightTicketRepositoryService,
    ){}


    async createOrder(reference_id: string,body: LccTicketDto,email: string){
        try{
            
            const amountData = Math.round(parseFloat(body.amount) * 100);
            const { currency, custom_order_id } = body;
            const amount = amountData;
            const orderdetails = await this.orderRepository.findOne(custom_order_id);
            const checkOrder = await this.flightTicketService.findOne(orderdetails.order_id);
            if(checkOrder){
                throw { message: "Payment record already exists for this order. Please initiate the process again.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            
            const orderAmount =  Math.round(parseFloat(orderdetails.amount) * 100);
            if(amount !==  orderAmount){
                throw { message: "Amount not matched", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            // const paymentInput = { amount, currency, custom_order_id };

           
            const paymentInput = {
                amount: amount,
                currency: currency,
                description: "Payment for flight Ticket",
                reference_id: custom_order_id.trim(),
                customer: {
                  email: email,
                },
                callback_url: 'https://page1-fe.vercel.app/payment/success',
              }
              
             const data = await this.razorpayPaymentService.createPaymentLink(paymentInput);
             
            const orderSave  = await this.flightTicketService.insertOrder(data, {order_id: orderdetails.order_id , user :reference_id});
            return { message: "Order Created successfully", data: data };
        }catch(error){
            console.error("Error ", error);
            throw error;
        }
    }


    async getExpireByTime() {
        const currentTime = Math.floor(Date.now() / 1000);  
        const expireBy = currentTime + 15 * 60; 
        return expireBy;
    }

    // async paymentVerify(razorpayPaymentId: string,razorpayPaymentLinkId: string,razorpaySignature: string){
    //     try{
            
    //         const signatureString = `${razorpayPaymentId}|${razorpayPaymentLinkId}`;
    //         // Generate the expected signature by hashing the signature string with the secret key
    //         const expectedSignature = crypto
    //                         .createHmac('sha256', this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY_SECRET)
    //                         .update(signatureString)
    //                         .digest('hex');
    //         if (expectedSignature === razorpaySignature) {
    //             console.log("signature verified",true);    
    //             return { message: "Payment verified successfully", data: true };
    //         }else{
    //             console.log("Not Verified...");
    //         } 
    //         // const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    
    //         // if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    //         //     throw new Error("Missing required Razorpay details.");
    //         // }
            
    //         // const verifyResponse = await this.razorpayPaymentService.verifyOrder(razorpay_order_id,razorpay_payment_id,razorpay_signature);
            
            
    //     }catch(error){
    //         console.error("Error ", error);
    //         throw error;
    //     }
    // }

   
    async paymentVerify(razorpayPaymentId: string, razorpayPaymentLinkId: string, razorpaySignature: string) {
        try {
            // Trim inputs to avoid any extra spaces
            razorpayPaymentId = razorpayPaymentId.trim();
            razorpayPaymentLinkId = razorpayPaymentLinkId.trim();
            razorpaySignature = razorpaySignature.trim();
    
            // Construct the signature string correctly
            const signatureString = `${razorpayPaymentId}|${razorpayPaymentLinkId}`;
            console.log("Signature String:", signatureString); // Log the signature string for debugging
    
            // Generate the expected signature using the Razorpay Secret Key
            const secretKey = "zuHsL13ehyikzktJQC1HsBok";  // Razorpay Secret Key
            const expectedSignature = crypto
                .createHmac('sha256', secretKey)
                .update(signatureString)
                .digest('hex');
    
            // Log expected and received signatures for debugging
            console.log("Expected Signature:", expectedSignature);
            console.log("Received Signature:", razorpaySignature);
    
            // Compare the signatures
            if (expectedSignature === razorpaySignature) {
                console.log("Signature verified");
                return { message: "Payment verified successfully", data: true };
            } else {
                console.log("Signature not verified");
                return { message: "Payment verification failed", data: false };
            }
        } catch (error) {
            console.error("Error during payment verification:", error);
            throw error;
        }
    }
    

}
