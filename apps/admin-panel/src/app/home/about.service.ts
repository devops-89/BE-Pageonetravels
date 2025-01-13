import { Injectable } from '@nestjs/common';
import { AboutRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { AddAboutDto, UpdateAboutDto } from '../../../../../libs/dtos/admin/about.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class AboutService {

    constructor(
        private readonly userRepositoryService:UserRepositoryService,
        private readonly aboutRepositoryService:AboutRepositoryService,
        private readonly s3Service:S3FileService
    ){}
    
    async addAbout(payload:JWTPayload,aboutDto:AddAboutDto,files){
        try{
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An Error occurred while adding About.`);
            }
            const about_image = files.about_image.map(file => file.originalname).join(', ');
            const about_heading = aboutDto.about_heading;
            const about_description = aboutDto.about_description;
            const about_button = aboutDto.about_button;

            const about = await this.aboutRepositoryService.insertAbout({about_image,about_heading,about_description,about_button});
            return {message: 'Successfully Inserted About.',aboutData:about}
        }catch(error){
            console.log('Error is add About Section.',error);
            throw Error(error.message || "An error occurred while add About Section.");
        }
    }

    async getAboutList(){
        try{
            const aboutList = await this.aboutRepositoryService.getAboutList();
            return {message:'About List',about:aboutList}
        }catch(error){
            console.log('About Service List Error : ',error);
            throw (`About List  Error : ${error.message}`);
        }
    }

    async updateAbout(payload:JWTPayload,aboutDto:UpdateAboutDto,files){
        try{
            const about_id = aboutDto.about_id;
            const existingAbout = await this.aboutRepositoryService.getAboutbyId(about_id);
            if(!existingAbout){
                throw {status_code: ERROR_CODES.NOT_FOUND, message: `About details not Found.`}
            }

            let about_heading = aboutDto.about_heading;
            let about_description = aboutDto.about_description;
            let about_button = aboutDto.about_button;
            let about_image = existingAbout.about_image;
            if(files && files.about_image && files.about_image.length){
                about_image = files.about_image.map(file => file.originalname).join(', ');
            }

            if(!about_heading){
                about_heading = existingAbout.about_heading;
            }

            if(!about_description){
                about_description = existingAbout.about_description;
            }

            if(!about_button){
                about_button = existingAbout.about_button;
            }

            const updateAboutValue = await this.aboutRepositoryService.updateAbout({
                about_id,
                about_image,
                about_heading,
                about_description,
                about_button
            });

            return {message: 'Successfully updated About.',data:updateAboutValue}

        }catch(error){
            console.log('Error in Update About Section.',error);
            throw Error(error.message || "An error occurred while and About Section.");
        }
    }

}