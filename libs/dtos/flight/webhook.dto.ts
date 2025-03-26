import { IsNotEmpty, Matches } from 'class-validator';

export class PaymentIdDto {
    @IsNotEmpty({ message: 'Payment ID cannot be empty' })
    @Matches(/^pay_[0-9a-zA-Z]{14,32}$/, {
        message: 'Invalid Razorpay payment ID format. It should start with "pay_" followed by 14-32 alphanumeric characters'
      })
      paymentId: string;
}