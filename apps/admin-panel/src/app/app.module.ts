import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommissionModule } from './commission/commission.module';

@Module({
    imports: [CommissionModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {} 

