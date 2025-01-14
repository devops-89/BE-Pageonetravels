import { Controller, Body, Post, Req, Res, Get, } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { CommissionService } from './commission.service';
import { AddCommissionDto } from '../../../../../libs/dtos/admin/commission.dto';
import { UpdateCommissionDto } from '../../../../../libs/dtos/admin/commission.dto';


@Controller('commission')
export class CommissionController {

    constructor (
        private readonly commissionService : CommissionService,
        private readonly ResponseHandler: ResponseHandlerService
    ){}

    @Post('add-commission')
    async addCommisson(@Body() body:AddCommissionDto, @Req() req: Request, @Res() res:Response ){
        try{ 
            const result = await this.commissionService.addCommissionData(body);
            return this.ResponseHandler.sendSuccessResponse(res, result);
        }catch(error){
            console.log("Commission Error..",error );
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }

    @Get('getAll')
    async getCommission(@Res() res:Response){
        try{
            const result = await this.commissionService.getCommissionList();
            return this.ResponseHandler.sendSuccessResponse(res, result);
        }catch(error){
            console.log("Error get Commission",error);
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }


    @Post('update')
    async updateCommission(@Body() body: UpdateCommissionDto ,@Req() req:Request,@Res() res:Response){
        try{ 
            const result = await this.commissionService.updateCommissionData(body);
            return this.ResponseHandler.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Commission Error..", error);
            return this.ResponseHandler.sendErrorResponse(res, error);
        }
    }
    
}
