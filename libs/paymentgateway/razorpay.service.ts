import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class RazorpayService {
    private razorpay: Razorpay;
    private key:string;
    private secret : string;
    constructor(private readonly configService: ConfigService) {

        this.key = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY;
        this.secret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY_SECRET;
        

        this.razorpay = new Razorpay({
            key_id: this.key,
            key_secret: this.secret,
        });
    }

    async createPayment(input: { amount: number; currency: string; receipt: string }): Promise<any> {
        try {
            const { amount, currency, receipt } = input;

            const orderOptions = {
                amount: amount * 100, // Razorpay expects the amount in paise
                currency: currency,
                receipt: receipt,
                payment_capture: 1, // auto-capture after payment
            };

            const response = await this.razorpay.orders.create(orderOptions);
            return response;
        } catch (error) {
            console.error("Error creating payment:", error);
            throw error;
        }
    }

    async verifyOrder(orderId: string, paymentId: string, razorpaySignature: string): Promise<{ success: boolean; message: string }> {
        try {
            const hmac = crypto.createHmac('sha256', this.secret);
            hmac.update(`${orderId}|${paymentId}`);
            const generatedSignature = hmac.digest('hex');

            if (razorpaySignature === generatedSignature) {
                return { success: true, message: "Payment has been verified" };
            } else {
                return { success: false, message: "Payment verification failed" };
            }
        } catch (error) {
            console.error("Razorpay verification error:", error);
            throw error;
        }
    }
}
