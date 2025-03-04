import { Body, Controller, Post,  Req,  Res, UseGuards } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightBookingService } from './flight-booking.service';
import { BookingDto, BookingNonLccDto, TicketDto } from '../../../../libs/dtos/flight/booking-flight.dto';
// import { JWTPayload } from '../../../../libs/interfaces/authentication/jwtPayload.interface';
import { UserRepositoryService } from '../../../../libs/database/src';
import {TokenValidationGuard} from '../../../../libs/middlewares/authMiddleware.guard';

@Controller('flight-booking')
export class FlightBookingController {
    constructor(
        private readonly responsehandlderservice:ResponseHandlerService,
        private readonly flightBookingService:FlightBookingService,
        private readonly userRepositoryService: UserRepositoryService,
    ){}
 


    @Post("/booking") 
    @UseGuards(TokenValidationGuard)
    async bookFlightForLCC(@Req() req:Request,@Res() res : Response, @Body() body: BookingDto) {
        try { 
            const payload = req['userPayload'];
            console.log(payload);
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An error occurred while fetching the user. Please try again later.`);
            }
            // Initialize optional arrays if they are not provided
            if (!body.passenger_details.child) {
                body.passenger_details.child = [];
            }
            if (!body.passenger_details.infant) {
                body.passenger_details.infant = [];
            }
            
            const result = await this.flightBookingService.bookFlight(reference_id,body);
         
            return  this.responsehandlderservice.sendSuccessResponse(res, result);
        } catch(err) {
            console.log(err);
            return this.responsehandlderservice.sendErrorResponse(res, err);
        }
    }

    

    @Post('/non_LCC_booking')
    @UseGuards(TokenValidationGuard)
    async bookFlightForNonLCC(@Req() req:Request, @Res() res: Response, @Body() body: BookingNonLccDto) {
        try { 
            const payload = req['userPayload'];
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An error occurred while fetching the user. Please try again later.`);
            }
            // Initialize optional arrays if they are not provided
            if (!body.passenger_details.child) {
                body.passenger_details.child = [];
            }
            if (!body.passenger_details.infant) {
                body.passenger_details.infant = [];
            }

            const result = await this.flightBookingService.bookFlightForNonLCC(reference_id,body);
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
