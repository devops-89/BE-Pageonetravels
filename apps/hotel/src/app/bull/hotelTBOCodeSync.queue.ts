import { Processor, Process } from "@nestjs/bull";
import { SearchHotelService } from "../../search-hotel/search-hotel.service";

@Processor("sync-hotel-codes")
export class HotelTBOCodeSyncProcessor {
  constructor(private readonly searchHotelService: SearchHotelService) {}

  @Process()
  async handleHotelTBOCodeSync() {
    console.log("🔄 Starting Hotel TBO Code Sync Job...");

    try {
      // Call the service and get summary
      const result = await this.searchHotelService.syncHotelTBOCodeData();

      if (result.synced > 0) {
        console.log(`✅ Hotel TBO codes synced successfully. Total synced: ${result.synced}`);
      } else {
        console.warn("⚠️ No hotel codes were synced.");
      }

      console.log(
        `📊 Summary: Synced: ${result.synced}, Skipped: ${result.skipped}, Failed: ${result.failed}`
      );

      if (result.failedCities.length) {
        console.log(`❌ Failed cities: ${result.failedCities.join(', ')}`);
      }
    } catch (error) {
      console.error("❌ Error during Hotel TBO Code Sync:", error?.message || error);
    } finally {
      console.log("🏁 Completed Hotel TBO Code Sync Job.");
    }
  }
}
