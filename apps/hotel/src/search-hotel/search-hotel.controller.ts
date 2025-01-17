import { Controller, Res, Get, Post, Body } from '@nestjs/common';
import { SearchHotelService } from './search-hotel.service';
// import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { GenerateTokenService } from './generateToken.service';

@Controller('/hotel')
export class SearchHotelController {
  constructor(
    private readonly searchHotelService: SearchHotelService,
    private readonly responseHandler: ResponseHandlerService,
    private readonly generateTokenService: GenerateTokenService
  ) { }

  // @Post('/search')
  // async searchHotel(@Res() res: Response, @Body() body) {
  //   try {
  //     const result = await this.searchHotelService.searchHotel(body);
  //     return this.responseHandler.sendErrorResponse(res, result)
  //   } catch (error) {
  //     console.error('Error in hotel search', error);
  //     throw error;
  //   }
  // }
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
  async getCities(@Body('countryCode') countryCode: string, @Res() res: Response) {
    try {
      if (!countryCode) {
        return this.responseHandler.sendErrorResponse(res, {
          message: 'Country code is required',
        });
      }
  
      const result = await this.searchHotelService.searchCity(countryCode);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      console.error('Error fetching cities:', error.message);
      return this.responseHandler.sendErrorResponse(res, {
        message: 'Error fetching cities',
        error: error.message,
      });
    }
  }
}