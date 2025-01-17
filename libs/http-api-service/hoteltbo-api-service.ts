import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {  IHotelSearchPayload, IFareRule } from '../../libs/interfaces/hotel/search.interface';

@Injectable()
export class HotelTBOAPIService {
  constructor() {}

  private async httpAPICall(baseURL: string, payload: object | null, headers: object): Promise<any> {
    try {
      const config = { headers };
      const response = payload
        ? await axios.post(baseURL, payload, config)
        : await axios.get(baseURL, config);

      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in Axios API call:', error.message);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
      }
      throw new Error(error.response?.data?.Description || 'Failed to make API call.');
    }
  }


  async fetchCountryList(token: string, countryListURL: string): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await this.httpAPICall(countryListURL, null, headers);
  
      if (!response || response.Status?.Code !== 1) {
        console.error('API Error:', response?.Status?.Description);
        throw new Error(response?.Status?.Description || 'Unexpected error while fetching the country list.');
      }
  
      return response.CountryList.map((country: { Code: string; Name: string }) => ({
        code: country.Code,
        name: country.Name,
      }));
    } catch (error) {
      console.error('Error in fetchCountryList:', error.message);
      throw new Error(error.message || 'Failed to fetch the country list.');
    }
  }
  
  async fetchCityList(token: string, cityListURL: string, countryCode: string): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const urlWithParams = `${cityListURL}?CountryCode=${countryCode}`;
      const response = await this.httpAPICall(urlWithParams, null, headers);
  
      if (!response || response.Status?.Code !== 1) {
        console.error('API Error:', response?.Status?.Description);
        throw new Error(response?.Status?.Description || 'Unexpected error while fetching the city list.');
      }
  
      return response.CityList.map((city: { Code: string; Name: string }) => ({
        code: city.Code,
        name: city.Name,
      }));
    } catch (error) {
      console.error('Error in fetchCityList:', error.message);
      throw new Error(error.message || 'Failed to fetch the city list.');
    }
  }
}

//   async searchHotelAPI(
//     // token: string,
//     body,
//     base_url: string,
//   ) {
//     try {
//       const {
//         city,
//         check_in_date,
//         check_out_date,
//         adult_count,
//         child_count = 0,
//         roomTypes,
//         preferredHotelBrand,
//         rating,
//         ip_address,
//         preferredAmenities,
//       } = body;

    
//       // const payload: IHotelSearchPayload = {
//       //   EndUserIp: ip_address,
//       //   TokenId: token,
//       //   CheckInDate: check_in_date,
//       //   CheckOutDate: check_out_date,
//       //   City: city,
//       //   NoOfRooms: roomTypes?.length || 1,
//       //   AdultCount: adult_count,
//       //   ChildCount: child_count,
//       //   PreferredHotelBrand: preferredHotelBrand || null,
//       //   Rating: rating || null,
//       //   PreferredAmenities: preferredAmenities || null,
//       // };
//       // const payload = {
//       //   "CheckInDate": check_in_date,
//       //   "NoOfNights": "1",
//       //   "CountryCode": "IN",
//       //   "CityId": "130443",
//       //   "HotelCode": "1150422",
//       //   "IsTBOMapped": "true",
//       //   "ResultCount": 0,
//       //   "PreferredCurrency": "INR",
//       //   "GuestNationality": "IN",
//       //   "NoOfRooms": 2,
//       //   "MaxRating": 5,
//       //   "MinRating": 1,
//       //   "ReviewScore": 0,
//       //   "IsNearBySearchAllowed": false,
//       //   "EndUserIp": "192.168.10.159",
//       //   "TokenId": "dbb0bc48-1202-4a01-bd55-4d283981ea80",
//       //   "RoomGuests": [
//       //     {
//       //       "NoOfAdults": 1,
//       //       "NoOfChild": 0,
//       //       "ChildAge": [
              
//       //       ]
//       //     },
//       //     {
//       //       "NoOfAdults": 1,
//       //       "NoOfChild": 0,
//       //       "ChildAge": [
              
//       //       ]
//       //     },
          
//       //   ]
//       // }
    
//       console.log('Request Payload: inside the http tbo');


//       // const response = await this.httpAPICall(base_url, body);;
//       const response = await axios.post(base_url, body);
//       // console.log("resssssssssssssssss", response);
//       // if (!response?.Response?.Results || response.Response.Results.length === 0) {
//       //   throw new Error('No results found in the hotel search response.');
//       // }
//       console.log("REsssssss", (response.data));
//       // const hoteldetails = this.mapHotelData(response.Response.Results);
//       return response;
//     } catch (error) {
//       console.error('Error in searchHotelAPI:', error.message);
//       throw new Error(error.message || 'Failed to fetch hotel data.');
//     }
//   }


//   async fareRule(baseurl:string, payload:IFareRule){
//           try {
//             let result = await this.httpAPICall(baseurl, payload);
//             return result;
//           } catch(error){
//             console.log(error);
//             throw error
//         }
//       }
//   /**
//    * Helper method to map hotel data from API response
//    */
//   private mapHotelData(results: any[]): any[] {
//     return results.map((hotel) => ({
//       hotelName: hotel.name,
//       hotelCode: hotel.code,
//       city: hotel.City,
//       location: hotel.location,
//       price: hotel.price,
//       rating: hotel.rating,
//       availableRooms: hotel.available_rooms,
//       amenities: hotel.amenities,
//       image: hotel.Image || null,

//     }));
//   }
// }
