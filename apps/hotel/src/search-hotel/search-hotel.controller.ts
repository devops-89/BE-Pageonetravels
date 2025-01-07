 import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { Controller, Post, Req, Res, Body,  ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { SearchHotelService } from '../../../hotel/src/search-hotel/search-hotel.service';
import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';

@Controller('/hotel')
export class HotelController {
  constructor(
    private readonly hotelDetailService: SearchHotelService,
    private readonly responseHandler: ResponseHandlerService,
  ) {}

  // @Get('/search-location/:location')
  // async searchHotelByLocation(
  //   @Req() req: Request, @Res() res: Response
  // ) {
  //   try {
  //     const { location } = req['params'];
  //     const result = await this.hotelDetailService.searchHotelByLocation(location);
  //     return this.responseHandler.sendSuccessResponse(res, result);
  //   } catch (error) {
  //     console.error("Failed in search hotel by location", error);
  //     return this.responseHandler.sendErrorResponse(res, error);
  //   }
  // }

  @Post('/search-hotel')
  async searchHotel(@Req() req: Request, @Body(new ValidationPipe()) body: HotelSearchDto, @Res() res: Response) {
    try {
      const result = await this.hotelDetailService.searchHotel(body);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      console.error("Error in search hotel", error);
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }
}