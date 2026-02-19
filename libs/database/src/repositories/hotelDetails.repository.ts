import { Injectable } from "@nestjs/common";
import { HotelDetails, HotelRatingEnum } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class HotelDetailsRepositoryService {
    constructor(
        @InjectRepository(HotelDetails)
        private readonly hotelDetailsRepository: Repository<HotelDetails>,
    ) { }

    // saving multiple hotelDetails of multiple hotel Codes
    async saveHotelDetailsList(apiResponse: any): Promise<HotelDetails[]> {
        const hotels = apiResponse?.HotelDetails || [];

        if (!Array.isArray(hotels) || hotels.length === 0) {
            throw new Error("HotelDetails array is empty or invalid");
        }

        const results = [];

        for (const hotelData of hotels) {
            const saved = await this.saveSingleHotel(hotelData);
            results.push(saved);
        }

        return results;
    }

    //  now this method saves a single hotel record
    private async saveSingleHotel(hotelData: any): Promise<HotelDetails> {
        const {
            HotelCode,
            HotelName,
            Description,
            HotelFacilities,
            Attractions,
            Image,
            Images,
            RoomID,
            Address,
            PinCode,
            CityId,
            CityName,
            CountryName,
            CountryCode,
            PhoneNumber,
            FaxNumber,
            HotelRating,
            Map,
            CheckInTime,
            CheckOutTime,
        } = hotelData;

        const ratingEnum: HotelRatingEnum =
            Number(HotelRating) >= 1 && Number(HotelRating) <= 5
                ? (Number(HotelRating) as HotelRatingEnum)
                : null;

        const payload: Partial<HotelDetails> = {
            hotelCode: String(HotelCode),
            hotelName: HotelName || null,
            description: Description || null,
            hotelFacilities: HotelFacilities || [],
            attractions: Attractions || null,
            image: Image || null,
            images: Images || [],
            roomIds: RoomID || [],
            address: Address || null,
            pinCode: PinCode || null,
            cityId: CityId || null,
            cityName: CityName || null,
            countryName: CountryName || null,
            countryCode: CountryCode || null,
            phoneNumber: PhoneNumber || null,
            faxNumber: FaxNumber || null,
            hotelRating: ratingEnum,
            map: Map || null,
            checkInTime: CheckInTime || null,
            checkOutTime: CheckOutTime || null,
        };

        // UPSERT by hotelCode
        let existing = await this.hotelDetailsRepository.findOne({
            where: { hotelCode: HotelCode },
        });


        if (existing) {
            this.hotelDetailsRepository.merge(existing, payload);
            return await this.hotelDetailsRepository.save(existing);
        } else {
            const created = this.hotelDetailsRepository.create(payload);
            return await this.hotelDetailsRepository.save(created);
        }
    }

//     single hotelCode hotelDetail Search using hotelCode
    async getHotelDetailByCode(hotelCode: string): Promise<HotelDetails | null> {
        return this.hotelDetailsRepository.findOne({
            where: { hotelCode },
        });
    }

    /**
     * Clear all hotel details from the table
     */
    async clearAll(): Promise<void> {
        await this.hotelDetailsRepository.clear();
        console.log("🗑️ Cleared all hotel details from the table.");
    }



}
