import { Controller, Post, Req, Res, ValidationPipe, Body } from '@nestjs/common';
import { FlightDetailService } from './flightdetail.service';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { FlightDetailRequestDto } from '../../../../../libs/dtos/flight/flight-detail.dto';


@Controller('flightdetail')
export class FlightdetailController {
    constructor(private readonly flightdetailservice: FlightDetailService,
        private readonly responseHandler: ResponseHandlerService,
    ) { }

    @Post('/farerule')
    async FareRule(@Req() req: Request, @Res() res: Response,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: FlightDetailRequestDto,) {
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
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }
}
