import { Injectable } from "@nestjs/common";
import { HotelCountry } from "../entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Country } from '../../../../libs/interfaces/hotel/search.interface'; 
import { Repository } from "typeorm";

@Injectable()
export class HotelCountryRepositoryService {

    constructor(
            @InjectRepository(HotelCountry)
            private readonly hotelCountryRepository: Repository<HotelCountry>,
      ) { }
    
    async createCountry(data:Country[]){
            await this.hotelCountryRepository.clear();
            // Transform and save the data
            const countries = data.map(item => ({
                    code: item.Code,
                    name: item.Name,
                }));
            return this.hotelCountryRepository.save(countries);
    }

    async getCountryCode(){
        const countries = await this.hotelCountryRepository.find({
            select: ['code','name']  
        });
        console.log("sd",countries);
        return countries;
    }

}