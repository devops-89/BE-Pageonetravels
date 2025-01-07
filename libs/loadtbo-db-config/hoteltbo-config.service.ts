import {  HOTELDATA } from "libs/config/config.interface";
import { Injectable } from '@nestjs/common';
import { SettingRepositoryService } from "../../libs/database/src/repositories/setting.repository";
import { ConfigService } from "libs/config/config.service";

@Injectable()
export class HotelTBO_CredentialsService {
  constructor(
    private readonly settingRepo: SettingRepositoryService,
    private readonly configService: ConfigService
  ) { }

  async getSettingValues() {
    try {
      const result = await this.settingRepo.getFlightKeysAndValues();
      const hotelConfig = result.value as any;

      this.configService.setHotelTBOConfig({
        HOTEL_AUTHENTICATION: hotelConfig.HOTEL_AUTHENTICATION,
        HOTEL_SEARCH:hotelConfig.HOTEL_SEARCH,
    


        HOTEL_CLIENT_ID: hotelConfig.HOTEL_CLIENT_ID,
        HOTEL_USERNAME: hotelConfig.HOTEL_USERNAME,
        HOTEL_PASSWORD: hotelConfig.HOTEL_PASSWORD,
        HOTEL_ENDUSERIP: hotelConfig.HOTEL_ENDUSERIP,
      })

      console.log('Configuration updated successfully');

    } catch (error) {
      console.log("Error in the getSettingValues from database", error);
      throw error;
    }
  }

  async getHotelTBOCredentials() {
    try {
      const tboConfig = this.configService.get().HOTELTBO_CREDENTIALS;
      return tboConfig as HOTELDATA;

    } catch (error) {
      console.log(error);
      throw error
    }
  }
}
