import { Injectable } from '@nestjs/common';
import { UserRepositoryService } from '../../../../../libs/database/src';
import { TabRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { AddServiceDto, UpdateServiceDto } from '../../../../../libs/dtos/admin/service.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class TabService {
            
    constructor(
                private readonly userRepositoryService:UserRepositoryService,
                private readonly tabRepositoryService:TabRepositoryService,
                private readonly s3Service:S3FileService
            ){}

    async addService(payload:JWTPayload,serviceDto:AddServiceDto,files){
        try{
            const { reference_id } = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An Error occurred while adding Services.`);
            }
            const service_image = files.service_image[0].originalname;
            const service_name = serviceDto.service_name;
            const service_status = serviceDto.service_status;
            const service = await this.tabRepositoryService.insertService({service_image,service_name,service_status});
            return { message: 'Successfully Inserted Service.', service: service };
        }catch(error){
            console.error('Error in add Service.',error);
            throw Error(error.message || 'An error occurred while add Service Section.');
        }
    }

    async getServiceList(){
        try{
            const serviceList = await this.tabRepositoryService.getService();
            return {message: 'Service List',service:serviceList};
        }catch(error){
            console.error('Error in Service List',error);
            throw (`Service List Error: ${error.message}`);
        }
    }

    async updateService(payload:JWTPayload,updateSDto:UpdateServiceDto,files){
        try{
            const service_id = updateSDto.service_id;
            let service_name = updateSDto.service_name;
            let service_status = updateSDto.service_status;
            const existingService = await this.tabRepositoryService.getServiceById(service_id);
            if(!existingService){
                throw { status_code: ERROR_CODES.NOT_FOUND,message:`Service Details Not Found.`}
            }

            let service_image = existingService.service_image;
            if(files && files.service_image && files.service_image.length){
                service_image = files.service_image[0].originalname;
            }

            if(!service_name){
                service_name = existingService.service_name;
            }
            
            if(!service_status){
                service_status = existingService.service_status;
            }

            const updateServiceValue = await this.tabRepositoryService.updateService({
                service_id,
                service_image,
                service_name,
                service_status
            });

            return { message: 'Successfully updated Service.', data: updateServiceValue }; 
        }catch(error){
            console.log('Error in Update Service.',error);
            throw Error(error.message || "An error occurred while Update Service Section.");
        }
    }

}