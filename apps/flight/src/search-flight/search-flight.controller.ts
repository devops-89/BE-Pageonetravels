import { Controller , Req, Res, Get} from '@nestjs/common';
import { SearchFlightService } from './search-flight.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

@Controller('/flight')
export class SearchFlightController {
    constructor(private readonly searchflightsearvice:SearchFlightService,
        private readonly responseHandler: ResponseHandlerService,
    ){}

    @Get('/data')
    async generateToken(@Req() req : Request, @Res() res: Response){
        try {
            const result = this.searchflightsearvice.generateToken();
            return result
            // return this.responseHandler.sendSuccessResponse(res,result)
        }catch(error){
            console.log("error in the generate token", error)
            return this.responseHandler.sendErrorResponse(res,error)
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
}
