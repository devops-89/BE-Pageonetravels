import { Processor, Process } from "@nestjs/bull";
import { SearchHotelService } from "../../search-hotel/search-hotel.service";

@Processor("sync-hotel-code-table")
export class HotelCodeTableSyncProcessor {
  constructor(private readonly searchHotelService: SearchHotelService) {}

  @Process()
  async handleHotelCodeTableSync() {
    console.log('🔄 Starting Hotel Code Table Sync Job...');

    try {
      // Call the service and get summary
      const result = await this.searchHotelService.syncHotelCodeData();

      if (result.synced > 0) {
        console.log(`✅ Hotel codes synced successfully. Total synced: ${result.synced}`);
      } else {
        console.warn("⚠️ No hotel codes were synced.");
      }

      console.log(
        `📊 Summary: Synced: ${result.synced}, Skipped: ${result.skipped}, Failed: ${result.failed}`
      );


    } catch (error) {
      console.error("❌ Error during Hotel Code Table Sync:", error?.message || error);
    } finally {
      console.log("🏁 Completed Hotel Code Table Sync Job.");
    }
  }
}
