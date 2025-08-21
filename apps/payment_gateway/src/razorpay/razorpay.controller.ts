import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { UserRepositoryService } from '../../../../libs/database/src/repositories/user.repository';
import { OrderRepositoryService } from '../../../../libs/database/src/repositories/order.repository';
import { LccTicketDto, VerifyDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { TokenValidationGuard } from '../../../../libs/middlewares/authMiddleware.guard';
import { RazorpayService } from './razorpay.service';
import { Repository } from 'typeorm';
import { CreateHotelBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';
import { Order, Payment, User } from '../../../../libs/database/src/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';
import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';

@Controller('razorpay')
export class RazorpayController {
    constructor(
        private readonly responsehandlderservice: ResponseHandlerService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly razorpayService: RazorpayService,
        private readonly razorpayPaymentService: RazorpayPaymentService,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>
    ) {}

    @Post('/payment-init')
    @UseGuards(TokenValidationGuard)
    async ticketLCC(@Body() body: LccTicketDto, @Req() req: Request, @Res() res: Response) {
        try {
            const payload = req['userPayload'];
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);

            if (!refData) {
                throw `An error occurred while fetching the user. Please try again later.`;
            }
            const email = refData.email;
            const result = await this.razorpayService.createOrder(reference_id, body, email);
            return this.responsehandlderservice.sendSuccessResponse(res, result);
        } catch (error) {
            console.log(error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

    @Post('/hotel-payment-init')
    @UseGuards(TokenValidationGuard)
    async initiateHotelBooking(@Body() body: CreateHotelBookingDto, @Req() req: Request, @Res() res: Response) {
        try {
            // separating the payload Data
            const { extraInfo, ...restOfBookingData } = body;

            const cleanedBody = { ...restOfBookingData };
            console.log("extraInfo", extraInfo);
            console.log("cleanedBody:",cleanedBody);

            const payload = req['userPayload'];
            const { reference_id } = payload;

            //    validate user
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if (!refData) throw 'User Not Found!';

            // Use amount from body directly
            const amount = cleanedBody.NetAmount;
            const hotelPayload = cleanedBody;

            // save order
            const orderResponse = await this.orderRepositoryService.insertBooking(reference_id, 'HOTEL', hotelPayload, amount, body.BookingCode, undefined, undefined, undefined, undefined, extraInfo);

            console.log('+++++++++++++++Order Response:++++++++++++++++', orderResponse);

            // extract the custom order id from the orderReaponse
            const custom_order_id = orderResponse.custom_order_id;

            // create Razorpay Payment Link
            const paymentLink = await this.razorpayPaymentService.createPaymentLink({
                amount: Math.round(amount * 100),
                currency: 'INR',
                description: 'Payment For Hotel Booking',
                reference_id: custom_order_id.trim(),
                customer: {
                    email: refData.email,
                },
                notes: {
                    module: 'hotel',
                    order_id: orderResponse.order_id,
                },
                callback_url: 'https://page1-fe.vercel.app/payment/success',
            });

            // save payment record to payment table
            const orderdetails = await this.orderRepositoryService.findOne(custom_order_id);
            console.log('Order Details by custom order id: ', orderdetails);
            const user = reference_id;

            const orderRef = new Order();
            orderRef.order_id = orderdetails.order_id;

            const userRef = new User();
            userRef.id = user;

            console.log(10);

            // Create the payment entity
            const paymentEntity = this.paymentRepository.create({
                razorpay_link_response: JSON.stringify(paymentLink),
                user: { id: user }, // or use userRef if already created
                order: { order_id: orderdetails.order_id },
                amount: orderdetails.amount,
                payment_gateway: 'Razorpay',
                payment_status: paymentLink.status,
                status: PAYMENT_STATUS.IN_PROGRESS,
            });

            // Save the entity (ensures relations are handled)
            await this.paymentRepository.save(paymentEntity);

            return this.responsehandlderservice.sendSuccessResponse(res, {
                message: 'Hotel Booking Initialized. Proceed to payment.',
                data: paymentLink,
            });
        } catch (error) {
            console.log('Hotel Booking Error: ', error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

    @Get('/payment/verify')
    // @UseGuards(TokenValidationGuard)
    async verifySignatue(@Req() req: Request, @Res() res: Response, @Query() query: any) {
        try {
            console.log('>>>>>>>>>> >>', query);
            console.log('Query Parameters:', query);

            // Access individual query parameters
            const razorpayPaymentId = query.razorpay_payment_id;
            const razorpayPaymentLinkId = query.razorpay_payment_link_id;
            const razorpayPaymentLinkStatus = query.razorpay_payment_link_status;
            const razorpaySignature = query.razorpay_signature;

            // Log the individual parameters if needed
            console.log('Payment ID:', razorpayPaymentId);
            console.log('Payment Link ID:', razorpayPaymentLinkId);
            console.log('Payment Link Status:', razorpayPaymentLinkStatus);
            console.log('Signature:', razorpaySignature);
            const result = await this.razorpayService.paymentVerify(razorpayPaymentId, razorpayPaymentLinkId, razorpaySignature);
            return this.responsehandlderservice.sendSuccessResponse(res, result);
            // const payload = req['userPayload'];
            // const {reference_id}= payload;
            // const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            // if(!refData){
            //     throw (`An error occurred while fetching the user. Please try again later.`);
            // }
            // const result = await this.razorpayService.paymentVerify(reference_id,body);
            // return this.responsehandlderservice.sendSuccessResponse(res,result);
        } catch (error) {
            console.log(error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }
}
