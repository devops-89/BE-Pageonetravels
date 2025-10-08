import { Controller, Res, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SearchHotelService } from './search-hotel.service';
// import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { GenerateTokenService } from './generateToken.service';
import {  UserRepositoryService } from '../../../../libs/database/src';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelSearchRequestDto , BookingDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { CreateHotelBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';
import {TokenValidationGuard} from '../../../../libs/middlewares/authMiddleware.guard';
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
  ) { } 
   
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
  
  @Post('/cities')
  async getCities(@Body('country_code') country_code: string, @Res() res: Response) {
    try {
      if (!country_code) {
        return this.responseHandler.sendErrorResponse(res, {
          message: 'Country code is required',
          statusCode:ERROR_CODES.BAD_REQUEST
        });
      }
  
      const result = await this.searchHotelService.searchCity();
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
     
      return this.responseHandler.sendErrorResponse(res, {
        message: 'Error fetching cities',
        statusCode: ERROR_CODES.UNEXPECTED_ERROR,
      });
    }
  }

  @Get('/listofhotels')
  async HotelList(@Res() res: Response) {
    try {
      const result = await this.searchHotelService.HotelCityCodeList();
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
     
      return this.responseHandler.sendErrorResponse(res, {
        message: 'Error fetching cities',
        statusCode: ERROR_CODES.UNEXPECTED_ERROR,
      });
    }
  }

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
  

 @Post('/hoteldetails')
  async HotelDetails(@Body() body: string,@Res() res: Response) {
    try {
      const result = await this.searchHotelService.HotelDetails();
      console.log(result);
      // return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
     
      return this.responseHandler.sendErrorResponse(res, {
        message: 'Error fetching cities',
        statusCode: ERROR_CODES.UNEXPECTED_ERROR,
      });
    }
  }


  @Post('/cityhoteldetails')
  async CityHotelDetails(@Body() body: string,@Res() res: Response) {
    try {
      console.log(body);
      const result = await this.searchHotelService.CityHotelDetails(body);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
     
      return this.responseHandler.sendErrorResponse(res, {
        message: 'Error fetching cities',
        statusCode: ERROR_CODES.UNEXPECTED_ERROR,
      });
    }
  }

  @Get('/citylist')
  async hotelCity(@Res() res: Response){
      try{
        const result = await this.searchHotelService.getCitylist();
        return this.responseHandler.sendSuccessResponse(res, result);
      }catch(error){
        return this.responseHandler.sendErrorResponse(res,error);
      }
  }

  @Post('/search')
  async searchHotel(@Res() res: Response, @Body() body:HotelSearchRequestDto) {
    try {
      const result = await this.searchHotelService.searchHotel(body);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res,error);
    }
  }


  @Post('/prebook')
  async hotelPreBook(@Res() res:Response,@Req() req:Request,@Body() body:BookingDto){
      try{
        const result = await this.searchHotelService.preBook(body);
        return this.responseHandler.sendSuccessResponse(res, result);
      }catch(error){
        return this.responseHandler.sendErrorResponse(res,error);
      }
  }


  @Get('/storeDetails')
  async hotelDetailsStore(@Res() res:Response){
    try{
      const result = await this.searchHotelService.fetchDetails();
      return this.responseHandler.sendSuccessResponse(res, result);
    }catch(error){
      return this.responseHandler.sendErrorResponse(res,error);
    }
  }


 @Post('/hotelBooking')
@UseGuards(TokenValidationGuard)
async hotelBooking(
  @Req() req: Request,
  @Res() res: Response,
  @Body() body: CreateHotelBookingDto
) {
  try {
    const payload = req['userPayload'];
    const { reference_id } = payload;

    const refData = await this.userRepositoryService.getUserByUserId(reference_id);
    if (!refData) {
      throw 'An error occurred while fetching the user. Please try again later.';
    }

    const bookingResult = await this.searchHotelService.bookingHotel(body, reference_id);
    console.log('✅ Booking API Result:', bookingResult);

    return this.responseHandler.sendSuccessResponse(res, bookingResult);
  } catch (error) {
    return this.responseHandler.sendErrorResponse(res, error);
  }
}

@Post('/getBookingDetails')
async hotelBookingDetails(
  @Req() req: Request,
  @Res() res: Response,
  @Body() body: { order_id: string; ip: string }
) {
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
      message:
        error?.message ||
        (typeof error === 'string' ? error : 'Unexpected error occurred.'),
      success: false,
    });
  }
}

 @Post('/cancelBooking')
  async cancelBooking(
    @Body() body: { orderId: string; Remarks: string; ip: string },
    @Res() res: Response,
  ) {
    try {
        const result=await this.searchHotelService.cancelBooking(body);
      // 4. Return the API response along with updated order status
      return this.responseHandler.sendSuccessResponse(res, {message:"Cancellation request initiated successfully",data:result});
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }


//   // Check Cancellation Status
  @Post('/cancelStatus')
  async cancelStatus(
    @Body() body: { orderId: string; ip: string },
    @Res() res: Response
  ) {
    try {

      const result=await this.searchHotelService.checkCancelStatus(body);
      // const result = await this.searchHotelService.getChangeRequestStatus(
      //   body.ChangeRequestId,
      //   body.ip_address
      // );
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      return this.responseHandler.sendErrorResponse(res, error);
}
}

 @Get('hotel-static-api-persist')
   async startSync() {
    await this.syncService.scheduleSyncJobs();
    return { message: 'TBO Hotel sync started!' };
  }

 

}



