import { Controller, Res, Get, Post, Body, Req, Query, Ip } from '@nestjs/common';
import { SearchHotelService } from './search-hotel.service';
// import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { GenerateTokenService } from './generateToken.service';
import {  UserRepositoryService } from '../../../../libs/database/src';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelSearchRequestDto, BookingDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import {SearchResult} from "./search-hotel.service";
import { HotelDetailDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { SyncCronService } from '../app/bull/sync-cron.service';


@Controller('/hotel')
export class SearchHotelController {
    constructor(
        private readonly searchHotelService: SearchHotelService,
        private readonly responseHandler: ResponseHandlerService,
        private readonly generateTokenService: GenerateTokenService,

        private readonly userRepositoryService: UserRepositoryService,
        private readonly syncService: SyncCronService
    ) {}

    @Get('/country-list')
    async getCountryList(@Res() res: Response) {
        try {
            const result = await this.searchHotelService.searchCountry();
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            console.error('Error fetching country list:', error.message);
            return this.responseHandler.sendErrorResponse(res, {
                message: 'Error fetching country list',
                error: error.message,
            });
        }
    }

    // search the cities codes by city, country name
    @Get('/searchCodes')
    async getSearchCodesByCityAndHotel(@Query('q') q: string): Promise<SearchResult> {
        return this.searchHotelService.getSearchCodesByCityAndHotel(q);
    }


    // clientHotel Details from the database
    // @Post('/clientHotelDetails')
    // async ClientHotelDetails(
    //     @Body() body: { hotelCode: string },
    //     @Res() res: Response
    // ) {
    //     if (!body.hotelCode) {
    //         return this.responseHandler.sendErrorResponse(res, {
    //             message: 'hotelCode is required.',
    //             statusCode: ERROR_CODES.BAD_REQUEST,
    //         });
    //     }
    //
    //     try {
    //         const result = await this.searchHotelService.ClientHotelDetails(body);
    //
    //         if (!result?.data) {
    //             return this.responseHandler.sendErrorResponse(res, {
    //                 message: `No details found for hotelCode: ${body.hotelCode}`,
    //                 statusCode: ERROR_CODES.NOT_FOUND,
    //             });
    //         }
    //
    //         return this.responseHandler.sendSuccessResponse(res, {
    //             message: 'Hotel Details fetched successfully',
    //             data: result.data,
    //         });
    //     } catch (error: any) {
    //         console.error('Error in ClientHotelDetails:', error.message || error);
    //
    //         // Dynamically determine statusCode if provided in the error
    //         const statusCode = error.statusCode || ERROR_CODES.UNEXPECTED_ERROR;
    //
    //         return this.responseHandler.sendErrorResponse(res, {
    //             message: error.message || 'Failed to fetch the hotel details.',
    //             statusCode,
    //         });
    //     }
    // }

  @Post('/clientHotelDetails')
  async ClientHotelDetails(@Body() body:HotelDetailDto,@Res() res:Response){
    try{
      const result=await this.searchHotelService.ClientHotelDetails(body);
      return this.responseHandler.sendSuccessResponse(res,result.data);
    }
    catch(error){
      return this.responseHandler.sendErrorResponse(res, {
        message: 'Error fetching cities',
        statusCode: ERROR_CODES.UNEXPECTED_ERROR,
      });
    }
  }


    // @Post('/hoteldetails')
    // async HotelDetails(@Body() body: string, @Res() res: Response) {
    //     try {
    //         const result = await this.searchHotelService.HotelDetails();
    //         console.log(result);
    //         // return this.responseHandler.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responseHandler.sendErrorResponse(res, {
    //             message: 'Error fetching cities',
    //             statusCode: ERROR_CODES.UNEXPECTED_ERROR,
    //         });
    //     }
    // }

    // @Post('/cityhoteldetails')
    // async CityHotelDetails(@Body() body: string, @Res() res: Response) {
    //     try {
    //         console.log(body);
    //         const result = await this.searchHotelService.CityHotelDetails(body);
    //         return this.responseHandler.sendSuccessResponse(res, result);
    //     } catch (error) {
    //         return this.responseHandler.sendErrorResponse(res, {
    //             message: 'Error fetching cities',
    //             statusCode: ERROR_CODES.UNEXPECTED_ERROR,
    //         });
    //     }
    // }

    @Post('/search')
    async searchHotel(@Res() res: Response, @Body() body: HotelSearchRequestDto) {
        try {
            const result = await this.searchHotelService.searchHotel(body);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    @Post('/prebook')
    async hotelPreBook(@Res() res: Response, @Req() req: Request, @Body() body: BookingDto) {
        try {
            const result = await this.searchHotelService.preBook(body);
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    @Post('/getBookingDetails')
    async hotelBookingDetails(@Req() req: Request, @Res() res: Response, @Body() body: { order_id: string; ip: string }) {
        try {
            const { order_id, ip } = body;



            // 🔍 Validate input
            if (!order_id || !ip) {
                return this.responseHandler.sendErrorResponse(res, {
                    statusCode: 400,
                    message: 'Both order_id and ip are required.',
                    success: false,
                });
            }

            //  Fetch booking details
            const result = await this.searchHotelService.bookingDetails(order_id, ip);

            //  Send success response
            return this.responseHandler.sendSuccessResponse(res, {
                message: 'Hotel booking status fetched successfully.',
                data: result,
            });
        } catch (error) {
            //  Log error for diagnostics
            console.error(' Error in /getBookingDetails:', error);

            return this.responseHandler.sendErrorResponse(res, {
                statusCode: error?.statusCode || 500,
                message: error?.message || (typeof error === 'string' ? error : 'Unexpected error occurred.'),
                success: false,
            });
        }
    }

    @Post('/cancelBooking')
    async cancelBooking(@Body() body: { orderId: string; Remarks: string; ip: string }, @Res() res: Response) {
        try {
            const result = await this.searchHotelService.cancelBooking(body);
            // 4. Return the API response along with updated order status
            return this.responseHandler.sendSuccessResponse(res, { message: 'Cancellation request initiated successfully', data: result });
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    //   // Check Cancellation Status
    @Post('/cancelStatus')
    async cancelStatus(@Body() body: { orderId: string; ip: string }, @Res() res: Response) {
        try {
            const result = await this.searchHotelService.checkCancelStatus(body);
            // const result = await this.searchHotelService.getChangeRequestStatus(
            //   body.ChangeRequestId,
            //   body.ip_address
            // );
            return this.responseHandler.sendSuccessResponse(res, result);
        } catch (error) {
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

    // for saving the data of the static apis
    @Get('hotel-static-api-persist-start')
    async startSync() {
        await this.syncService.scheduleSyncJobs();
        return { message: 'TBO Hotel sync started!' };
    }

    @Get('hotel-static-api-persist-pause')
    async pauseSync() {
        await this.syncService.pauseAll();
        return { message: 'Sync paused.' };
    }

    @Get('hotel-static-api-persist-resume')
    async resumeSync() {
        await this.syncService.resumeAll();
        return { message: 'Sync resumed.' };
    }

    @Get('hotel-static-api-persist-stop')
    async stopSync() {
        await this.syncService.stopAll();
        return { message: 'Sync stopped and all jobs cleared.' };
    }


//     saving the hotel Code from TBO Hotel Code api in HotelCode Table
    @Get("hotel-code-static-api-persist")
    async startHotelCodeSync():Promise<{message:string}>{
        await this.searchHotelService.syncHotelCodeData();
        return {message: 'TBO Hotel Code sync started!'};
    }

//     saving the hotel Code from the TBO Hotel Code api for Single City
    @Post("hotel-code-static-api-persist")
    async startHotelCodeSyncByCityCode(@Body() body:{cityCode: string},@Res() res:Response)
    {
        try{
            const result=await this.searchHotelService.syncSingleCityHotelCode(body.cityCode);
            return this.responseHandler.sendSuccessResponse(res, result);
        }
        catch(error){
            return this.responseHandler.sendErrorResponse(res, error);
        }
    }

//     saving the hotel detail from hotel detail api in HotelDetail Table
    @Post("hotel-detail-static-api-persist")
    async startHotelDetailSync(@Body() body:HotelDetailDto,@Res() res:Response){
      try{
          const result=await this.searchHotelService.syncHotelDetailData(body);
          return this.responseHandler.sendSuccessResponse(res, result);
      }
      catch(error){
          return this.responseHandler.sendErrorResponse(res, error);
      }
    }
}
