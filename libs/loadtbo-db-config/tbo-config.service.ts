import { FLIGHTDATA } from "libs/config/config.interface";
import { Injectable } from '@nestjs/common';
import { SettingRepositoryService } from "../../libs/database/src/repositories/setting.repository";
import { ConfigService } from "libs/config/config.service";

@Injectable()
export class TBO_CredentialsService {
    constructor(
        private readonly settingRepo: SettingRepositoryService,
        private readonly configService: ConfigService
    ){}

    async getSettingValues(){
        try {
              console.log("I am inside the getSettingValues");
          const result = await this.settingRepo.getFlightKeysAndValues();
          const flightConfig = result.value as any;

            this.configService.setTBOConfig({
            FLIGHT_AUTHENTICATION : flightConfig.FLIGHT_AUTHENTICATION,
            FLIGHT_SEARCH : flightConfig.FLIGHT_SEARCH,
            FLIGHT_FARERULE : flightConfig.FLIGHT_FARERULE,
            FLIGHT_FAREQUOTE : flightConfig.FLIGHT_FAREQUOTE,
            FLIGHT_BOOKING : flightConfig.FLIGHT_BOOKING,
            FLIGHT_TICKET : flightConfig.FLIGHT_TICKET,
            FLIGHT_BOOKING_DETAILS : flightConfig.FLIGHT_BOOKING_DETAILS,
            FLIGHT_CALENDER_DETAILS : flightConfig.FLIGHT_CALENDER_DETAILS,
    
    
            FLIGHT_CLIENT_ID :  flightConfig.FLIGHT_CLIENT_ID,
            FLIGHT_USERNAME :  flightConfig.FLIGHT_USERNAME,
            FLIGHT_PASSWORD : flightConfig.FLIGHT_PASSWORD,
            FLIGHT_ENDUSERIP : flightConfig.FLIGHT_ENDUSERIP,
          })

        console.log('Configuration updated successfully');

        }catch(error){
          console.log("Error in the getSettingValues from database", error);
          throw error;
        }
    }

    async getTBOCredentials(){
        try {
            
          // const result = await this.settingRepo.getFlightKeysAndValues();
          // const flightConfig = result.value as any;

          //   this.configService.setTBOConfig({
          //   FLIGHT_AUTHENTICATION : flightConfig.FLIGHT_AUTHENTICATION,
          //   FLIGHT_SEARCH : flightConfig.FLIGHT_SEARCH,
          //   FLIGHT_FARERULE : flightConfig.FLIGHT_FARERULE,
          //   FLIGHT_FAREQUOTE : flightConfig.FLIGHT_FAREQUOTE,
          //   FLIGHT_BOOKING : flightConfig.FLIGHT_BOOKING,
          //   FLIGHT_TICKET : flightConfig.FLIGHT_TICKET,
          //   FLIGHT_BOOKING_DETAILS : flightConfig.FLIGHT_BOOKING_DETAILS,
          //   FLIGHT_CALENDER_DETAILS : flightConfig.FLIGHT_CALENDER_DETAILS,
    
    
          //   FLIGHT_CLIENT_ID :  flightConfig.FLIGHT_CLIENT_ID,
          //   FLIGHT_USERNAME :  flightConfig.FLIGHT_USERNAME,
          //   FLIGHT_PASSWORD : flightConfig.FLIGHT_PASSWORD,
          //   FLIGHT_ENDUSERIP : flightConfig.FLIGHT_ENDUSERIP,
          // })

        // console.log('Configuration updated successfully');

          const tboConfig = this.configService.get().TBO_CREDENTIALS;
          return tboConfig as FLIGHTDATA;

        }catch(error){
            console.log(error);
            throw error
        }
    }

}