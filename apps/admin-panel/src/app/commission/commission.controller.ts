import { Controller, Body, Post, Req, Res, Get } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { CommissionService } from './commission.service';
import { AddCommissionDto } from '../../../../../libs/dtos/admin/commission.dto';
import { UpdateCommissionDto } from '../../../../../libs/dtos/admin/commission.dto';


@Controller('commission')
export class CommissionController {

    constructor (
        private readonly commissionService : CommissionService,
        private readonly responseHandler: ResponseHandlerService
    ){}


    @Post('add-commission')
    // @UseGuards(TokenValidationGuard,CheckIfAdminGuard)
    async addCommisson(@Body() body:AddCommissionDto,  @Req() req: Request, @Res() res:Response ){
        try{  
            const result = await this.commissionService.addCommissionData(body);
            return this.responseHandler.sendSuccessResponse(res, result);
        }catch(error){
            console.log("Commission Error..",error );
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }   

    @Get('getAll')
    async getCommission(@Res() res:Response){
        try{
            const result = await this.commissionService.getCommissionList();
            return this.responseHandler.sendSuccessResponse(res, result);
        }catch(error){
            console.log("Error get Commission",error);
            return this.responseHandler.sendErrorResponse(res, error);
        }
    } 


    @Post('update')
    async updateCommission(@Body() body: UpdateCommissionDto ,@Req() req:Request,@Res() res:Response){
        try{ 
            const result = await this.commissionService.updateCommissionData(body);
            return this.responseHandler.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Commission Error..", error);
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }
    
}
