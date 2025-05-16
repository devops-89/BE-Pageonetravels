import { Injectable } from "@nestjs/common";
import { UserRepositoryService } from '../../../../libs/database/src';
import { CreatePackageCategoryDto , UpdatePackageCategoryDto } from '../../../../libs/dtos/package/package-category.dto';
import { PackageCategoryRepositoryService } from '../../../../libs/database/src/repositories/packagecategory.repository';
import { PackageAmeniteRepositoryService } from '../../../../libs/database/src/repositories/packageamenite.repository';
import { CreatePackageAmeniteDto , UpdatePackageAmeniteDto } from '../../../../libs/dtos/package/package-amenites.dto';


@Injectable()
export class PackageService {
    constructor(
        private readonly UserModel: UserRepositoryService,
        private readonly packageCategoryRepositoryService:PackageCategoryRepositoryService,
        private readonly packageAmeniteRepositoryService:PackageAmeniteRepositoryService
    ){}

    
    // add-category
    async addCategory(input: CreatePackageCategoryDto){
        try{
            const result = await this.packageCategoryRepositoryService.insertCategory(input);
            return { message: `Package Category Created Successfully`, data: result };
        }catch(error){
            console.log(error);
            throw error;
        }
    }

    async getAllCategory(){
        try{
            const result = await this.packageCategoryRepositoryService.getAllCategory();
            console.log(">>>>>>>>>>> >",result);
            return {message:`Package Category fetch Successfully.`,data:result}
        }catch(error){
            console.log(error);
            throw error;
        }
    }

    async updateCategory(id,body:UpdatePackageCategoryDto){
        try{
            const result = await this.packageCategoryRepositoryService.updateCategory(id,body);
            return {message:`Package Category Updated Successfully.`,data:result}
        }catch(error){
            console.log(error);
            throw error;
        }
    }

    // Amenites
    async addAmenites(body:CreatePackageAmeniteDto){
        try{
            const result = await this.packageAmeniteRepositoryService.insetAmenites(body);
            return { message: `Package Amenites Created Successfully`, data: result };
        }catch(error){
            console.log(error);
            throw error;
        }
    }

    async getAmenites(){
        try{
            const result = await this.packageAmeniteRepositoryService.getAllAmenites();
            console.log(">>>>>>>>>>> >",result);
            return {message:`Package Amenites fetch Successfully.`,data:result}
        }catch(error){
            console.log(error);
            throw error;
        }
    }

    async updateAmenites(amenite_id,body:UpdatePackageAmeniteDto){
        try{
            const result = await this.packageAmeniteRepositoryService.updateAmenites(amenite_id,body);
            return {message:`Package Amenites Updated Successfully.`}
        }catch(error){
            console.log(error);
            throw error;
        }
    }

}