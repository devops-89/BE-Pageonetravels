import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ResponseHandlerModule } from '../response-handler/response-handler.module';
import { OrderRepositoryService } from '//database/repositories/order.repository';

@Module({
  providers: [
    PaypalService,
    ResponseHandlerModule, 
    OrderRepositoryService
  ]
})
export class PaypalModule { }

