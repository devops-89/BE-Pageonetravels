import { Injectable } from '@nestjs/common';
import { AddHeaderDto, UpdateHeaderDto } from '../../../../../libs/dtos/admin/header.dto';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { UserRepositoryService } from '../../../../../libs/database/src';
import { HeaderRepositoryService } from '../../../../../libs/database/src';
import { S3FileService} from '../../../../../libs/S3-Service/s3File.service';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';
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
           const refData = await this.userRepositoryService.getUserByUserId(reference_id);
           if(!refData){
                throw (`An Error occurred while adding Header.`);
            }
           const headerData = this.headerRepositoryService.saveHeaderData({favicon,header_logo,header_links});
           return { message: 'Successfully Inserted Header.', header: headerData };
        }catch(error){ 
            console.log('Error in add Header Section.',error); 
            throw Error(error.message || "An error occurred while add Header Section.");
        }
    }

    async getHeaderList(){
        try{
            const headerList = await this.headerRepositoryService.getHeaderList();
            return { message: 'Header List', headerlist: headerList };
        }catch(error){
            console.log('Commission Service List Error:', error);
            throw (`Header List Error: ${error.message}`);
        }
    }

    

    async updateHeader(payload:JWTPayload,headerDto:UpdateHeaderDto,files){
        try{
            
            const header_id = headerDto.header_id;
            const headerLinks = headerDto.header_links;
            const existingHeader = await this.headerRepositoryService.getHeaderbyId(header_id);
            if (!existingHeader) {
                throw { statusCode: ERROR_CODES.NOT_FOUND, message: `Commission not found` };
            }


            let favicon = existingHeader.favicon;
            if(files && files.favicon && files.favicon.length > 0)
            {
                favicon = files.favicon[0].originalname
            }

            let header_logo = existingHeader.header_logo;
            if(files && files.header_logo && files.header_logo.length > 0)
            {
                header_logo = files.header_logo[0].originalname
            }

            const updateHeaderValue = await this.headerRepositoryService.updateHeader({header_id,
                favicon,
                header_logo,
                header_links: headerLinks || existingHeader.header_links
            });  

            return { message: 'Successfully updated Header.', data: updateHeaderValue }; 
        }catch(error){
            console.error('Error in Update Header Section.',error);
		    throw Error(error.message || "An error occurred while add Header Section.");
        }
    }

}






