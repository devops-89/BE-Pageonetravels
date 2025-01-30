import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {  IHotelSearchPayload, IFareRule } from '../../libs/interfaces/hotel/search.interface';

@Injectable()
export class HotelTBOAPIService {
  constructor() {}

  private async httpAPICall(baseURL: string, headers: object): Promise<any> {
    try {
      const config = { headers };
      const result = await axios.get(baseURL, config)
      return result.data;
    } catch (error) {
      console.error('Error in Axios API call:', error.message);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
      }
      throw new Error(error.response?.data?.Description || 'Failed to make API call.');
    }
  }
  
  private async httpPostAPICall(baseURL: string,payload,headers: object): Promise<any> {
    try {
      const config = { headers };
    
      const result = await axios.post(baseURL,payload, config);
    
      return result.data;
     
    } catch (error) {
      console.error('Error in Axios API call:', error.message);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
      }
      throw new Error(error.response?.data?.Description || 'Failed to make API call.');
    }
  }


  async fetchCountryList(countryListURL: string): Promise<any> {
    try {
     
      const username = "TBOStaticAPITest";
      const password = "Tbo@11530818";
  
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };
  
      const response = await this.httpAPICall(countryListURL, headers);

      return response;
  
    } catch (error) {
      console.error('Error in fetchCountryList:', error.message);
      throw (error.message || 'Failed to fetch the country list.');
    }
  }
  
  
  async fetchCityList(cityListURL: string, countryCode: string): Promise<any> {
    try {
     
      const username = "TBOStaticAPITest";
      const password = "Tbo@11530818";
  
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
     
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        "CountryCode": countryCode
      }

      const response = await this.httpPostAPICall(cityListURL, payload ,headers);
     
      return response;

    } catch (error) {
      console.error('Error in fetchCityList:', error.message);
      throw (error.message || 'Failed to fetch the city list.');
    }
  }

  async fetchHotelDetails(cityListURL: string, hotel_city_code:number): Promise<any> {
    try {
     
      const username = "TBOStaticAPITest";
      const password = "Tbo@11530818";
  
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
     
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        "Hotelcodes": hotel_city_code, 
        "Language": "EN" 
      }

      const response = await this.httpPostAPICall(cityListURL, payload ,headers);

      return response;

    } catch (error) {
      console.error('Error in fetchCityList:', error.message);
      throw (error.message || 'Failed to fetch the city list.');
    }
  }

  async fetchHotelCityCodeList(cityListURL: string): Promise<any> {
    try {
     
      const username = "TBOStaticAPITest";
      const password = "Tbo@11530818";
  
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
     
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const response = await this.httpAPICall(cityListURL, headers);
 
      return response;

    } catch (error) {
      console.error('Error in fetchCityList:', error.message);
      throw (error.message || 'Failed to fetch the city list.');
    }
  }

  async fetchCityHotelDetails(baseurl: string, city_code:string): Promise<any> {
    try {
     
      const username = "TBOStaticAPITest";
      const password = "Tbo@11530818";
  
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
     
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        "CityCode": city_code,
        "IsDetailedResponse": "true"
      }

      const response = await this.httpPostAPICall(baseurl, payload, headers);

      return response;

    } catch (error) {
      console.error('Error in fetchCityList:', error.message);
      throw (error.message || 'Failed to fetch the city list.');
    }
  }


  async searchHotelFromTBO(body,base_url: string, token: string,
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

    
      const payload = {
          "CheckIn": "2024-06-20",
          "CheckOut": "2024-06-22",
          "HotelCodes": "1279415",
          "GuestNationality": body.country_code,
          "PaxRooms": [
              {
                  "Adults": adult_count,
                  "Children": child_count,
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
      };

    
      console.log('Request Payload: inside the http tbo');


      const response = await this.httpPostAPICall(base_url, body, {});;
      return response;
     
    } catch (error) {
      console.error('Error in searchHotelAPI:', error.message);
      throw (error.message || 'Failed to fetch hotel data.');
    }
  }



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
