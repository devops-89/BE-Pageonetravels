import { Injectable } from "@nestjs/common";
import { Package } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageAmeniteRepositoryService } from '../../../../libs/database/src/repositories/packageamenite.repository';
import { PackageCategoryRepositoryService } from '../../../../libs/database/src/repositories/packagecategory.repository';
import { PackageDayRepositoryService } from '../../../../libs/database/src/repositories/packageday.repository';
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
import { PaginationDto } from "../../../../libs/dtos/authentication/user.dto";

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
          //  const fetchAmenites = await this.packageAmeniteRepositoryService.checkAmenite(body.amenities);

           const upload = body.gallery_image;
           const originalNames = upload.map(file =>file.path).join(', ');
           console.log("?>?>?>?",body.main_image[0].path);
           const pkgData = this.pkgRepository.create({
                    package_name : body.package_name,
                    short_description:body.short_description,
                    description:body.description,
                    main_image: body.main_image,                       
                    gallery_image: body.gallery_image,  
                    banner_image: body.banner_image,             
                    package_slug:body.package_slug,
                    package_day:body.package_day,
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
                    package_type:body.package_type,
                    status:body.status,
                    highlight:body.highlight,
                    amenities:body.amenities,
                    rating:body.rating || 0
           });
           console.log(">>>>>>>>>>>>@#$@#$ ...",pkgData);
           const result = await this.pkgRepository.save(pkgData);
            return result;
        }catch(error){
            console.log('Insert Package Repository Error',error);
            throw error;
        }
    }

    async getPackageList(pagination: PaginationDto, search?: string) {
        try {
          const { page = 1, limit = 10 } = pagination;
      
          const queryBuilder = this.pkgRepository.createQueryBuilder('package')
            .orderBy('package.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
      
          if (search) {
            queryBuilder.where('package.name ILIKE :search OR package.description ILIKE :search', {
              search: `%${search}%`,
            });
          }
      
          const [items, count] = await queryBuilder.getManyAndCount();
      
          const meta = {
            totalDocs: count,
            limit,
            totalPages: Math.ceil(count / limit),
            hasPrevPage: page > 1,
            hasNextPage: page * limit < count,
          };
      
          return {
            items,
            meta,
          };
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

    async getPackageById(id: string) {
        try {
            const pkg = await this.pkgRepository.findOne({ where: { id } });
            if (!pkg) {
                throw { message: "Package not found.", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            return pkg;
        } catch (error) {
            console.log("Get Package By ID Repository Error.", error);
            throw error;
        }
    }

}

