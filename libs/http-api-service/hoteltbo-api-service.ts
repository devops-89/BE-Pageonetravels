// import { Injectable } from '@nestjs/common';
// import axios from 'axios';
// import { IFareRule, IHotelSearchPayload } from '../../libs/interfaces/hotel/search.interface';

// @Injectable()
// export class HotelTBOAPIService {
//   constructor() {}

//   // Call external API to search for hotels
//   async searchHotelAPI(token: string, base_url: string, body: IHotelSearchPayload) {
//     try {
//       const payload = {
//         ...body,
//         TokenId: token,
//       };

//       console.log('Request Payload:', payload);
//       const response = await axios.post(base_url, payload);

//       if (!response?.data?.HotelSearchResult?.HotelResults) {
//         throw new Error('No hotels found.');
//       }

//       return response.data; // Returning the full response
//     } catch (error) {
//       console.error('Error in searchHotelAPI:', error.message);
//       throw new Error(error.message || 'Failed to fetch hotel data.');
//     }
//   }

//     async fareRule(baseurl:string, payload:IFareRule){
//           try {
//             let result = await this.fareRule(baseurl, payload);
//             return result;
//           } catch(error){
//             console.log(error);
//             throw error
//         }
//       }
// }

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IHotelSearch, IHotelSearchPayload, HotelSearchResponse, IFareRule } from '../../libs/interfaces/hotel/search.interface';

@Injectable()
export class HotelTBOAPIService {
  constructor() {}

 
  async httpAPICall(baseURL: string, payload: object): Promise<any> {
    try {
      const result = await axios.post(baseURL, payload);
      return result.data;
    } catch (error) {
      console.error('Error in Axios API call:', error.message);
      throw new Error('Failed to make API call.');
    }
  }

  async searchHotelAPI(
    token: string,
    base_url: string,
    body: IHotelSearch
  ) {
    try {
      const {
        city,
        check_in_date,
        check_out_date,
        adult_count,
        child_count = 0,
        roomTypes,
        preferredHotelBrand,
        rating,
        ip_address,
        preferredAmenities,
      } = body;

    
      const payload: IHotelSearchPayload = {
        EndUserIp: ip_address,
        TokenId: token,
        CheckInDate: check_in_date,
        CheckOutDate: check_out_date,
        City: city,
        NoOfRooms: roomTypes?.length || 1,
        AdultCount: adult_count,
        ChildCount: child_count,
        PreferredHotelBrand: preferredHotelBrand || null,
        Rating: rating || null,
        PreferredAmenities: preferredAmenities || null,
      };

    
      console.log('Request Payload:', payload);


      const response = await this.httpAPICall(base_url, payload);

  
      if (!response?.Response?.Results || response.Response.Results.length === 0) {
        throw new Error('No results found in the hotel search response.');
      }

      const hoteldetails = this.mapHotelData(response.Response.Results);
      return hoteldetails as any;
    } catch (error) {
      console.error('Error in searchHotelAPI:', error.message);
      throw new Error(error.message || 'Failed to fetch hotel data.');
    }
  }


  async fareRule(baseurl:string, payload:IFareRule){
          try {
            let result = await this.httpAPICall(baseurl, payload);
            return result;
          } catch(error){
            console.log(error);
            throw error
        }
      }
  /**
   * Helper method to map hotel data from API response
   */
  private mapHotelData(results: any[]): any[] {
    return results.map((hotel) => ({
      hotelName: hotel.name,
      hotelCode: hotel.code,
      city: hotel.City,
      location: hotel.location,
      price: hotel.price,
      rating: hotel.rating,
      availableRooms: hotel.available_rooms,
      amenities: hotel.amenities,
      image: hotel.Image || null,

    }));
  }
}
