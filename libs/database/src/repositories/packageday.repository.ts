import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageDay } from "../entities";
import { InsertDays } from "../../../../libs/interfaces/package/days.interface";
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";

@Injectable()
export class PackageDayRepositoryService {

    constructor(
            @InjectRepository(PackageDay)
            private readonly pkdDayRepository: Repository<PackageDay>,
    ) {}

    async insetDay(input:InsertDays){
        try{
            const details = this.pkdDayRepository.create({
                pkgday_duration : input.pkgday_duration
            });
    
            const result = await this.pkdDayRepository.save(details);
            return result;
        }catch(error){
            console.log("Pkg Day's Add Repository Error",error);
            throw error;
        }
    }

    async getDayFetch(){
        try{
            return await this.pkdDayRepository.find({
                // order: {
                //     created_at: 'DESC' // Optional: Sort by creation date (newest first)
                // },
            });
        }catch(error){
            console.log("Pkg Day's list Repository Error",error);
            throw error;
        }
    }


    async updatePkgday(pkgdayId,body){
        try{
            // First check if the day exists
            const existingDay = await this.pkdDayRepository.findOne({
                where: { pkgday_id: pkgdayId }
            });

            if (!existingDay) {
                throw { message: "Pkg Day's ID Not Exist. Please Provide Valid Pkg Day's ID", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            // Update the day with new data
            const updatedDay = await this.pkdDayRepository.save({
                                        ...existingDay,
                                        ...(body.pkgday_duration && { pkgday_duration: body.pkgday_duration }),
                                    });

            return updatedDay;
        }catch(error){
            console.log("Pkg Day's update Repository Error",error);
            throw error;
        }
    }
    

    async findDayExist(pkddayduartion:string){
        try{
            const result = await this.pkdDayRepository.findOne({where: { pkgday_duration: pkddayduartion }});
            if(!result){
                throw {message:`package day's not Match`, statusCode: ERROR_CODES.BAD_REQUEST }
            }
            return result;
        }catch(error){
            console.log(error);
            throw error;
        }
    }


}