import { Controller,Get,Req,Res } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

@Controller('customer')
export class CustomerController {

    constructor(private readonly customerService:CustomerService, private readonly responseHandlerService:ResponseHandlerService){}

    @Get("/getcustomers")
    async getCustomers(@Req() req:Request,@Res() res:Response){
        try{
           const customers=await this.customerService.getAllCustomers();
           return this.responseHandlerService.sendSuccessResponse(res,customers);
        }
        catch(error){
            return this.responseHandlerService.sendErrorResponse(res,error);
        }

    }

}
