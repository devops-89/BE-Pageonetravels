
import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { UserRepositoryService } from '../../../../libs/database/src/repositories/user.repository';
import { TokenValidationGuard } from '../../../../libs/middlewares/authMiddleware.guard';
import { LccTicketDto, VerifyDto } from '../../../../libs/dtos/flight/flight-ticket.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FlightTicketService } from './flight-ticket.service';


@Controller('flight')

export class FlightTicketController {
  
    constructor(
            private readonly responsehandlderservice:ResponseHandlerService,
            private readonly userRepositoryService: UserRepositoryService,
            private readonly  flightTicketService:FlightTicketService
        ){}

    @Post('/ticket')
    @UseGuards(TokenValidationGuard)
    async ticketLCC(@Body() body: LccTicketDto, @Req() req:Request, @Res() res:Response){
        try{
            
            const payload = req['userPayload'];
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An error occurred while fetching the user. Please try again later.`);
            }
            const result = await this.flightTicketService.directTicket(reference_id,body);
            return this.responsehandlderservice.sendSuccessResponse(res,result);

        }catch(error){
            console.log(error);
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }

    @Post('/ticket/verify')
    @UseGuards(TokenValidationGuard)
    async verifySignatue(@Req() req:Request,@Res() res:Response,@Body() body:VerifyDto){
        try{
            const payload = req['userPayload'];
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An error occurred while fetching the user. Please try again later.`);
            }
            
            const result = await this.flightTicketService.verifyTicket(body);
           
            return this.responsehandlderservice.sendSuccessResponse(res,result);
        }catch(error){
            return this.responsehandlderservice.sendErrorResponse(res, error);
        }
    }


    
    
}
