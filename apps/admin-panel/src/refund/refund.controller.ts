import { Controller, Body, Post, Res } from '@nestjs/common';
import { RefundService } from './refund.service';
import {CreateRefundDto} from "../../../../libs/dtos/common/refund.dto";
import {ResponseHandlerService} from '../../../../libs/response-handler/response-handler.service';

@Controller('refund')
export class RefundController {
    constructor(
        private readonly refundService:RefundService,
        private readonly  responseHandlerService:ResponseHandlerService
    ){}

    @Post("initiate-refund")
    async createRefund(@Body() body: CreateRefundDto,@Res() res:Response) {
        try{

            const refundResponse=await this.refundService.issueRefund(body);
            return this.responseHandlerService.sendSuccessResponse(res,refundResponse);
        }

        catch(error){
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

}
