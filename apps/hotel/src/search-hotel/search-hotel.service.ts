import { Inject, Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
// import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelCountryRepositoryService } from "../../../../libs/database/src/repositories/hotelCountry.repository";
import { CommissionRepositoryService } from "../../../../libs/database/src/repositories/commission.repository";
import { HotelDetailsRepositoryService } from "../../../../libs/database/src/repositories/hotelDetails.repository";
import { HotelCityRepositoryService } from "../../../../libs/database/src/repositories/hotelCity.repository";
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { COMMISSION_TYPE } from '../../../../libs/constants/autenticationConstants/userContants';
import { CreateHotelBookingDto ,CreateBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';

@Injectable()
export class SearchHotelService {
  constructor(
    private readonly hotelTBOAPIService: HotelTBOAPIService,
    private readonly commissionRepositoryService: CommissionRepositoryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly hotelCountryRepositoryService: HotelCountryRepositoryService,
    private readonly hotelDetailsRepositoryService: HotelDetailsRepositoryService,
    private readonly hotelCityRepositoryService: HotelCityRepositoryService,
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
      throw new Error(error.message || 'Failed to fetch the country list.');
    }
  }

  async HotelDetails(body) {
    try {
      const {hotel_city_code} = body;

      const hotelcodelist_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/hotelcodelist';
      const code_list = await this.hotelTBOAPIService.fetchHotelCityCodeList(hotelcodelist_base_url);
      console.log(">>>>>>",code_list);
      
      const hotelDetailsList = [];
      for (const city of code_list.HotelCodes) { 
        const hotel_details_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/Hoteldetails';
        const hotel_details = await this.hotelTBOAPIService.fetchHotelDetails(hotel_details_base_url, city);
        console.log(">>>>>>>>>>> >>>> >",hotel_details);
        hotelDetailsList.push(hotel_details);
      }
  
      return { message: 'Hotel Details fetched successfully',  data: hotelDetailsList };

    } catch (error) {
      console.error('Error in HotelDetails:', error.message || error);
      throw new Error(error.message || 'Failed to fetch the hotel details.');
    }
  }

  async CityHotelDetails(body) {
    try {
      const {city_code} = body;

      const city_hotel_details = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
      
      const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details, city_code);
  
      return { message: 'Hotel Details fetched successfully',  data: hotel_details };

    } catch (error) {
      console.error('Error in CityHotelDetails:', error.message || error);
      throw new Error(error.message || 'Failed to fetch the city hotel details.');
    }
  }

  async HotelCityCodeList() {
    try {
      const hotel_code_list = await this.rediscacheservice.getCache('HotelCityCodes') as string;
      
      if (hotel_code_list) {
        return { message: "Hotel city codes sent successfully", data: JSON.parse(hotel_code_list) };
      }

      const hotelcodelist_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/hotelcodelist';
      
      const code_list = await this.hotelTBOAPIService.fetchHotelCityCodeList(hotelcodelist_base_url);
  
      if (code_list && code_list.length) {
        await this.rediscacheservice.setCache('HotelCityCodes', JSON.stringify(code_list), 88000);
      }
  
      return { message: 'Hotel Code list fetched successfully',  data: code_list };

    } catch (error) {
      console.error('Error in HotelCityCodeList:', error.message || error);
      throw new Error(error.message || 'Failed to fetch the hotel city code list.');
    }
  }

  async searchHotel(body) {
    try {
      const allResponses = [];
      const city_hotel_details = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
      const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details, body.CityCodes);
      const { CountryCode } = hotel_details.Hotels[0];
      const commissionType = await this.commissionRepositoryService.getCommissionbytype(
        CountryCode === "IN" ? COMMISSION_TYPE.HOTEL_DOMESTIC : COMMISSION_TYPE.HOTEL_INTERNATIONAL
      );
      const hotel_code = hotel_details.Hotels.map(hotel => hotel.HotelCode);
      
      const chunksArray = this.createAChunkArray(hotel_code, 80);
   
      for (const chunk of chunksArray) {
        const promises = chunk.map(async (hotelCode) => {
          const payload = {
            CheckIn: body.CheckIn,
            CheckOut: body.CheckOut,
            HotelCodes: hotelCode,
            GuestNationality: body.GuestNationality,
            EndUserIp: body.EndUserIp,
            PaxRooms: body.PaxRooms,
            ResponseTime: body.ResponseTime,
            IsDetailedResponse: body.IsDetailedResponse,
            Filters: body.Filters,
          };

          return await this.fetchHotelData(payload);
        });

        const results = await Promise.allSettled(promises);

      
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value?.Status?.Code === 200) {
            let [HD] = result.value.HotelResult.map(code => hotel_details.Hotels.filter(find => find.HotelCode == code.HotelCode))
            allResponses.push({
              ...result.value.HotelResult[0], 
              ...HD[0]
            })
          }
        });
      }
      
      // allResponses.COMMISSION = commissionType;
      // console.log(allResponses);
      return { message :"Hotel Search List fetched successfully", data : allResponses,commission: commissionType }; 

    } catch (error) {
      console.error('Error in searchHotel:', error);
      throw error;
    }
  }

  async preBook(body){
    try{
      const hotel_prebook_url = "https://affiliate.tektravels.com/HotelAPI/PreBook";
      const data = body.BookingCode;
      const response = await this.hotelTBOAPIService.handlePreBook(hotel_prebook_url,data);
      return { message :"Hotel Pre Book fetched successfully", data : response };
    }catch(error){
      console.log("Error in PreBook",error);
      throw error;
    }
  }

  async getCitylist() {
    const CACHE_KEY = "cityData";
    
    try {
      const cachedCities = await this.cacheManager.get(CACHE_KEY);
      
      if (cachedCities) {
        console.log("Returning data from Redis cache");
        return {
          message: "Hotel City list fetched successfully from cache",
          data: cachedCities
        };
      }
  
      console.log("Data not in cache - fetching from database");
      const freshData = await this.hotelCityRepositoryService.getAllCities();
      
      await this.cacheManager.set(CACHE_KEY, freshData);
      
      return {
        message: "Hotel City list fetched successfully from database",
        data: freshData
      };
      
    } catch (error) {
      console.error("Error in getCitylist:", error);
      throw error;
    }
  }

  async fetchDetails(){
    try{
      const citylist = await this.hotelDetailsRepositoryService.fetchcity();
      console.log(citylist);
      for (const cityCode of citylist) { 
          const hotelcityDetails = await this.hotelDetailsRepositoryService.fetchDetails(cityCode); 
          await this.cacheManager.set(cityCode, hotelcityDetails);
          console.log("stored data in cache database",cityCode);
      }

      return { message :"Hotel Details set successfully", data : citylist };
    }catch(error){
      console.log(error);
      throw error;
    }
  }

  async bookingHotel(body:CreateHotelBookingDto){
    try{ 
      console.log(">>>",body);
      const order_type = "HOTEL";
            const amount = 10;
            const is_LCC = "";
            const journey = "";
            const journey_type = "";
            const commissionType : {
              commission_type: "FIXED",
              percentage:5
            }
            
      await this.orderRepository.insertBooking(reference_id,order_type,body,amount,is_LCC,journey,journey_type,commissionType.commission_type,commissionType.percentage);
      
      // const url = 'https://HotelBE.tektravels.com/hotelservice.svc/rest/book/';
      // const result = await this.hotelTBOAPIService.hotelBook(url,body);
      return ;
    }catch(error){
      console.log(error);
      throw error;
    }
  }

  async bookingDetails(body:CreateBookingDto){
    try{
      const url = "http://HotelBE.tektravels.com/internalhotelservice.svc/rest/GetBookingDetail";
      const result = await this.hotelTBOAPIService.hotelBookingDetails(url,body);
      return result;
    }catch(error){
      console.log(error);
      throw error;
    }
  }

 createAChunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  async fetchHotelData(payload) {
    try {
      const username = "Pageone";
      const password = "Pageone@1234";
      const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };

      const baseURL = "https://affiliate.tektravels.com/HotelAPI/Search";

      const config = { headers };
      const result = await axios.post(baseURL,payload, config);
      return result.data;

    } catch (error) {
      console.error(`Error fetching data for ${payload.HotelCodes}:`, error.message);
      throw error;
    }
  }
}