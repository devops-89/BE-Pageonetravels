import { BadGatewayException, Injectable } from '@nestjs/common';
import { EnquiryRepositoryService } from '../../../../libs/database/src/repositories/enquiry-repository';
import { EmailService } from '../../../../libs/email-service/email.service';
import {buildEnquiryTemplate} from "../../../../libs/templates/enquiryTemplate";
@Injectable()
export class AppService {
    constructor(
        private readonly enquiryRepositoryService: EnquiryRepositoryService,
        private readonly emailService:EmailService
    ){}

    async createAEnquiry(body) {
        try { 
           await this.enquiryRepositoryService.createEnquiry(body);
           console.log("body header:",body.enquiry_description.email);
           if(body.enquiry_description.email){
             const subject = 'Enquiry Received';
        
         const enquiryEmailHTML = buildEnquiryTemplate(body.enquiry_type, body.enquiry_description);
        await this.emailService.sendEmail(body.enquiry_description.email, subject, enquiryEmailHTML);
        console.log("Enquiry Send Successfully.");
           }
           
           
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
