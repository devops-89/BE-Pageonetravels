import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { HotelierService } from './hotelier.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import {LoginDto} from '../../../../libs/dtos/authentication/user.dto';
import { CreateHotelDto } from '../../../../libs/dtos/hotelier/create-hotel.dto';
import { CreateHotelRoomDto } from '../../../../libs/dtos/hotelier/hotel-room.dto';

@Controller('hotelier')
export class HotelierController {
    constructor(
        private readonly hotelierService:HotelierService,
        private readonly responseHandlerService:ResponseHandlerService,
    ){}

    @Post('/login')
    async hotelierLogin(@Req() req: Request, @Res() res: Response, @Body() body:LoginDto){
        try{
            const device_type = req.headers['devicetype'];
            const result = await this.hotelierService.loginWithEmail(body, device_type);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        }catch(error){
            console.error("Error in the Search Flight", error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Post('/add-hotel')
    async createHotel(@Req() req:Request,@Res() res:Response,@Body() body:CreateHotelDto){
        try{
            const result = await this.hotelierService.addHotel(body);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        }catch(error){
            console.error("Error in the Search Flight", error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }


    @Post('/add-room')
    async createRoom(@Req() req:Request,@Res() res:Response,@Body() body:CreateHotelRoomDto){
        try{
            const result = await this.hotelierService.addRoom(body);
            return this.responseHandlerService.sendSuccessResponse(res, result); 
        }catch(error){
            console.log(">>> >> >",error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

}






