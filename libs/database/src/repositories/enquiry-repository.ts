import { Injectable } from "@nestjs/common";
import { Enquiry } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { EnquiryType } from '../../../../libs/database/src/entities/enquiry.entity';
import { database } from "firebase-admin";

@Injectable()
export class EnquiryRepositoryService {

    constructor(
            @InjectRepository(Enquiry)
            private readonly enquiryRepository: Repository<Enquiry>,
        ){}

    async createEnquiry(body){
        
        await this.enquiryRepository.save(body);
    }

    async getEnquiry(enquiryType: EnquiryType): Promise<Partial<Enquiry>[]> {
      return this.enquiryRepository.find({
          where: { enquiry_type: enquiryType },
          select: ['enquiry_description'] // Include PK (id) and the description
      });
  }

}