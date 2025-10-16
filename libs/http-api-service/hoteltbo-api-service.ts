import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {  IHotelSearchPayload, IFareRule } from '../../libs/interfaces/hotel/search.interface';
import { HotelCountry } from '../../libs/interfaces/hotel/search.interface'; 
import { HotelCityRepositoryService } from '../../libs/database/src/repositories/hotelCity.repository';
import { HotelDetailsRepositoryService } from "../../libs/database/src/repositories/hotelDetails.repository";
import { ERROR_CODES } from '../../libs/constants/commonConstants';
import { CommissionRepositoryService } from "../../libs/database/src/repositories/commission.repository";
import { COMMISSION_TYPE } from 'libs/constants/autenticationConstants/userContants';
import { HotelDetailDto } from 'libs/dtos/hotel/search-hotel.dto';


@Injectable()
export class HotelTBOAPIService {
  constructor(
    private readonly commissionRepositoryService: CommissionRepositoryService,
    private readonly hotelCityRepositoryService: HotelCityRepositoryService,
    private readonly hotelDetailsRepositoryService: HotelDetailsRepositoryService
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
      // console.log(">>>>>>>>>>",result.data);
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
     
      const username = "travelcategory";
      const password = "Tra@59334536";
  
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
    const username = "travelcategory";
    const password = "Tra@59334536";

    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };

    const responses = [];

    for (const country of countryCodes) {
      const payload = { CountryCode: country.code };

      try {
        const response = await this.httpPostAPICall(cityListURL, payload, headers);

        if (response.Status?.Code === 200 && response.CityList?.length) {
          // Save cities for this country
          await this.hotelCityRepositoryService.createCity(
            country.code,
            country.name,
            response.CityList
          );
        }

        responses.push(response);

      } catch (error) {
        console.error(`Error fetching cities for country ${country.code}:`, error.message);
        continue; // continue with next country
      }
    }

    return responses;

  } catch (error) {
    console.error('Error in fetchCityList:', error.message);
    throw new Error(error.message || 'Failed to fetch the city list.');
  }
}


  async fetchClientHotelDetails(body:HotelDetailDto){
    try{
        const username = "TBOStaticAPITest";
        const password = "Tbo@11530818";
  
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
     
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        "Hotelcodes": body.Hotelcodes, 
        "Language": body.Language 
      }
      
        const hotel_details_base_url = 'https://apiwr.tboholidays.com/HotelAPI/Hoteldetails';
      const response = await this.httpPostAPICall(hotel_details_base_url, payload ,headers);
     
      return response;

    }
    catch(error){
        console.log(">>>>>>",error);
      console.error('Error in fetchCityList:', error.message);
    }
  }

  async fetchHotelDetails(cityListURL: string, hotel_city_code:number): Promise<any> {
    try {
     
      const username = "travelcategory";
      const password = "Tra@59334536";
  
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
      console.log(hotel_city_code); 
      console.log(response.Status.Code);
      if(response.Status.Code === 200){
        await this.hotelDetailsRepositoryService.createDetails(response.HotelDetails[0].CountryName, response.HotelDetails[0].CountryCode, response.HotelDetails[0].CityId, response.HotelDetails);
      }
      return response;

    } catch (error) {
      console.log(">>>>>>",error);
      console.error('Error in fetchCityList:', error.message);
      // throw (error.message || 'Failed to fetch the city list.');
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
      // throw (error.message || 'Failed to fetch the city list.');
    }
  }

 async fetchCityHotelDetails(baseurl: string, city_code: string): Promise<any> {
  try {
    const username = "travelcategory";
    const password = "Tra@59334536";
    const credentials = Buffer.from(`${username}:${password}`).toString("base64");

    const headers = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };

    const payload = {
      CityCode: city_code, 
    };

    const response = await this.httpPostAPICall(baseurl, payload, headers);
    console.log("Hotel Code  TBO API Response: ",response);

    if (!response?.Status || response.Status.Code !== 200) {
      throw {
        message: response?.Status?.Description || "Hotel API failed",
        statusCode: response?.Status?.Code || 500,
      };
    }

    return response;
  } catch (error) {
    console.error("Error in fetchCityHotelDetails:", error.message || error);
    throw error;
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
  async searchHotelFromTBO(body, base_url: string, token: string, hotelCodesinCity: any,hotel_details:any) {
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
        if(response.Status.Code === 200){
          const hotelResult = response.HotelResult;
          hotelResult.forEach(function(hotelResult){
            const hotelCodeSearch = hotelResult.HotelCode
            const hotelDetails = hotel_details.Hotels;
            hotelDetails.forEach(function(hotelDetails){
              const hotelCode = hotelDetails.HotelCode;
              
              if(hotelCode === hotelCodeSearch){
                console.log("Match");
              hotelResult.HotelDetails = hotelDetails
              }
            })

          })
          console.log(">>>>>>>>>>>>>>>data of the Array",response.HotelResult);
        }
        
        allResponses.push(response);
      }
      console.log(">>>>>>>> hinitonso",allResponses.length);
      return allResponses;
    } catch (error) {
      console.error('Error in searchHotelFromTBO:', error.message);
      throw error.message || 'Failed to fetch hotel data.';
    }
  }

  async handlePreBook(url: string, data: string) {
    try {
      const username = "DELP574";
      const password = "Api@deL5-4@";
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };
      console.log(data);
      
      const payload = {
        "BookingCode": data
      };
      
      const response = await this.httpPostAPICall(url, payload, headers);
      if (!response?.HotelResult?.[0]?.HotelCode) {
        throw { message: "Invalid hotel response structure - missing HotelCode.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
      const hotel_details_base_url = 'https://apiwr.tboholidays.com/HotelAPI/Hoteldetails';
      const hotel_details = await this.fetchHotelDetails(
        hotel_details_base_url, 
        response.HotelResult[0].HotelCode
      );

      if (!hotel_details?.HotelDetails?.[0]) {
        throw { message: "Hotel Details Missing.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
      const CountryCode = hotel_details.HotelDetails[0].CountryCode;
      const commissionType = await this.commissionRepositoryService.getCommissionbytype(
        CountryCode === "IN" ? COMMISSION_TYPE.HOTEL_DOMESTIC : COMMISSION_TYPE.HOTEL_INTERNATIONAL
      );
      
      const hotelInfo = hotel_details.HotelDetails[0];
      response.HotelResult[0].HotelName = hotelInfo.HotelName;
      response.HotelResult[0].HotelAddress = hotelInfo.Address;
      response.HotelResult[0].HotelHotelRating = hotelInfo.HotelRating;
      response.COMMISSION  = commissionType;
      console.log(">>>>",response);
      return response;

    } catch(error) {
      console.log("Error in Pre Booking API", error);
      throw error;
    }
  }

  async hotelBook(url:string,data:any){
    try{
      const username = "DELP574";
      const password = "Api@deL5-4@";
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const payload = data;
      
      const response = await this.httpPostAPICall(url, payload, headers);
      return response;
    }catch(error){
      console.log(error);
      throw error;
    }
  }

  async hotelBookingDetails(url:string,data:any){
    try{
      const username = "DELP574";
      const password = "Api@deL5-4@";
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const payload = data;
      
      const response = await this.httpPostAPICall(url, payload, headers);
      return response;
    }catch(error){
      console.log(error);
      throw error;
    }
  }

async sendChangeRequest(
  BookingId: number,
  Remarks: string,
  ip_address: string,
  token: string,
) {
  try {
  
    const payload = {
      EndUserIp: ip_address,
      TokenId: token,
      BookingId,
      RequestType: 4, 
      BookingMode: 5,
      Remarks,
    };

    console.log("New cancellation payload:",payload);

    const url =
      'https://hotelbooking.travelboutiqueonline.com/HotelAPI_V10/HotelService.svc/rest/SendChangeRequest';

    // const response = await this.httpPostAPICall(url, payload, { headers });
    const response=await axios.post(url,payload);

    const result = response.data?.HotelChangeRequestResult;

  

    if (!result) {
      throw new Error('No response from TBO SendChangeRequest API');
    }

    return result;
  } catch (error: any) {
    console.error('Error in sendChangeRequest:', error.response?.data || error.message);
    throw error;
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
