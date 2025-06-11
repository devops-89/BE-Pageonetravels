import { Body, Controller, Get, Post, Query,  Res } from '@nestjs/common';
import { EnquiryType } from '../../../../libs/database/src/entities/enquiry.entity';
import { AppService } from './app.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import {Response} from "express"
@Controller('page-one-travels')
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly responseHandler: ResponseHandlerService,
    ) {}

    @Post()
   async createAEnquiry(@Body() body: any, @Res() res: Response) {
        
       await this.appService.createAEnquiry(body);
       return this.responseHandler.sendSuccessResponse(res, { statusCode: 200, success: true });
        // return { message: undefined };
    }

    

    @Get()
    async getEnquiry(@Res() res: Response,@Query('enquiryType') enquiryType?: string ){
        try{
            if (enquiryType) {
                // Validate against the EnquiryType enum 
                if (!Object.values(EnquiryType).includes(enquiryType as EnquiryType)) {
                    throw { message: "Invalid enquiry type.", statusCode: ERROR_CODES.BAD_REQUEST };
                }
            }
            const result = await this.appService.getEnquiry(enquiryType);
            return this.responseHandler.sendSuccessResponse(res, result);  
        }catch(error){
            console.log(error);
            return this.responseHandler.sendErrorResponse(res,error);
        }
    }
}
