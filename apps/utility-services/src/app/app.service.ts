import { BadGatewayException, Injectable } from '@nestjs/common';
import { EnquiryRepositoryService } from '../../../../libs/database/src/repositories/enquiry-repository';

@Injectable()
export class AppService {
    constructor(
        private readonly enquiryRepositoryService: EnquiryRepositoryService,
    ){}

    async createAEnquiry(body) {
        try { 
           await this.enquiryRepositoryService.createEnquiry(body);
        } catch (error) {
            console.log("Error in creating enquiry", error)
            throw new BadGatewayException("Error in creating enquiry");
        }
    }

    async getEnquiry(enquiryType){
        try{   
            const response = await this.enquiryRepositoryService.getEnquiry(enquiryType);
            return { message :"Successfully Fetch Data", data : response }; 
        }catch(error){
            console.log(error);
            throw error;
        }
    }
}
