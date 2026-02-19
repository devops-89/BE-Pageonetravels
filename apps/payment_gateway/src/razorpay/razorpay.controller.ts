import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { UserRepositoryService } from '../../../../libs/database/src';
import { OrderRepositoryService } from '../../../../libs/database/src';
import { LccTicketDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { TokenValidationGuard } from '../../../../libs/middlewares/authMiddleware.guard';
import { RazorpayService } from './razorpay.service';
import { Repository } from 'typeorm';
import { CreateHotelBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';
import { Payment } from '../../../../libs/database/src';
import { InjectRepository } from '@nestjs/typeorm';

import { RazorpayService as RazorpayPaymentService } from '../../../../libs/paymentgateway/razorpay.service';
import { CreatePackageBookingDto } from '../../../../libs/dtos/package/package-booking.dto';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';

import { GetAgencyBalanceDto } from '../../../../libs/dtos/flight/flight-detail.dto';

@Controller('razorpay')
export class RazorpayController {
    constructor(
        private readonly responsehandlderservice: ResponseHandlerService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly orderRepositoryService: OrderRepositoryService,
        private readonly razorpayService: RazorpayService,
        private readonly razorpayPaymentService: RazorpayPaymentService,
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        private readonly rediscacheservice: RedisCacheService
    ) {}

    @Post('/payment-init')
    @UseGuards(TokenValidationGuard)
    async ticketLCC(@Body() body: LccTicketDto, @Req() req: Request, @Res() res: Response) {
        try {
            const payload = req['userPayload'];
            const { reference_id } = payload;

            const { traceId } = body;

            // check session is valid or not using TraceId start

            if (!traceId) {
                return this.responsehandlderservice.sendErrorResponse(res, { message: 'TraceId is required', statusCode: 400 });
            }

            // Check in Redis
            const traceData = await this.rediscacheservice.getCache(`trace:${traceId}`);

            if (!traceData) {
                return this.responsehandlderservice.sendErrorResponse(res, { message: 'Session expired', statusCode: 440 });
            }

            // check session is valid or not using TraceId end

            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if (!refData) {
                throw `An error occurred while fetching the user. Please try again later.`;
            }
            const email = refData.email;
            const result = await this.razorpayService.createFlightOrder(reference_id, body, email);
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
            const payload = req['userPayload'];
            const { reference_id } = payload;

            const paymentResponse = await this.razorpayService.createHotelOrder(reference_id, body);

            if (!paymentResponse.success) {
                return this.responsehandlderservice.sendErrorResponse(res, paymentResponse);
            }

            return this.responsehandlderservice.sendSuccessResponse(res, {
                message: paymentResponse.message,
                data: paymentResponse.data,
            });
        } catch (error) {
            console.log('Hotel Booking Error: ', error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

    @Post('package-payment-init')
    @UseGuards(TokenValidationGuard)
    async packagePaymentInit(@Body() body: CreatePackageBookingDto, @Req() req: Request, @Res() res: Response) {
        try {
            const payload = req['userPayload'];
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);

            if (!refData) {
                throw `An error occurred while fetching the user. Please try again later.`;
            }
            console.log('Payload coming for the razorpay: ', body);
            const email = refData.email;
            const result = await this.razorpayService.createPackageOrder(reference_id, body, email);
            return this.responsehandlderservice.sendSuccessResponse(res, {
                message: 'Package Booking Initialized. Proceed to payment.',
                data: result,
            });
        } catch (error) {
            console.log(error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

    @Get('/payment/verify')
    // @UseGuards(TokenValidationGuard)
    async verifySignatue(@Req() req: Request, @Res() res: Response, @Query() query) {
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

    @Post('get-agency-balance')
    async getAgencyBalance(@Body() body: GetAgencyBalanceDto, @Res() res: Response) {
        try {
            const result = await this.razorpayService.getAgencyBalance(body);

            if (!result.success) {
                return this.responsehandlderservice.sendErrorResponse(res, result);
            }

            return this.responsehandlderservice.sendSuccessResponse(res, {
                statusCode: result.statusCode,
                message: result.message,
                data: result.data,
                success: true,
            });
        } catch (error) {
            return this.responsehandlderservice.sendErrorResponse(res, {
                statusCode: 500,
                message: error.message || 'Internal server error',
                extraError: error,
            });
        }
    }
}
