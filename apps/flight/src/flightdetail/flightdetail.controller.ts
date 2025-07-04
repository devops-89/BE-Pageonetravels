import { Controller, Post,Get, Req, Res, ValidationPipe, Body, Param} from '@nestjs/common';
import { FlightDetailService } from './flightdetail.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightDetailRequestDto,FlightRuleDto } from '../../../../libs/dtos/flight/flight-detail.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';


@Controller('flightdetail')
export class FlightdetailController {
    constructor(private readonly flightdetailservice: FlightDetailService,
        private readonly responseHandler: ResponseHandlerService,

    ) { }

    @Post('/farerule')
    async FareRule(@Req() req: Request, @Res() res: Response,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: FlightRuleDto) {
        try {
            const result = await this.flightdetailservice.FareRule(body);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            console.log("Internal Server Error", error);
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    @Post('/flightdetail')
    async FlightDetail(@Req() req: Request, @Res() res: Response,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: FlightDetailRequestDto,) {
        try {
            const result = await this.flightdetailservice.FlightDetail(body);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            console.log("Internal Server Error", error);
            return this.responseHandler.sendErrorResponse(res, ERROR_CODES.INVALID_BASE_URL);
        }
    }


    // this is not userful
    @Post('/fetch_seat_meal_baggage_details')
    async FetchSeatMealBaggaeDetails(@Req() req: Request, @Res() res: Response,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: FlightDetailRequestDto,) {
        try {
            const result = await this.flightdetailservice.FetchSeatMealBaggaeDetails(body);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            console.log("Internal Server Error", error);
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    // ===================================== flight canncellation routes ============================================
     // to fetch airline types before cancellation
  // Flight Cancellation Endpoints

  @Post('release-pnr')
  async releasePNR(@Body() body: { bookingId: string; endUserIp: string; tokenId: string }, @Res() res: Response) {
      try {
          const result = await this.flightdetailservice.releasePNR(body.bookingId, body.endUserIp, body.tokenId);
          return this.responseHandler.sendSuccessResponse(res, result);
      } catch (error) {
          return this.responseHandler.sendErrorResponse(res, error);
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
          const result = await this.flightdetailservice.getCancellationCharges(body);
          return this.responseHandler.sendSuccessResponse(res, result);
      } catch (error) {
          return this.responseHandler.sendErrorResponse(res, error);
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
          const result = await this.flightdetailservice.sendChangeRequest(body);
          return this.responseHandler.sendSuccessResponse(res, result);
      } catch (error) {
          return this.responseHandler.sendErrorResponse(res, error);
      }
  }

  @Get('change-request-status/:changeRequestId')
  async getChangeRequestStatus(@Param('changeRequestId') changeRequestId: string, @Res() res: Response) {
      try {
          const result = await this.flightdetailservice.getChangeRequestStatus(changeRequestId);
          return this.responseHandler.sendSuccessResponse(res, result);
      } catch (error) {
          return this.responseHandler.sendErrorResponse(res, error);
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
          const result = await this.flightdetailservice.cancelFlightTicketNew(body);
          return this.responseHandler.sendSuccessResponse(res, result);
      } catch (error) {
          return this.responseHandler.sendErrorResponse(res, error);
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
          const result = await this.flightdetailservice.partialCancellation(body);
          return this.responseHandler.sendSuccessResponse(res, result);
      } catch (error) {
          return this.responseHandler.sendErrorResponse(res, error);
      }
  }

  @Get('airline-types')
  async getAirlineTypes(@Res() res: Response) {
      try {
          const result = await this.flightdetailservice.getAirlineTypes();
          return this.responseHandler.sendSuccessResponse(res, result);
      } catch (error) {
          return this.responseHandler.sendErrorResponse(res, error);
      }
    }
}
