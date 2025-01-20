import { Module } from '@nestjs/common';
import { HotelDetailController} from './hoteldetail.controller';

import { ConfigModule } from '../../../../../libs/config/config.module';
import { DBModule } from '../../../../../libs/database/src/database.module'
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';
import { TBOConfigModule } from '../../../../../libs/loadtbo-db-config/tbo-config.module';
import { GenerateTokenService } from '../../search-hotel/generateToken.service';
import { TBO_CredentialsService } from '../../../../../libs/loadtbo-db-config/tbo-config.service';
import { HotelTBOAPIService } from '../../../../../libs/http-api-service/hoteltbo-api-service';
import { RedisCacheServiceModule } from '../../../../../libs/redis-cache-service/redis-cache-module';
import { HotelDetailService } from './hoteldetail.service';
import { SearchHotelModule } from '../../search-hotel/search-hotel.module';

@Module({
    imports:[
         DBModule.forRoot(),
         ConfigModule,
         SearchHotelModule,
         ResponseHandlerModule,
         RedisCacheServiceModule,
         TBOConfigModule.register(),    
    ],
    controllers: [HotelDetailController],
    providers:[HotelDetailService,GenerateTokenService, TBO_CredentialsService, HotelTBOAPIService]
})
export class FlightdetailModule {}
