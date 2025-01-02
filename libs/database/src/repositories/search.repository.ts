import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Airport } from "../entities";
import { AirportType, IFlightSearch } from "../../../../libs/interfaces/flight/search.interface";
import XLSX from "xlsx";
@Injectable()
export class SearchRepositoryService {
    constructor(
        @InjectRepository(Airport)
        private readonly airportRepository: Repository<Airport>
    ) { }


    async searchAirport(page?:number, pageSize?:number ,search_query?:string):Promise<Airport[]>{
        try {

            if(!page && !pageSize){
                page = 1,
                pageSize = 1000
            }

            if(search_query){
                const airport_list = await this.airportRepository
                    .createQueryBuilder('airport')
                    .where("airport.airport_name LIKE :search", { search: `${search_query}%` })
                    .orWhere("airport.iata_code LIKE :search", { search: `${search_query}%` })
                    .orWhere("airport.city_name LIKE :search", { search: `${search_query}%` })
                    .getMany();

                return airport_list;
            }

            const airport_list = await this.airportRepository
                    .createQueryBuilder('airport')
                    .getMany();

            return airport_list;

        }catch(error){
            console.log("Error in the search airport query", error)
            throw error
        }
    }

    async paginate(data, page: number, pageSize: number) {
        try {
            const offset = (page - 1) * pageSize;
            const paginatedData = data.slice(offset, offset + pageSize);
            const list = {
                data: paginatedData,
                page,
                pageSize,
                total: data.length,
            }
            return list

        } catch (error) {
            console.log("Error in the pagination function", error);
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


    async uploadExcelData(filePath) {
        try {
            // Step 1: Read the Excel file
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0]; // Get the first sheet
            const sheet = workbook.Sheets[sheetName];

            // Step 2: Convert Excel sheet to JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet) as any;

            // Step 3: Insert data into the database with UPSERT
            for (const row of jsonData) {

                const { iata_code, airport_name, city_name, city_code, country_code } = row;

                if (!iata_code || !airport_name) {
                    console.log("Missing IATA code in row:", iata_code, airport_name);
                    continue; // Skip this row if there's no IATA code
                }
                // console.log(
                //   iata_code, airport_name, city_name, city_code, country_code
                // )
                // Use the repository to perform the UPSERT operation
                await this.airportRepository
                    .createQueryBuilder()
                    .insert()
                    .into('airport')
                    .values({
                        iata_code,
                        airport_name,
                        city_name,
                        city_code,
                        country_code,
                        created_at: () => "CURRENT_TIMESTAMP",
                    })
                    .orUpdate(
                        ['airport_name', 'city_name', 'city_code', 'country_code', 'created_at'],
                        ['iata_code']  // The column that should trigger the conflict resolution
                    )
                    .execute();

            }

            console.log("Data uploaded successfully!");
            return
        } catch (error) {
            console.error("Error uploading Excel data:", error.message);
            throw error;
        }
    }



}