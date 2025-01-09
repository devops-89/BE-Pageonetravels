import { Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';

import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';

@Injectable()
export class SearchHotelService {
  constructor(
    private readonly generateTokenService: GenerateTokenService,
    private readonly hotelTBOAPIService: HotelTBOAPIService,
  ) {}


  async searchHotel(body) {
    try {
      console.log("body", HotelSearchDto);
      const {
        // check_in_date,
        // check_out_date,
        // adult_count,
        // child_count,
        ip_address,
        // country_code,
        // city,
        // preferred_currency,
        // guest_nationality,
        // room_guests,
        // result_count = 10,
        // max_rating = 5, 
        // min_rating = 1, 
      } = body;

      // console.log(payload)
      if (body.adult_count < 1) {
        throw {message:'At least one adult is required.', statusCode: ERROR_CODES.BAD_REQUEST};
      }
      if (body.adult_count < body.child_count) {
        throw { message :'Number of adults should be greater than or equal to children.', statusCode:ERROR_CODES.BAD_REQUEST};
      }
      if (new Date(body.check_in_date) >= new Date(body.check_out_date)) {
        throw {message :'Check-out date must be after check-in date.', statusCode: ERROR_CODES.BAD_REQUEST};
      }
    


      const {token} = await this.generateTokenService.getToken(ip_address);

      console.log("5000000000000000", token);

      const payload = {
        "CheckIn": "2025-01-20",
        "CheckOut": "2025-01-22",
        "HotelCodes": "1279415",
        "GuestNationality": "IN",
        "PaxRooms": [
            {
                "Adults": 1,
                "Children": 0,
                "ChildrenAges": null
            }
     
        ],
        "ResponseTime": 23.0,
        "IsDetailedResponse": true,
        "Filters": {
            "Refundable": false,
            "NoOfRooms": 1,
            "MealType": 0,
            "OrderBy": 0,
            "StarRating": 0,
            "HotelName": null
        }
    }
    
      const hotel_search_base_url = "https://affiliate.tektravels.com/HotelAPI/Search";
      console.log("hotel_search_base_url", hotel_search_base_url);

      const response = await this.hotelTBOAPIService.searchHotelAPI(payload, hotel_search_base_url)
      // const noOfNights = this.calculateNoOfNights(check_in_date, check_out_date).toString();
      // console.log("noOfNights", noOfNights);
      // const payload = {
      //   EndUserIp: ip_address,
      //   TokenId: token,
      //   CheckInDate: this.formatDate(check_in_date),
      //   CheckOutDate: this.formatDate(check_out_date),
      //   NoOfNights: noOfNights, 
      //   CountryCode: country_code,
      //   CityId: city, 
      //   NoOfRooms: room_guests.length.toString(),
      //   AdultCount: adult_count,
      //   ChildCount: child_count,
      //   IsTBOMapped: 'true', 
      //   ResultCount: result_count.toString(), // Convert result_count to a string
      //   PreferredCurrency: preferred_currency,
      //   GuestNationality: guest_nationality,
      //   MaxRating: max_rating,
      //   MinRating: min_rating,
      //   ReviewScore: 0,
      //   IsNearBySearchAllowed: false,
      //   RoomGuests: room_guests.map((guest) => ({
      //     NoOfAdults: guest.no_of_adults.toString(),
      //     NoOfChild: guest.no_of_children.toString(),
      //     ChildAge: guest.child_ages ? guest.child_ages.map(age => age.toString()) : [],
      //   })),
      // };

      // const response = await this.hotelTBOAPIService.searchHotelAPI(token,  payload);
      // console.log("Request payload:", payload);

      // // Return the parsed response
      // const respons = await this.parseHotelResponse(response);
      return {message :"Hotel Search List fetched successfully", data : response }
    } catch (error) {
      console.error('Error in searchHotel:', error);
      throw new Error('Error during hotel search: ' + error.message);
    }
  }

  // Utility to format date to MM/DD/YYYY
  private formatDate(date: string): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private calculateNoOfNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDifference = checkOut.getTime() - checkIn.getTime();
    return timeDifference / (1000 * 3600 * 24); // Convert time difference to days
  }

  // Parse the hotel search response
  private parseHotelResponse(responseData) {
    if (responseData.HotelSearchResult.ResponseStatus !== 1) {
      throw new Error(`API Error: ${responseData.HotelSearchResult.Error.ErrorMessage}`);
    }

    const hotels = responseData.HotelSearchResult.HotelResults.map((hotel) => ({
      hotelCode: hotel.HotelCode,
      hotelName: hotel.HotelName,
      starRating: hotel.StarRating,
      description: hotel.HotelDescription,
      hotelImage: hotel.HotelPicture,
      price: this.formatPrice(hotel.Price),
      location: hotel.HotelAddress,
      hotelPolicy: hotel.HotelPolicy || 'No cancellation policy found.',
      contact: hotel.HotelContactNo || 'No contact details available',
      tripAdvisor: {
        rating: hotel.TripAdvisor?.Rating,
        reviewUrl: hotel.TripAdvisor?.ReviewURL,
      },
    }));

    return { hotels };
  }

  // Format the price to include the currency symbol
  private formatPrice(price): string {
    return `${price.Amount} ${price.CurrencyCode}`;
  }

 
}
