import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from '../entities/offer.entity';
import { IOffer, UOffer } from '../../../../libs/interfaces/commonTypes/home.interface';
import { of } from 'rxjs';




@Injectable()
export class OfferRepositoryService {
    constructor(
            @InjectRepository(Offer)
            private readonly offerRespository: Repository<Offer>
        ){}
    
    async insertOffer(input: IOffer):Promise<Offer>{
        try{
            const {offer_image,offer_title,offer_description,offer_listing,button_name} = input;
            const newOffer = this.offerRespository.create({ 
                offer_image,
                offer_title,
                offer_description,
                offer_listing,
                button_name
            });
            const result = await this.offerRespository.save(newOffer);
            return result;
        }catch(error){
            console.log('Error inserting offer',error);
            throw 'Failed to insert offer. Please try again later. ${error.message}';
        }
    }

    async getOList():Promise<Offer[]>{
        try{
            const offer = await this.offerRespository
                          .createQueryBuilder('offer')
                          .getMany();
            console.log('Offer List retrived successfully', offer);
            return offer;
        }catch(error){
            console.log('Error Fetching offer list:',error);
            throw new Error ('Failed to fetch offer list. Please try again later.');
        }
    }

    async updateOffer(input:UOffer){
        try{
            const updateOffer = await this.offerRespository.save(input);
            return updateOffer;
        }catch(error){
            console.log(`Failed to update Offer : ${error.message}`);
            throw (`Failed to update offer : ${error.message}`);
        }
    }


    async getOfferById(id:string):Promise<Offer>{
        try{
            const offer  = await this.offerRespository.findOne({where : {offer_id:id}});
            return offer;
        }catch(error){
            console.log(`Failed to retrive Festival : ${error.message}`);
            throw error;
        }
    }
    

}
