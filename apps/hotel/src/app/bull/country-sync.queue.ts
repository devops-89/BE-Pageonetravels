import {Processor , Process} from "@nestjs/bull";


import { SearchHotelService } from "../../search-hotel/search-hotel.service";

@Processor("sync-country")
export class CountrySyncProcessor{

    constructor(private readonly searchHotelService:SearchHotelService){}

    @Process()
    async handleCountrySync(){
  console.log('🔄 Syncing country list...');
  await this.searchHotelService.syncCountryData();
  console.log("Country List Synced.");
    }

}