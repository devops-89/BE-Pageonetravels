import { Processor, Process } from "@nestjs/bull";
import { SearchHotelService } from "../../search-hotel/search-hotel.service";

@Processor("sync-hotel-details-table")
export class HotelDetailSyncProcessor {
    constructor(private readonly searchHotelService: SearchHotelService) {}

    @Process()
    async handleHotelDetailSync() {
        console.log("🔄 Starting Hotel Detail Sync Job...");

        try {
            // Call the service and get summary
            const result = await this.searchHotelService.syncAutoHotelDetail();

            if (result.synced > 0) {
                console.log(`✅ Hotel details synced successfully. Total synced: ${result.synced}`);
            } else {
                console.warn("⚠️ No hotel details were synced.");
            }

            console.log(
                `📊 Summary: Synced: ${result.synced}, Failed: ${result.failed}`
            );

            if (result.failedHotels?.length) {
                console.log(`❌ Failed hotels: ${result.failedHotels.join(", ")}`);
            }
        } catch (error) {
            console.error("❌ Error during Hotel Detail Sync:", error?.message || error);
        } finally {
            console.log("🏁 Completed Hotel Detail Sync Job.");
        }
    }
}
