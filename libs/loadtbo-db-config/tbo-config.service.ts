import { FLIGHTDATA } from "../../libs/config/config.interface";
import { Injectable } from '@nestjs/common';
import { SettingRepositoryService } from "../../libs/database/src/repositories/setting.repository";
import { ConfigService } from "../../libs/config/config.service";

@Injectable()
export class TBO_CredentialsService {
  constructor(
    private readonly settingRepo: SettingRepositoryService,
    private readonly configService: ConfigService
  ) {}


    async getSettingValues(){
        try {
          const result = await this.settingRepo.getFlightKeysAndValues();
          const flightConfig = result.value as any;
          const hotel_result = await this.settingRepo.getHotelKeysAndValues();
          const hotelConfig = hotel_result.value as any

            this.configService.setTBOConfig({
            FLIGHT_AUTHENTICATION : flightConfig.FLIGHT_AUTHENTICATION,
            FLIGHT_SEARCH : flightConfig.FLIGHT_SEARCH,
            FLIGHT_FARERULE : flightConfig.FLIGHT_FARERULE,
            FLIGHT_FAREQUOTE : flightConfig.FLIGHT_FAREQUOTE,
            FLIGHT_SSR: flightConfig.FLIGHT_SSR,
            FLIGHT_BOOKING_API_FORNONLCC : flightConfig.FLIGHT_BOOKING,
            FLIGHT_TICKET_FORLCC : flightConfig.FLIGHT_TICKET,
            FLIGHT_BOOKING_DETAILS : flightConfig.FLIGHT_BOOKING_DETAILS,
            FLIGHT_CALENDER_DETAILS : flightConfig.FLIGHT_CALENDER_DETAILS,
            FLIGHT_GET_CANCELLATION_CHARGES: flightConfig.FLIGHT_GET_CANCELLATION_CHARGES,
    
    
            FLIGHT_CLIENT_ID :  flightConfig.FLIGHT_CLIENT_ID,
            FLIGHT_USERNAME :  flightConfig.FLIGHT_USERNAME,
            FLIGHT_PASSWORD : flightConfig.FLIGHT_PASSWORD,
            FLIGHT_ENDUSERIP : flightConfig.FLIGHT_ENDUSERIP,
            
            HOTEL_SEARCH : hotelConfig.HOTEL_SEARCH,
            HOTEL_INFO : hotelConfig.HOTEL_INFO,
            HOTEL_ROOM_INFO : hotelConfig.HOTEL_ROOM_INFO,
            HOTEL_BLOCK_ROOM :  hotelConfig.HOTEL_BLOCK_ROOM,
            COUNTRY_SEARCH :  hotelConfig.COUNTRY_SEARCH,
            CITY_SEARCH :   hotelConfig.CITY_SEARCH,
            HOTEL_BOOK : hotelConfig.HOTEL_BOOK,
            HOTEL_BOOKING_DETAILS : hotelConfig.HOTEL_BOOKING_DETAILS,
            GET_HOTELSTATICDATA : hotelConfig.GET_HOTELSTATICDATA,
 
      })

      console.log('Configuration updated successfully');

    } catch (error) {
      console.log("Error in the getSettingValues from database", error);
      throw error;
    }
  }


  async getTBOCredentials() {
    try {
      const tboConfig = this.configService.get().TBO_CREDENTIALS;
      return tboConfig as FLIGHTDATA;

    } catch (error) {
      console.log(error);
      throw error
    }
  }
}