import { Injectable } from '@nestjs/common';
import { AddHeaderDto } from '../../../../../libs/dtos/admin/header.dto';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { UserRepositoryService } from '../../../../../libs/database/src';
import { HeaderRepositoryService } from '../../../../../libs/database/src';
import { S3FileService} from '../../../../../libs/S3-Service/s3File.service';
// import { ApiResponse } from 'libs/interfaces/commonTypes/apiResponse.interface';

  
@Injectable()
export class HeaderService {
    constructor(
        private readonly userRepositoryService:UserRepositoryService,
        private readonly headerRepositoryService:HeaderRepositoryService,
        private readonly s3Service:S3FileService
    ){}

    async addHeader(payload:JWTPayload,headerDto:AddHeaderDto,files){
        try{
          // console.log(files); 
           const favicon = files.favicon[0].originalname;
           const header_logo = files.header_logo[0].originalname;
           const header_links = headerDto.header_links;
           const {reference_id}= payload; 
           this.userRepositoryService.getUserByUserId(reference_id);
           const headerData = this.headerRepositoryService.saveHeaderData({favicon,header_logo,header_links});
           return { message: 'Successfully Inserted Header.', header: headerData };
        }catch(error){
            console.error('Error in Update Header Section.',error);
            throw Error(error.message || "An error occurred while add Header Section.");
        }
    }

    async getHeaderList(){
        try{
            const headerList = await this.headerRepositoryService.getHeaderList();
            return { message: 'Header List', commissionlist: headerList };
        }catch(error){
            console.log('Commission Service List Error:', error);
            throw (`Header List Error: ${error.message}`);
        }
    }
}






