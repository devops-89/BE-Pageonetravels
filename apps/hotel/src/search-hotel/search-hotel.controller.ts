import { Controller, Res, Get, Post, Body, Req } from '@nestjs/common';
import { SearchHotelService } from './search-hotel.service';
// import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { GenerateTokenService } from './generateToken.service';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelSearchRequestDto , BookingDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { CreateHotelBookingDto,CreateBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';

@Controller('/hotel') 
export class SearchHotelController { 
  constructor( 
    private readonly searchHotelService: SearchHotelService,
    private readonly responseHandler: ResponseHandlerService,
    private readonly generateTokenService: GenerateTokenService
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
  
      const result = await this.searchHotelService.searchCity(country_code);
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

  @Post('/hoteldetails')
  async HotelDetails(@Body() body: string,@Res() res: Response) {
    try {
      const result = await this.searchHotelService.HotelDetails(body);
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
  async hotelBooking(@Req() req:Request, @Res() res:Response, @Body() body:CreateHotelBookingDto){
    try{
      const result = await this.searchHotelService.bookingHotel(body);
      return this.responseHandler.sendSuccessResponse(res, result);
    }catch(error){
      return this.responseHandler.sendErrorResponse(res,error);
    }
  }

  @Post('/getBookingDetails')
  async hotelBookingDetails(@Req() req:Request,@Res() res:Response,@Body() body:CreateBookingDto){
    try{
      console.log(body);
      const result = await this.searchHotelService.bookingDetails(body);
      return this.responseHandler.sendSuccessResponse(res,result);
    }catch(error){
      return this.responseHandler.sendErrorResponse(res,error);
    }
  }

}



