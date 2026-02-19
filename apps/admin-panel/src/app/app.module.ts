import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommissionModule } from './commission/commission.module';
import { HomeModule } from './home/home.module';
import { HotelierModule } from '../hotelier/hotelier.module';
import { PackageModule } from '../package/package.module';
import { CustomerModule } from '../customer/customer.module';
import { ProfileModule } from '../profile/profile.module';
import { RefundModule } from '../refund/refund.module';

@Module({
    imports: [CommissionModule, HomeModule, HotelierModule, PackageModule, CustomerModule, ProfileModule, RefundModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }

