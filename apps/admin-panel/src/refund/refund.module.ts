import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Payment,Order} from "../../../../libs/database/src/entities";

import {RazorpayModule} from "../../../../libs/paymentgateway/razorpay.module";
@Module({
    imports:[RazorpayModule,TypeOrmModule.forFeature([Payment,Order]),ResponseHandlerModule],
  controllers: [RefundController],
  providers: [RefundService]
})
export class RefundModule {}
