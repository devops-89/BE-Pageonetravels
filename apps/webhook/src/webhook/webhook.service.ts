// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '../../../../libs/config/config.service';
// import Razorpay from 'razorpay';

// @Injectable()
// export class WebhookService {
//     private razorpay: Razorpay;
//     private key: string;
//     private secret: string;

//     constructor(private readonly configService: ConfigService) {
//         this.key = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY;
//         this.secret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY_SECRET;

//         try {
//             this.razorpay = new Razorpay({
//                 key_id: this.key,
//                 key_secret: this.secret,
//             });
//         } catch (error) {
//             console.error('Failed to initialize Razorpay:', error);
//             throw new Error('Razorpay initialization failed');
//         }
//     }

//     getInstance(): Razorpay {
//         return this.razorpay;
//     }
// }

import { Injectable  } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../../../../libs/config/config.service';
import { OrderRepositoryService } from '../../../../libs/database/src/repositories/order.repository';
import { FlightTicketRepositoryService } from '../../../../libs/database/src/repositories/flightticket.repository';
import { FlightService } from '../../../../libs/tickethandler/flight.service';

@Injectable()
export class WebhookService {
    private readonly apiUrl = 'https://api.razorpay.com/v1/payments/';
    constructor(
      private readonly configService: ConfigService,
      private readonly orderRepositoryService:OrderRepositoryService,
      private readonly flightTicketRepositoryService:FlightTicketRepositoryService,
      private readonly flightService:FlightService
    ){
    }
  // Handle different Razorpay events
  async handleEvent(event: string, payload: any) {
    switch (event) {
      case 'payment.success':
        await this.handlePaymentSuccess(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailure(payload);
        break;
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      default:
        console.warn(`Unhandled event: ${event}`);
    }
  }

  // Handle payment success
  async handlePaymentSuccess(payload: any) {
    const paymentDetails = payload.payment.entity;
    console.log('Payment Successful:', paymentDetails);
    // Add business logic (e.g., update the database, notify the customer, etc.)
  }

  // Handle payment failure
  async handlePaymentFailure(payload: any) {
    const paymentDetails = payload.payment.entity;
    console.log('Payment Failed:', paymentDetails);
    // Add business logic (e.g., update the database, notify the customer, etc.)
  }

  // Handle payment captured
  async handlePaymentCaptured(payload: any) {
    const paymentDetails = payload.payment.entity;
    console.log('Payment Captured:', paymentDetails);
    // Add business logic (e.g., confirm order, notify customer, etc.)
  }

// Method to get payment details by payment_id
async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const username = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY; // Replace with your Razorpay API key ID
      const password = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY_SECRET; // Replace with your Razorpay API key secret

      // Set up basic authentication
      const auth = Buffer.from(`${username}:${password}`).toString('base64');

      // Make the GET request to Razorpay API
      const response = await axios.get(`${this.apiUrl}${paymentId}`, {
        headers: {
          'Authorization': `Basic ${auth}`, // Pass basic auth header
        },
      });

      return response.data; // Return the payment details
    } catch (error) {
      if(error.response){
        throw { message: error.response.statusText, statusCode: error.response.status };
      }
      throw error; 
    }
  }

   async handlePaymentdata(body: any) {
        try { 
            const orderid = body.payload.payment.entity.order_id;
            const response =await this.getPayment(orderid);
            const orderdetails = await this.orderRepositoryService.findOne(response);
            console.log("=============webhook handlePayment Order Details Fetched: ",orderdetails);
            console.log("modify order body:", body);
            const modifyOrder = await this.orderRepositoryService.updateOrder(response,body);
            console.log("modified order Repository:",modifyOrder);
            const updatedPayment = await this.flightTicketRepositoryService.findAndUpdate(modifyOrder,body);
            console.log("updated Payment:",updatedPayment);
            if(orderdetails){  
              await this.flightService.flightHandler(orderdetails.order_id,orderdetails.custom_order_id,orderdetails.journey_type,orderdetails.journey,orderdetails.isLCC,orderdetails.is_LCC_round,orderdetails.trace_id,orderdetails.order_request,orderdetails.order_request_second,orderdetails.user);
            }
        } catch (error) {
            console.log("Error inside handlePaymentCaptured:", error);
            throw error;
        }
    }

    
  
    async getPayment(paymentId: string): Promise<any> {
      try {
        const username = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY; // Your Razorpay API Key ID
        const password = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_KEY_SECRET; // Your Razorpay API Key Secret
        
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        const apiUrl = `https://api.razorpay.com/v1/orders/${paymentId}`;

        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Basic ${auth}`, // Basic Authentication header
          },
        });

        const receiptId = response.data.receipt; 

        return receiptId;
      } catch (error) {
        console.error('Error fetching payment details:', error);
        throw error; // Handle the error accordingly
      }
    }
  

}
