import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchHotelModule } from '../search-hotel/search-hotel.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports: [
        SearchHotelModule,
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: () => ({
                store: redisStore,
                host: 'localhost',
                port: 6379,
                ttl: 600, // This is now at the correct level
                max: 100000, // This is now at the correct level
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}