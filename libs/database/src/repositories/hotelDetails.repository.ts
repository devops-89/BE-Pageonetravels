import { Injectable } from "@nestjs/common";
import { HotelDetails } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class HotelDetailsRepositoryService {
    constructor(
        @InjectRepository(HotelDetails)
        private readonly hotelDetailsRepository: Repository<HotelDetails>,
    ) { }

    async createDetails(
        countryname: string,
        countrycode: string,
        hotel_city_code: string,
        hoteldetails: any
    ) {
        // Check if any required field is empty or undefined
        if (
            !countryname ||
            !countrycode ||
            !hotel_city_code ||
            !hoteldetails?.[0]?.HotelCode ||
            !hoteldetails
        ) {
            
        }
    
        const details = {
            country_name: countryname,
            country_code: countrycode,
            city_code: hotel_city_code,
            hotel_code: hoteldetails[0].HotelCode,
            hotel_details: hoteldetails
        };
    
        return await this.hotelDetailsRepository.save(details);
    }
    

    async fetchcity() {
        try {
            // Using query builder for maximum flexibility
            const distinctCities = await this.hotelDetailsRepository
                                    .createQueryBuilder('hotel')
                                    .select('DISTINCT(hotel.city_code)', 'city_code')
                                    .where('hotel.city_code != :empty', { empty: '' })  // Exclude empty strings
                                    .andWhere('hotel.city_code != :zero', { zero: '0' }) // Exclude '0' values
                                    .andWhere('hotel.city_code IS NOT NULL') // Exclude NULL values if needed
                                    .orderBy('city_code', 'ASC')
                                    .getRawMany();
    
            return distinctCities.map(item => item.city_code);
            
        } catch (error) {
            throw new Error(`Failed to fetch distinct cities: ${error.message}`);
        }
    }

    async fetchDetails(city:string){ 
        const hotels = await this.hotelDetailsRepository.find({
            where: { city_code: city },
            select: [
                "hotel_details"
            ]
        });

        return hotels;

    }


}