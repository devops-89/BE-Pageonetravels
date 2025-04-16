import { Body, Controller, Get, Post, Res } from '@nestjs/common';

import { AppService } from './app.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

@Controller('page-one-travels')
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly responseHandler: ResponseHandlerService,

    ) {}

    @Post()
   async createAEnquiry(@Body() body: any, @Res() res: Response,) {
       await this.appService.createAEnquiry(body);
        return this.responseHandler.sendSuccessResponse(res, { statusCode: 200, success: true });
        // return { message: undefined };
    }
}
