import { Injectable } from '@nestjs/common';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { FaqRepositoryService, UserRepositoryService } from '../../../../../libs/database/src';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { AddFaqDto, UpdateFaqDto } from '../../../../../libs/dtos/admin/faq.dto';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

@Injectable()
export class FaqService {
    constructor(
                private readonly userRepositoryService:UserRepositoryService,
                private readonly faqRepositoryService:FaqRepositoryService,
                private readonly s3Service:S3FileService
            ){}


    async addFaq(payload:JWTPayload,faqDto:AddFaqDto){
        try{
            const {reference_id} = payload;
            const refData = await this.userRepositoryService.getUserByUserId(reference_id);
            if(!refData){
                throw (`An Error occurred while adding Faq.`);
            }
            const faq_question = faqDto.faq_question;
            const faq_answer = faqDto.faq_answer;
            const faq_status = faqDto.faq_status;
            const faq = await this.faqRepositoryService.insertFaq({faq_question,faq_answer,faq_status});
            return {message : 'Successfully Inserted Faq',faqData:faq}
        }catch(error){
            console.log('Error is add Faq Section,',error);
            throw Error(error.message || "An error occurred while add FAQ Section.");
        }
    }

    async getFaqList(){
        try{
            const faqList = await this.faqRepositoryService.getFaq();
            return {message:'Faq List',faq:faqList};
        }catch(error){
            console.log('Faq list Error ',error);
            throw (`Faq List Error : ${error.message}`);
        }
    }

    async updateFaq(payload:JWTPayload,faqDtoUpdate:UpdateFaqDto){
        try{
            const faq_id = faqDtoUpdate.faq_id;
            const existingFaq = await this.faqRepositoryService.getFaqbyId(faq_id);
            if(!existingFaq){
                throw {status_code: ERROR_CODES.NOT_FOUND,message:`FAQ details not Found.`}
            }

            let {faq_question, faq_answer, faq_status} = faqDtoUpdate;

            if(!faq_question){
                faq_question = existingFaq.faq_question
            }
            if(!faq_answer){
                faq_answer = existingFaq.faq_answer
            }
            if(!faq_status){
                faq_status = existingFaq.faq_status
            }

            const updateFaq = await this.faqRepositoryService.updateFaqData({
                faq_id,
                faq_question,
                faq_answer,
                faq_status
            });
            return { message: 'Successfully updated Faq.',data:updateFaq}
        }catch(error){
            console.log('Error in FAQ Section',error);
            throw Error(error.message || "An error occurred while add Header Section.");
        }
    }


}