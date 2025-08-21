import { Controller, Post, Req, Headers,  Body, Get, Query, Param, Res   } from '@nestjs/common';
import { ConfigService } from '../../../../libs/config/config.service';
import { OrderRepositoryService } from '../../../../libs/database/src/repositories/order.repository';
import { WebhookService } from './webhook.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
// import { Payment } from '../../../../libs/interfaces/payment/payment.interface';
import { Response } from 'express';
import { Request } from 'express';

@Controller('webhook')
export class WebhookController {
      

    constructor(
        private readonly responsehandlderservice:ResponseHandlerService,
        private readonly webhookService: WebhookService,
        private readonly configService: ConfigService,
        private readonly orderRepositoryService:OrderRepositoryService
      ) {
      }
    
    @Get('payment/:paymentId')
    async getPayment(@Param('paymentId') paymentId: string) {
      return await this.webhookService.getPaymentDetails(paymentId);
    }

    
    @Post('paymentDetails')
    async payment(@Res() res: Response, @Query('paymentId') paymentId: string) {

        console.log("==== PAYMENT DETAILS CALLED ====");
  console.log("paymentId:", paymentId);
      
      if(!paymentId){
        throw {   message: "Payment Id Required.",   statusCode: ERROR_CODES.BAD_REQUEST  };
      }
      if(paymentId.length < 18){
        throw { message: "Invalid payment ID format.", statusCode: ERROR_CODES.BAD_REQUEST };
      }

      const razorpayPaymentIdPattern = /^pay_[A-Za-z0-9]{14,}$/;
      
      if (!razorpayPaymentIdPattern.test(paymentId)) {
        throw { message: "Invalid payment ID format.", statusCode: ERROR_CODES.BAD_REQUEST };
      }

      try{
        const result = await this.webhookService.getPaymentDetails(paymentId);
        // console.log("Webhook result",result);
        // console.log("Webhook result id",result.order_id);
        // const order = await this.orderRepositoryService.findOne(result.order_id);
        // console.log("order",order);

        // if(order){
        //   const payment = await this.orderRepositoryService.findOne(order.payment.payment_id);
          
        //   console.log("webhook payment info: ",payment);
         
        return this.responsehandlderservice.sendSuccessResponse(res,result);
      }catch(error){
        console.log("Error in Webhook Api:", error);
        return this.responsehandlderservice.sendErrorResponse(res, error);
      }
    }

 
    @Post("/test")
    async handleWebhookData(@Req() req:Request, @Headers('x-razorpay-signature') signature: string,@Body() body:any){

    return await this.webhookService.processWebhookEvent(signature, body)
}
   
 

}