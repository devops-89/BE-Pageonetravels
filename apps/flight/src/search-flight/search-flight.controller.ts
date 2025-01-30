import { Controller, Req, Body, ValidationPipe, Res, Get, Post, UploadedFile, UseInterceptors, Query} from '@nestjs/common';
import { SearchFlightService } from './search-flight.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { SearchFlightDto } from '../../../../libs/dtos/flight/search-flights.dto';
import { imageFileFilter } from '../../../../libs/utils/fileUpload';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/flight')
export class SearchFlightController {
    constructor(private readonly searchflightsearvice: SearchFlightService,
        private readonly responseHandler: ResponseHandlerService,
    ){}

    @Post('/upload-airport')
    @UseInterceptors(FileInterceptor('airportexcel', { fileFilter: imageFileFilter }))
    async uploadAirport(@Req() req: Request, @Res() res: Response, @UploadedFile() file) {
        try {
            // Pass the uploaded file to the service for processing
            const result = await this.searchflightsearvice.uploadAirport(file);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            console.log("Error in generate token:", error);
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }


    @Get('/search-airport/:search_query')
    async searchAirport(
        // @Param('search_query ') searchQuery :string, 
        @Req() req : Request, @Res() res : Response, @Query('page') page :number, @Query('pageSize') pageSize:number){
        try {
            const {search_query} = req['params'];
            const result = await this.searchflightsearvice.searchAirport(page, pageSize, search_query);
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