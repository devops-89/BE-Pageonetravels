import { Body, Controller, Post,  Res } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightBookingService } from './flight-booking.service';
import { BookingDto } from '../../../../libs/dtos/flight/booking-flight.dto';

@Controller('flight-booking')
export class FlightBookingController {
    constructor(
        private readonly responsehandlderservice:ResponseHandlerService,
        private readonly flightBookingService:FlightBookingService
    ){}

    @Post("/booking") 
    async bookFlightForLCC(@Res() res : Response, @Body() body: BookingDto) {
        try { 
            console.log(body);
            const result = await this.flightBookingService.bookFlight(body);
            this.responsehandlderservice.sendSuccessResponse(res, result);
        } catch(err) {
            console.log(err);
            this.responsehandlderservice.sendErrorResponse(err, err);
        }
    }

    // @Post('non_LCC_booking')
    // async bookFlightForNonLCC(@Res() res : Response, @Body() body: BookingDto) {
    //     try {
    //         const result = await this.flightBookingService.bookFlightForNonLCC(body);
    //         this.responsehandlderservice.sendSuccessResponse(res, result);

    //     }catch(err) {
    //         console.log(err);
    //         this.responsehandlderservice.sendErrorResponse(err, err);
    //     }
    // }
}
