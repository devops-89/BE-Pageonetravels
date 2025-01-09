import { Controller, Post, Body, Res } from '@nestjs/common';
import { SearchHotelService } from './search-hotel.service';
// import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

@Controller('/hotel')
export class SearchHotelController {
  constructor(
    private readonly searchHotelService: SearchHotelService,
    private readonly responseHandler: ResponseHandlerService,
  ) {}

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
