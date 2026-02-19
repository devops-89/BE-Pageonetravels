import { Injectable } from '@nestjs/common';
import { CreateRefundDto } from '../../../../libs/dtos/common/refund.dto';
import { RazorpayService } from '../../../../libs/paymentgateway/razorpay.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, Order } from '../../../../libs/database/src';
import { Repository } from 'typeorm';
@Injectable()
export class RefundService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        private readonly razorpayService: RazorpayService
    ) {}

    async issueRefund(input: CreateRefundDto) {
        try {
            //   extracting tthe order and Payment Details from OrderId
            const order = await this.orderRepository.findOne({
                where: { order_id: input.orderId },
                relations: ['payment'],
            });

            if (!order || !order.payment) {
                throw new Error(`Order ${input.orderId} or its payment record not found`);
            }

            const payment = order.payment;

            // extracting the paymentId and razorpayPaymentId from orderId
            const paymentId = payment.payment_id;
            const razorpayPaymentId = payment.transaction_id;

            if (!razorpayPaymentId) {
                throw new Error(`No Razorpay payment ID found for order ${input.orderId}`);
            }

            //  Convert amount to paise (multiply by 100)
            const amountInPaise = input.amount ? Math.round(input.amount * 100) : undefined;

            // Step 1: Call Razorpay Refund API
            const refundResponse = await this.razorpayService.createRefund({
                paymentId: razorpayPaymentId,
                amount: amountInPaise,
                speed: input.speed,
                remarks: input.remarks,
            });

            // Step 2: Check refund response status
            if (refundResponse && refundResponse.status && refundResponse.status !== 'failed') {
                //  Refund created successfully → update DB
                await this.paymentRepository.update(paymentId, {
                    refund_id: refundResponse.id,
                    refund_amount: refundResponse.amount,
                    refund_currency: refundResponse.currency,
                    refund_status: refundResponse.status,
                    refund_speed: refundResponse.speed_processed,
                    refund_notes: refundResponse.notes,
                    refund_created_at: new Date(refundResponse.created_at * 1000),
                });

                return {
                    success: true,
                    message: 'Refund processed successfully',
                    data: refundResponse,
                };
            } else {
                //  Refund failed
                return {
                    success: false,
                    message: refundResponse?.error?.description || 'Refund failed',
                    data: refundResponse,
                };
            }
        } catch (error) {
            // Step 3: Handle unexpected errors
            console.error('Refund error:', error);

            return {
                success: false,
                message: error.message || 'Unexpected error while processing refund',
            };
        }
    }
}
