import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchHotelModule } from '../search-hotel/search-hotel.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// import { GenerateTokenService } from '../search-hotel/generateToken.service';
// import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';

@Module({
    imports: [
        SearchHotelModule,
        CacheModule.registerAsync({
            isGlobal: true,
            useFactory: () => ({
                store: redisStore.create({
                    // Use `create` to initialize the store
                    host: 'localhost',
                    port: 6379,
                    ttl: 600,
                    max: 100000,
                }),
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
