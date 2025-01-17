import { Module } from '@nestjs/common';
import { FlightBookingController } from './flight-booking.controller';
import { FlightBookingService } from './flight-booking.service';
import { BookingRepositoryService, DBModule, UserRepositoryService } from '../../../../libs/database/src';
import { ConfigModule } from '../../../../libs/config/config.module';
import { SearchFlightModule } from '../search-flight/search-flight.module';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { RedisCacheServiceModule } from '../../../../libs/redis-cache-service/redis-cache-module';
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { RazorpayModule } from '../../../../libs/paymentgateway/razorpay.module'
import { RazorpayService } from "../../../../libs/paymentgateway/razorpay.service";

@Module({
    imports: [
        DBModule.forRoot(),
        ConfigModule,
        RazorpayModule,
        SearchFlightModule,
        ResponseHandlerModule,
        RedisCacheServiceModule,
        TBOConfigModule.register(),    
    ],
    controllers: [FlightBookingController],
    providers: [FlightBookingService, GenerateTokenService, HTTPSTboAPIService, RazorpayService,BookingRepositoryService,UserRepositoryService],
})
export class FlightBookingModule {}
