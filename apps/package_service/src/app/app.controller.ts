import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

   

    @Post()
    createAPackage(@Body() body: any) {
        try {
            return this.appService.createAPackage(body);
        } catch (error) {
            console.log(error);
       
        }
    }
}
