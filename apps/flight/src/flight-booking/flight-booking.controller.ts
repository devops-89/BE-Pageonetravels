import { Body, Controller, Post,  Req,  Res, UseGuards, Get, Param, Query } from '@nestjs/common';
import { Response } from 'express';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightBookingService } from './flight-booking.service';
import { BookingDto, BookingNonLccDto, TicketDto } from '../../../../libs/dtos/flight/booking-flight.dto';
import { RoundDto} from '../../../../libs/dtos/flight/round-flight.dto';
import { UserRepositoryService } from '../../../../libs/database/src';
import {TokenValidationGuard} from '../../../../libs/middlewares/authMiddleware.guard';
import { BookingRepositoryService } from '../../../../libs/database/src';

@Controller('flight-booking')
export class FlightBookingController {
    constructor(
        private readonly responsehandlerservice:ResponseHandlerService,
        private readonly flightBookingService:FlightBookingService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly bookingRepository: BookingRepositoryService
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
            // let flightItinerary = null;
            // if (result?.response?.order_response) {
            //     try {
            //         const tboResponse = JSON.parse(result.response.order_response);
            //         flightItinerary = tboResponse?.Response?.Response?.FlightItinerary;
            //     } catch (e) {
            //         console.error('Error parsing order_response:', e);
            //     }
            // }
            // if (flightItinerary) {
            //     console.log('FlightItinerary:', JSON.stringify(flightItinerary, null, 2));
            //     // Expand and log Ticket object for each passenger
            //     if (Array.isArray(flightItinerary.Passenger)) {
            //         flightItinerary.Passenger.forEach((p, idx) => {
            //             console.log(`Passenger[${idx}].Ticket:`, JSON.stringify(p.Ticket, null, 2));
            //         });
            //     }
            // } else {
            //     console.log('No FlightItinerary found in response.');
            // }
           
         
            return  this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch(err) {
            console.log(err);
            return this.responsehandlerservice.sendErrorResponse(res, err);
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
            console.error("Ticket Error:", error);
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }


    // Handle Round Trip Flight
    @Post('/round-trip')
    @UseGuards(TokenValidationGuard)
    async flightRoundBooking(@Req() req:Request,@Res() res: Response, @Body() body: RoundDto){
        try{
            const payload = req['userPayload'];
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An error occurred while fetching the user. Please try again later.`);
            }
            const result = await this.flightBookingService.roundFlightBook(reference_id,body);
            return this.responsehandlerservice.sendSuccessResponse(res,result);
        }catch(error){
            console.error("Ticket Error:", error);
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Get(':id')
    @UseGuards(TokenValidationGuard)
    async getBookingById(@Param('id') id: string, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.getBookingById(id);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Get()
    @UseGuards(TokenValidationGuard)
    async getAllBookings(@Query('userId') userId: string, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.getAllBookings(userId);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

}
