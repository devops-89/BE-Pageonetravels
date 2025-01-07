import { Module } from '@nestjs/common';
import { FlightdetailController } from './flightdetail.controller';
import { FlightDetailService } from './flightdetail.service';
import { ConfigModule } from '../../../../libs/config/config.module';
import { DBModule } from '../../../../libs/database/src/database.module'
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { GenerateTokenService } from '../search-flight/generateToken.service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { SearchFlightModule } from '../search-flight/search-flight.module';
import { RedisCacheServiceModule } from '../../../../libs/redis-cache-service/redis-cache-module';

@Module({
    imports:[
         DBModule.forRoot(),
         ConfigModule,
         SearchFlightModule,
         ResponseHandlerModule,
         RedisCacheServiceModule,
         TBOConfigModule.register(),    
    ],
    controllers: [FlightdetailController],
    providers:[FlightDetailService,GenerateTokenService, TBO_CredentialsService, HTTPSTboAPIService]
})
export class FlightdetailModule {}
