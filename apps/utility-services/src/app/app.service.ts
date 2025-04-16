import { BadGatewayException, Injectable } from '@nestjs/common';
import { Enquiry } from '../../../../libs/database/src/entities/enquiry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
    constructor(
        @InjectRepository(Enquiry)
        private readonly enquiryRepository: Repository<Enquiry>,


    ){}
    async createAEnquiry(body) {
        try { 
           await this.enquiryRepository.save(body);
        } catch (error) {
            console.log("Error in creating enquiry", error)
            throw new BadGatewayException("Error in creating enquiry");
        }
        

    }
}
