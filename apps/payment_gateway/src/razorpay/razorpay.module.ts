import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { RazorpayController } from './razorpay.controller';
import { DBModule } from '../../../../libs/database/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';

@Module({
  imports: [
      DBModule.forRoot(),
      TypeOrmModule.forFeature([
          //  BookingRepositoryService,
          //  Payment,
          //  FlightTicketRepositoryService,
          //  OrderRepositoryService,
          //  Booking,
          //  Order,
          //  User,
          //  TransactionManager,
          //  UserRepositoryService
      ]),
      ConfigModule,
      ResponseHandlerModule,
      RazorpayModule,
  ],
  controllers: [RazorpayController],
  providers: [RazorpayService,TokenValidationMiddleware,JwtService,RazorpayPaymentService],
})

export class RazorpayModule {}
