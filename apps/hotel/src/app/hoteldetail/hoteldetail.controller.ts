

import { Controller, Req, Body, ValidationPipe, Res, Post } from '@nestjs/common';
import { HotelDetailService } from '../../../../hotel/src/app/hoteldetail/hoteldetail.service';
import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { HotelDetailRequestDto } from '../../../../../libs/dtos/hotel/hotel-detail.dto';

@Controller('/hotel')
export class SearchHotelController {
  constructor(
    private readonly HotelDetailService: HotelDetailService,
    private readonly responseHandler: ResponseHandlerService
  ) {}

  @Post('/search-hotel')
  async searchHotel(@Req() req: Request, @Body(new ValidationPipe()) body: HotelDetailRequestDto, @Res() res: Response) {
    try {
      const result = await this.HotelDetailService.hotelDetail(body);
      return this.responseHandler.sendSuccessResponse(res, result);
    } catch (error) {
      console.error("Error in the Search Hotel", error);
      return this.responseHandler.sendErrorResponse(res, error);
    }
  }
}