import { Module } from '@nestjs/common';
import { FlightBookingController } from './flight-booking.controller';
import { FlightBookingService } from './flight-booking.service';
import { Booking, BookingRepositoryService, DBModule, Order, OrderRepositoryService, User, UserRepositoryService } from '../../../../libs/database/src';
import { ConfigModule } from '../../../../libs/config/config.module';
import { SearchFlightModule } from '../search-flight/search-flight.module';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { RedisCacheServiceModule } from '../../../../libs/redis-cache-service/redis-cache-module';
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { RazorpayModule } from '../../../../libs/paymentgateway/razorpay.module'
import { RazorpayService } from "../../../../libs/paymentgateway/razorpay.service";
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { TransactionManager } from '../../../../libs/database/src/repositories/utils';
import { JwtService } from 'libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from 'libs/middlewares/authMiddleware';

@Module({
    imports: [
        DBModule.forRoot(),
        TypeOrmModule.forFeature([
             BookingRepositoryService,
             OrderRepositoryService,
             Booking,
             Order,
             User,
             TransactionManager,
             UserRepositoryService
        ]),
        ConfigModule,
        RazorpayModule,
        SearchFlightModule,
        ResponseHandlerModule,
        RedisCacheServiceModule,
        TBOConfigModule.register(),    
    ],
    controllers: [FlightBookingController],
    providers: [FlightBookingService, GenerateTokenService, Booking, Order, OrderRepositoryService, TransactionManager, HTTPSTboAPIService, RazorpayService,BookingRepositoryService,UserRepositoryService, JwtService, TokenValidationMiddleware],
})
export class FlightBookingModule {} 
