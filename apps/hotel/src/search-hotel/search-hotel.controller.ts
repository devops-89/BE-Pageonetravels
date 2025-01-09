import { Controller, Post, Body, Req } from '@nestjs/common';
import { SearchHotelService } from './search-hotel.service';
import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { HotelSearchResponse } from '../../../../libs/interfaces/hotel/search.interface';
import { GenerateTokenService } from './generateToken.service';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';

@Controller('/hotel')
export class SearchHotelController {
  constructor(
    private readonly searchHotelService: SearchHotelService,
    private readonly generateTokenService: GenerateTokenService,
    private readonly responseHandler: ResponseHandlerService,
  ) {}

  @Post('/search')
  async searchHotel(@Req() req: Request, @Body() body: HotelSearchDto): Promise<HotelSearchResponse> {
    try {
      const result = await this.searchHotelService.searchHotel(body);
      return result;
    } catch (error) {
      console.error('Error in hotel search', error);
      throw error;
    }
  }
}
