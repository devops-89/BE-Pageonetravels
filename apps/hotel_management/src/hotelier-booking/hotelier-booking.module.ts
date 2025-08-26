import { Module } from '@nestjs/common';
import { HotelierBookingController } from './hotelier-booking.controller';
import { BookingsService } from './hotelier-booking.service';
import { ConfigModule } from '../../../../libs/config/config.module';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { TransactionManager } from '../../../../libs/database/src/repositories/utils';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { BookingsRepository } from '../../../../libs/database/src/repositories/hotelier-booking.repository';
import { DBModule, HotelierBooking, User, UserRepositoryService } from '../../../../libs/database/src';
@Module({
    imports: [DBModule.forRoot(), TypeOrmModule.forFeature([User, HotelierBooking]), ConfigModule, ResponseHandlerModule],
    controllers: [HotelierBookingController],
    providers: [BookingsService, TransactionManager, UserRepositoryService, JwtService, TokenValidationMiddleware,BookingsRepository],
})
export class HotelierBookingModule {}