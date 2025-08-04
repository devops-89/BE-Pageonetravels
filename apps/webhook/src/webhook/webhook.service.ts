
import { Injectable  } from '@nestjs/common';
import {  HttpStatus, HttpException  } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../../../../libs/config/config.service';
import { OrderRepositoryService } from '../../../../libs/database/src/repositories/order.repository';
import { FlightTicketRepositoryService } from '../../../../libs/database/src/repositories/flightticket.repository';
import {HotelPaymentRepositoryService} from "../../../../libs/database/src/repositories/hotelPayment.repository";
import { FlightService } from '../../../../libs/tickethandler/flight.service';
import {HotelService} from "../../../../libs/hotelbookinghandler/hotel.service";
import { ORDER_STATUS,PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';

import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
    private readonly apiUrl = 'https://api.razorpay.com/v1/payments/';
    constructor(
      private readonly configService: ConfigService,
      private readonly orderRepositoryService:OrderRepositoryService,
      private readonly flightTicketRepositoryService:FlightTicketRepositoryService,
      private readonly hotelPaymentRepositoryService:HotelPaymentRepositoryService,
      private readonly flightService:FlightService,
      private readonly hotelService:HotelService
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

  async processWebhookEvent(signature: string, body: any) {
  const webhookSecret = this.configService.get().RAZORPAY_CREDENTIAL.RAZORPAY_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body))
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
  }

  if (!body?.payload) return { status: 'ignored' };

  const event = body.event;
  const entity = body.payload.payment.entity;
  const notes = entity?.notes || {};
  const module = notes?.module;

  console.log("+++++++++++++++++++ Webhook Payload Response +++++++++++++++++++++++++++");
  console.log('Module from webhook:', module);
  console.log("Received Razorpay Event: ", event);
  console.log("Razorpay Entity Id: ", entity.id);
  console.log("Payment Link Id: ", entity.payment_link_id);
  console.log("Payment Link Reference Id (custom_order_id): ", entity.payment_link_reference_id);
  console.log("Payment Status: ", entity.status);
  console.log("Payment Id (Razorpay Order ID):", entity.order_id);
  console.log("+++++++++++++++++++ Webhook Payload Response +++++++++++++++++++++++++++");

   const razorpayOrderId = entity.order_id;
    const receipt = await this.getPayment(razorpayOrderId);
    const order = await this.orderRepositoryService.findOne(receipt);

  if (event === 'payment.captured') {
  try {
    if (module === 'hotel') {
      await this.handleHotelPaymentdata(body);
    } else if (module === 'flight') {
      await this.handleFlightPaymentdata(body);
    } else {
      console.warn('Unknown module type in webhook:', module);
      return { status: 'ignored' };
    }

    // ✅ Only mark payment success if booking handler completes
    // await this.orderRepositoryService.updatePaymentStatus(order.order_id, PAYMENT_STATUS.SUCCESS);
    return { status: 'success' };
  } catch (error) {
    console.error("❌ Booking handler failed after payment captured:", error);
    
    // Optional: update custom booking status or log error
    return { status: 'payment_success_but_booking_failed', orderId: order.order_id };
  }
} else if (event === 'payment.failed') {
    // 🔁 Get order receipt from Razorpay
   

    // ❌ Update payment status as FAILED
    // order.payment_status = PAYMENT_STATUS.FAILED;
    // await this.orderRepositoryService.save(order);
    this.orderRepositoryService.updatePaymentStatus(order.order_id,PAYMENT_STATUS.FAILED);

    console.log(`❌ Payment failed for order: ${receipt}`);
    return { status: 'failed', orderId: receipt };
  }

  return { status: 'ignored' };
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

   async handleFlightPaymentdata(body: any) {
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

       async handleHotelPaymentdata(body: any) {
        try { 
            const orderid = body.payload.payment.entity.order_id;
            const response =await this.getPayment(orderid);
            const orderdetails = await this.orderRepositoryService.findOne(response);
            console.log("id based on the order id for razorpay: ",response);
          
            console.log("=============webhook handlePayment Order Details Fetched: ",orderdetails);
            this.orderRepositoryService.updatePaymentStatus(orderdetails.order_id, PAYMENT_STATUS.SUCCESS);
            console.log("modify order body:", body);
            const modifyOrder = await this.orderRepositoryService.updateOrder(response,body);
            console.log("modified order Repository:",modifyOrder);
            const updatedPayment = await this.hotelPaymentRepositoryService.findAndUpdate(modifyOrder,body);
            console.log("updated Payment:",updatedPayment);
           
            if(orderdetails){  
              await this.hotelService.hotelHandler(orderdetails.order_id,orderdetails.custom_order_id,orderdetails.order_request,orderdetails.user,orderdetails.payment);
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
