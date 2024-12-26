import { Injectable } from '@nestjs/common';
import { AddHeaderDto } from '../../../../../libs/dtos/admin/header.dto';
import { JWTPayload } from 'libs/interfaces/authentication/jwtPayload.interface';
import { UserRepositoryService } from 'libs/database/src';
import { S3FileService} from '../../../../../libs/S3-Service/s3File.service';
// import { ApiResponse } from 'libs/interfaces/commonTypes/apiResponse.interface';

  
@Injectable()
export class HeaderService {
    constructor(private readonly userRepositoryService:UserRepositoryService,
        private readonly s3Service:S3FileService
    ){}

    async addHeader(payload:JWTPayload,headerDto:AddHeaderDto,file){
        try{
            const {reference_id}= payload; 
            const existingUser=this.userRepositoryService.getuserbyuserId(reference_id)
            
            console.log(headerDto);
            console.log(file);
           // const { favicon, header_logo, header_links } = headerDto;

        }catch(error){
            console.error('Error in Update Header Section.',error);
            throw Error(error.message || "An error occurred while add Header Section.");
        }
    }
}






