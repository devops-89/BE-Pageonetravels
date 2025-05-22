import { Injectable } from "@nestjs/common";
import { Package } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageAmeniteRepositoryService } from '../../../../libs/database/src/repositories/packageamenite.repository';
import { PackageCategoryRepositoryService } from '../../../../libs/database/src/repositories/packagecategory.repository';

@Injectable()
export class PackageRepositoryService {

    constructor(
            @InjectRepository(Package)
            private readonly pkgRepository: Repository<Package>,
            private readonly packageAmeniteRepositoryService:PackageAmeniteRepositoryService,
            private readonly packageCategoryRepositoryService:PackageCategoryRepositoryService
    ) {}

    async insertPackage(body:any){
        try{
        //    const checkPkgType  =  

        }catch(error){
            console.log('Insert Package Repository Error',error);
            throw error;
        }
    }


}