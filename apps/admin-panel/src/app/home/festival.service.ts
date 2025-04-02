import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '../../../../../libs/database/src';
import { FestivalRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { AddFestivalDto, UpdateFestivalDto } from '../../../../../libs/dtos/admin/festival.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class FestivalService {

    constructor(
                private readonly userRepositoryService:UserRepositoryService,
                private readonly festivalRepositoryService:FestivalRepositoryService,
                private readonly s3Service:S3FileService
            ){}

    async addFestival(payload:JWTPayload,festivalDto:AddFestivalDto,files){
        try{
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An Error occurred while adding Festival.`);
            }
            const festival_image = files.festival_image[0].originalname;
            const festival_name = festivalDto.festival_name;
            const festival_discount = festivalDto.festival_discount 
            const festival_status = festivalDto.festival_status 
            const festival =  await this.festivalRepositoryService.insertFestival({festival_image,festival_name,festival_discount,festival_status});
            return { message: 'Successfully Inserted Festival', festivaldata: festival }; 
        }catch(error){
            console.log('Error in add Festival Section.',error);
            throw Error(error.message || "An error occurred while add Festival Section.");
        }
    }

    async getFestivalList(){
        try{
            const festivalList = await this.festivalRepositoryService.getFestival();
            return { message: 'Festival List ', festival:festivalList};
        }catch(error){
            console.log('Error in Festival List', error);
            throw (`Festival List Error : ${error.message}`);
        }
    }   

    async updateFestival(payload:JWTPayload,updateFDto:UpdateFestivalDto,files){
        try{
            const festival_id = updateFDto.festival_id;

            const existingFestival = await this.festivalRepositoryService.getFestivalById(festival_id);
            if(!existingFestival){
                throw { statusCode: ERROR_CODES.NOT_FOUND,message:`Festival Details not Found.`};
            }

            let festival_name = updateFDto.festival_name;
            let festival_discount = updateFDto.festival_discount;
            let festival_status = updateFDto.festival_status;

            let festival_image = existingFestival.festival_image;
            if(files && files.festival_image && files.festival_image.length){
                festival_image = files.festival_image[0].originalname;
            }

            if(!festival_name){
                festival_name = existingFestival.festival_name;
            }

            if(festival_discount){
                festival_discount = existingFestival.festival_discount;
            }

            if(festival_status){
                festival_status = existingFestival.festival_status;                
            }

            const updateFestivalValue = await this.festivalRepositoryService.updateFestival({
                        festival_id,
                        festival_image,
                        festival_name,
                        festival_discount,
                        festival_status
            });

            return { message: 'Successfully updated festival.',data:updateFestivalValue };
        }catch(error){
            console.log('Error in update Festival : ',error);
            throw Error(error.message || "An error occurred while update Festival section");
        }
    }

}