import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { UserRepositoryService } from '../../../../libs/database/src/repositories/user.repository';
import { LccTicketDto,VerifyDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { TokenValidationGuard } from '../../../../libs/middlewares/authMiddleware.guard';
import { RazorpayService } from './razorpay.service';

@Controller('razorpay')
export class RazorpayController {
    constructor(
        private readonly responsehandlderservice:ResponseHandlerService,
        private readonly userRepositoryService: UserRepositoryService,
        private readonly  razorpayService:RazorpayService
    ){}

    @Post('/payment-init')
    @UseGuards(TokenValidationGuard)
    async ticketLCC(@Body() body: LccTicketDto, @Req() req:Request, @Res() res:Response){
        try{
            const payload = req['userPayload'];
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An error occurred while fetching the user. Please try again later.`);
            }
            const result = await this.razorpayService.createOrder(reference_id,body);
            return this.responsehandlderservice.sendSuccessResponse(res,result);
        }catch(error){
            console.log(error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

    @Post('/payment/verify')
    @UseGuards(TokenValidationGuard)
    async verifySignatue(@Req() req:Request,@Res() res:Response,@Body() body:VerifyDto){
        try{
            const payload = req['userPayload'];
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An error occurred while fetching the user. Please try again later.`);
            }
            const result = await this.razorpayService.paymentVerify(reference_id,body);
            return this.responsehandlderservice.sendSuccessResponse(res,result);
        }catch(error){
            console.log(error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }



}
