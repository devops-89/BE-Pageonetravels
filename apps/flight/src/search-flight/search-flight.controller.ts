import { Controller, Req, Body, ValidationPipe, Res, Get} from '@nestjs/common';
import { SearchFlightService } from './search-flight.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { SearchFlightDto } from '../../../../libs/dtos/flight/flights.dto';

@Controller('/flight') 
export class SearchFlightController { 
    constructor(private readonly searchflightservice:SearchFlightService,
        private readonly responseHandler: ResponseHandlerService,
    ){}

    @Get('/data') 
    async generateToken(@Req() req : Request, @Res() res: Response){
        try {
            const result = this.searchflightservice.generateToken();
            return result;
            // return this.responseHandler.sendSuccessResponse(res,result)
        }catch(error){
            console.log("error in the generate token", error);
            return this.responseHandler.sendErrorResponse(res,error);
        }
    }

    // @Get('/search-airport')
    // async searchAirport(){
    //     try {
    //         return this.searchflightsearvice.searchAirport()
    //     }catch(error){
    //         console.log("Failed in the search airport", error)
    //         throw error
    //     }
    // }

    @Get('/search-flight')
    async searchAirport(@Req() req: Request, @Body(new ValidationPipe()) body: SearchFlightDto,  @Res() res: Response){
        try{
            console.log(body);
            const result = this.searchflightservice.searchFlight(body);
            return result
        }catch(error){
            console.log("Error in the Search Flight", error);
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }
}
