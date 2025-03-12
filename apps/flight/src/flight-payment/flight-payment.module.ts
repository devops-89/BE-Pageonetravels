import { Module } from '@nestjs/common';
import { FlightPaymentController } from './flight-payment.controller';
import { FlightPaymentService } from './flight-payment.service';

@Module({
    controllers: [FlightPaymentController],
    providers: [FlightPaymentService],
})
export class FlightPaymentModule {}
