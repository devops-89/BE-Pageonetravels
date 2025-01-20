import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import { DBModule } from '../../../../libs/database/src/database.module'
import { SearchRepositoryService, Setting, SettingRepositoryService } from '../../../../libs/database/src';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { GenerateTokenService } from './generateToken.service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { RedisCacheServiceModule } from "../../../../libs/redis-cache-service/redis-cache-module";
import { SearchHotelService } from './search-hotel.service';
import { SearchHotelController } from './search-hotel.controller';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';

@Module({
    imports:[
        DBModule.forRoot(),
        ConfigModule,
        ResponseHandlerModule,
        RedisCacheServiceModule,
        TBOConfigModule.register(),    
        TypeOrmModule.forFeature([
            Setting,
            SettingRepositoryService,
            SearchRepositoryService
        ]),
    ],
    controllers: [SearchHotelController],
    providers: [SearchHotelService, GenerateTokenService, TBO_CredentialsService, HotelTBOAPIService],
})
export class SearchHotelModule {}
