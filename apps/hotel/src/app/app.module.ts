import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchHotelModule } from '../search-hotel/search-hotel.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import {MongoDBModule} from '../../../../libs/database/src/mongodb/mongodbconnect';

@Module({
    imports: [
        SearchHotelModule,
        MongoDBModule,
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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}