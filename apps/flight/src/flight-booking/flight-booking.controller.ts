import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightBookingService } from './flight-booking.service';
import { BookingDto, BookingNonLccDto, TicketDto } from '../../../../libs/dtos/flight/booking-flight.dto';
import { RoundDto } from '../../../../libs/dtos/flight/round-flight.dto';
import { UserRepositoryService } from '../../../../libs/database/src';
import { TokenValidationGuard } from '../../../../libs/middlewares/authMiddleware.guard';
import { BookingRepositoryService } from '../../../../libs/database/src';

@Controller('flight-booking')
export class FlightBookingController {
    constructor(
        private readonly responsehandlerservice: ResponseHandlerService,
        private readonly flightBookingService: FlightBookingService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly bookingRepository: BookingRepositoryService
    ) {}

    @Post('/booking')
    @UseGuards(TokenValidationGuard)
    // async bookFlightForLCC(@Req() req: Request, @Res() res: Response, @Body() body: BookingDto)
    async bookFlightForLCC(@Req() req: Request, @Res() res: Response, @Body() body:any) {
        try {
            const payload = req['userPayload'];
            const reference_id = payload?.reference_id;

            if (!reference_id) {
                return this.responsehandlerservice.sendErrorResponse(res, {
                    statusCode: 400,
                    message: 'Reference ID missing in token payload',
                });
            }

            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if (!refData) {
                return this.responsehandlerservice.sendErrorResponse(res, {
                    statusCode: 404,
                    message: 'User not found',
                });
            }

            // Ensure passenger_details exist
            body.passenger_details = {
                ...body.passenger_details,
                child: body.passenger_details?.child || [],
                infant: body.passenger_details?.infant || [],
            };

            const result = await this.flightBookingService.bookFlight(reference_id, body);

            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            console.error('Flight Booking Error:', error);

            // Extract only what’s needed — no deep nesting
            const statusCode = error?.response?.statusCode || error?.status || 500;
            const message =
                error?.response?.message ||
                error?.message ||
                'Something went wrong while booking flight';

            //  Keep it clean — don’t send the entire error object
            return res.status(statusCode).json({
                statusCode,
                message,
                success: false,
            });
        }
    }

    @Post('/non_LCC_booking')
    @UseGuards(TokenValidationGuard)
    // BookingNonLccDto
    // async bookFlightForNonLCC(@Req() req: Request, @Res() res: Response, @Body() body:BookingNonLccDto )
    async bookFlightForNonLCC(@Req() req: Request, @Res() res: Response, @Body() body:any ) {
        try {
            const payload = req['userPayload'];
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if (!refData) {
                throw `An error occurred while fetching the user. Please try again later.`;
            }

            console.log("controller passenger Details:",body.passenger_details);
            // Initialize optional arrays if they are not provided
            if (!body.passenger_details.child) {
                body.passenger_details.child = [];
            }
            if (!body.passenger_details.infant) {
                body.passenger_details.infant = [];
            }

            const result = await this.flightBookingService.bookFlightForNonLCC(reference_id, body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (err) {
            console.log(err);
            return this.responsehandlerservice.sendErrorResponse(res, err);
        }
    }

    // Not Usefull
    @Post('/ticket')
    async flighticketAfterBooking(@Res() res: Response, @Body() body: TicketDto) {
        try {
            const result = await this.flightBookingService.bookTicket(body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            console.error('Ticket Error:', error);
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    // Handle Round Trip Flight
    @Post('/round-trip')
    @UseGuards(TokenValidationGuard)
    // async flightRoundBooking(@Req() req: Request, @Res() res: Response, @Body() body:RoundDto)
    async flightRoundBooking(@Req() req: Request, @Res() res: Response, @Body() body:any){
        try {
            const payload = req['userPayload'];
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            console.log("refData",refData);
            if (!refData) {
                throw `An error occurred while fetching the user. Please try again later.`;
            }
            console.log("calling the servvice");
            const result = await this.flightBookingService.roundFlightBook(reference_id, body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            console.error('Ticket Error:', error);
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    // @Get(':id')
    // @UseGuards(TokenValidationGuard)
    // async getBookingById(@Param('id') id: string, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.getBookingById(id);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // @Get()
    // @UseGuards(TokenValidationGuard)
    // async getAllBookings(@Query('userId') userId: string, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.getAllBookings(userId);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }
}
