import { Injectable } from "@nestjs/common";
import { Package } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageAmeniteRepositoryService } from '../../../../libs/database/src/repositories/packageamenite.repository';
import { PackageCategoryRepositoryService } from '../../../../libs/database/src/repositories/packagecategory.repository';
import { PackageDayRepositoryService } from '../../../../libs/database/src/repositories/packageday.repository';

@Injectable()
export class PackageRepositoryService {

    constructor(
            @InjectRepository(Package)
            private readonly pkgRepository: Repository<Package>,
            private readonly packageAmeniteRepositoryService:PackageAmeniteRepositoryService,
            private readonly packageCategoryRepositoryService:PackageCategoryRepositoryService,
            private readonly packageDayRepositoryService:PackageDayRepositoryService
    ) {}

    async insertPackage(body:any){
        try{
           const checkPkgType  =  await this.packageDayRepositoryService.findDayExist(body.package_day);
            console.log(checkPkgType);
        }catch(error){
            console.log('Insert Package Repository Error',error);
            throw error;
        }
    }


}