import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../entities';
import { IFaq, UFaq } from '../../../../libs/interfaces/commonTypes/home.interface';

@Injectable()
export class FaqRepositoryService {

    constructor(
                @InjectRepository(Faq)
                private readonly faqRepository: Repository<Faq>,
            ) { }

    async insertFaq(input:IFaq):Promise<Faq>{
        try{
            const {faq_question,faq_answer,faq_status} = input
            // create a faq entity
            const newfaq = this.faqRepository.create({
                faq_question,
                faq_answer,
                faq_status
            });

            // save the faq  to the database
            const faq = await this.faqRepository.save(newfaq);
            return faq;
        }catch(error){
            console.log('Error inserting Faq : ',error);
            throw `Failed to insert Faq. Please try again later. ${error.message}`;
        }
    }


    async getFaq(){
        try{
            const faq = await this.faqRepository
                        .createQueryBuilder('Faq')
                        .where('Faq.faq_status = :status', { status: "True" }) // Correct comparison for boolean
                        .getMany();
            console.log('Faq list retrived Successfully.',faq);
            return faq;
        }catch(error){
            console.log('Error fetching faq list.',error);
            throw new Error('Error to fetch FAQ.Please Try again later.');
        }
    }

    async getFaqbyId(id:string):Promise<Faq>{
        try{
            const faq = await this.faqRepository.findOne({where: {faq_id : id}});
            return faq;
        }catch(error){
            console.log(`Failed to retrive Faq : ${error.message}`);
            throw error;
        }
    } 

    async updateFaqData(input:UFaq){
        try{
            const updateFaq = await this.faqRepository.update({ faq_id: input.faq_id}, input);
            return updateFaq;
        }catch(error){
            console.log(`Failed to Update Faq: ${error.message}`);
            throw (`Failed to update Faq: ${error.message}`);
        }
    }



}