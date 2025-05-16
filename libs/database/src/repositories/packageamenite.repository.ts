import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageAmenite } from "../entities";
import { InsertAmenites } from '../../../../libs/interfaces/package/amenites.interface';
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";


@Injectable()
export class PackageAmeniteRepositoryService {

    constructor(
            @InjectRepository(PackageAmenite)
            private readonly pkgAmeniteRepository: Repository<PackageAmenite>,
    ) {}

      async insetAmenites(input:InsertAmenites){
        try{
            const mainImage = input.amenite_image.path;
            const details = this.pkgAmeniteRepository.create({
                amenite_name : input.amenite_name,
                amenite_image : mainImage
            });
    
            const result = await this.pkgAmeniteRepository.save(details);
            return result;
        }catch(error){
            console.log(">>>>>>",error);
            throw error;
        }
    }

    async getAllAmenites(){
        try{
            return await this.pkgAmeniteRepository.find({
                order: {
                    created_at: 'DESC' // Optional: Sort by creation date (newest first)
                },
            });
        }catch(error){
            console.log(">>>>>>>",error);
            throw error;
        }
    }


    async updateAmenites(amenite_id,body){
        try{
            const existingAmenites = await this.pkgAmeniteRepository.findOne({
                where: { amenite_id: amenite_id }
            });

             if (!existingAmenites) {
                throw { message: "Amenites ID Not Exist. Please Provide Valid Amenites ID", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            const updatedAmenites = await this.pkgAmeniteRepository.save({
                                        ...existingAmenites,
                                        amenite_name: body.amenite_name,
                                        ...(body.amenite_image?.path && { amenite_image: body.amenite_image.path }),
                                    });

            return updatedAmenites;
        }catch(error){
            console.log(">>>>>>>",body);
            throw error;
        }
    }

}