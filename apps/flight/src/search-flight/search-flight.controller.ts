import { Controller, Req, Body, ValidationPipe, Res, Get, Post } from '@nestjs/common';
import { SearchFlightService } from './search-flight.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { SearchFlightDto } from '../../../../libs/dtos/flight/search-flights.dto';

@Controller('/flight')
export class SearchFlightController {
    constructor(private readonly searchflightsearvice: SearchFlightService,
        private readonly responseHandler: ResponseHandlerService,
    ) { }
    // @Get('/data')
    // async generateToken(@Req() req : Request, @Res() res: Response){
    //     try {
    //         const result = await this.searchflightsearvice.generateToken();
    //         return this.responseHandler.sendSuccessResponse(res,result)
    //     }catch(error){
    //         console.log("error in the generate token", error);
    //         return this.responseHandler.sendErrorResponse(res,error);
    //     }
    // }


    @Get('/search-airport/:search_query')
    async searchAirport(
        // @Param('search_query ') searchQuery :string,
        @Req() req: Request, @Res() res: Response) {
        try {
            const { search_query } = req['params'];
            const result = await this.searchflightsearvice.searchAirport(search_query);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            console.error("Failed in the search airport", error)
            return this.responseHandler.sendErrorResponse(res, error)
        }
    }

    @Get('/all-airport')
    async searchAllAirport(
        @Req() req : Request, @Res() res : Response){
        try {
            const result = await this.searchflightsearvice.searchAllAirport();
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch(error){
            console.error("Failed in the search airport", error)
            return this.responseHandler.sendErrorResponse(res,error)
        }
    }


    @Post('/search-flight')
    async searchFlight(@Req() req: Request, @Body(new ValidationPipe()) body: SearchFlightDto,  @Res() res: Response){
        try{
            const result = await this.searchflightsearvice.searchFlight(body);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            console.error("Error in the Search Flight", error);
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }
}