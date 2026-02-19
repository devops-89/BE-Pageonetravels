import { Controller, Get, Req, Res } from '@nestjs/common';
import {ProfileService} from './profile.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
@Controller('profile')
export class ProfileController {
    constructor(
        private readonly profileService:ProfileService,
        private readonly responseHandlerService:ResponseHandlerService,
    ){}


    @Get("/getProfileInfo")
    async getAdminInfo(@Req() req:Request,@Res() res:Response){
        try{
            const admin=await this.profileService.getAdminInfo();
            return this.responseHandlerService.sendSuccessResponse(res,admin);
        }
        catch(error){
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }


}
