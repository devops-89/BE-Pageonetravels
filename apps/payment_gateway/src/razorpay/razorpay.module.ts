import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { RazorpayController } from './razorpay.controller';
import { DBModule } from '../../../../libs/database/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment, Order, User, PackageCategory, PackageAmenite, Package, PackageDay, PackageBooking } from '../../../../libs/database/src/entities';
import { ConfigModule } from '../../../../libs/config/config.module';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import {
    OrderRepositoryService,
    PackageAmeniteRepositoryService,
    PackageBookingRepositoryService,
    PackageCategoryRepositoryService,
    PackageDayRepositoryService,
    PackageRepositoryService,
    UserRepositoryService,
} from '../../../../libs/database/src/repositories';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';
import { RedisCacheServiceModule } from '../../../../libs/redis-cache-service/redis-cache-module';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';

@Module({
    imports: [
        DBModule.forRoot(),
        TypeOrmModule.forFeature([Payment, OrderRepositoryService, Order, User, PackageCategory, PackageAmenite, PackageBooking, Package, PackageDay]),
        RedisCacheServiceModule,
        ConfigModule,
        ResponseHandlerModule,
        RazorpayModule,
    ],
    controllers: [RazorpayController],
    providers: [
        RazorpayService,
        TokenValidationMiddleware,
        JwtService,
        RazorpayPaymentService,
        PackageRepositoryService,
        PackageDayRepositoryService,
        PackageBookingRepositoryService,
        PackageAmeniteRepositoryService,
        PackageCategoryRepositoryService,
        UserRepositoryService,
        RedisCacheService,
    ],
})
export class RazorpayModule {}
