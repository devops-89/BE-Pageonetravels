import { Module } from '@nestjs/common';
import { SearchFlightController } from './search-flight.controller';
import { SearchFlightService } from './search-flight.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import {DBModule } from '../../../../libs/database/src/database.module'
import { Airport, SearchRepositoryService, Setting, SettingRepositoryService } from '../../../../libs/database/src';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { GenerateTokenService } from './generateToken.service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { HTTPSTboAPIService } from "../../../../libs/http-api-service/tbo-api-service";

@Module({
    imports:[
        DBModule.forRoot(),
        ConfigModule,
        ResponseHandlerModule,
        TBOConfigModule.register(),    
        TypeOrmModule.forFeature([
            Setting,
            Airport,
            SettingRepositoryService,
            SearchRepositoryService
        ]),
    ],
    controllers: [SearchFlightController],
    providers: [SearchFlightService, GenerateTokenService, TBO_CredentialsService, HTTPSTboAPIService],
})
export class SearchFlightModule {}
