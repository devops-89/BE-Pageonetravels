import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommissionModule } from './commission/commission.module';
import { HomeModule } from './home/home.module';

@Module({
    imports: [CommissionModule,HomeModule ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {} 

