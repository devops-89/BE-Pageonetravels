import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { HotelierService } from './hotelier.service';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import {RegisterDto} from '../../../../../libs/dtos/authentication/user.dto';

@Controller('hotelier')
export class HotelierController {
    constructor(
        private readonly hotelierService: HotelierService,
        private readonly responseHandlerService: ResponseHandlerService,
    ) {}

    @Post('/register')
    async hotelierLogin(@Req() req: Request, @Res() res: Response, @Body() body:RegisterDto){
        try{
            console.log(">>>>>>>",body);
            //const result = await this.authService.registerWithEmailPassword(body);
        }catch(error){
            console.log(error);
            return  this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    
}