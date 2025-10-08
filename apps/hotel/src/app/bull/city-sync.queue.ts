import {Processor , Process} from "@nestjs/bull";


import { SearchHotelService } from "../../search-hotel/search-hotel.service";

@Processor("sync-city")
export class CitySyncProcessor{
    constructor(private readonly searchHotelService: SearchHotelService){}

    @Process()
    async handleCitySync(){
         console.log('🔄 Syncing city list...');
         await this.searchHotelService.syncCityData();
          console.log('✅ City list synced');
    }
}