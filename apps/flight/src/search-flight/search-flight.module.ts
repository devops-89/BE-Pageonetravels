import { Module } from '@nestjs/common';
import { SearchFlightController } from './search-flight.controller';
import { SearchFlightService } from './search-flight.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../../../libs/config/config.module';
import {DBModule } from '../../../../libs/database/src/database.module'
import { Airport, SearchRepositoryService, Setting, SettingRepositoryService } from '../../../../libs/database/src';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
@Module({
    imports:[
        DBModule.forRoot(),
        ConfigModule,
        ResponseHandlerModule,
        TBOConfigModule,
        TypeOrmModule.forFeature([
            Setting,
            Airport,
            SettingRepositoryService,
            SearchRepositoryService
        ]),
    ],
    controllers: [SearchFlightController],
    providers: [SearchFlightService],
})
export class SearchFlightModule {}
