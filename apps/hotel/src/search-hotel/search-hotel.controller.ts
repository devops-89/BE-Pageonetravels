import { Controller, Res, Get, Post, Body } from '@nestjs/common';
import { SearchHotelService } from './search-hotel.service';
// import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { GenerateTokenService } from './generateToken.service';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';

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
      return this.responseHandler.sendSuccessResponse(res, result);
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
  
      const result = await this.searchHotelService.CityHotelDetails(body);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
     
      return this.responseHandler.sendErrorResponse(res, {
        message: 'Error fetching cities',
        statusCode: ERROR_CODES.UNEXPECTED_ERROR,
      });
    }
  }

  @Post('/search')
  async searchHotel(@Res() res: Response, @Body() body) {
    try {
      const result = await this.searchHotelService.searchHotel(body);
      return this.responseHandler.sendErrorResponse(res, result)
    } catch (error) {
      console.error('Error in hotel search', error);
      throw error;
    }
  }
}