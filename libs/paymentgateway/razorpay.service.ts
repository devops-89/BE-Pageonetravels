import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ERROR_CODES } from '../../libs/constants/commonConstants';
import { log } from 'console';
// import { FlightTicketRepositoryService } from '//database/repositories/flightticket.repository';

@Injectable()
export class RazorpayService {
    private razorpay: Razorpay;
    private key:string;
    private secret : string;
    constructor(
        private readonly configService: ConfigService,
        // private readonly flightTicketService:FlightTicketRepositoryService,
    ) {

        this.key = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY;
        this.secret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY_SECRET;
        

        this.razorpay = new Razorpay({
            key_id: this.key,
            key_secret: this.secret,
        });
        
    }

    async createPayment(input: { amount: number; currency: string; custom_order_id: string }): Promise<any> {
        try { 
            const { amount, currency, custom_order_id } = input;

            const orderOptions = {
                amount: amount, // Razorpay expects the amount in paise 
                currency: currency, 
                receipt: custom_order_id,
                payment_capture: 1, // auto-capture after payment 
            }; 

            const response = await this.razorpay.orders.create(orderOptions);
            
            return response;
        } catch (error) {
            console.log(">>>>>> >>>> >",error);
            if (error.statusCode === 400 && error.error.code === 'BAD_REQUEST_ERROR') {
                throw { message: "The amount exceeds the maximum limit allowed. Please adjust the amount and try again.", statusCode: ERROR_CODES.BAD_REQUEST };
            }else{
                throw error;
            }
            
            
        }
    }

    async verifyOrder(orderId: string, paymentId: string, razorpaySignature: string): Promise<{ success: boolean; message: string }> {
        try {
            if (!orderId || !paymentId || !razorpaySignature) {
                throw new Error("Missing required parameters for verification.");
            }
            const hmac = crypto.createHmac('sha256', this.secret);
            hmac.update(`${orderId}|${paymentId}`);
            const generatedSignature = hmac.digest('hex');
            if (razorpaySignature === generatedSignature) {
                return { success: true, message: "Payment has been verified" };
            } else {
                //return { success: true, message: "Payment has been verified" };
                throw { message:  "Payment verification failed" , statusCode: ERROR_CODES.BAD_REQUEST };
            }
        } catch (error) {
            console.error("Razorpay verification error:", error);
            throw error;
        }
    }
}
