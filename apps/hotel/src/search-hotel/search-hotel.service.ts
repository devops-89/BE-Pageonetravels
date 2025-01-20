import { Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
//import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';

import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
//import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
//import axios from 'axios';

@Injectable()
export class SearchHotelService {
  constructor(
    private readonly hotelTBOAPIService: HotelTBOAPIService,
    private readonly generateTokenService: GenerateTokenService,
  ) {}


  /**
   * Fetch the country list.
   * Generates a token if not available and calls the HotelTBOAPIService.
   */
  async searchCountry() {
    try {
      const tokenData = await this.generateTokenService.getToken('122.160.31.42');
      const token = tokenData.token;
      const countryListURL = process.env.COUNTRY_SEARCH;
  
      if (!countryListURL) {
        throw new Error('Country search URL is not defined in environment variables.');
      }
  
      const countryList = await this.hotelTBOAPIService.fetchCountryList(token, countryListURL);
  
      return {
        message: 'Country list fetched successfully',
        data: countryList,
      };
    } catch (error) {
      console.error('Error in searchCountry:', error.message);
      throw new Error(error.message || 'Failed to fetch the country list.');
    }
  }
  
  async searchCity(countryCode: string) {
    try {
      if (!countryCode) {
        throw new Error('Country code is required to fetch the city list.');
      }
  
      const tokenData = await this.generateTokenService.getToken('127.0.0.1');
      const token = tokenData.token;
      const cityListURL = process.env.CITY_SEARCH;
  
      if (!cityListURL) {
        throw new Error('City search URL is not defined in environment variables.');
      }
  
      const cityList = await this.hotelTBOAPIService.fetchCityList(token, cityListURL, countryCode);
  
      return {
        message: 'City list fetched successfully',
        data: cityList,
      };
    } catch (error) {
      console.error('Error in searchCity:', error.message);
      throw new Error(error.message || 'Failed to fetch the city list.');
    }
  }
}

  // async searchHotel(body) {
  //   try {
  //     console.log("body", HotelSearchDto);
  //     const {
  //       // check_in_date,
  //       // check_out_date,
  //       // adult_count,
  //       // child_count,
  //       ip_address,
  //       // country_code,
  //       // city,
  //       // preferred_currency,
  //       // guest_nationality,
  //       // room_guests,
  //       // result_count = 10,
  //       // max_rating = 5, 
  //       // min_rating = 1, 
  //     } = body;

  //     // console.log(payload)
  //     if (body.adult_count < 1) {
  //       throw {message:'At least one adult is required.', statusCode: ERROR_CODES.BAD_REQUEST};
  //     }
  //     if (body.adult_count < body.child_count) {
  //       throw { message :'Number of adults should be greater than or equal to children.', statusCode:ERROR_CODES.BAD_REQUEST};
  //     }
  //     if (new Date(body.check_in_date) >= new Date(body.check_out_date)) {
  //       throw {message :'Check-out date must be after check-in date.', statusCode: ERROR_CODES.BAD_REQUEST};
  //     }
  //     const {token} = await this.generateTokenService.getToken(ip_address);

  //     console.log("5000000000000000", token);

  //     const payload = {
  //       "CheckIn": "2025-01-20",
  //       "CheckOut": "2025-01-22",
  //       "HotelCodes": "1279415",
  //       "GuestNationality": "IN",
  //       "PaxRooms": [
  //           {
  //               "Adults": 1,
  //               "Children": 0,
  //               "ChildrenAges": null
  //           }
     
  //       ],
  //       "ResponseTime": 23.0,
  //       "IsDetailedResponse": true,
  //       "Filters": {
  //           "Refundable": false,
  //           "NoOfRooms": 1,
  //           "MealType": 0,
  //           "OrderBy": 0,
  //           "StarRating": 0,
  //           "HotelName": null
  //       }
  //   }
    
  //     const hotel_search_base_url = "https://affiliate.tektravels.com/HotelAPI/Search";
  //     console.log("hotel_search_base_url", hotel_search_base_url);

  //     const response = await this.hotelTBOAPIService.searchHotelAPI(payload, hotel_search_base_url)
  //     // const noOfNights = this.calculateNoOfNights(check_in_date, check_out_date).toString();
  //     // console.log("noOfNights", noOfNights);
  //     // const payload = {
  //     //   EndUserIp: ip_address,
  //     //   TokenId: token,
  //     //   CheckInDate: this.formatDate(check_in_date),
  //     //   CheckOutDate: this.formatDate(check_out_date),
  //     //   NoOfNights: noOfNights, 
  //     //   CountryCode: country_code,
  //     //   CityId: city, 
  //     //   NoOfRooms: room_guests.length.toString(),
  //     //   AdultCount: adult_count,
  //     //   ChildCount: child_count,
  //     //   IsTBOMapped: 'true', 
  //     //   ResultCount: result_count.toString(), // Convert result_count to a string
  //     //   PreferredCurrency: preferred_currency,
  //     //   GuestNationality: guest_nationality,
  //     //   MaxRating: max_rating,
  //     //   MinRating: min_rating,
  //     //   ReviewScore: 0,
  //     //   IsNearBySearchAllowed: false,
  //     //   RoomGuests: room_guests.map((guest) => ({
  //     //     NoOfAdults: guest.no_of_adults.toString(),
  //     //     NoOfChild: guest.no_of_children.toString(),
  //     //     ChildAge: guest.child_ages ? guest.child_ages.map(age => age.toString()) : [],
  //     //   })),
  //     // };

  //     // const response = await this.hotelTBOAPIService.searchHotelAPI(token,  payload);
  //     // console.log("Request payload:", payload);

  //     // // Return the parsed response
  //     // const respons = await this.parseHotelResponse(response);
  //     return {message :"Hotel Search List fetched successfully", data : response }
  //   } catch (error) {
  //     console.error('Error in searchHotel:', error);
  //     throw new Error('Error during hotel search: ' + error.message);
  //   }
  // }


  // private readonly countryListURL = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList';
  // async fetchCountryList() {
  //   try {
  //     const headers = {
  //       Authorization: `Bearer ${token}`,
  //     };
  //     console.log('Generated token:', token);
  
  //     const response = await axios.get(this.countryListURL, { headers });
  //     console.log('Country List API Response:', response.data);
  
  //     if (!response.data || response.data.ResponseStatus !== 1) {
  //       throw new Error(response.data?.ErrorMessage || 'Failed to fetch country list');
  //     }
  
  //     return response.data.CountryList; // Ensure this is the correct property
  //   } catch (error) {
  //     console.error('Error fetching country list:', error.message);
  //     if (error.response) {
  //       console.error('API Error Response:', error.response.data);
  //     }
  //     throw new Error('Unable to fetch country list');
  //   }
  // }
  

  // Utility to format date to MM/DD/YYYY
  // private formatDate(date: string): string {
  //   const d = new Date(date);
  //   const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
  //   const day = d.getDate().toString().padStart(2, '0');
  //   const year = d.getFullYear();
  //   return `${month}/${day}/${year}`;
  // }

  // private calculateNoOfNights(checkInDate: string, checkOutDate: string): number {
  //   const checkIn = new Date(checkInDate);
  //   const checkOut = new Date(checkOutDate);
  //   const timeDifference = checkOut.getTime() - checkIn.getTime();
  //   return timeDifference / (1000 * 3600 * 24); // Convert time difference to days
  // }

  // // Parse the hotel search response
  // private parseHotelResponse(responseData) {
  //   if (responseData.HotelSearchResult.ResponseStatus !== 1) {
  //     throw new Error(`API Error: ${responseData.HotelSearchResult.Error.ErrorMessage}`);
  //   }

  //   const hotels = responseData.HotelSearchResult.HotelResults.map((hotel) => ({
  //     hotelCode: hotel.HotelCode,
  //     hotelName: hotel.HotelName,
  //     starRating: hotel.StarRating,
  //     description: hotel.HotelDescription,
  //     hotelImage: hotel.HotelPicture,
  //     price: this.formatPrice(hotel.Price),
  //     location: hotel.HotelAddress,
  //     hotelPolicy: hotel.HotelPolicy || 'No cancellation policy found.',
  //     contact: hotel.HotelContactNo || 'No contact details available',
  //     tripAdvisor: {
  //       rating: hotel.TripAdvisor?.Rating,
  //       reviewUrl: hotel.TripAdvisor?.ReviewURL,
  //     },
  //   }));

  //   return { hotels };
  // }

  // // Format the price to include the currency symbol
  // private formatPrice(price): string {
  //   return `${price.Amount} ${price.CurrencyCode}`;
  // }

