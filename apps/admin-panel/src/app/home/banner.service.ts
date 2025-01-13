import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '../../../../../libs/database/src';
import { BannerRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { AddBannerDto, UpdateBannerDto } from '../../../../../libs/dtos/admin/banner.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class BannerService {

    constructor(
            private readonly userRepositoryService:UserRepositoryService,
            private readonly bannerRepositoryService:BannerRepositoryService,
            private readonly s3Service:S3FileService
        ){}

    async addBanner(payload:JWTPayload,bannerDto:AddBannerDto,files){
        try{
            const {reference_id}= payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An Error occurred while adding Banner.`);
            }
            const banner_image = files.banner_image.map(file => file.originalname).join(', ');
            const banner_title = bannerDto.banner_title;
            const banner_heading = bannerDto.banner_heading;
            const banner = await this.bannerRepositoryService.insertBanner({banner_image,banner_title,banner_heading});
            return { message: 'Successfully Inserted Banner', bannerdata: banner }; 
        }catch(error){
            console.error('Error in add Banner Section.',error); 
            throw Error(error.message || "An error occurred while add Banner Section.");
        }
    }

    async getBannerList(){
        try{
            const bannerList = await this.bannerRepositoryService.getBannerList();
            return {message : "Banner List", bannerList : bannerList}
        }catch(error){
            console.log('Banner Service List Error : ',error);
            throw (`Banner List Error: ${error.message}`);
        }
    }
    
    async updateBanner(payload:JWTPayload,bannerDto:UpdateBannerDto,files){
        try{
            const banner_id = bannerDto.banner_id;
            let banner_title = bannerDto.banner_title;
            let banner_heading = bannerDto.banner_heading;
            const existingBanner = await this.bannerRepositoryService.getBannerbyId(banner_id);
            if(!existingBanner){
                throw { status_code: ERROR_CODES.NOT_FOUND,message:`Banner details not found.` }
            }

            let banner_image = existingBanner.banner_image;
            if(files && files.banner_image && files.banner_image.length){  
               banner_image = files.banner_image.map(file => file.originalname).join(', ');
            }

            if(!banner_title){
                banner_title = existingBanner.banner_title
            }

            if(!banner_heading){
                banner_heading = existingBanner.banner_heading
            }

            const updateBannerValue = await this.bannerRepositoryService.updateBanner({
                banner_id,
                banner_image,
                banner_title,
                banner_heading
            });

            return { message: 'Successfully updated Banner.', data: updateBannerValue }; 

        }catch(error){
            console.log('Error in Update Banner Section.' , error);
            throw Error(error.message || "An error occurred while add Header Section.");
        }  
    }

}