import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchFlightModule } from '../search-flight/search-flight.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { FlightDetailModule } from '../flightdetail/flightdetail.module';
import { FlightBookingModule } from '../flight-booking/flight-booking.module';
import { FlightTicketModule } from '../flight-ticket/flight-ticket.module';
import { DBModule } from '../../../../libs/database/src';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 600, // TTL in milliseconds
      // no 'max' option in newer versions
    }),
    SearchFlightModule,
    FlightDetailModule,
    FlightBookingModule,
    FlightTicketModule,
    DBModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}