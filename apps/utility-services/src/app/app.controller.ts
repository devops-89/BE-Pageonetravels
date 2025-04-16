import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller('page-one-travels')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post()
    createAEnquiry(@Body() body: any): { message: string } {
        return this.appService.createAEnquiry(body);
    }
}
