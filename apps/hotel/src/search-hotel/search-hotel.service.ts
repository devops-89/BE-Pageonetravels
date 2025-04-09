import { Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
// import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelCountryRepositoryService } from "../../../../libs/database/src/repositories/hotelCountry.repository";
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';

@Injectable()
export class SearchHotelService {
  constructor(
    private readonly hotelTBOAPIService: HotelTBOAPIService,
    private readonly hotelCountryRepositoryService: HotelCountryRepositoryService,
    private readonly generateTokenService: GenerateTokenService,
    private readonly rediscacheservice: RedisCacheService,
  ) {}



  async searchCountry() {
    try {
      
      const country_list_from_cache = await this.rediscacheservice.getCache('CountryList') as string;
      
      if (country_list_from_cache) {
        return { message: "Country list sent successfully", data: JSON.parse(country_list_from_cache) };
      }
  
   
      const country_search_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList';
      
     
      const country_list = await this.hotelTBOAPIService.fetchCountryList(country_search_base_url);
      if(country_list.Status.Code === 200){
        await this.hotelCountryRepositoryService.createCountry(country_list.CountryList);
      }
      
      if (country_list && country_list.length) {
        await this.rediscacheservice.setCache('CountryList', JSON.stringify(country_list), 88000);
      }
     
      return {
        message: 'Country list fetched successfully',
        data: country_list,
      };
    } catch (error) {
     
      console.error('Error in searchCountry:', error.message || error);
      throw new Error(error.message || 'Failed to fetch the country list.');
    }
  }
  
  
  async searchCity(country_code) {
    try {
      
      const city_list_from_cache = await this.rediscacheservice.getCache('CityList') as string;
      
      if (city_list_from_cache) {
        return { message: "Country list sent successfully", data: JSON.parse(city_list_from_cache) };
      }
  
      const countryCodes = await this.hotelCountryRepositoryService.getCountryCode();
   
      const city_search_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList';
      
      const city_list = await this.hotelTBOAPIService.fetchCityList(city_search_base_url, countryCodes);
     
      if (city_list && city_list.length) {
        await this.rediscacheservice.setCache('CityList', JSON.stringify(city_list), 88000);
      }
  
      
      return { message: 'Country list fetched successfully',  data: city_list };

    } catch (error) {
      console.error('Error in searchCountry:', error.message || error);
      throw (error.message || 'Failed to fetch the country list.');
    }
  }

  async HotelDetails(body) {
    try {
      const {hotel_city_code} = body;

      const hotel_details_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/Hoteldetails';
      
      const hotel_details = await this.hotelTBOAPIService.fetchHotelDetails(hotel_details_base_url, hotel_city_code);
  
      return { message: 'Hotel Details fetched successfully',  data: hotel_details };

    } catch (error) {
      console.error('Error in searchCountry:', error.message || error);
      throw (error.message || 'Failed to fetch the country list.');
    }
  }

  async CityHotelDetails(body) {
    try {
      const {city_code} = body;

      const city_hotel_details = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
      
      const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details, city_code);
  
      return { message: 'Hotel Details fetched successfully',  data: hotel_details };

    } catch (error) {
      console.error('Error in searchCountry:', error.message || error);

      throw (error.message || 'Failed to fetch the country list.');
    }
  }


  async HotelCityCodeList() {
    try {
      
      const hotel_code_list = await this.rediscacheservice.getCache('HotelCityCodes') as string;
      
      if (hotel_code_list) {
        return { message: "Country list sent successfully", data: JSON.parse(hotel_code_list) };
      }

      const hotelcodelist_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/hotelcodelist';
      
     
      const code_list = await this.hotelTBOAPIService.fetchHotelCityCodeList(hotelcodelist_base_url);
  
     
      if (code_list && code_list.length) {
        await this.rediscacheservice.setCache('HotelCityCodes', JSON.stringify(code_list), 88000);
      }
  
     
      return { message: 'Hotel Code list fetched successfully',  data: code_list };

    } catch (error) {
      console.error('Error in searchCountry:', error.message || error);
      throw (error.message || 'Failed to fetch the country list.');
    }
  }

  async searchHotel(body) {
    try {
      console.log(body);
      // const {
      //   check_in_date, //Format: YYYY-MM-DD
      //   check_out_date,
      //   adult_count,
      //   child_count,
      //   EndUserIp,
      //   // country_code,
      //   // city,
      //   // no_of_rooms,
      //   // max_rating = 5, 
      //   // preferred_hotel_brand,
        
      // } = body;


      // if (adult_count < 1) {
      //   throw { message:'At least one adult is required.', statusCode: ERROR_CODES.BAD_REQUEST};
      // }

      // if (adult_count < child_count) {
      //   throw { message :'Number of adults should be greater than or equal to children.', statusCode:ERROR_CODES.BAD_REQUEST};
      // }

      // if (new Date(check_in_date) >= new Date(check_out_date)) {
      //   throw {message :'Check-out date must be after check-in date.', statusCode: ERROR_CODES.BAD_REQUEST};
      // }
      const hotelCodesinCity = [];
      const {token} = await this.generateTokenService.getToken(body.EndUserIp);
      const city_hotel_details = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
      const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details, body.HotelCodes);
      const hotelcodeArray = hotel_details.Hotels;
      if(hotelcodeArray != ""){
        for (const country of hotelcodeArray) {
          hotelCodesinCity.push(country.HotelCode)
        }
      }else if(hotelcodeArray == ""){
        throw { message: "No Hotel Found.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
      
      const hotel_search_base_url = "https://affiliate.tektravels.com/HotelAPI/Search";
      const responseFromTBO = await this.hotelTBOAPIService.searchHotelFromTBO(body, hotel_search_base_url, token,hotelCodesinCity);

      return { message :"Hotel Search List fetched successfully", data : responseFromTBO }

    } catch (error) {
      console.error('Error in searchHotel:', error);
      // throw ('Error during hotel search: ' + error.message);
      throw error;
    }
  }

}

  
