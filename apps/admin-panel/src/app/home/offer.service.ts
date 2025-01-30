import { Injectable } from '@nestjs/common';
import { OfferRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { AddOfferDto, UpdateOfferDto } from '../../../../../libs/dtos/admin/offer.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class OfferService { 

    constructor(
                private readonly userRepositoryService:UserRepositoryService,
                private readonly offerRepositoryService:OfferRepositoryService,
                private readonly s3Service:S3FileService
            ){}

    async addOffer(payload:JWTPayload,offerDto:AddOfferDto,files){
        try{
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An Error occurred while adding Offer.`);
            }
            const offer_image = files.offer_image.map(file => file.originalname).join(',');
            const offer_title = offerDto.offer_title;
            const offer_description = offerDto.offer_description;
            const offer_listing = offerDto.offer_listing;
            const button_name = offerDto.button_name

            const offer = await this.offerRepositoryService.insertOffer({offer_image,offer_title,offer_description,offer_listing,button_name});
            return { message: 'Successfully Inserted Offer.', offer: offer };
        }catch(error){
            console.log('Error in add offer Section.',error);
            throw Error(error.message || "An error occurred while add Banner Section.");
        }
    }

    async getOfferList(){
        try{
            const offerList = await this.offerRepositoryService.getOList();
            return {message : "Offer List", offerList : offerList}
        }catch(error){
            console.log('Offer Service list Error : ',error);
            throw (`Offer List Error : ${error.message}`);
        }
    }

    async updateOffer(payload:JWTPayload,updatOffer:UpdateOfferDto,files){
        try{
            const offer_id = updatOffer.offer_id;
            const existingOffer = await this.offerRepositoryService.getOfferById(offer_id);
            if(!existingOffer){
                throw {status_code:ERROR_CODES.NOT_FOUND,message:`Offer Details not Found.`};
            } 

            let offer_title = updatOffer.offer_title;
            let offer_description = updatOffer.offer_description;
            let offer_listing = updatOffer.offer_listing;
            let button_name = updatOffer.button_name;

            let offer_image = existingOffer.offer_image;
            if(files && files.offer_image && files.offer_image.length){
                offer_image = files.offer_image[0].originalname;
            }

            if(!offer_title){
                offer_title = existingOffer.offer_title;
            }

            if(!offer_description){
                offer_description = existingOffer.offer_description;
            }

            if(!offer_listing){
                offer_listing = existingOffer.offer_listing;
            }

            if(!button_name){
                button_name = existingOffer.button_name;
            }

            const updateOfferValue = await this.offerRepositoryService.updateOffer({
                offer_id,
                offer_image,
                offer_title,
                offer_description,
                offer_listing,
                button_name
            });
            console.log(updateOfferValue);               

            return { message : "Successfully updated offer.", data: updateOfferValue }

        }catch(error){
            console.log('Error in update Section.',error);
            throw Error(error.message || "An error occured while add Offer Section");
        }
    }

}