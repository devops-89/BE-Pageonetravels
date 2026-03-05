import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchHotelModule } from '../search-hotel/search-hotel.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import {MongoDBModule} from '../../../../libs/database/src/mongodb/mongodbconnect';
import {BullModule} from "@nestjs/bull";
import { ScheduleModule } from '@nestjs/schedule';
import { SyncCronService } from './bull/sync-cron.service';
import { CountrySyncProcessor } from './bull/country-sync.queue';
import { CitySyncProcessor } from './bull/city-sync.queue';
import { HotelTBOCodeSyncProcessor } from './bull/hotelTBOCodeSync.queue';
import { HotelCodeTableSyncProcessor } from "./bull/hotelCodeSync.queue";
import {HotelDetailSyncProcessor} from './bull/hotelDetailSync.queue';

@Module({
    imports: [
        SearchHotelModule,
        // MongoDBModule,
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: () => ({
                store: redisStore,
                host: 'localhost',
                port: 6379,
                ttl: 0, // This is now at the correct level
                max: 100000, // This is now at the correct level
            }),
        }),
        // bull global configuration
        BullModule.forRoot({
            redis:{
                host:"localhost",
                port:6379
            }
        }),
       // Register Queues
       BullModule.registerQueue({
        name:"sync-country"
       }),
       BullModule.registerQueue({
        name:"sync-city"
       }),
       BullModule.registerQueue({
        name:"sync-hotel-tbo-codes"
       }),
        BullModule.registerQueue({
            name:"sync-hotel-code-table"
        }),
        BullModule.registerQueue({
            name:"sync-hotel-details-table"
        }),
       ScheduleModule.forRoot(),

    ],
    controllers: [AppController],
    providers: [AppService,SyncCronService,CountrySyncProcessor,CitySyncProcessor,HotelTBOCodeSyncProcessor,HotelCodeTableSyncProcessor,HotelDetailSyncProcessor],
})
export class AppModule {}
