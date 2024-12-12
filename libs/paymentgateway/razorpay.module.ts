import { Module } from '@nestjs/common';
import { ResponseHandlerModule } from '../response-handler/response-handler.module';
import { RazorpayService } from './razorpay.service';
import { ConfigModule } from '../../libs/config/config.module';

@Module({
  imports:[ConfigModule],
  providers: [
    RazorpayService,
    ResponseHandlerModule
    ]
})
export class RazorpayModule { }

