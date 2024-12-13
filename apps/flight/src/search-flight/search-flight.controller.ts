import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchFlightService } from './search-flight.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

@Controller('flight')
export class SearchFlightController {
    constructor(
        private readonly searchflightservice: SearchFlightService,
        private readonly responseHandlerService: ResponseHandlerService
    ) { }
    
    @Get('search')
    async searchFlight(
        @Req() req:Request,
        @Query('to') to: string,
        @Query('from') from: string,
        @Query('departure_date') departure_date: string,
        @Query('arrival_date') arrival_date: string,
        @Query('adult') adult: string,
        @Query('child') child: string,
        @Query('infant') infant: string,
        @Query('class_type') class_type: string,
    ) {
        try {
            const {to, from, departure_date, adult, arrival_date, child, infant, class_type } = req['query'];
            let result = this.searchflightservice.searchFlight(to, from,departure_date,adult, arrival_date, child, infant, class_type);
            return this.responseHandlerService.sendSuccessResponse(, result)

        } catch (error) {
            console.log("Search Flight Failed", error);
            return this.responseHandlerService.sendErrorResponse( , 'error')
        }
    }
}
