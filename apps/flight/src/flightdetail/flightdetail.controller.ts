import { Controller, Post, Req, Res, ValidationPipe, Body } from '@nestjs/common';
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
}
