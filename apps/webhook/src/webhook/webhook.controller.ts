import { Controller, Post, Req, Headers, HttpStatus, HttpException, Body, Get, Query, Param   } from '@nestjs/common';
import { ConfigService } from '../../../../libs/config/config.service';
import { OrderRepositoryService } from '../../../../libs/database/src/repositories/order.repository';
import { WebhookService } from './webhook.service';
import * as crypto from 'crypto';
// import { Payment } from '../../../../libs/interfaces/payment/payment.interface';

@Controller('webhook')
export class WebhookController {

    
    constructor(
        private readonly webhookService: WebhookService,
        private readonly configService: ConfigService,
        private readonly orderRepositoryService:OrderRepositoryService
      ) {
      }
    
    @Get('payment/:paymentId')
    async getPayment(@Param('paymentId') paymentId: string) {
      return await this.webhookService.getPaymentDetails(paymentId);
    }

    @Post('/test')
    async handleWebhookData(@Req() req:Request, @Headers('x-razorpay-signature') signature: string,@Body() body:any){
          const webhookSecret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_WEBHOOK_SECRET;
          const resposne = req.body; 
          console.log(">>>>>>>> resposne" ,resposne); 
          const expectedSignature = crypto
                                  .createHmac('sha256', webhookSecret)
                                  .update(JSON.stringify(body))
                                  .digest('hex');
          if (expectedSignature !== signature) {
              throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
          }

              
          if (body && body.payload ) {
          
              const event = body.event;
              if (event === 'payment.captured') {
              // Handle payment captured event 
              await this.webhookService.handlePaymentdata(body);
              } else if (event === 'payment.failed') {
                  // Handle payment failed event
                  // console.log(`Payment failed for order ID: ${custom_order_id}`);
              } else {
                  // Handle unhandled events
                  console.log(`Unhandled event: ${event}`);
              }

          return { status: 'success' };   
        } 
    }

   
      
    @Get('/test')
    async handleWebhook(@Body() body: any, @Headers('x-razorpay-signature') razorpaySignature: any, @Query() query:any) {
      const webhookSecret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_WEBHOOK_SECRET;

        console.log("Received Query Parameters:", query);
        console.log("Received Razorpay Signature from Headers:", razorpaySignature);
        console.log("Webhook Secret:", webhookSecret);
        
      // Step 1: Get the payload (the relevant data for signature verification)
        const payload = {
            razorpay_payment_id: query.razorpay_payment_id,
            razorpay_payment_link_id: query.razorpay_payment_link_id,
            razorpay_payment_link_reference_id: query.razorpay_payment_link_reference_id,
            razorpay_payment_link_status: query.razorpay_payment_link_status,
        };
        const data = await this.getPayment(query.razorpay_payment_id);
        payload['razorpay_order_id'] = data.order_id
        console.log(payload);
        //cosnt orderdetails = await this.orderRepositoryService.findOne(query.razorpay_payment_link_reference_id);
        


        // console.log(payload);
      // Step 2: Verify the webhook signature
      
        //const isVerified = this.verifyRazorpaySignature(payload, query.razorpay_signature, webhookSecret);

        // if (!isVerified) {
        // throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
        // }
  
      // Step 2: Handle the event based on the Razorpay event type
    //   const event = body.event;
    //   const payload = body.payload;
  
    //   try {
    //     await this.webhookService.handleEvent(event, payload);
    //   } catch (error) {
    //     console.error('Error handling webhook event:', error);
    //     throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    //   }
  
    //   return { status: 'success' };
    }
  
    // Method to verify Razorpay webhook signature
    
    private verifyRazorpaySignature(payload: any, razorpaySignature: string, secret: string): boolean {

      // const generated_signature = hmac_sha256(payload.razorpay_order_id + "|" + payload.razorpay_payment_id, secret);
      // crypto.createHash('HMAC-SHA256').update(payload.razorpay_order_id + "|" + payload.razorpay_payment_id, secret).digest("base64");

      //   if (generated_signature == razorpaySignature) {
      //   console.log("=====>>> payment is successful")
        // }
       
        const payloadString = `${payload.razorpay_payment_link_reference_id}|${payload.razorpay_payment_id}`;
        console.log("Payload String for payloadString:", payloadString);
        console.log("Payload String for secret:", secret);
        
        // Generate the expected signature using HMAC with SHA256
        const expectedSignature = crypto
            .createHmac('sha256', secret.trim())
            .update(payloadString)  // Use the concatenated string here
            .digest('hex');
        
        // Log expected signature for debugging purposes
       
               
        if (razorpaySignature === expectedSignature) {
          console.log('Signature Verified',expectedSignature,razorpaySignature);
        } else {
          console.log('Signature Mismatch',expectedSignature,razorpaySignature);
        }
        
        // Compare the calculated signature with the one received in the Razorpay signature
        return razorpaySignature === expectedSignature;
    }

    

   
    
    
    
    

}



