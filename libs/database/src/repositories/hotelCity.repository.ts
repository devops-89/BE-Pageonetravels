import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HotelCity } from '../entities';

@Injectable()
export class HotelCityRepositoryService {
    constructor(
        @InjectRepository(HotelCity)
        private readonly hotelCityRepository: Repository<HotelCity>
    ) {}

    async createCity(countryCode: string, countryName: string, response: any) {
        const cities = response.map((item) => ({
            country_code: countryCode,
            country_name: countryName,
            city_name: item.Name,
            city_code: item.Code,
        }));

        // Using upsert to ignore duplicates based on city_code
        return this.hotelCityRepository
            .createQueryBuilder()
            .insert()
            .into(HotelCity)
            .values(cities)
            .orIgnore() // skips inserting if city_code already exists
            .execute();
    }

    async getAllUniqueCities(): Promise<Partial<HotelCity>[]> {
        return this.hotelCityRepository
            .createQueryBuilder('city')
            .select(['city.country_code', 'city.country_name', 'city.city_name', 'city.city_code'])
            .distinctOn(['city.city_code'])
            .orderBy('city.city_code', 'ASC')
            .getRawMany();
    }

    async getAllCities(): Promise<Partial<HotelCity>[]> {
        return this.hotelCityRepository.find({
            select: ['country_code', 'country_name', 'city_name', 'city_code'],
        });
    }

    async getCityByCode(city_code: string): Promise<HotelCity | null> {
        return this.hotelCityRepository.findOne({
            where: { city_code },
        });
    }

    //   this method is used to get the filtered cities according to query
    async searchCities(query: string): Promise<Partial<HotelCity>[]> {
        // return top 20 default cities if no query
        if (!query) {
            return this.hotelCityRepository.find({
                select: ['country_code', 'country_name', 'city_code', 'city_name'],
                take: 20,
            });
        }



        return this.hotelCityRepository
            .createQueryBuilder('city')
            .select([ 'city.city_code AS city_code', 'city.city_name AS city_name','city.country_name AS country_name'])
            .where('LOWER(city.city_name) LIKE :q', { q: `%${query.toLowerCase()}%` })
            .orWhere('LOWER(city.country_name) LIKE :q', { q: `%${query.toLowerCase()}%` })
            .orWhere('LOWER(city.country_code) LIKE :q', { q: `%${query.toLowerCase()}%` })
          .limit(100)
          .getRawMany();
    }
}
