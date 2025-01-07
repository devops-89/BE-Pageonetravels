
import { Injectable } from '@nestjs/common';
import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { GenerateTokenService } from './generateToken.service';
import { HotelSearchResponse } from '../../../../libs/interfaces/hotel/search.interface';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
import { HotelValidator } from './search-utility';

@Injectable()
export class SearchHotelService {
  constructor(
    private readonly generateTokenService: GenerateTokenService,
    private readonly httptboapiservice: HotelTBOAPIService
  ) {}

  async searchHotel(body: HotelSearchDto) {
    try {
      const {
        check_in_date,
        check_out_date,
        //location,
        //room_count,
        adult_count,
        child_count,
        //room_type,
        ip_address,
      } = body;

      // Validate required fields
      if (adult_count < 1) {
        return { message: "At least one adult is required.", statusCode: 400 };
      }
      if (adult_count < child_count) {
        return { message: "Number of adults should be greater than or equal to children.", statusCode: 400 };
      }

      // Validate the dates
      HotelValidator.validateDates(check_in_date, check_out_date);

      // Get the token from cache or generate a new one
      const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);
      const { HOTEL_SEARCH: base_url } = TBO_data;

      // Make the API call to fetch hotels
      const response = await this.httptboapiservice.searchHotelAPI(token, base_url, {
        ...body,
        check_in_date,
        check_out_date,
        //location,
        //room_count,
        // room_type,
        ip_address,
        adult_count,
        child_count
      });

      // Process and transform the response data
      const hotels = this.extractHotelData(response);

      return { message: "Hotel list fetched successfully", data: hotels };
    } catch (error) {
      console.log("Error in the search hotel function", error);
      throw error;
    }
  }

  private extractHotelData(response: HotelSearchResponse) {
    try {
      return response.Response.Results.map((hotel) => ({
        HotelName: hotel.HotelName,
        HotelCode: hotel.HotelCode,
        Address: hotel.Address,
        City: hotel.City,
        Country: hotel.Country,
        StarRating: hotel.StarRating,
        Price: hotel.Price,
        AvailableRooms: hotel.AvailableRooms,
        Facilities: hotel.Facilities,
        Image: hotel.Image || null,
      }));
    } catch (error) {
      console.error('Error extracting hotel data:', error);
      throw new Error('Failed to process hotel data');
    }
  }
}