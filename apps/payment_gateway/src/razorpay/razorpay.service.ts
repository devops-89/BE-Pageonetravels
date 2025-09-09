import { Injectable } from '@nestjs/common';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';
import { FlightTicketRepositoryService, OrderRepositoryService, UserRepositoryService } from '../../../../libs/database/src/repositories';
import { LccTicketDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import * as crypto from 'crypto';
import { ConfigService } from '../../../../libs/config/config.service';
// import { CreatePackageBookingDto } from '../../../../libs/dtos/package/package-booking.dto';
import { PackageRepositoryService } from '../../../../libs/database/src/repositories';
import { PackageBookingRepositoryService } from '../../../../libs/database/src/repositories/package-booking.repository';
// import { BookingStatus } from '../../../../libs/database/src';
// import { PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';

@Injectable()
export class RazorpayService {
    constructor(
        private readonly configService: ConfigService,
        private readonly orderRepository: OrderRepositoryService,
        private readonly userrepositoryservice: UserRepositoryService,
        private readonly packageBookingRepositoryService:PackageBookingRepositoryService,
        private readonly packageRepositoryService:PackageRepositoryService,
        private readonly razorpayPaymentService: RazorpayPaymentService,
        private readonly flightTicketService: FlightTicketRepositoryService
    ) {}

    async createFlightOrder(reference_id: string, body: LccTicketDto, email: string) {
        try {
            const amountData = Math.round(parseFloat(body.amount) * 100);
            const { currency, custom_order_id } = body;
            const amount = amountData;
            const orderdetails = await this.orderRepository.findOne(custom_order_id);
            const checkOrder = await this.flightTicketService.findOne(orderdetails.order_id);
            if (checkOrder) {
                throw { message: 'Payment record already exists for this order. Please initiate the process again.', statusCode: ERROR_CODES.BAD_REQUEST };
            }

            const orderAmount = Math.round(parseFloat(orderdetails.amount) * 100);
            if (amount !== orderAmount) {
                throw { message: 'Amount not matched', statusCode: ERROR_CODES.BAD_REQUEST };
            }
            // const paymentInput = { amount, currency, custom_order_id };

            const paymentInput = {
                amount: amount,
                currency: currency,
                description: 'Payment for flight Ticket',
                reference_id: custom_order_id.trim(),
                customer: {
                    email: email,
                },
                notes: {
                    module: 'flight',
                    order_id: orderdetails.order_id,
                },
                callback_url: 'https://page1-fe.vercel.app/payment/success',
            };

            const data = await this.razorpayPaymentService.createPaymentLink(paymentInput);

            const orderSave = await this.flightTicketService.insertOrder(data, { order_id: orderdetails.order_id, user: reference_id });
            return { message: 'Order Created successfully', data: data };
        } catch (error) {
            console.error('Error ', error);
            throw error;
        }
    }

    async getExpireByTime() {
        const currentTime = Math.floor(Date.now() / 1000);
        const expireBy = currentTime + 15 * 60;
        return expireBy;
    }

//     async createPackageOrder(reference_id: string,body:CreatePackageBookingDto, email: string){
//         try{
//                 // getting package details
//             const packageDetail=await this.packageRepositoryService.getPackageById(body?.packageId);
//             const amount=packageDetail.selling_price;
//             console.log("package details:",amount, email);

//             // package repository code

//              // booking payload
// const bookingData = {
//   packageId: body.packageId, 
//   userId: reference_id,
//   title: body.title,         
//   first_name: body.first_name,
//   last_name: body.last_name,
//   DOB: body.DOB,
//   passport_number: body.passport_number,
//   passport_expiry: body.passport_expiry,
//   email: body.email,
//   mealType: body.mealType,
//   status: BookingStatus.PENDING,   
// };

//             // save order
//             // const orderResponse = await this.orderRepositoryService.insertBooking(reference_id, 'HOTEL', hotelPayload, amount, body.BookingCode, undefined, undefined, undefined, undefined, extraInfo);
//             const response=await this.packageBookingRepositoryService.createPackageBooking(bookingData);

//             console.log('+++++++++++++++Order Response:++++++++++++++++', response);

//             // extract the custom order id from the orderReaponse
//             const custom_order_id = response.id;

//             // create Razorpay Payment Link
//             const paymentLink = await this.razorpayPaymentService.createPaymentLink({
//                 amount: Math.round(amount * 100),
//                 currency: 'INR',
//                 description: 'Payment For Package Booking',
//                 reference_id: custom_order_id.trim(),
//                 customer: {
//                     email: email,
//                 },
//                 notes: {
//                     module: 'package',
//                     order_id: custom_order_id,
//                 },
//                 callback_url: 'https://page1-fe.vercel.app/payment/success',
//             });

//             // save payment record to payment table
//             const packageBookingDetails = await this.packageBookingRepositoryService.findPackageBookingById(custom_order_id);
//             console.log('package booking Details by custom order id: ', packageBookingDetails);
//             const user = reference_id;

//             // const orderRef = new PackageBooking();
//             // orderRef.order_id = custom_order_id;

//             // const userRef = new User();
//             // userRef.id = user;



//             // Create the payment entity
//             // const paymentEntity = this.paymentRepository.create({
//             //     razorpay_link_response: JSON.stringify(paymentLink),
//             //     user: { id: user }, 
//             //     packageBooking: { id: response.id },
//             //     amount: amount.toString(),
//             //     payment_gateway: 'Razorpay',
//             //     payment_status: paymentLink.status,
//             //     status: PAYMENT_STATUS.IN_PROGRESS,
//             // });

//             // Save the entity (ensures relations are handled)
//             // await this.paymentRepository.save(paymentEntity);

//             // return this.responsehandlderservice.sendSuccessResponse(res, {
//             //     message: 'Package Booking Initialized. Proceed to payment.',
//             //     data: paymentLink,
//             // });


//             // package repository code
//         }
//         catch(error){
//              console.error('Error ', error);
//             throw error;
           
//         }
//     }

   

    async paymentVerify(razorpayPaymentId: string, razorpayPaymentLinkId: string, razorpaySignature: string) {
        try {
            // Trim inputs to avoid any extra spaces
            razorpayPaymentId = razorpayPaymentId.trim();
            razorpayPaymentLinkId = razorpayPaymentLinkId.trim();
            razorpaySignature = razorpaySignature.trim();

            // Construct the signature string correctly
            const signatureString = `${razorpayPaymentId}|${razorpayPaymentLinkId}`;
            console.log('Signature String:', signatureString); // Log the signature string for debugging

            // Generate the expected signature using the Razorpay Secret Key
            const secretKey = 'zuHsL13ehyikzktJQC1HsBok'; // Razorpay Secret Key
            const expectedSignature = crypto.createHmac('sha256', secretKey).update(signatureString).digest('hex');

            // Log expected and received signatures for debugging
            console.log('Expected Signature:', expectedSignature);
            console.log('Received Signature:', razorpaySignature);

            // Compare the signatures
            if (expectedSignature === razorpaySignature) {
                console.log('Signature verified');
                return { message: 'Payment verified successfully', data: true };
            } else {
                console.log('Signature not verified');
                return { message: 'Payment verification failed', data: false };
            }
        } catch (error) {
            console.error('Error during payment verification:', error);
            throw error;
        }
    }
}
