import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommissionModule } from './commission/commission.module';
import { HomeModule } from './home/home.module';
import { HotelierModule } from '../hotelier/hotelier.module';
import { PackageModule } from '../package/package.module';
import { CustomerModule } from '../customer/customer.module';
import { FlightsModule } from '../flights/flights.module';

@Module({
    imports: [CommissionModule, HomeModule, HotelierModule, PackageModule, CustomerModule, FlightsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }

