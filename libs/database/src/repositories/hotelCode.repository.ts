import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelCode } from '../entities';

@Injectable()
export class HotelCodeRepositoryService {
    constructor(
        @InjectRepository(HotelCode)
        private hotelCodeRepository: Repository<HotelCode>
    ) {}

    async saveOne(city, hotel) {
        const record = this.hotelCodeRepository.create({
            hotelCode: hotel.HotelCode,
            hotelName: hotel.HotelName,
            hotelRating: hotel.HotelRating,
            address: hotel.Address,
            attractions: hotel.Attractions,
            countryName: hotel.CountryName,
            countryCode: hotel.CountryCode,
            description: hotel.Description,
            faxNumber: hotel.FaxNumber,
            hotelFacilities: hotel.HotelFacilities,
            cityCode: city.city_code,
        });

        await this.hotelCodeRepository
            .createQueryBuilder()
            .insert()
            .into(HotelCode)
            .values(record)   // <-- FIXED HERE
            .orUpdate(
                [
                    'hotelName',
                    'address',
                    'hotelRating',
                    'countryName',
                    'countryCode',
                    'cityCode'
                ],
                ['hotelCode']
            )
            .execute();
    }

    async saveAllOneByOne(city, hotels: any[]) {
        for (const hotel of hotels) {
            await this.saveOne(city, hotel);
        }
    }

    async searchHotels(query:string):Promise<Partial<HotelCode>[]>{
        const q=`%${query.toLowerCase()}%`;
        return this.hotelCodeRepository.createQueryBuilder('hotel')
            .select([
                'hotel.hotelCode AS "hotelCode"',
                'hotel.cityCode AS "cityCode"',
                'hotel.countryName AS "countryName"',
                'hotel.hotelName AS "hotelName"'
            ])
            .where('LOWER(hotel.hotelName) LIKE :q',{q})
            .orWhere('LOWER(hotel.address) LIKE :q',{q})
          .limit(100)
            .getRawMany();
    }

    async countByCity(cityCode: number) {
        return this.hotelCodeRepository.count({ where: { cityCode } });
    }

    async deleteByCityCode(cityCode: number) {
        return this.hotelCodeRepository.delete({ cityCode });
    }

    /**
     * Clear all hotelCode  from the hotelCode table
     */
    async clearAll(): Promise<void> {
        await this.hotelCodeRepository.clear();
        console.log("🗑️ Cleared all hotelCode from the hotelCode table.");
    }
}
