import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RazorpayModule } from '../razorpay/razorpay.module';


@Module({
    imports: [RazorpayModule],
    controllers: [AppController],
    providers: [AppService],
})



export class AppModule {}
