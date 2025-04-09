import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {  IHotelSearchPayload, IFareRule } from '../../libs/interfaces/hotel/search.interface';
import { HotelCountry } from '../../libs/interfaces/hotel/search.interface'; 
import { HotelCityRepositoryService } from '../../libs/database/src/repositories/hotelCity.repository';


@Injectable()
export class HotelTBOAPIService {
  constructor(
    private readonly hotelCityRepositoryService: HotelCityRepositoryService,
  ) {}

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
      console.error('Error in Axios API call:', error);
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
  
  
  async fetchCityList(cityListURL: string, countryCodes: any): Promise<any> {
    try {
      const username = "TBOStaticAPITest";
      const password = "Tbo@11530818";
  
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
      const responses = [];
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

     // Process each country code one by one
      for (const country of countryCodes) {
        const payload = {
          "CountryCode": country.code
        };
      
      try {
        const response = await this.httpPostAPICall(cityListURL, payload, headers);
        // if(response.Status === 200){
        //   console.log("sdf");
        //   await this.hotelCityRepositoryService.createCity(country.code,country.name,response.CityList);
        // }
        // console.log("start");
        // const savedata = await this.hotelCityRepositoryService.createCity(country.code,country.name,response.CityList);
        // console.log("kingsdfaaaaaaaaaaaaa",savedata);
        responses.push(response);
      } catch (error) {
        console.error(`Error fetching cities for country ${country.code}:`, error.message);
        // Continue with next country even if one fails
        continue;
      }
    }
     
      return responses;

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
      if(response.Status.Code === 500){
        throw { message: response.Status.Description, statusCode: response.Status.Code };
      }
      return response;

    } catch (error) {
      throw error
    }
  }

  // old function
  // async searchHotelFromTBO(body,base_url: string, token: string,hotelCodesinCity:any ) {
  //   try {

  //     const username = "Pageone";
  //     const password = "Pageone@1234";
  //     const credentials = Buffer.from(`${username}:${password}`).toString('base64');
     
  //     const headers = {
  //       'Authorization': `Basic ${credentials}`,
  //       'Content-Type': 'application/json',
  //     };

  //   const hotelCodes = Array.isArray(hotelCodesinCity) && hotelCodesinCity.length > 1 ? hotelCodesinCity.join(',') : hotelCodesinCity?.[0] ?? '';
  //     const payload = {
  //         "CheckIn": body.CheckIn,
  //         "CheckOut": body.CheckOut,
  //         "HotelCodes": hotelCodes,
  //         "GuestNationality": body.GuestNationality,
  //         "EndUserIp": body.EndUserIp,
  //         "PaxRooms": body.PaxRooms,
  //         "ResponseTime": body.ResponseTime,
  //         "IsDetailedResponse": body.IsDetailedResponse,
  //         "Filters": body.Filters
  //     };
     

  //     const response = await this.httpPostAPICall(base_url, body, headers);;
  //     return response;
     
  //   } catch (error) {
  //     console.error('Error in searchHotelAPI:', error.message);
  //     throw (error.message || 'Failed to fetch hotel data.');
  //   }
  // }
  async searchHotelFromTBO(body, base_url: string, token: string, hotelCodesinCity: any) {
    try {
      const username = "Pageone";
      const password = "Pageone@1234";
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };
  
      // Ensure hotelCodesinCity is an array
      const codesArray = Array.isArray(hotelCodesinCity) ? hotelCodesinCity : [];
  
      // Split into chunks of 100
      const chunkSize = 100;
      const chunks = [];
      for (let i = 0; i < codesArray.length; i += chunkSize) {
        chunks.push(codesArray.slice(i, i + chunkSize));
      }
  
      const allResponses = [];
  
      for (const chunk of chunks) {
        const hotelCodes = chunk.join(',');
        const payload = {
          CheckIn: body.CheckIn,
          CheckOut: body.CheckOut,
          HotelCodes: hotelCodes,
          GuestNationality: body.GuestNationality,
          EndUserIp: body.EndUserIp,
          PaxRooms: body.PaxRooms,
          ResponseTime: body.ResponseTime,
          IsDetailedResponse: body.IsDetailedResponse,
          Filters: body.Filters,
        };
  
        const response = await this.httpPostAPICall(base_url, payload, headers);
        allResponses.push(response);
      }
  
      return allResponses;
  
    } catch (error) {
      console.error('Error in searchHotelFromTBO:', error.message);
      throw error.message || 'Failed to fetch hotel data.';
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
