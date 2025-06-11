import { Body, Controller, Post,Get, Req, Res } from "@nestjs/common";
import { HotelierService } from './hotelier.services';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { RegisterDto } from '../../../../libs/dtos/authentication/user.dto';

@Controller('hotelier')
export class HotelierController {
    
    constructor(
        private readonly hotelierService:HotelierService,
        private readonly responsehandlderservice:ResponseHandlerService,
    ){}

    @Post("/register") 
    async hotelierRegister(@Req() req:Request,@Res() res : Response, @Body() body: RegisterDto) {
        try {
            const result = await this.hotelierService.registerWithEmailPassword(body);
            return this.responsehandlderservice.sendSuccessResponse(res, result);
        } catch (error) {
           return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

    @Get("/gethotliers")
    async getHotliers(@Req() req:Request,@Res() res:Response){
         try{
           const hotliers=await this.hotelierService.getAllHotliers();
           return this.responsehandlderservice.sendSuccessResponse(res,hotliers);
         }
         catch(error){
            return this.responsehandlderservice.sendErrorResponse(res,error);
         }
    }

}