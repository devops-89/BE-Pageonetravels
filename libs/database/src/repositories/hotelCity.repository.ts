import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HotelCity } from "../entities";

@Injectable()
export class HotelCityRepositoryService {

    constructor(
            @InjectRepository(HotelCity)
            private readonly hotelCityRepository: Repository<HotelCity>,
      ) { }
    
    async createCity(countrycode:string,countryname:string,response:any){
        console.log("abced",countrycode)
        console.log("abced",countryname)
        console.log("abced",response)
        const countries = response.map(item => ({
            country_code : countrycode,
            country_name : countryname,
            city_name: item.Name,
            city_code: item.Code,
        }));

        return this.hotelCityRepository.save(countries);

    }

}