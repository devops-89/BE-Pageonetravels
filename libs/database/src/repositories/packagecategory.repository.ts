import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageCategory } from "../entities";
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
import { InsertCategory , UpdateCategory } from '../../../../libs/interfaces/package/category.interface'

@Injectable()
export class PackageCategoryRepositoryService {

    constructor(
            @InjectRepository(PackageCategory)
            private readonly pkgCatRepository: Repository<PackageCategory>,
    ) {}

    async insertCategory(input:InsertCategory){
        try{
            
            const mainImage = input.category_image[0].path;
            
            const details = this.pkgCatRepository.create({
                category_name : input.category_name,
                category_image : mainImage
            });
            const result = await this.pkgCatRepository.save(details);
            return result;
        }catch(error){
            console.log(">>>>>>",error);
            throw error;
        }
    }

    async getAllCategory(){
        try{
            return await this.pkgCatRepository.find({
                order: {
                    created_at: 'DESC' // Optional: Sort by creation date (newest first)
                },
            });
        }catch(error){
            console.log(">>>>>>",error);
            throw error;
        }
    }

    async updateCategory(id,body:UpdateCategory ){
        try{
            // First check if the category exists
            const existingCategory = await this.pkgCatRepository.findOne({
                where: { category_id: id }
            });

            if (!existingCategory) {
                throw { message: "Category ID Not Exist. Please Provide Valid Category ID", statusCode: ERROR_CODES.BAD_REQUEST };
            }

            // Update the category with new data
            const updatedCategory = await this.pkgCatRepository.save({
                                        ...existingCategory,
                                        category_name: body.category_name,
                                        ...(body.category_image?.path && { category_image: body.category_image.path }),
                                    });


            return updatedCategory;
        }catch(error){
            console.log(">>>>>>",error);
            throw error;
        }
    }

    async findCategory(package_type:string){
        try{
            console.log(">>>>>>>>>>>",package_type);
            const result = await this.pkgCatRepository.findOne({where: { category_name : package_type }});
            console.log(">>>>>>>>",result);
            if(!result){
                throw {message:`package category not Match`, statusCode: ERROR_CODES.BAD_REQUEST }
            }
            return result;
        }catch(error){
            console.log("Error in Category Repository.",error);
            throw error;
        }
    }
  

}