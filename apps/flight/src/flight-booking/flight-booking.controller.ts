import { Body, Controller, Post,  Res } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightBookingService } from './flight-booking.service';
import { BookingDto, BookingNonLccDto, TicketDto } from '../../../../libs/dtos/flight/booking-flight.dto';

@Controller('flight-booking')
export class FlightBookingController {
    constructor(
        private readonly responsehandlderservice:ResponseHandlerService,
        private readonly flightBookingService:FlightBookingService
    ){}

    @Post("/booking") 
    async bookFlightForLCC(@Res() res : Response, @Body() body: BookingDto) {
        try { 
            // Initialize optional arrays if they are not provided
            if (!body.passenger_details.child) {
                body.passenger_details.child = [];
            }
            if (!body.passenger_details.infant) {
                body.passenger_details.infant = [];
            }
            
            const result = await this.flightBookingService.bookFlight(body);
            return  this.responsehandlderservice.sendSuccessResponse(res, result);
        } catch(err) {
            console.log(err);
            return this.responsehandlderservice.sendErrorResponse(res, err);
        }
    }

    

    @Post('/non_LCC_booking')
    async bookFlightForNonLCC(@Res() res: Response, @Body() body: BookingNonLccDto) {
        try {
            // Initialize optional arrays if they are not provided
            if (!body.passenger_details.child) {
                body.passenger_details.child = [];
            }
            if (!body.passenger_details.infant) {
                body.passenger_details.infant = [];
            }

            const result = await this.flightBookingService.bookFlightForNonLCC(body);
            return this.responsehandlderservice.sendSuccessResponse(res, result);
        } catch (err) {
            console.log(err);
            return this.responsehandlderservice.sendErrorResponse(res, err);
        }
    }


    @Post('/ticket')
    async flighticketAfterBooking(@Res() res: Response, @Body() body: TicketDto) {
        try {
            const result = await this.flightBookingService.bookTicket(body);
            return this.responsehandlderservice.sendSuccessResponse(res, result);
        } catch (error) {
            console.error("Ticket Error:", error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

}
