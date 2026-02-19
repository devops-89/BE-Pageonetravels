import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import { DBModule } from '../../../../libs/database/src/database.module';
import { HotelCity, HotelTboCode, HotelTboCodeRepositoryService, SearchRepositoryService, Setting, SettingRepositoryService } from '../../../../libs/database/src';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { GenerateTokenService } from './generateToken.service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';

import { RedisCacheServiceModule } from '../../../../libs/redis-cache-service/redis-cache-module';
import { SearchHotelService } from './search-hotel.service';
import { SearchHotelController } from './search-hotel.controller';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';

import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { RazorpayModule } from '../../../../libs/paymentgateway/razorpay.module';
import { RazorpayService } from '../../../../libs/paymentgateway/razorpay.service';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { SyncCronService } from '../app/bull/sync-cron.service';
import { BullModule } from '@nestjs/bull';

@Module({
    imports: [
        DBModule.forRoot(),
        ConfigModule,
        ResponseHandlerModule,
        RedisCacheServiceModule,
        TBOConfigModule.register(),
        TypeOrmModule.forFeature([Setting, SettingRepositoryService, SearchRepositoryService, HotelCity, HotelTboCode]),
        BullModule.registerQueue({ name: 'sync-country' }, { name: 'sync-city' }, { name: 'sync-hotel-tbo-codes' }, { name: 'sync-hotel-code-table' }, { name: 'sync-hotel-details-table' }),
        RazorpayModule,
    ],
    controllers: [SearchHotelController],
    exports: [SearchHotelService, SyncCronService],
    providers: [
        SearchHotelService,
        GenerateTokenService,
        TBO_CredentialsService,
        HotelTBOAPIService,
        HTTPSTboAPIService,
        RazorpayService,
        JwtService,
        TokenValidationMiddleware,
        HotelTboCodeRepositoryService,
        HotelCity,
        HotelTboCode,
        SyncCronService,
    ],
})
export class SearchHotelModule {}
