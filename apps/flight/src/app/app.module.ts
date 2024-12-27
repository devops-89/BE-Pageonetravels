import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchFlightModule } from '../search-flight/search-flight.module';
// import { TBOConfigModule } from '../../../../libs/loadtbo-db-config/tbo-config.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FlightdetailModule } from './flightdetail/flightdetail.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports: [
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
        SearchFlightModule,
        FlightdetailModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
