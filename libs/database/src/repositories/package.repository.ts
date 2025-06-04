import { Injectable } from "@nestjs/common";
import { Package } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageAmeniteRepositoryService } from '../../../../libs/database/src/repositories/packageamenite.repository';
import { PackageCategoryRepositoryService } from '../../../../libs/database/src/repositories/packagecategory.repository';
import { PackageDayRepositoryService } from '../../../../libs/database/src/repositories/packageday.repository';
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";

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
           const checkCategory = await this.packageCategoryRepositoryService.findCategory(body.package_type);
           const fetchAmenites = await this.packageAmeniteRepositoryService.checkAmenite(body.amenities);

           const upload = body.gallery_image;
           const originalNames = upload.map(file =>file.path).join(', ');
           console.log("?>?>?>?",body.main_image[0].path);
           const pkgData = this.pkgRepository.create({
                    package_name : body.package_name,
                    short_description:body.short_description,
                    description:body.description,
                    main_image:body.main_image[0].path,
                    gallery_image:originalNames,
                    banner_image:body.banner_image[0].path,
                    package_slug:body.package_slug,
                    package_day:body.package_day,
                    package_no_of_person:body.package_no_of_person,
                    package_price:body.package_price,
                    selling_price:body.selling_price,
                    package_destination:body.package_destination,
                    near_by_location:body.near_by_location,
                    address1:body.near_by_location,
                    address2:body.address2,
                    city:body.city,
                    state:body.state,
                    country:body.country,
                    zip:body.zip,
                    monthYear:body.monthYear,
                    package_type:body.package_type,
                    status:body.status,
                    highlight:body.highlight
           });
           console.log(">>>>>>>>>>>>@#$@#$ ...",pkgData);
           const result = await this.pkgRepository.save(pkgData);
            return result;
        }catch(error){
            console.log('Insert Package Repository Error',error);
            throw error;
        }
    }

    async getPackageList(){
        try{
            const result = await this.pkgRepository.find();
            console.log(">>>>>>>>",result);
            return result;
        }catch(error){
            console.log("Package List Repository Error.",error);
            throw error;
        }
    }

    async getPackageUpdate(id,body:any){
        try{
            const existingPackage = await this.pkgRepository.findOne({ where: { id: id }  });
            if (!existingPackage) {
                throw { message: "Please provide a valid Package ID.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            return existingPackage;
        }catch(error){
            console.log("Package Update Repository Error.",error);
            throw error;
        }
    }

}

