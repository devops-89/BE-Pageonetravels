import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Social } from '../entities';
import { ISocial, USocial } from '../../../../libs/interfaces/commonTypes/home.interface';

@Injectable()
export class SocialRepositoryService{

    constructor(
            @InjectRepository(Social)
            private readonly socialRepository: Repository<Social>,
        ) { }

    async addSocailIcon(input:ISocial){
        try{
            const {icon_image,icon_link,icon_status} = input
            //create a social
            const newSocial = this.socialRepository.create({
                icon_image,
                icon_link,
                icon_status
            });

            // save the social  to the database
            const result = await this.socialRepository.save(newSocial);
            return result;
        }catch(error){
            console.log('Error inserting Social Service',error);
            throw `Failed to insert Social Service. Please try again later. ${error.message}`;
        }
    }

    async getSocial():Promise<Social[]>{
        try{
            const social = await this.socialRepository
                            .createQueryBuilder('Social')
                            .getMany();
            console.log('Social List retrived Successfully.',social);
            return social;
        }catch(error){
            console.log('Error Fetching Social List: ',error);
            throw new Error ('Failed to fetch social List.Please try again later.');
        }
    }

    async getSocialbyId(id:string):Promise<Social>{
            try{
                const social = await this.socialRepository.findOne({where :{social_id:id}});
                return social;
            }catch(error){
                console.log(`Failed to retrive Social : ${error.message}`);
                throw (`Failed to update Social : ${error.message}`);
            }
    }

    async updateSocialData(input:USocial){
        try{
            const updateSocial = await this.socialRepository.save(input);
            return updateSocial;
        }catch(error){
            console.log(`Failed to update Social : ${error.message}`);
            throw (`Failed to Update Social : ${error.message}`);
        }
    }

}