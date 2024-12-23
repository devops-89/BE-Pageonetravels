import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Airport } from "../entities";
import { IFlightSearch } from "../../../../libs/interfaces/flight/search.interface";
@Injectable()
export class SearchRepositoryService{
    constructor(
        @InjectRepository(Airport)
        private readonly airportRepository: Repository<Airport>
    ){}


    async searchAirport(search_query:string):Promise<Airport[]>{
        try {
            const airport_list = await this.airportRepository
                    .createQueryBuilder('airport')
                    .where("airport.airport_name LIKE :search", { search: `${search_query}%` })
                    .orWhere("airport.iata_code LIKE :search", { search: `${search_query}%` })
                    .orWhere("airport.city_name LIKE :search", { search: `${search_query}%` })
                    .getMany();
          
            return airport_list;
        }catch(error){
            console.log("Error in the search airport query", error)
            throw error
        }
    }

    // async searcflight( body: IFlightSearch){
    //     try{

    //     }catch(error){

    //     }
    // }
    // async findAllAirports(): Promise<{ message: string; success: boolean; data: Airport[] }> {
    //     try {
    //         const expirationTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    //         let airportList = await this.cacheManager.get('airportList') as any;

    //         if (!airportList) {
    //             let airportdata = await this.AirportModel.find();

    //             await this.cacheManager.set('airportList', airportdata, expirationTime);

    //             return { message: 'Airport Codes searched Successfully', success: true, data: airportdata };
    //         }
    //         return { message: 'Airport Codes searched Successfully', success: true, data: airportList };
            
    //     } catch (err) {
    //         console.log(err);
    //         throw new InternalServerException('Internal Server Error')
    //     }

    // }

}