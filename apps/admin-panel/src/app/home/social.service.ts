import { Injectable } from '@nestjs/common';
import { AddSocialDto, UpdateSocialDto } from '../../../../../libs/dtos/admin/social.dto';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { SocialRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class SocialService {

    constructor(
                private readonly userRepositoryService:UserRepositoryService,
                private readonly socialRepositoryService:SocialRepositoryService,
                private readonly s3Service:S3FileService
            ){}


    async addSocial(payload:JWTPayload,addSocialDto:AddSocialDto,files){
        try{
            const {reference_id} = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An Error occurred while adding Social Icon.`);
            }
            const icon_image = files.icon_image.map(file => file.originalname).join(', ');
            const icon_link = addSocialDto.icon_link;
            const icon_status = addSocialDto.icon_status;
            const social = await this.socialRepositoryService.addSocailIcon({icon_image,icon_link,icon_status});
            return {message: 'Successfully Inserted Social Icon.',socialData:social}
        }catch(error){
            console.log('Error in add Social Section.',error);
            throw Error(error.message || "An error occurred while add Social Section.");
        }
    }

    async getSocialList(){
        try{
            const socialList = await this.socialRepositoryService.getSocial();
            return {message:'Social List', social:socialList}
        }catch(error){
            console.log('Social Service List Error.' , error);
            throw (`Social Service List Error : ${error.message}`);
        }
    }


    async updateSocialData(payload:JWTPayload,updateSDto:UpdateSocialDto,files){
        try{
            const social_id = updateSDto.social_id;
            const existingSocial = await this.socialRepositoryService.getSocialbyId(social_id);
            if(!existingSocial){
                throw {statusCode: ERROR_CODES.NOT_FOUND,message:`Social details not found.`}
            }
            let icon_link = updateSDto.icon_link;
            let icon_status = updateSDto.icon_status;

            let icon_image = existingSocial.icon_image;
            if(files && files.icon_image && files.icon_image.length){
                icon_image = files.icon_image.map(file => file.originalname).join(', ');
            }

            if(!icon_link){
                icon_link = existingSocial.icon_link;
            }

            if(!icon_status){
                icon_status = existingSocial.icon_status;
            }

            const updateSocialValue = await this.socialRepositoryService.updateSocialData({
                social_id,
                icon_image,
                icon_link,
                icon_status
            });

            return {message : 'Successfully updated Social.',data: updateSocialValue};

        }catch(error){
            console.log('Error in Update Social Section.',error);
            throw Error(error.message || "An error occurred while add Social Section.")
        }
    }

}