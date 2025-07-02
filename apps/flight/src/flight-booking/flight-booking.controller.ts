import { Body, Controller, Post,  Req,  Res, UseGuards, Get, Param, Query } from '@nestjs/common';
import { Response } from 'express';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightBookingService } from './flight-booking.service';
import { BookingDto, BookingNonLccDto, TicketDto } from '../../../../libs/dtos/flight/booking-flight.dto';
import { RoundDto} from '../../../../libs/dtos/flight/round-flight.dto';
import { UserRepositoryService } from '../../../../libs/database/src';
import {TokenValidationGuard} from '../../../../libs/middlewares/authMiddleware.guard';
import { BookingRepositoryService } from '../../../../libs/database/src';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';
import { EmailService } from '../../../../libs/email-service/email.service';

@Controller('flight-booking')
export class FlightBookingController {
    constructor(
        private readonly responsehandlerservice:ResponseHandlerService,
        private readonly flightBookingService:FlightBookingService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly bookingRepository: BookingRepositoryService,
        private readonly emailService: EmailService
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
         
            //const flightItinerary = result.response.Response?.Response?.FlightItinerary;
            // if (flightItinerary) {
            //     console.log('FlightItinerary:', JSON.stringify(flightItinerary, null, 2));
            // }

            return  this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch(err) {
            console.log(err);
            return this.responsehandlerservice.sendErrorResponse(res, err);
        }
    }

    

    // @Post('/non_LCC_booking')   
    // @UseGuards(TokenValidationGuard)    
    // async bookFlightForNonLCC(@Req() req:Request, @Res() res: Response, @Body() body: BookingNonLccDto) {
    //     try { 
    //         const payload = req['userPayload'];
    //         const {reference_id}= payload;
    //         const refData = await this.userRepositoryService.getUserByUserId(reference_id);
    //         if(!refData){
    //             throw (`An error occurred while fetching the user. Please try again later.`);
    //         }
    //         // Initialize optional arrays if they are not provided
    //         if (!body.passenger_details.child) {
    //             body.passenger_details.child = [];
    //         }
    //         if (!body.passenger_details.infant) {
    //             body.passenger_details.infant = [];
    //         }

    //         const result = await this.flightBookingService.bookFlightForNonLCC(reference_id,body);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (err) {
    //         console.log(err);
    //         return this.responsehandlerservice.sendErrorResponse(res, err);
    //     }
    // }


    
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

    @Get()
    // @UseGuards(TokenValidationGuard)
    async getBookingById(@Param('id') id: string, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.getBookingById(id);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }


    @Get()
    //@UseGuards(TokenValidationGuard)
    async getAllBookings(@Query('userId') userId: string, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.getAllBookings(userId);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Get('userId')
    // @UseGuards(TokenValidationGuard)
    async getUserBookings(
      @Param('userId') userId: string,
      @Query('status') status: ORDER_STATUS,
      @Query('paymentStatus') paymentStatus: PAYMENT_STATUS,
      @Res() res: Response
    ) {
      try {
        const result = await this.flightBookingService.getUserBookings(userId, status, paymentStatus);
        return this.responsehandlerservice.sendSuccessResponse(res, {
            //status: true,
            message: 'Bookings fetched successfully for this particular user',
            data: result,
          });
        } catch (error) {
        return this.responsehandlerservice.sendSuccessResponse(res, error);
      }
    }


//     @Get('users/:userId')
//   async getUserDetails(@Param('userId') userId: string, @Res() res: Response) {
//     try {
//       const result = await this.flightBookingService.getUserDetails(userId);
//       return this.responsehandlerservice.sendSuccessResponse(res, {
//         message: 'User details fetched successfully',
//         data: result,
//       });
//     } catch (error) {
//       return this.responsehandlerservice.sendErrorResponse(res, error);
//     }
//   }

  @Get('bookings')
  async searchBookings(@Query() query, @Res() res: Response) {
    try {
      const result = await this.flightBookingService.searchBookings(query);
      return this.responsehandlerservice.sendSuccessResponse(res, {
        //status: true,
        message: 'Bookings fetched successfully',
        data: result,
      });
    } catch (error) {
      return this.responsehandlerservice.sendErrorResponse(res, error);
    }
  }

//   @Get('orderId')
//   async getBookingDetails(@Param('orderId') orderId: string, @Res() res: Response) {
//     try {
//       const result = await this.flightBookingService.getBookingDetails(orderId);
//       return this.responsehandlerservice.sendSuccessResponse(res, result);
//     } catch (error) {
//         return this.responsehandlerservice.sendErrorResponse(res, error);
//     }
//   }

    @Post('cancel-ticket')
    async cancelTicket(@Body() body: { bookingId: string; requestType?: number; userEmail?: string }, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.cancelFlightTicket(
                body.bookingId,
                body.requestType || 1,
                body.userEmail,
            );
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('book-flight')
    async bookFlight(@Body() body: BookingDto, @Res() res: Response) {
        try {
            const reference_id = `FLIGHT_${Date.now()}`;
            const result = await this.flightBookingService.bookFlight(reference_id, body);

            // Extract and log FlightItinerary from order_response
            let flightItinerary = null;
            if (result?.response?.order_response) {
                try {
                    const tboResponse = JSON.parse(result.response.order_response);
                    flightItinerary = tboResponse?.Response?.Response?.FlightItinerary;
                } catch (e) {
                    console.error('Error parsing order_response:', e);
                }
            }
            if (flightItinerary) {
                console.log('FlightItinerary:', JSON.stringify(flightItinerary, null, 2));
                // Expand and log Ticket object for each passenger
                if (Array.isArray(flightItinerary.Passenger)) {
                    flightItinerary.Passenger.forEach((p, idx) => {
                        console.log(`Passenger[${idx}].Ticket:`, JSON.stringify(p.Ticket, null, 2));
                    });
                }
            } else {
                console.log('No FlightItinerary found in response.');
            }

            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('book-flight-non-lcc')
    async bookFlightForNonLCC(@Body() body: BookingNonLccDto, @Res() res: Response) {
        try {
            const reference_id = `FLIGHT_${Date.now()}`;
            const result = await this.flightBookingService.bookFlightForNonLCC(reference_id, body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('book-ticket')
    async bookTicket(@Body() body: TicketDto, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.bookTicket(body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('round-flight-book')
    async roundFlightBook(@Body() body: RoundDto, @Res() res: Response) {
        try {
            const reference_id = `FLIGHT_${Date.now()}`;
            const result = await this.flightBookingService.roundFlightBook(reference_id, body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    // @Get('booking/:orderId')
    // async getBookingById(@Param('orderId') orderId: string, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.getBookingById(orderId);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // @Get('bookings')
    // async getAllBookings(@Query('userId') userId: string, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.getAllBookings(userId);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // @Get()
    // async getUserBookings(
    //     @Param('userId') userId: string,
    //     @Query('status') status: ORDER_STATUS,
    //     @Query('paymentStatus') paymentStatus: PAYMENT_STATUS,
    //     @Res() res: Response
    // ) {
    //     try {
    //         const result = await this.flightBookingService.getUserBookings(userId, status, paymentStatus);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // @Get('search-users')
    // async searchUsers(@Query('search') search?: string, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.searchUsers(search);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // @Get('user-details/:userId')
    // async getUserDetails(@Param('userId') userId: string, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.getUserDetails(userId);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // @Get('search-bookings')
    // async searchBookings(@Query() query: any, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.searchBookings(query);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // @Get('booking-details/:orderId')
    // async getBookingDetails(@Param('orderId') orderId: string, @Res() res: Response) {
    //     try {
    //         const result = await this.flightBookingService.getBookingDetails(orderId);
    //         return this.responsehandlerservice.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responsehandlerservice.sendErrorResponse(res, error);
    //     }
    // }

    // Flight Cancellation Endpoints

    @Post('release-pnr')
    async releasePNR(@Body() body: { bookingId: string; endUserIp: string; tokenId: string }, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.releasePNR(body.bookingId, body.endUserIp, body.tokenId);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('get-cancellation-charges')
    async getCancellationCharges(@Body() body: {
        bookingId: string;
        requestType: string;
        bookingMode: string;
        endUserIp: string;
        tokenId: string;
    }, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.getCancellationCharges(body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('send-change-request')
    async sendChangeRequest(@Body() body: {
        bookingId: string;
        requestType: number;
        tokenId: string;
        cancellationType: number;
        sectors?: Array<{ origin: string; destination: string }>;
        ticketIds?: number[];
        remarks?: string;
        userEmail?: string;
    }, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.sendChangeRequest(body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Get('change-request-status/:changeRequestId')
    async getChangeRequestStatus(@Param('changeRequestId') changeRequestId: string, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.getChangeRequestStatus(changeRequestId);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('cancel-flight-ticket-new')
    async cancelFlightTicketNew(@Body() body: {
        bookingId: string;
        requestType?: number;
        userEmail?: string;
        remarks?: string;
        sectors?: Array<{ origin: string; destination: string }>;
        ticketIds?: number[];
    }, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.cancelFlightTicketNew(body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Post('partial-cancellation')
    async partialCancellation(@Body() body: {
        bookingId: string;
        sectors: Array<{ origin: string; destination: string }>;
        ticketIds: number[];
        remarks?: string;
        userEmail?: string;
    }, @Res() res: Response) {
        try {
            const result = await this.flightBookingService.partialCancellation(body);
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }

    @Get('airline-types')
    async getAirlineTypes(@Res() res: Response) {
        try {
            const result = await this.flightBookingService.getAirlineTypes();
            return this.responsehandlerservice.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responsehandlerservice.sendErrorResponse(res, error);
        }
    }
}
