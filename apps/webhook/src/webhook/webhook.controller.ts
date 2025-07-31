import { Controller, Post, Req, Headers, HttpStatus, HttpException, Body, Get, Query, Param, Res   } from '@nestjs/common';
import { ConfigService } from '../../../../libs/config/config.service';
import { OrderRepositoryService } from '../../../../libs/database/src/repositories/order.repository';
import { WebhookService } from './webhook.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import * as crypto from 'crypto';
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

    // @Post('/test')
    // async handleWebhookData(@Req() req:Request, @Headers('x-razorpay-signature') signature: string,@Body() body:any){
    //       const webhookSecret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_WEBHOOK_SECRET;
    //       const resposne = req.body; 
    //       console.log(">>>>>>>>Anshu resposne" ,resposne); 
    //       const expectedSignature = crypto
    //                               .createHmac('sha256', webhookSecret)
    //                               .update(JSON.stringify(body))
    //                               .digest('hex');
    //       if (expectedSignature !== signature) {
    //           throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    //       }

              
    //       if (body && body.payload ) {
          
    //           const event = body.event;
    //           if (event === 'payment.captured') {
    //           // Handle payment captured event 
    //           await this.webhookService.handlePaymentdata(body);
    //           } else if (event === 'payment.failed') {
    //               // Handle payment failed event
    //               console.log(`Payment failed for order ID: `);
    //           } else {
    //               // Handle unhandled events
    //               console.log(`Unhandled event: ${event}`);
    //           }

    //       return { status: 'success' };   
    //     } 
    // }

    @Post("/test")
    async handleWebhookData(@Req() req:Request, @Headers('x-razorpay-signature') signature: string,@Body() body:any){

  const webhookSecret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_WEBHOOK_SECRET;

  const response = req.body;
  console.log(">>>>>>>>Anshu response", response);

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body))
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
  }

  if (body && body.payload) {
    const event = body.event;
    if (event === 'payment.captured') {
      await this.webhookService.handlePaymentdata(body);
    } else if (event === 'payment.failed') {
      console.log(`Payment failed for order ID: `);
    } else {
      console.log(`Unhandled event: ${event}`);
    }

    return { status: 'success' };
  }
}
}
   
      
//     @Get('/test')
//     async handleWebhook(@Body() body: any, @Headers('x-razorpay-signature') razorpaySignature: any, @Query() query:any) {
//       const webhookSecret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_WEBHOOK_SECRET;

//         console.log("Received Query Parameters:", query);
//         console.log("Received Razorpay Signature from Headers:", razorpaySignature);
//         console.log("Webhook Secret:", webhookSecret);
        
//       // Step 1: Get the payload (the relevant data for signature verification)
//         const payload = {
//             razorpay_payment_id: query.razorpay_payment_id,
//             razorpay_payment_link_id: query.razorpay_payment_link_id,
//             razorpay_payment_link_reference_id: query.razorpay_payment_link_reference_id,
//             razorpay_payment_link_status: query.razorpay_payment_link_status,
//         };
//         const data = await this.getPayment(query.razorpay_payment_id);
//         payload['razorpay_order_id'] = data.order_id
        
//         //cosnt orderdetails = await this.orderRepositoryService.findOne(query.razorpay_payment_link_reference_id);
        


//         // console.log(payload);
//       // Step 2: Verify the webhook signature
      
//         const isVerified = this.verifyRazorpaySignature(payload, query.razorpay_signature, webhookSecret);

//         if (!isVerified) {
//         throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
//         }
  
//       // Step 2: Handle the event based on the Razorpay event type
//     //   const event = body.event;
//     //   const payload = body.payload;
  
//     //   try {
//     //     await this.webhookService.handleEvent(event, payload);
//     //   } catch (error) {
//     //     console.error('Error handling webhook event:', error);
//     //     throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
//     //   }
  
//     //   return { status: 'success' };
//     }
  
//     // Method to verify Razorpay webhook signature
    
//     private verifyRazorpaySignature(payload: any, razorpaySignature: string, secret: string): boolean {

//       const razorpay_payment_link_id = payload.razorpay_payment_link_id;
//       const razorpay_payment_link_reference_id = payload.razorpay_payment_link_reference_id;
//       const razorpay_payment_link_status = payload.razorpay_payment_link_status;
//       const razorpay_payment_id = payload.razorpay_payment_id;
      
//       // Create the signature payload by concatenating the parameters with '|'
//       const signature_payload = `${razorpay_payment_link_id.trim()}|${razorpay_payment_link_reference_id.trim()}`;
//        console.log(signature_payload);
//         // Generate the expected signature using HMAC with SHA256
//         const expectedSignature = crypto
//             .createHmac('sha256', secret)
//             .update(signature_payload)  // Use the concatenated string here
//             .digest('hex');
        
//         // Log expected signature for debugging purposes  
//         console.log(">>>>>>>>>>>> ",expectedSignature, razorpaySignature);
            
//         if (razorpaySignature === expectedSignature) {
//           console.log('Signature Verified',expectedSignature,razorpaySignature);
//         } else {
//           console.log('Signature Mismatch',expectedSignature,razorpaySignature);
//         }
        
//         // Compare the calculated signature with the one received in the Razorpay signature
//         return razorpaySignature === expectedSignature;
//     }
       

// }



