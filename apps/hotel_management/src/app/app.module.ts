import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HotelierModule } from '../hotelier/hotelier.module';
import { HotelierInventoryModule } from '../hotelier-inventory/hotelier-inventory.module';
import { HotelierRoomTypesModule } from '../hotelier-room-types/hotelier-room-types.module';
import { HotelierBookingModule } from '../hotelier-booking/hotelier-booking.module';
import { DBModule } from '../../../../libs/database/src/database.module'; // apne DB module ka correct path check karna
import * as redisStore from 'cache-manager-redis-store';
import {S3Module} from "../../../../libs/S3-Service/s3.module";
@Module({
    imports: [
        CacheModule.register({
            isGlobal: true,
            store: redisStore, // "as any" typecast for TS
            host: 'localhost',
            port: 6379,
            ttl: 600, // TTL in seconds
        }),
        HotelierModule,
        HotelierRoomTypesModule,
        HotelierBookingModule,
        HotelierInventoryModule,
        DBModule.forRoot(),
        S3Module.forRoot()
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}